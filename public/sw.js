// Service Worker for PWA functionality
const CACHE_NAME = 'todolist-pwa-v1.0.0';
const urlsToCache = [
  '/',
  '/dashboard',
  '/tasks',
  '/habits',
  '/analytics',
  '/settings',
  '/manifest.json',
  '/offline',
  // Core CSS and JS files
  '/_next/static/css/',
  '/_next/static/chunks/',
  // Icons
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Fonts and other assets
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Failed to cache assets:', error);
      })
  );
  // Activate the service worker immediately
  self.skipWaiting();
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip requests to external APIs
  if (event.request.url.includes('/api/')) {
    // For API requests, try network first, fallback to cache if offline
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request)
            .then((response) => {
              if (response) {
                return response;
              }
              // Return offline page for API requests that fail
              return caches.match('/offline');
            });
        })
    );
    return;
  }

  // For non-API requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Clone the request because it's a stream and can only be consumed once
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest)
          .then((response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's a stream and can only be consumed once
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If fetch fails, return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/offline');
            }
            // For other requests, return cached version if available
            return caches.match(event.request);
          });
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Claim clients to ensure service worker takes control immediately
        return self.clients.claim();
      })
  );
});

// Handle background sync for offline task completion
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  } else if (event.tag === 'sync-habits') {
    event.waitUntil(syncHabits());
  }
});

// Handle push notifications
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const title = data.title || 'Productivity App';
    const options = {
      body: data.message || 'You have new notifications',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: data.tag || 'general',
      data: data.data || {},
      actions: data.actions || [
        {
          action: 'open',
          title: 'Open App',
          icon: '/icons/icon-192x192.png'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  } else {
    event.waitUntil(
      self.clients.openWindow(event.notification.data?.url || '/')
    );
  }
});

// Sync functions for offline data synchronization
async function syncTasks() {
  try {
    // Get pending offline task updates from IndexedDB
    const pendingTasks = await getPendingTasks();
    
    // Sync each task update
    await Promise.all(
      pendingTasks.map(async (task) => {
        try {
          const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(task)
          });
          
          if (response.ok) {
            // Remove from pending queue
            await removePendingTask(task.id);
          }
        } catch (error) {
          console.error('Failed to sync task:', error);
        }
      })
    );
    
    // Notify clients of successful sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        data: { category: 'tasks' }
      });
    });
  } catch (error) {
    console.error('Task sync failed:', error);
  }
}

async function syncHabits() {
  try {
    // Get pending offline habit updates from IndexedDB
    const pendingHabits = await getPendingHabits();
    
    // Sync each habit update
    await Promise.all(
      pendingHabits.map(async (habit) => {
        try {
          const response = await fetch('/api/habits', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(habit)
          });
          
          if (response.ok) {
            // Remove from pending queue
            await removePendingHabit(habit.id);
          }
        } catch (error) {
          console.error('Failed to sync habit:', error);
        }
      })
    );
    
    // Notify clients of successful sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        data: { category: 'habits' }
      });
    });
  } catch (error) {
    console.error('Habit sync failed:', error);
  }
}

// IndexedDB Database Schema and Operations
const DB_NAME = 'DoNextDB';
const DB_VERSION = 1;

// Store names
const STORES = {
  PENDING_TASKS: 'pendingTasks',
  PENDING_HABITS: 'pendingHabits',
  SYNC_QUEUE: 'syncQueue'
};

/**
 * Initialize IndexedDB database
 */
function initializeDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create pending tasks store
      if (!db.objectStoreNames.contains(STORES.PENDING_TASKS)) {
        const taskStore = db.createObjectStore(STORES.PENDING_TASKS, { keyPath: 'id' });
        taskStore.createIndex('userId', 'userId', { unique: false });
        taskStore.createIndex('status', 'status', { unique: false });
        taskStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Create pending habits store
      if (!db.objectStoreNames.contains(STORES.PENDING_HABITS)) {
        const habitStore = db.createObjectStore(STORES.PENDING_HABITS, { keyPath: 'id' });
        habitStore.createIndex('userId', 'userId', { unique: false });
        habitStore.createIndex('status', 'status', { unique: false });
        habitStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Create sync queue store
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
        syncStore.createIndex('type', 'type', { unique: false });
        syncStore.createIndex('status', 'status', { unique: false });
      }
    };
  });
}

/**
 * Get all pending tasks from IndexedDB
 */
async function getPendingTasks() {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PENDING_TASKS], 'readonly');
      const store = transaction.objectStore(STORES.PENDING_TASKS);
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.error('Error getting pending tasks:', error);
    return [];
  }
}

/**
 * Add pending task to IndexedDB
 */
async function addPendingTask(task) {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PENDING_TASKS], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_TASKS);
      const request = store.add({
        ...task,
        id: `pending_task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.error('Error adding pending task:', error);
    throw error;
  }
}

/**
 * Remove pending task from IndexedDB
 */
async function removePendingTask(taskId) {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PENDING_TASKS], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_TASKS);
      const request = store.delete(taskId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Error removing pending task:', error);
    throw error;
  }
}

/**
 * Get all pending habits from IndexedDB
 */
async function getPendingHabits() {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PENDING_HABITS], 'readonly');
      const store = transaction.objectStore(STORES.PENDING_HABITS);
      const index = store.index('status');
      const request = index.getAll('pending');

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.error('Error getting pending habits:', error);
    return [];
  }
}

/**
 * Add pending habit to IndexedDB
 */
async function addPendingHabit(habit) {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PENDING_HABITS], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_HABITS);
      const request = store.add({
        ...habit,
        id: `pending_habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: 'pending',
        createdAt: new Date().toISOString()
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  } catch (error) {
    console.error('Error adding pending habit:', error);
    throw error;
  }
}

