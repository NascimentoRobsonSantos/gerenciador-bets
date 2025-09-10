"use client";

export default function SessionExpiredModal({ active, message }: { active?: boolean; message?: string }) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-lg border border-neutral-800 bg-background text-foreground p-5 shadow-xl">
        <div className="text-lg font-semibold mb-2">Sessão expirada</div>
        <p className="text-sm text-neutral-400 mb-4">{message || 'Sua sessão expirou. Faça login novamente para continuar.'}</p>
        <div className="flex justify-end">
          <button
            onClick={() => { window.location.href = '/login'; }}
            className="rounded-md border border-neutral-700 bg-b365-green/20 px-3 py-1.5 text-sm hover:bg-b365-green/30"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

