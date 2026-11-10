"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLabic } from "@/context/LabicContext";

export default function LoginPage() {
  const { login, isAuthenticated } = useLabic();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/app");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.ok) {
      router.push("/app");
    } else {
      setError(result.error || "Falha ao autenticar.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0d10] text-zinc-100 flex flex-col justify-between p-6">
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
          ← Voltar para a página institucional
        </Link>
        <span className="text-xs text-zinc-500">IFS — Campus Lagarto</span>
      </div>

      <div className="max-w-sm w-full mx-auto bg-[#111318] border border-zinc-800/80 rounded-lg p-6 shadow-xl">
        <div className="mb-6">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-6 h-6 rounded bg-emerald-600 flex items-center justify-center font-semibold text-white text-xs">
              L
            </div>
            <span className="font-semibold text-sm tracking-tight text-zinc-100">HUB-LABIC</span>
          </div>
          <h1 className="text-lg font-semibold text-zinc-100">Acesso Interno</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Entre com seu e-mail e senha cadastrados no laboratório. Sua sessão permanece ativa por 24 horas.
          </p>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded bg-red-950/50 border border-red-900/60 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@academico.ifs.edu.br"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Senha</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-medium transition-colors"
          >
            {submitting ? "Verificando..." : "Entrar no Sistema"}
          </button>
        </form>
      </div>

      <div className="text-center text-[11px] text-zinc-600">
        LABIC — Laboratório de Pesquisa · Instituto Federal de Sergipe
      </div>
    </div>
  );
}
