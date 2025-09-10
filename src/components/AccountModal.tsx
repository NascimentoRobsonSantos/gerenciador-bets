"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type User = { email: string; name?: string | null; dark_theme?: boolean | null };

export default function AccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User>({ email: "" });
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/users", { cache: "no-store" });
        if (res.status === 401) { window.location.href = "/login"; return; }
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        const u = Array.isArray(data) ? (data[0] || {}) : data;
        setUser({ email: u.email || "", name: u.name || "", dark_theme: u.dark_theme ?? undefined });
      } catch (e: any) {
        setError(e?.message || "Falha ao carregar usuário");
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  async function onSave() {
    try {
      setSaving(true);
      setError(null);
      const payload: any = { email: user.email, name: user.name, dark_theme: !!user.dark_theme };
      if (password.trim()) payload.password = password;
      const res = await fetch("/api/users", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.status === 401) { window.location.href = "/login"; return; }
      if (!res.ok) throw new Error(await res.text());
      onClose();
    } catch (e: any) {
      setError(e?.message || "Falha ao salvar");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/60 px-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-lg border border-neutral-800 bg-background text-foreground p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-lg font-semibold mb-3">Conta</div>
        {loading ? (
          <div className="text-sm text-neutral-400">Carregando...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm">
              <div className="text-xs text-neutral-400">Nome</div>
              <input className="w-full rounded border form-input px-2 py-1" value={user.name ?? ""} onChange={(e) => setUser({ ...user, name: e.target.value })} />
            </label>
            <label className="text-sm">
              <div className="text-xs text-neutral-400">E-mail</div>
              <input className="w-full rounded border form-input px-2 py-1" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
            </label>
            <label className="text-sm sm:col-span-2">
              <div className="text-xs text-neutral-400">Senha (opcional)</div>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  className="w-full rounded border form-input px-2 py-1 pr-8"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Deixe em branco para não alterar"
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>
            <label className="text-sm flex items-center gap-2 sm:col-span-2">
              <input type="checkbox" checked={!!user.dark_theme} onChange={(e) => setUser({ ...user, dark_theme: e.target.checked })} />
              <span>Usar tema escuro</span>
            </label>
          </div>
        )}
        {error ? <div className="mt-2 text-sm text-red-400">{error}</div> : null}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-800/60">Cancelar</button>
          <button onClick={onSave} disabled={saving} className="rounded-md border border-neutral-700 bg-b365-green/20 px-3 py-1.5 text-sm hover:bg-b365-green/30">{saving ? 'Salvando...' : 'Salvar'}</button>
        </div>
      </div>
    </div>
  );
}

