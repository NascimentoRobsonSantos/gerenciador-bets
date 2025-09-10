"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(token ? { token } : { email, password }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Falha no login");
      }
      window.location.href = "/";
    } catch (e: any) {
      setError(e?.message || "Erro ao logar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-lg border border-neutral-800 bg-neutral-900/40 p-6 mt-16">
      <h1 className="mb-4 text-xl font-semibold">Login</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <div>
            <label className="mb-1 block text-sm text-neutral-400">E-mail</label>
            <input
              className="w-full rounded border form-input px-3 py-2"
              placeholder="voce@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-400">Senha</label>
            <input
              type="password"
              className="w-full rounded border form-input px-3 py-2"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="text-xs text-neutral-500">ou informe diretamente um token</div>
          <div>
            <label className="mb-1 block text-sm text-neutral-400">Token</label>
            <input
              className="w-full rounded border form-input px-3 py-2"
              placeholder="Cole seu token aqui"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>
        </div>
        {error ? <div className="text-sm text-red-400">{error}</div> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md border border-neutral-700 bg-b365-green/20 px-3 py-2 text-sm hover:bg-b365-green/30"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
