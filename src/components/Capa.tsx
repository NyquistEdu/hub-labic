'use client';

import { useEffect, useRef, useState } from 'react';
import { AREAS } from '@/lib/tipos';

/**
 * Capa de projeto. Quando não há foto (ou ela falha ao carregar), mostra um
 * desenho de trilhas de circuito na cor da frente principal do projeto.
 */
export function Capa({ src, alt, areas, className = '', espelhar = false }: { src?: string; alt: string; areas: string[]; className?: string; espelhar?: boolean }) {
  const [falhou, setFalhou] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // A imagem pode falhar antes de o React assumir a página; confere de novo ao montar.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFalhou(true);
  }, [src]);
  const cor = AREAS[areas[0]]?.cor ?? '#000';
  const cor2 = AREAS[areas[1]]?.cor ?? cor;
  return (
    <div className={`relative overflow-hidden bg-nevoa ${className}`}>
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full" style={espelhar ? { transform: 'scaleX(-1)' } : undefined} aria-hidden>
        <rect width="400" height="300" fill={cor} opacity=".14" />
        <g fill="none" stroke="#000" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-10 210 H120 L160 170 H250" />
          <path d="M410 80 H300 L260 120 H190" />
          <path d="M90 -10 V60 L130 100" />
        </g>
        <circle cx="250" cy="170" r="13" fill={cor} stroke="#000" strokeWidth="5" />
        <circle cx="190" cy="120" r="13" fill="#fff" stroke="#000" strokeWidth="5" />
        <circle cx="130" cy="100" r="13" fill={cor2} stroke="#000" strokeWidth="5" />
      </svg>
      {src && !falhou && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFalhou(true)}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
}
