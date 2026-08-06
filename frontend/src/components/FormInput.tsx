"use client";

import React, { useState } from "react";
import styles from "./FormInput.module.css";

/* ── Shared Text / Email Input ─────────────────── */
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  error?: string;
}

export function FormInput({ label, id, error, className, ...rest }: FormInputProps) {
  return (
    <div className={styles.group}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <input
        id={id}
        className={[
          styles.input,
          error ? styles["input--error"] : "",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      />
      {error && <span className={styles.hint}>{error}</span>}
    </div>
  );
}

/* ── Password Input with show/hide toggle ──────── */
interface PasswordInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  id: string;
  error?: string;
  showStrength?: boolean;
  value?: string;
}

function getStrength(pwd: string): { pct: number; label: string; color: string } {
  if (!pwd) return { pct: 0, label: "", color: "transparent" };
  let score = 0;
  if (pwd.length >= 6)  score++;
  if (pwd.length >= 10) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { pct: 33,  label: "Weak",   color: "var(--error)" };
  if (score <= 3) return { pct: 66,  label: "Fair",   color: "var(--warning)" };
  return              { pct: 100, label: "Strong", color: "var(--success)" };
}

export function PasswordInput({
  label,
  id,
  error,
  showStrength = false,
  value = "",
  ...rest
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? getStrength(value as string) : null;

  return (
    <div className={styles.group}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <div className={styles.inputWrapper}>
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          className={[
            styles.input,
            styles["input--withIcon"],
            error ? styles["input--error"] : "",
          ]
            .filter(Boolean)
            .join(" ")}
          {...rest}
        />
        <button
          type="button"
          className={styles.eyeBtn}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      {strength && strength.pct > 0 && (
        <div className={styles.strengthRow}>
          <div className={styles.strengthTrack}>
            <div
              className={styles.strengthFill}
              style={{ width: `${strength.pct}%`, backgroundColor: strength.color }}
            />
          </div>
          <span className={styles.strengthLabel} style={{ color: strength.color }}>
            {strength.label}
          </span>
        </div>
      )}

      {error && <span className={styles.hint}>{error}</span>}
    </div>
  );
}

/* ── Select Dropdown ───────────────────────────── */
interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  error?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export function FormSelect({ label, id, error, placeholder, options, ...rest }: FormSelectProps) {
  return (
    <div className={styles.group}>
      <label htmlFor={id} className={styles.label}>{label}</label>
      <input
        id={id + "_hidden"}
        className={styles.input}
        style={{ display: "none" }}
        readOnly
      />
      {/* Custom select rendered as styled element */}
      <div className={styles.inputWrapper}>
        <select
          id={id}
          className={[styles.input, error ? styles["input--error"] : ""].filter(Boolean).join(" ")}
          style={{ cursor: "pointer" }}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {error && <span className={styles.hint}>{error}</span>}
    </div>
  );
}
