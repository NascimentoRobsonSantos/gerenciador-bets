"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import AccountModal from "@/components/AccountModal";
import { useTheme } from "next-themes";

export default function SettingsMenu() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [dark, setDark] = useState(true);
  const [updating, setUpdating] = useState(false);
  useEffect(() => {
    const isDark = (theme ?? resolvedTheme) !== 'light';
    setDark(isDark);
  }, [theme, resolvedTheme]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest('#settings-menu')) setOpen(false);
    }
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  async function toggleTheme() {
    const newDark = !dark;
    setDark(newDark);
    setTheme(newDark ? 'dark' : 'light');
    try {
      // Busca sempre o usuário atual para obter o id
      let userId: string | number | null = null;
      try {
        const res = await fetch('/api/users', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const u = Array.isArray(data) ? (data[0] || {}) : data;
          if (u?.id != null) userId = u.id;
        }
      } catch {}
      if (!userId) userId = localStorage.getItem('userId');
      try { if (userId) localStorage.setItem('userId', String(userId)); } catch {}
      // Envia via API (proxy server-side para evitar CORS) – sempre envia
      await fetch('/api/users/dark_theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId ?? null, dark_theme: newDark }),
      });
    } catch {}
  }

  async function handleUpdateGroups() {
    setUpdating(true);
    alert('Atualizando os grupos monitorados...');
    try {
      await fetch('https://webhook.storeprodigital.site/webhook/bot-telegram/get-groups-corujao', {
        method: 'GET',
      });
      alert('Grupos atualizados com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar grupos. Tente novamente.');
    } finally {
      setUpdating(false);
      setOpen(false);
    }
  }

  return (
    <div id="settings-menu" className="relative">
      <button onClick={() => setOpen((v) => !v)} className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:bg-neutral-800/60" title="Configurações">
        <Settings className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-56 rounded-md border border-neutral-800 bg-background text-foreground p-2 shadow-xl">
          <button onClick={toggleTheme} className="w-full text-left rounded px-2 py-2 hover:bg-neutral-800/40 text-sm">
            Tema: {dark ? 'Escuro' : 'Claro'} (alternar)
          </button>
          <button onClick={() => setAccountOpen(true)} className="w-full text-left rounded px-2 py-2 hover:bg-neutral-800/40 text-sm">
            Conta
          </button>
          <button
            onClick={handleUpdateGroups}
            disabled={updating}
            className="w-full text-left rounded px-2 py-2 hover:bg-neutral-800/40 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updating ? 'Atualizando...' : 'Atualizar Grupos'}
          </button>
          <a href="/logout" className="block rounded px-2 py-2 hover:bg-neutral-800/40 text-sm">Sair</a>
        </div>
      ) : null}
      <AccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
    </div>
  );
}
