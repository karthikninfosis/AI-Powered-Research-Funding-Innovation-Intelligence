import React from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "outline" | "ghost" | "danger";
export type ButtonSize    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  isLoading = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  const cls = [
    styles.btn,
    styles[`btn--${variant}`],
    styles[`btn--${size}`],
    fullWidth ? styles["btn--full"] : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={cls} disabled={disabled || isLoading} {...rest}>
      {isLoading && (
        <span
          className="spinner"
          aria-hidden="true"
          style={
            variant === "primary"
              ? undefined
              : { borderColor: "rgba(0,0,0,0.15)", borderTopColor: "currentColor" }
          }
        />
      )}
      {children}
    </button>
  );
}
