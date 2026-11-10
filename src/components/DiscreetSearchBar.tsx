"use client";

import React, { useState, useRef, useEffect } from "react";

interface DiscreetSearchBarProps {
  value: string;
  onChange: (newValue: string) => void;
  placeholder?: string;
  className?: string;
}

export function DiscreetSearchBar({
  value,
  onChange,
  placeholder = "Digite para pesquisar...",
  className = "",
}: DiscreetSearchBarProps) {
  const [isOpen, setIsOpen] = useState(Boolean(value.trim()));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Se o valor externo mudar para preenchido, mantém aberto
  useEffect(() => {
    if (value.trim()) {
      setIsOpen(true);
    }
  }, [value]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    onChange("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (value.trim()) {
        onChange("");
      } else {
        setIsOpen(false);
      }
    }
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={handleOpen}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#111318] hover:bg-zinc-800/80 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition-colors shrink-0 ${className}`}
        title="Abrir campo de busca"
      >
        <svg
          className="w-3.5 h-3.5 text-zinc-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span>Pesquisar</span>
        {value.trim() && (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        )}
      </button>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center gap-1.5 bg-[#111318] border border-zinc-700/80 rounded px-2.5 py-1 text-xs text-zinc-100 transition-all ${className}`}
    >
      <svg
        className="w-3.5 h-3.5 text-emerald-400 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="bg-transparent border-none outline-none text-xs text-zinc-100 placeholder-zinc-500 w-44 sm:w-60 focus:ring-0"
      />

      <button
        type="button"
        onClick={handleClose}
        className="text-zinc-400 hover:text-zinc-200 text-xs px-1 hover:bg-zinc-800 rounded transition-colors"
        title="Fechar pesquisa"
      >
        ✕
      </button>
    </div>
  );
}
