"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import { apiFetch, ApiError } from "@/utils/api";
import { useToast } from "@/components/Toast";
import styles from "./page.module.css";

interface JwtUser  { sub: string; email: string; role: string; }
interface FullUser  {
  _id: string; user_id: string; name: string;
  email: string; role_id: string;
  is_active: boolean; created_at?: string;
}

const FEATURES = [
  { icon: "🔍", title: "Funding Discovery",     desc: "Browse AI-curated government & private research funding opportunities." },
  { icon: "📊", title: "Innovation Analytics",  desc: "Run real-time reports on research investments and emerging sectors." },
  { icon: "📂", title: "My Applications",       desc: "Track and manage all your submitted funding proposals in one place." },
  { icon: "🤝", title: "Collaboration Hub",     desc: "Connect with researchers, institutions, and industry partners globally." },
  { icon: "📣", title: "Alerts & Deadlines",    desc: "Never miss a deadline with smart funding alerts and reminders." },
  { icon: "⚙️", title: "Account Settings",      desc: "Manage your profile, security settings, and API keys." },
];

const STATS = [
  { icon: "💰", value: "2,400+", label: "Active Grants" },
  { icon: "🏛️", value: "180+",   label: "Institutions" },
  { icon: "🌍", value: "42",     label: "Countries" },
  { icon: "📈", value: "$6.8B",  label: "Tracked Funding" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [user, setUser]         = useState<FullUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const jwt  = await apiFetch<JwtUser>("api/auth/me");
        const full = await apiFetch<FullUser>(`api/users/${jwt.sub}`);
        setUser(full);
      } catch {
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await apiFetch("api/auth/logout", { method: "POST" });
      showToast("You have been signed out.", "success");
      router.push("/login");
    } catch {
      showToast("Logout failed. Please try again.", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="loading-screen">
        <span className="spinner spinner--primary spinner--lg" />
        <p>Loading your dashboard…</p>
      </div>
    );
  }

  if (!user) return null;

  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <>
      {/* ── Sticky Navbar ── */}
      <nav className={styles.navbar}>
        <div className={styles.navBrand}>
          <div className={styles.navIcon}>🔬</div>
          <span className={styles.navTitle}>InnovatIQ</span>
        </div>

        <div className={styles.navRight}>
          <div className={styles.navUser}>
            <div className={styles.navAvatar}>{initial}</div>
            <span className={styles.navUserName}>{user.name}</span>
          </div>
          <Button variant="danger" size="sm" onClick={handleLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </Button>
        </div>
      </nav>

      {/* ── Page Body ── */}
      <div className={styles.page}>

        {/* Greeting */}
        <div className={styles.pageHeader}>
          <h1 className={styles.greeting}>Good day, {user.name.split(" ")[0]} 👋</h1>
          <p className={styles.greetingSubtitle}>Here's a quick overview of your research platform activity.</p>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statIcon}>{s.icon}</div>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className={styles.grid}>

          {/* ── Profile Sidebar ── */}
          <aside className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>My Profile</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.profileTop}>
                <div className={styles.avatar}>{initial}</div>
                <div className={styles.profileMeta}>
                  <span className={styles.profileName}>{user.name}</span>
                  <span className={styles.profileEmail}>{user.email}</span>
                </div>
              </div>

              <div className={styles.detailList}>
                {[
                  { label: "User ID",   value: user.user_id },
                  { label: "Joined",    value: joinDate },
                  { label: "Status",    value: (
                    <span className={`${styles.badge} ${user.is_active ? styles["badge--active"] : styles["badge--inactive"]}`}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  )},
                  { label: "Role ID",   value: user.role_id.slice(-8) + "…" },
                ].map((d) => (
                  <div key={d.label} className={styles.detailItem}>
                    <span className={styles.detailLabel}>{d.label}</span>
                    <span className={styles.detailValue}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Dashboard Content ── */}
          <section className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Platform Overview</h2>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.welcomeNote}>
                ✅ You are successfully authenticated. Explore the features below to get started with the Research Funding Intelligence Platform.
              </div>

              <div className={styles.featureGrid}>
                {FEATURES.map((f) => (
                  <div key={f.title} className={styles.featureCard}>
                    <div className={styles.featureIcon}>{f.icon}</div>
                    <h3 className={styles.featureTitle}>{f.title}</h3>
                    <p className={styles.featureDesc}>{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
