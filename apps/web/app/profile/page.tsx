"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, LogOut, Calendar } from "lucide-react";
import { getUser, isLoggedIn, logout, type UserProfile } from "@/app/auth/auth";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/auth/login");
      return;
    }
    setUser(getUser());
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/auth/login");
  }

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-page">
      <h1 className="page-title">Profile</h1>

      <div className="profile-card">
        <div className="profile-avatar">
          {user.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
        <h2 className="profile-name">{user.name || "User"}</h2>
        <p className="profile-email">{user.email}</p>
      </div>

      <div className="profile-details">
        <div className="profile-row">
          <User size={16} />
          <span className="profile-label">Name</span>
          <span className="profile-value">{user.name || "—"}</span>
        </div>
        <div className="profile-row">
          <Mail size={16} />
          <span className="profile-label">Email</span>
          <span className="profile-value">{user.email}</span>
        </div>
        <div className="profile-row">
          <Shield size={16} />
          <span className="profile-label">Auth</span>
          <span className="profile-value" style={{ textTransform: "capitalize" }}>{user.auth_provider}</span>
        </div>
      </div>

      <button className="profile-logout" onClick={handleLogout}>
        <LogOut size={16} />
        Log Out
      </button>
    </div>
  );
}
