"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/AuthCard";
import { FormInput, PasswordInput, FormSelect } from "@/components/FormInput";
import Button from "@/components/Button";
import { apiFetch, ApiError } from "@/utils/api";
import { useToast } from "@/components/Toast";

interface Role { _id: string; roleId: string; name: string; }

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [name,            setName]            = useState("");
  const [email,           setEmail]           = useState("");
  const [password,        setPassword]        = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [roleId,          setRoleId]          = useState("");
  const [roles,           setRoles]           = useState<Role[]>([]);
  const [isLoading,       setIsLoading]       = useState(false);
  const [rolesLoading,    setRolesLoading]    = useState(true);

  // Errors per field
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    apiFetch<Role[]>("api/roles/get")
      .then((data) => {
        setRoles(data);
        if (data.length > 0) setRoleId(data[0]._id);
      })
      .catch(() => showToast("Could not load platform roles.", "error"))
      .finally(() => setRolesLoading(false));
  }, [showToast]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Please enter a valid email.";
    if (password.length < 6) e.password = "Password must be at least 6 characters.";
    if (password !== confirmPassword) e.confirmPassword = "Passwords do not match.";
    if (!roleId) e.roleId = "Please select a role.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      showToast("Please fix the errors below.", "warning");
      return;
    }
    setErrors({});
    setIsLoading(true);
    try {
      const res = await apiFetch<{ message: string }>("api/users/", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role_id: roleId, is_active: true }),
      });
      showToast(res.message || "Account created successfully!", "success");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      showToast((err as ApiError).message || "Registration failed.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      badge="Join the Platform"
      title="Create your account"
      subtitle="Fill in your details below to get started."
      footerText="Already have an account?"
      footerLinkLabel="Sign in instead"
      footerLinkHref="/login"
    >
      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <FormInput
          id="name"
          label="Full name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
          error={errors.name}
          autoComplete="name"
          required
        />

        <FormInput
          id="email"
          label="Email address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
          error={errors.email}
          autoComplete="email"
          required
        />

        <FormSelect
          id="role"
          label="Platform role"
          value={roleId}
          onChange={(e) => { setRoleId(e.target.value); setErrors((p) => ({ ...p, roleId: "" })); }}
          error={errors.roleId}
          disabled={rolesLoading}
          options={roles.map((r) => ({
            value: r._id,
            label: `${r.name.charAt(0).toUpperCase() + r.name.slice(1)} (${r.roleId})`,
          }))}
          placeholder={rolesLoading ? "Loading roles…" : undefined}
        />

        <PasswordInput
          id="password"
          label="Password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: "" })); }}
          error={errors.password}
          showStrength
          autoComplete="new-password"
          required
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: "" })); }}
          error={errors.confirmPassword}
          autoComplete="new-password"
          required
        />

        <div style={{ marginTop: "4px" }}>
          <Button type="submit" fullWidth size="lg" isLoading={isLoading} disabled={rolesLoading}>
            {isLoading ? "Creating account…" : "Create Account"}
          </Button>
        </div>
      </form>
    </AuthCard>
  );
}
