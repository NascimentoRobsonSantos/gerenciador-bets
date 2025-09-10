"use client";

import { useEffect } from "react";

export default function SessionExpired({ active }: { active?: boolean }) {
  useEffect(() => {
    if (!active) return;
    alert("Sua sessão expirou. Faça login novamente.");
    window.location.href = "/logout";
  }, [active]);
  return null;
}

