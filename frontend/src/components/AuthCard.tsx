import React from "react";
import Link from "next/link";
import styles from "./AuthCard.module.css";

interface AuthCardProps {
  children: React.ReactNode;
  brandTitle?: string;
  brandDesc?: string;
  title: string;
  subtitle?: string;
  footerText?: string;
  footerLinkLabel?: string;
  footerLinkHref?: string;
}

const BRAND_FEATURES = [
  "AI-powered research funding discovery",
  "Real-time innovation analytics",
  "Role-based access control",
  "Enterprise-grade data security",
];

// Clean SVG icon — no emojis
function CheckIcon() {
  return (
    <svg className={styles.brandFeatureIcon} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2.5 8 6.5 12 13.5 4" />
    </svg>
  );
}

export default function AuthCard({
  children,
  brandTitle = "Research Funding Intelligence Platform",
  brandDesc  = "Discover funding opportunities, track research innovations, and collaborate with institutions worldwide.",
  title,
  subtitle,
  footerText,
  footerLinkLabel,
  footerLinkHref,
}: AuthCardProps) {
  return (
    <div className={styles.page}>

      {/* ── Left Brand Panel ── */}
      <aside className={styles.brand}>
        <div className={styles.brandTop}>
          <div className={styles.brandMark}>
            {/* Minimal DNA/network logomark */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.9)" stroke="none" />
              <circle cx="3"  cy="4"  r="1.5" fill="rgba(255,255,255,0.5)" stroke="none" />
              <circle cx="17" cy="4"  r="1.5" fill="rgba(255,255,255,0.5)" stroke="none" />
              <circle cx="3"  cy="16" r="1.5" fill="rgba(255,255,255,0.5)" stroke="none" />
              <circle cx="17" cy="16" r="1.5" fill="rgba(255,255,255,0.5)" stroke="none" />
              <line x1="10" y1="10" x2="3"  y2="4"  />
              <line x1="10" y1="10" x2="17" y2="4"  />
              <line x1="10" y1="10" x2="3"  y2="16" />
              <line x1="10" y1="10" x2="17" y2="16" />
            </svg>
          </div>
          <span className={styles.brandName}>InnovatIQ</span>
        </div>

        <div className={styles.brandMiddle}>
          <h2 className={styles.brandTitle}>{brandTitle}</h2>
          <p className={styles.brandDesc}>{brandDesc}</p>
        </div>

        <ul className={styles.brandBottom}>
          {BRAND_FEATURES.map((f) => (
            <li key={f} className={styles.brandFeature}>
              <CheckIcon />
              {f}
            </li>
          ))}
        </ul>
      </aside>

      {/* ── Right Form Panel ── */}
      <main className={styles.formPanel}>
        <div className={styles.card}>
          <header className={styles.cardHeader}>
            <h1 className={styles.cardTitle}>{title}</h1>
            {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
          </header>

          {children}

          {footerText && footerLinkHref && footerLinkLabel && (
            <>
              <div className={styles.divider} />
              <p className={styles.footer}>
                {footerText}{" "}
                <Link href={footerLinkHref} className={styles.footerLink}>
                  {footerLinkLabel}
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