/**
 * Remove pending habit from IndexedDB
 */
async function removePendingHabit(habitId) {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PENDING_HABITS], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_HABITS);
      const request = store.delete(habitId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  } catch (error) {
    console.error('Error removing pending habit:', error);
    throw error;
  }
}

/**
 * Sync pending tasks when online
 */
async function syncPendingTasks() {
  try {
    const pendingTasks = await getPendingTasks();
    
    for (const task of pendingTasks) {
      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(task)
        });

        if (response.ok) {
          await removePendingTask(task.id);
          console.log(`Synced task: ${task.title}`);
        }
      } catch (error) {
        console.error('Error syncing task:', error);
      }
    }
  } catch (error) {
    console.error('Error syncing pending tasks:', error);
  }
}

/**
 * Sync pending habits when online
 */
async function syncPendingHabits() {
  try {
    const pendingHabits = await getPendingHabits();
    
    for (const habit of pendingHabits) {
      try {
        const response = await fetch('/api/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(habit)
        });

        if (response.ok) {
          await removePendingHabit(habit.id);
          console.log(`Synced habit: ${habit.name}`);
        }
      } catch (error) {
        console.error('Error syncing habit:', error);
      }
    }
  } catch (error) {
    console.error('Error syncing pending habits:', error);
  }
}

/**
 * Sync all pending data when online
 */
async function syncAllPendingData() {
  console.log('Starting sync of pending data...');
  await syncPendingTasks();
  await syncPendingHabits();
  console.log('Sync complete');
}

/**
 * Listen for online event and sync
 */
self.addEventListener('online', () => {
  console.log('App is online, syncing pending data...');
  syncAllPendingData();
});

/**
 * Handle background sync
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-data') {
    event.waitUntil(syncAllPendingData());
  }
});

/**
 * Add pending task to IndexedDB
 */
async function addPendingTask(task) {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PENDING_TASKS], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_TASKS);
      
      const pendingTask = {
        id: task.id || `pending_${Date.now()}_${Math.random()}`,
        ...task,
        status: 'pending',
        createdAt: new Date().toISOString(),
        synced: false
      };

      const request = store.add(pendingTask);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(pendingTask);
    });
  } catch (error) {
    console.error('Error adding pending task:', error);
    throw error;
  }
}

/**
 * Remove pending task from IndexedDB
 */
async function removePendingTask(taskId) {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PENDING_TASKS], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_TASKS);
      const request = store.delete(taskId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  } catch (error) {
    console.error('Error removing pending task:', error);
    throw error;
  }
}

/**
 * Update pending task status
 */
async function updatePendingTaskStatus(taskId, status) {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PENDING_TASKS], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_TASKS);
      const getRequest = store.get(taskId);

      getRequest.onsuccess = () => {
        const task = getRequest.result;
        if (task) {
          task.status = status;
          task.updatedAt = new Date().toISOString();
          const updateRequest = store.put(task);
          updateRequest.onsuccess = () => resolve(task);
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Task not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('Error updating pending task status:', error);
    throw error;
  }
}

/**
 * Get all pending habits from IndexedDB
 */
async function getPendingHabits() {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PENDING_HABITS], 'readonly');
      const store = transaction.objectStore(STORES.PENDING_HABITS);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const habits = request.result.filter(habit => habit.status === 'pending');
        resolve(habits);
      };
    });
  } catch (error) {
    console.error('Error getting pending habits:', error);
    return [];
  }
}

/**
 * Add pending habit to IndexedDB
 */
async function addPendingHabit(habit) {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PENDING_HABITS], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_HABITS);
      
      const pendingHabit = {
        id: habit.id || `pending_habit_${Date.now()}_${Math.random()}`,
        ...habit,
        status: 'pending',
        createdAt: new Date().toISOString(),
        synced: false
      };

      const request = store.add(pendingHabit);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(pendingHabit);
    });
  } catch (error) {
    console.error('Error adding pending habit:', error);
    throw error;
  }
}

/**
 * Remove pending habit from IndexedDB
 */
async function removePendingHabit(habitId) {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PENDING_HABITS], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_HABITS);
      const request = store.delete(habitId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  } catch (error) {
    console.error('Error removing pending habit:', error);
    throw error;
  }
}

/**
 * Update pending habit status
 */
async function updatePendingHabitStatus(habitId, status) {
  try {
    const db = await initializeDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PENDING_HABITS], 'readwrite');
      const store = transaction.objectStore(STORES.PENDING_HABITS);
      const getRequest = store.get(habitId);

      getRequest.onsuccess = () => {
        const habit = getRequest.result;
        if (habit) {
          habit.status = status;
          habit.updatedAt = new Date().toISOString();
          const updateRequest = store.put(habit);
          updateRequest.onsuccess = () => resolve(habit);
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Habit not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  } catch (error) {
    console.error('Error updating pending habit status:', error);
    throw error;
  }
}

// Handle messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({
      version: CACHE_NAME
    });
  }
});