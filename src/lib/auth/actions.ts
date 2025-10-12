"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  password: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export async function signUp(data: SignUpData) {
  const supabase = await createClient();

  // Create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (authError) {
    return { error: authError.message };
  }

  if (!authData.user) {
    return { error: "Failed to create user" };
  }

  // Create the user profile in our custom table
  const { error: profileError } = await supabase.from("users").insert({
    id: authData.user.id,
    email: data.email,
    first_name: data.firstName,
    last_name: data.lastName,
    phone: data.phone,
    company: data.company,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  revalidatePath("/", "layout");
  redirect("/test");
}

export async function signIn(data: SignInData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/test");
}

export async function signOut() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch the user profile data
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}
