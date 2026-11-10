"use client";

import React, { useState, useMemo } from "react";
import { useLabic } from "@/context/LabicContext";
import {
  DOCUMENT_CATEGORY_LABELS,
  formatDateBR,
  GeneralDocument,
  LabicAttachment,
} from "@/types/labic";
import { AttachmentManager } from "@/components/AttachmentManager";
import { PaginationControls } from "@/components/PaginationControls";
import { DiscreetSearchBar } from "@/components/DiscreetSearchBar";

export default function DocumentosPage() {
  const {
    generalDocuments,
    members,
    currentUser,
    addGeneralDocument,
    updateGeneralDocument,
    deleteGeneralDocument,
  } = useLabic();

  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<GeneralDocument | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<
    "TEMPLATE_ARTIGO" | "MANUAL_BANCADA" | "OFICIO_EDITAL" | "OUTRO_DOCUMENTO"
  >("TEMPLATE_ARTIGO");
  const [attachments, setAttachments] = useState<LabicAttachment[]>([]);

  // Filtros, Busca Discreta e Paginação
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCatFilter, setSelectedCatFilter] = useState("TODAS");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const filteredDocuments = useMemo(() => {
    return generalDocuments.filter((doc) => {
      if (selectedCatFilter !== "TODAS" && doc.category !== selectedCatFilter) {
        return false;
      }
      if (searchTerm.trim()) {
        const term = searchTerm.trim().toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(term);
        const matchesCat = (DOCUMENT_CATEGORY_LABELS[doc.category] || "").toLowerCase().includes(term);
        const uploaderName = members.find((m) => m.id === doc.uploadedByProfileId)?.name || "";
        const matchesUploader = uploaderName.toLowerCase().includes(term);
        if (!matchesTitle && !matchesCat && !matchesUploader) {
          return false;
        }
      }
      return true;
    });
  }, [generalDocuments, selectedCatFilter, searchTerm, members]);

  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredDocuments.slice(start, start + pageSize);
  }, [filteredDocuments, currentPage, pageSize]);

  const openCreateModal = () => {
    setEditingDoc(null);
    setTitle("");
    setCategory("TEMPLATE_ARTIGO");
    setAttachments([]);
    setShowModal(true);
  };

  const openEditModal = (doc: GeneralDocument) => {
    setEditingDoc(doc);
    setTitle(doc.title);
    setCategory(doc.category);
    setAttachments(
      doc.attachments && doc.attachments.length > 0
        ? doc.attachments
        : doc.fileName
        ? [
            {
              id: `legacy-${doc.id}`,
              label: doc.fileName,
              url: doc.fileName,
              fileType: doc.fileName.toLowerCase().endsWith(".pdf")
                ? "PDF_UPLOAD"
                : "LINK_EXTERNO",
            },
          ]
        : []
    );
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUser) return;
    const primaryAttachment = attachments[0];
    if (editingDoc) {
      await updateGeneralDocument(editingDoc.id, {
        title: title.trim(),
        category,
        fileName: primaryAttachment?.label || editingDoc.fileName || "Sem arquivo",
        attachments,
      });
    } else {
      await addGeneralDocument({
        title: title.trim(),
        category,
        uploadedByProfileId: currentUser.id,
        uploadedAt: new Date().toISOString().slice(0, 10),
        fileName: primaryAttachment?.label || "Sem arquivo",
        attachments,
      });
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-100">Documentos Gerais</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Repositório de templates, manuais de bancada, ofícios e arquivos avulsos do laboratório.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-3.5 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors shrink-0"
        >
          + Registrar Documento
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <select
            value={selectedCatFilter}
            onChange={(e) => {
              setSelectedCatFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#111318] border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-200 cursor-pointer"
          >
            <option value="TODAS">Todas as Categorias</option>
            {Object.entries(DOCUMENT_CATEGORY_LABELS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <DiscreetSearchBar
          value={searchTerm}
          onChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          placeholder="Buscar por título, categoria..."
        />
      </div>

      <div className="bg-[#111318] border border-zinc-800/80 rounded-lg overflow-hidden">
        {filteredDocuments.length === 0 ? (
          <p className="text-xs text-zinc-500 p-6">Nenhum documento geral encontrado para este filtro.</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 bg-zinc-900/40">
                <th className="py-2.5 px-4 font-medium">Título</th>
                <th className="py-2.5 px-4 font-medium">Categoria</th>
                <th className="py-2.5 px-4 font-medium">Enviado por</th>
                <th className="py-2.5 px-4 font-medium">Data</th>
                <th className="py-2.5 px-4 font-medium">Arquivos / Links</th>
                <th className="py-2.5 px-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {paginatedDocuments.map((doc) => {
                const uploader =
                  members.find((m) => m.id === doc.uploadedByProfileId)?.name || "Membro";
                const list =
                  doc.attachments && doc.attachments.length > 0
                    ? doc.attachments
                    : doc.fileName
                    ? [
                        {
                          id: `legacy-${doc.id}`,
                          label: doc.fileName,
                          url: doc.fileName,
                          fileType: "LINK_EXTERNO" as const,
                        },
                      ]
                    : [];

                return (
                  <tr key={doc.id} className="hover:bg-zinc-900/20">
                    <td className="py-3 px-4 font-medium text-zinc-100">{doc.title}</td>
                    <td className="py-3 px-4 text-zinc-400">
                      {DOCUMENT_CATEGORY_LABELS[doc.category] || doc.category}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{uploader}</td>
                    <td className="py-3 px-4 text-zinc-500">{formatDateBR(doc.uploadedAt)}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {list.map((att) => (
                          <a
                            key={att.id}
                            href={att.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400 hover:underline text-[11px]"
                          >
                            [{att.fileType === "PDF_UPLOAD" ? "PDF" : "LINK"}] {att.label}
                          </a>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(doc)}
                        className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px]"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => deleteGeneralDocument(doc.id)}
                        className="px-2 py-1 rounded bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-900/40 text-[11px]"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <PaginationControls
          currentPage={currentPage}
          totalItems={filteredDocuments.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[15, 20, 50]}
          className="p-3"
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#111318] border border-zinc-800 rounded-lg max-w-lg w-full p-6 space-y-4 text-xs my-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-semibold text-zinc-100">
                {editingDoc ? "Editar Documento Geral" : "Registrar Documento Geral"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-zinc-400">
                Fechar
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-zinc-400 mb-1">Título do Documento *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-zinc-400 mb-1">Categoria</label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(
                      e.target.value as
                        | "TEMPLATE_ARTIGO"
                        | "MANUAL_BANCADA"
                        | "OFICIO_EDITAL"
                        | "OUTRO_DOCUMENTO"
                    )
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded px-3 py-2 text-zinc-100"
                >
                  <option value="TEMPLATE_ARTIGO">Template / Modelo</option>
                  <option value="MANUAL_BANCADA">Manual de Bancada / Norma</option>
                  <option value="OFICIO_EDITAL">Ofício / Edital</option>
                  <option value="OUTRO_DOCUMENTO">Outro Documento</option>
                </select>
              </div>

              <AttachmentManager
                attachments={attachments}
                onChange={setAttachments}
                bucket="documentos-labic"
                label="Arquivos do Documento (PDFs ou Links Externos)"
              />

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 text-white font-medium"
                >
                  {editingDoc ? "Salvar Alterações" : "Salvar Documento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
