'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LabicMember, ProductionItem } from '@/types/labic';

interface WorldMapLabicProps {
  members: LabicMember[];
  productions?: ProductionItem[];
}

interface LocationCluster {
  key: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  members: LabicMember[];
}

export function WorldMapLabic({ members }: WorldMapLabicProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<unknown>(null);

  const activeMembers = useMemo(
    () => members.filter((m) => m.status === 'ATIVO'),
    [members]
  );

  const clusters = useMemo(() => {
    const map = new Map<string, LocationCluster>();
    for (const m of activeMembers) {
      const city = m.currentCity || 'Lagarto';
      const country = m.currentCountry || 'Brasil';
      const key = `${city.toLowerCase()}-${country.toLowerCase()}`;
      const existing = map.get(key);
      if (existing) {
        existing.members.push(m);
      } else {
        map.set(key, {
          key,
          city,
          state: m.currentStateOrProvince || '',
          country,
          lat: m.latitude || -10.9167,
          lng: m.longitude || -37.65,
          members: [m],
        });
      }
    }
    return Array.from(map.values());
  }, [activeMembers]);

  const [selectedKey, setSelectedKey] = useState<string>(clusters[0]?.key || '');
  const selectedCluster =
    clusters.find((c) => c.key === selectedKey) || clusters[0] || null;

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Carrega CSS do Leaflet se ainda não existir
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initMap = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current, {
        center: [15, -20],
        zoom: 2,
        minZoom: 2,
        worldCopyJump: true,
      });

      L.tileLayer(
        'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        {
          attribution: '&copy; OpenStreetMap &copy; CARTO',
          subdomains: 'abcd',
          maxZoom: 18,
        }
      ).addTo(map);

      clusters.forEach((cluster) => {
        const marker = L.circleMarker([cluster.lat, cluster.lng], {
          radius: 8,
          fillColor: '#10b981',
          color: '#ffffff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
        }).addTo(map);

        marker.bindTooltip(
          `${cluster.city}, ${cluster.country} (${cluster.members.length})`,
          { direction: 'top' }
        );

        marker.on('click', () => {
          setSelectedKey(cluster.key);
        });
      });

      mapInstanceRef.current = map;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).L) {
      initMap();
    } else {
      const existingScript = document.getElementById('leaflet-js');
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.async = true;
        script.onload = initMap;
        document.body.appendChild(script);
      } else {
        existingScript.addEventListener('load', initMap);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [clusters]);

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Distribuição Geográfica de Pesquisadores
          </h3>
          <p className="text-xs text-zinc-400">
            Localidades associadas aos membros ativos conforme cadastrado no perfil.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-400">
          <span>
            Polos ativos: <strong className="text-white">{clusters.length}</strong>
          </span>
          <span>
            Pesquisadores ativos:{' '}
            <strong className="text-white">{activeMembers.length}</strong>
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div
            ref={mapContainerRef}
            className="h-[340px] w-full rounded-lg border border-zinc-800 bg-zinc-950 z-0"
          />
        </div>

        <div className="lg:col-span-4 rounded-lg border border-zinc-800 bg-zinc-950 p-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5 border-b border-zinc-800 pb-2.5">
              {clusters.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setSelectedKey(c.key)}
                  className={`rounded px-2.5 py-1 text-xs font-medium cursor-pointer ${
                    selectedCluster?.key === c.key
                      ? 'bg-zinc-800 text-white border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {c.city} ({c.members.length})
                </button>
              ))}
            </div>

            {selectedCluster ? (
              <div className="space-y-2 max-h-[240px] overflow-y-auto">
                <p className="text-xs font-semibold text-zinc-300">
                  {selectedCluster.city}
                  {selectedCluster.state ? `, ${selectedCluster.state}` : ''} —{' '}
                  {selectedCluster.country}
                </p>
                {selectedCluster.members.map((m) => (
                  <div
                    key={m.id}
                    className="rounded border border-zinc-800 bg-zinc-900/50 p-2.5 text-xs"
                  >
                    <p className="font-medium text-white">{m.name}</p>
                    <p className="text-zinc-400 mt-0.5">
                      {m.degreeLevel ? `${m.degreeLevel} • ` : ''}
                      {m.course || 'Pesquisador'} — {m.institution || 'LABIC'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">
                Nenhum membro cadastrado no momento.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
