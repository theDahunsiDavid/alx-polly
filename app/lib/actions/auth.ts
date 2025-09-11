"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { User } from "@/types";

type AuthResult = {
  error?: string;
  user?: User;
};

type RegisterResult = {
  error?: string;
  success?: string;
};

// Basic email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Redacts an email address for logging purposes, showing up to the first two characters of the local part.
 * If the email is malformed, it returns "[redacted]".
 * @param email The email address to redact.
 * @returns The redacted email string.
 */
function redactEmail(email: string): string {
  if (!EMAIL_REGEX.test(email)) {
    return "[redacted]";
  }
  const [localPart, domainPart] = email.split('@');
  const redactedLocalPart = localPart.length > 2 ? localPart.substring(0, 2) + '***' : localPart.substring(0,2) + '***';
  return `${redactedLocalPart}@${domainPart}`;
}

export async function login(formData: FormData): Promise<AuthResult | never> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  // Validate email
  if (!email) {
    return {
      error: "Email is required",
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      error: "Please enter a valid email address",
    };
  }

  // Validate password
  if (!password) {
    return {
      error: "Password is required",
    };
  }

  if (password.length < 6) {
    return {
      error: "Password must be at least 6 characters long",
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Login authentication error:", {
        error: error.message,
        email: redactEmail(email),
        timestamp: new Date().toISOString(),
      });
      return {
        error: "Invalid credentials",
      };
    }
  } catch (error) {
    console.error("Unexpected login error:", {
      error: error instanceof Error ? error.message : String(error),
      email: redactEmail(email),
      timestamp: new Date().toISOString(),
    });
    return {
      error: "Authentication failed",
    };
  }

  redirect("/dashboard");
}

export async function register(formData: FormData): Promise<RegisterResult> {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  // Validate name
  if (!name) {
    return {
      error: "Name is required",
    };
  }

  // Validate email
  if (!email) {
    return {
      error: "Email is required",
    };
  }

  if (!EMAIL_REGEX.test(email)) {
    return {
      error: "Please enter a valid email address",
    };
  }

  // Validate password
  if (!password) {
    return {
      error: "Password is required",
    };
  }

  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters",
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    if (error) {
      console.error("Registration error:", {
        error: error.message,
        email: redactEmail(email),
        timestamp: new Date().toISOString(),
      });
      return {
        error: "Registration failed. Please try again.",
      };
    }
  } catch (error) {
    console.error("Unexpected registration error:", {
      error: error instanceof Error ? error.message : String(error),
      email: redactEmail(email),
      timestamp: new Date().toISOString(),
    });
    return {
      error: "Registration failed. Please try again.",
    };
  }

  return {
    success:
      "Registration successful! Please check your email to verify your account.",
  };
}
