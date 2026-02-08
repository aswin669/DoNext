"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function signUpUser(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;

  if (!email || !password || !name) {
    return { error: "Email, name, and password are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  try {
    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    return { success: true, user: { id: user.id, email: user.email } };
  } catch (error: any) {
    console.error("Signup error:", error);
    if (error.code === 'P2002') {
      return { error: "User with this email already exists" };
    }
    return { error: "Something went wrong" };
  }
}
