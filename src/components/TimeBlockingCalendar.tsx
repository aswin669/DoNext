"use client";

import { useState, useEffect } from "react";

type TimeBlock = {
    id: string;
    title: string;
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
    category: string;
    color: string;
    description?: string;
};

type TimeSlot = {
    time: string; // HH:MM format
    blocks: TimeBlock[];
};

const CATEGORIES = [
    { name: 'Work', color: 'bg-blue-500' },
    { name: 'Personal', color: 'bg-green-500' },
    { name: 'Health', color: 'bg-red-500' },
    { name: 'Learning', color: 'bg-purple-500' },
    { name: 'Meetings', color: 'bg-yellow-500' },
    { name: 'Break', color: 'bg-gray-500' }
];

const HOURS = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
});

export default function TimeBlockingCalendar() {
    const [blocks, setBlocks] = useState<TimeBlock[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);
    const [newBlock, setNewBlock] = useState<Omit<TimeBlock, 'id'>>({
        title: '',
        startTime: '09:00',
        endTime: '10:00',
        category: 'Work',
        color: 'bg-blue-500',
        description: ''
    });

    // Generate time slots for the calendar view
    const generateTimeSlots = (): TimeSlot[] => {
        return HOURS.map(hour => ({
            time: hour,
            blocks: blocks.filter(block => block.startTime === hour)
        }));
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingBlock) {
            // Update existing block
            setBlocks(prev => prev.map(block => 
                block.id === editingBlock.id 
                    ? { ...editingBlock, ...newBlock }
                    : block
            ));
        } else {
            // Create new block
            const block: TimeBlock = {
                ...newBlock,
                id: Date.now().toString()
            };
            setBlocks(prev => [...prev, block]);
        }
        
        resetForm();
    };

    // Reset form
    const resetForm = () => {
        setNewBlock({
            title: '',
            startTime: '09:00',
            endTime: '10:00',
            category: 'Work',
            color: 'bg-blue-500',
            description: ''
        });
        setEditingBlock(null);
        setShowModal(false);
    };

    // Edit block
    const editBlock = (block: TimeBlock) => {
        setEditingBlock(block);
        setNewBlock({
            title: block.title,
            startTime: block.startTime,
            endTime: block.endTime,
            category: block.category,
            color: block.color,
            description: block.description || ''
        });
        setShowModal(true);
    };

    // Delete block
    const deleteBlock = (id: string) => {
        setBlocks(prev => prev.filter(block => block.id !== id));
    };

    // Get category color
    const getCategoryColor = (categoryName: string): string => {
        const category = CATEGORIES.find(cat => cat.name === categoryName);
        return category ? category.color : 'bg-gray-500';
    };

    // Format time for display
    const formatTime = (time: string): string => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const timeSlots = generateTimeSlots();

    return (
        <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-100 dark:border-[#222] p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Time Blocking Calendar</h2>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222] text-sm"
                    />
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-opacity-90 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Add Block
                    </button>
                </div>
            </div>

            {/* Calendar View */}
            <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                    {/* Time Headers */}
                    <div className="flex border-b border-slate-100 dark:border-[#333]">
                        <div className="w-20 flex-shrink-0"></div>
                        <div className="flex-1 p-3 font-bold text-center text-slate-700 dark:text-slate-300">
                            {new Date(selectedDate).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </div>
                    </div>

                    {/* Time Slots */}
                    <div className="divide-y divide-slate-100 dark:divide-[#333]">
                        {timeSlots.map((slot, index) => (
                            <div key={slot.time} className="flex min-h-16">
                                {/* Time Label */}
                                <div className="w-20 flex-shrink-0 p-2 text-right text-sm text-slate-500 font-medium">
                                    {formatTime(slot.time)}
                                </div>
                                
                                {/* Time Block Area */}
                                <div className="flex-1 p-1 relative">
                                    {slot.blocks.length > 0 ? (
                                        <div className="space-y-1">
                                            {slot.blocks.map(block => (
                                                <div
                                                    key={block.id}
                                                    className={`${getCategoryColor(block.category)} text-white p-2 rounded-lg text-sm cursor-pointer hover:brightness-110 transition-all group relative`}
                                                    onClick={() => editBlock(block)}
                                                >
                                                    <div className="font-bold truncate">{block.title}</div>
                                                    <div className="text-xs opacity-90 truncate">
                                                        {formatTime(block.startTime)} - {formatTime(block.endTime)}
                                                    </div>
                                                    {block.description && (
                                                        <div className="text-xs opacity-75 mt-1 truncate">
                                                            {block.description}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            deleteBlock(block.id);
                                                        }}
                                                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/20 rounded"
                                                    >
                                                        <span className="material-symbols-outlined text-[14px]">close</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div 
                                            className="h-full w-full hover:bg-slate-50 dark:hover:bg-[#222] rounded cursor-pointer transition-colors flex items-center justify-center"
                                            onClick={() => {
                                                setNewBlock(prev => ({
                                                    ...prev,
                                                    startTime: slot.time,
                                                    endTime: HOURS[index + 1] || '23:59'
                                                }));
                                                setShowModal(true);
                                            }}
                                        >
                                            <span className="text-slate-300 text-xs">+ Add time block</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-xl max-w-md w-full p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">
                                {editingBlock ? 'Edit Time Block' : 'Add Time Block'}
                            </h3>
                            <button
                                onClick={resetForm}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    value={newBlock.title}
                                    onChange={(e) => setNewBlock(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Start Time</label>
                                    <input
                                        type="time"
                                        value={newBlock.startTime}
                                        onChange={(e) => setNewBlock(prev => ({ ...prev, startTime: e.target.value }))}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">End Time</label>
                                    <input
                                        type="time"
                                        value={newBlock.endTime}
                                        onChange={(e) => setNewBlock(prev => ({ ...prev, endTime: e.target.value }))}
                                        className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    value={newBlock.category}
                                    onChange={(e) => {
                                        const category = CATEGORIES.find(cat => cat.name === e.target.value);
                                        setNewBlock(prev => ({ 
                                            ...prev, 
                                            category: e.target.value,
                                            color: category?.color || 'bg-gray-500'
                                        }));
                                    }}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222]"
                                >
                                    {CATEGORIES.map(category => (
                                        <option key={category.name} value={category.name}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Description (Optional)</label>
                                <textarea
                                    value={newBlock.description}
                                    onChange={(e) => setNewBlock(prev => ({ ...prev, description: e.target.value }))}
                                    className="w-full px-3 py-2 border border-slate-200 dark:border-[#333] rounded-lg bg-white dark:bg-[#222] h-20 resize-none"
                                    placeholder="Add details about this time block..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-[#333] rounded-lg font-bold hover:bg-slate-50 dark:hover:bg-[#222] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-opacity-90 transition-all"
                                >
                                    {editingBlock ? 'Update' : 'Add'} Block
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-[#333]">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Category Legend</h3>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(category => (
                        <div key={category.name} className="flex items-center gap-2 text-xs">
                            <div className={`size-3 rounded-full ${category.color}`}></div>
                            <span className="text-slate-600 dark:text-slate-400">{category.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}