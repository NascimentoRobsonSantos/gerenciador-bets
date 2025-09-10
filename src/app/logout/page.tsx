"use client";

import { useEffect } from "react";

export default function LogoutPage() {
  useEffect(() => {
    (async () => {
      try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
      window.location.href = "/login";
    })();
  }, []);
  return <div className="p-6 text-sm text-neutral-400">Saindo...</div>;
}

