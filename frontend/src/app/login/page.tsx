"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import { FormInput, PasswordInput } from "@/components/FormInput";
import Button from "@/components/Button";
import { apiFetch, ApiError } from "@/utils/api";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading]         = useState(false);
  const [isVerifying, setIsVerifying]     = useState(true);

  // Redirect if already authenticated
  useEffect(() => {
    apiFetch("api/auth/me")
      .then(() => { showToast("You are already signed in.", "info"); router.push("/"); })
      .catch(() => setIsVerifying(false));
  }, [router, showToast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast("Please fill in all fields.", "warning"); return;
    }
    setIsLoading(true);
    try {
      const res = await apiFetch<{ message: string }>("api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      showToast(res.message || "Signed in successfully!", "success");
      router.push("/");
    } catch (err) {
      showToast((err as ApiError).message || "Invalid email or password.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="loading-screen">
        <span className="spinner spinner--primary spinner--lg" />
        <p>Checking session…</p>
      </div>
    );
  }

  return (
    <AuthCard
      badge="Secure Portal"
      title="Sign in to your account"
      subtitle="Welcome back! Enter your credentials to access the platform."
      footerText="Don't have an account?"
      footerLinkLabel="Create one for free"
      footerLinkHref="/register"
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <FormInput
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <PasswordInput
          id="password"
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />

        <Button type="submit" fullWidth size="lg" isLoading={isLoading}>
          {isLoading ? "Signing in…" : "Sign In"}
        </Button>
      </form>
    </AuthCard>
  );
}
