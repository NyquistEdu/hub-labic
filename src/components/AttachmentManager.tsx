"use client";

import React, { useState } from "react";
import { LabicAttachment } from "@/types/labic";
import { useLabic } from "@/context/LabicContext";

interface AttachmentManagerProps {
  attachments: LabicAttachment[];
  onChange: (next: LabicAttachment[]) => void;
  bucket?: string;
  label?: string;
}

export function AttachmentManager({
  attachments,
  onChange,
  bucket = "documentos-labic",
  label = "Arquivos e Links Anexados",
}: AttachmentManagerProps) {
  const { uploadFileToStorage, currentUser } = useLabic();

  const [pdfLabel, setPdfLabel] = useState("");
  const [uploading, setUploading] = useState(false);

  const [linkLabel, setLinkLabel] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  const handleUploadFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const added: LabicAttachment[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = await uploadFileToStorage(bucket, file);
      added.push({
        id: `att-${Date.now()}-${i}`,
        label: pdfLabel.trim() ? `${pdfLabel.trim()} (${file.name})` : file.name,
        url,
        fileType: "PDF_UPLOAD",
        uploadedById: currentUser?.id,
        uploadedAt: new Date().toISOString().slice(0, 10),
      });
    }
    setUploading(false);
    setPdfLabel("");
    e.target.value = "";
    onChange([...attachments, ...added]);
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;
    const newAtt: LabicAttachment = {
      id: `att-link-${Date.now()}`,
      label: linkLabel.trim() || linkUrl.trim(),
      url: linkUrl.trim(),
      fileType: "LINK_EXTERNO",
      uploadedById: currentUser?.id,
      uploadedAt: new Date().toISOString().slice(0, 10),
    };
    onChange([...attachments, newAtt]);
    setLinkLabel("");
    setLinkUrl("");
  };

  const handleRemove = (id: string) => {
    onChange(attachments.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-3 bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-3.5 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-medium text-zinc-200">{label}</span>
        <span className="text-[11px] text-zinc-500">
          {attachments.length} arquivo(s) / link(s)
        </span>
      </div>

      <p className="text-[11px] text-zinc-400 bg-zinc-900/70 border border-zinc-800/80 rounded px-2.5 py-1.5">
        <strong>Orientação de formato:</strong> Para documentos em <strong>PDF</strong>, faça a importação direta no sistema abaixo (aceita múltiplos PDFs). Para outros tipos de arquivo (códigos, vídeos, pastas Drive, planilhas), insira o <strong>link externo de redirecionamento</strong>.
      </p>

      {/* Bloco 1: Upload Direto de PDF (suporta múltiplos) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end pt-1">
        <div className="sm:col-span-2">
          <label className="block text-[11px] text-zinc-400 mb-1">
            Identificação / Descrição do PDF (Opcional)
          </label>
          <input
            type="text"
            value={pdfLabel}
            onChange={(e) => setPdfLabel(e.target.value)}
            placeholder="Ex.: Versão Final Publicada, Certificado INPI..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
          />
        </div>
        <div>
          <label className="w-full flex items-center justify-center px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 font-medium cursor-pointer transition-colors text-center">
            {uploading ? "Importando PDF..." : "+ Importar PDF(s)"}
            <input
              type="file"
              accept=".pdf,application/pdf"
              multiple
              disabled={uploading}
              onChange={handleUploadFiles}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Bloco 2: Adicionar Link Externo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end pt-1 border-t border-zinc-800/60">
        <div>
          <label className="block text-[11px] text-zinc-400 mb-1">
            Nome do Link Externo
          </label>
          <input
            type="text"
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            placeholder="Ex.: Repositório, Pasta Drive, DOI..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
          />
        </div>
        <div>
          <label className="block text-[11px] text-zinc-400 mb-1">
            URL de Redirecionamento
          </label>
          <input
            type="text"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
          />
        </div>
        <div>
          <button
            type="button"
            onClick={handleAddLink}
            className="w-full px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-medium transition-colors"
          >
            + Adicionar Link
          </button>
        </div>
      </div>

      {/* Lista de Arquivos e Links Adicionados */}
      {attachments.length > 0 && (
        <div className="divide-y divide-zinc-800/60 pt-2 border-t border-zinc-800/80">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="py-1.5 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[10px] text-emerald-400 shrink-0">
                  {att.fileType === "PDF_UPLOAD" ? "PDF" : "LINK"}
                </span>
                <a
                  href={att.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-200 hover:text-emerald-400 underline truncate"
                >
                  {att.label}
                </a>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(att.id)}
                className="text-[11px] text-zinc-500 hover:text-red-400 shrink-0"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
