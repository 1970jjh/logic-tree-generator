"use client";
import { useState, useRef, useCallback } from "react";

/* ──────────────────────────── CONSTANTS ──────────────────────────── */
const TYPE_META = {
  "problem-definition": {
    icon: "🔍",
    title: "문제정의",
    en: "What Tree",
    css: "what",
    desc: "무엇이 문제인지를 구조적으로 분해합니다. MECE 원칙에 따라 문제의 구성요소를 빠짐없이, 겹침 없이 나눕니다.",
    placeholder:
      "예) 투썸플레이스 을지로입구역 지점의 매출이 3개월 연속 하락하고 있다.",
  },
  "root-cause": {
    icon: "🧠",
    title: "원인분석",
    en: "Why Tree",
    css: "why",
    desc: "문제의 근본 원인을 파악합니다. 'Why?'를 반복하여 표면적 현상 뒤에 숨어있는 진짜 원인을 찾아갑니다.",
    placeholder:
      "예) 신규 입사자의 6개월 내 이직률이 전년 대비 40% 증가했다.",
  },
  solution: {
    icon: "💡",
    title: "해결방안",
    en: "How Tree",
    css: "how",
    desc: "문제를 어떻게 해결할 것인지 실행방안을 체계적으로 도출합니다. 대방향부터 세부 Action Item까지 전개합니다.",
    placeholder:
      "예) 고객 재방문율을 현재 25%에서 40%로 6개월 내 향상시켜야 한다.",
  },
};

const ACCEPTED_TYPES = {
  "image/png": true,
  "image/jpeg": true,
  "image/jpg": true,
  "image/webp": true,
  "application/pdf": true,
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
  "application/msword": true,
};

const FILE_ICONS = {
  pdf: "📄",
  doc: "📝",
  docx: "📝",
  png: "🖼️",
  jpg: "🖼️",
  jpeg: "🖼️",
  webp: "🖼️",
};

const MAX_FILES = 10;
const MAX_TOTAL_SIZE = 15 * 1024 * 1024; // 15MB before compression

/* ──────────────────────────── HELPERS ──────────────────────────── */
function getFileExt(name) {
  return name.split(".").pop().toLowerCase();
}

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function compressImage(file, maxDim = 1200, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          resolve(
            new File([blob], file.name, { type: "image/jpeg" })
          );
        },
        "image/jpeg",
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file); // fallback to original
    };
    img.src = url;
  });
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      resolve({
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        data: base64,
        size: file.size,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ──────────────────────────── HEADER ──────────────────────────── */
function Header() {
  return (
    <header className="app-header">
      <div className="badge">AI Logic Tree Generator</div>
      <h1>🌳 Logic Tree 자동 생성기</h1>
      <div className="subtitle">
        상황만 입력하면 AI가 자동으로 Logic Tree를 생성합니다
      </div>
    </header>
  );
}

/* ──────────────────────────── FOOTER ──────────────────────────── */
function Footer() {
  return (
    <footer className="app-footer">
      <div style={{ color: "#6366f1", fontWeight: 500, marginBottom: 4 }}>
        문제해결 5단계 프로세스 | Logic Tree Workshop Tool
      </div>
      <div>© 2026 JJ CREATIVE Edu with AI. All Rights Reserved.</div>
    </footer>
  );
}

/* ──────────────────────────── STEP 1: TYPE SELECTOR ──────────────────────────── */
function TypeSelector({ onSelect }) {
  return (
    <section className="type-selector">
      <div className="intro">
        <h2>Logic Tree 유형을 선택하세요</h2>
        <p>
          문제해결 프로세스에 따라 적합한 Logic Tree 유형을 선택합니다.
          <br />
          AI가 입력하신 상황에 맞는 로직트리를 자동으로 생성합니다.
        </p>
      </div>
      <div className="type-cards">
        {Object.entries(TYPE_META).map(([key, meta]) => (
          <div
            key={key}
            className={`type-card ${meta.css}`}
            onClick={() => onSelect(key)}
          >
            <div className="card-icon">{meta.icon}</div>
            <div className="card-title">{meta.title}</div>
            <div className="card-en">{meta.en}</div>
            <div className="card-desc">{meta.desc}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ──────────────────────────── STEP 2: INPUT FORM ──────────────────────────── */
function CountSelector({ label, value, min, max, onChange }) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <div className="count-selector">
        <button
          type="button"
          className="count-btn"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
        >
          −
        </button>
        <div className="count-display">{value}</div>
        <button
          type="button"
          className="count-btn"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
        >
          +
        </button>
        <span className="count-label">개 ({min}~{max}개 선택 가능)</span>
      </div>
    </div>
  );
}

function FileUploadZone({ files, onFilesAdd, onFileRemove }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (newFiles) => {
      const validFiles = Array.from(newFiles).filter((f) => {
        const ext = getFileExt(f.name);
        return (
          ACCEPTED_TYPES[f.type] ||
          ["pdf", "png", "jpg", "jpeg", "webp", "doc", "docx"].includes(ext)
        );
      });
      if (validFiles.length > 0) {
        onFilesAdd(validFiles);
      }
    },
    [onFilesAdd]
  );

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  return (
    <div className="form-group">
      <label>
        참고 자료 첨부 <span className="hint">선택사항 · PDF, 이미지, Word 파일 지원 (최대 {MAX_FILES}개)</span>
      </label>

      {/* Drop Zone */}
      <div
        className={`file-dropzone ${isDragging ? "dragging" : ""} ${files.length > 0 ? "has-files" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
          style={{ display: "none" }}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {files.length === 0 ? (
          <div className="dropzone-empty">
            <div className="dropzone-icon">📎</div>
            <div className="dropzone-text">
              파일을 드래그하여 놓거나 클릭하여 선택하세요
            </div>
            <div className="dropzone-hint">
              PDF, PNG, JPG, Word (.docx) · 최대 {MAX_FILES}개
            </div>
          </div>
        ) : (
          <div className="dropzone-add-more">
            <span>+ 파일 추가</span>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="file-list">
          {files.map((file, idx) => {
            const ext = getFileExt(file.name);
            const icon = FILE_ICONS[ext] || "📎";
            const isImage = file.type?.startsWith("image/");
            return (
              <div className="file-item" key={idx}>
                <div className="file-item-icon">
                  {isImage ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="file-thumb"
                    />
                  ) : (
                    <span className="file-type-icon">{icon}</span>
                  )}
                </div>
                <div className="file-item-info">
                  <div className="file-item-name">{file.name}</div>
                  <div className="file-item-size">{formatFileSize(file.size)}</div>
                </div>
                <button
                  type="button"
                  className="file-item-remove"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileRemove(idx);
                  }}
                >
                  ✕
                </button>
              </div>
            );
          })}
          <div className="file-summary">
            📁 {files.length}개 파일 · 총 {formatFileSize(totalSize)}
            {totalSize > MAX_TOTAL_SIZE && (
              <span className="file-warning"> ⚠️ 파일 크기가 큽니다. 이미지는 자동 압축됩니다.</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function InputForm({ type, onSubmit, onBack }) {
  const [situation, setSituation] = useState("");
  const [l1Count, setL1Count] = useState(4);
  const [l2Count, setL2Count] = useState(3);
  const [l3Count, setL3Count] = useState(2);
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const meta = TYPE_META[type];

  const handleFilesAdd = useCallback(
    (newFiles) => {
      setFiles((prev) => {
        const combined = [...prev, ...newFiles];
        return combined.slice(0, MAX_FILES);
      });
    },
    []
  );

  const handleFileRemove = useCallback((index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!situation.trim() && files.length === 0) return;

    setProcessing(true);

    try {
      // Process files: compress images, convert all to base64
      const processedFiles = [];
      for (const file of files) {
        let processedFile = file;
        if (file.type?.startsWith("image/")) {
          processedFile = await compressImage(file, 1200, 0.7);
        }
        const b64 = await fileToBase64(processedFile);
        processedFiles.push(b64);
      }

      onSubmit(situation.trim(), l1Count, l2Count, l3Count, processedFiles);
    } catch (err) {
      console.error("File processing error:", err);
      onSubmit(situation.trim(), l1Count, l2Count, l3Count, []);
    } finally {
      setProcessing(false);
    }
  };

  const canSubmit = (situation.trim() || files.length > 0) && !processing;

  return (
    <section className="input-section">
      <div className={`type-badge ${meta.css}`}>
        <span>{meta.icon}</span>
        <span>
          {meta.title} ({meta.en})
        </span>
      </div>

      <form className="input-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            상황 / 이슈 입력
            <span className="hint">텍스트와 파일을 함께 입력할 수 있습니다</span>
          </label>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder={meta.placeholder}
          />
        </div>

        <FileUploadZone
          files={files}
          onFilesAdd={handleFilesAdd}
          onFileRemove={handleFileRemove}
        />

        <div className="branch-count-grid">
          <CountSelector label="L1 · 1차 분해(대분류)" value={l1Count} min={2} max={7} onChange={setL1Count} />
          <CountSelector label="L2 · 2차 분해(중분류)" value={l2Count} min={2} max={5} onChange={setL2Count} />
          <CountSelector label="L3 · 3차 분해(소분류)" value={l3Count} min={2} max={4} onChange={setL3Count} />
        </div>

        <div className="btn-row">
          <button type="button" className="btn-back" onClick={onBack}>
            ← 뒤로
          </button>
          <button
            type="submit"
            className="btn-generate"
            disabled={!canSubmit}
          >
            {processing ? "📎 파일 처리 중..." : "🌳 Logic Tree 생성하기"}
          </button>
        </div>
      </form>
    </section>
  );
}

/* ──────────────────────────── STEP 3: LOADING ──────────────────────────── */
function LoadingScreen({ type, hasFiles }) {
  const meta = TYPE_META[type];
  return (
    <section className="loading-section">
      <div className="spinner" />
      <div className="loading-text">
        {meta.icon} {meta.title} Logic Tree 생성 중...
      </div>
      <div className="loading-sub">
        {hasFiles
          ? "첨부 파일을 분석하고 MECE 원칙에 따라 구조화하고 있습니다"
          : "AI가 MECE 원칙에 따라 구조화하고 있습니다"}
      </div>
    </section>
  );
}

/* ──────────────────────────── TOOLTIP MODAL ──────────────────────────── */
function TooltipModal({ data, onClose }) {
  if (!data) return null;
  return (
    <div className="tooltip-overlay" onClick={onClose}>
      <div className="tooltip-card" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h3>{data.title}</h3>
        <p>{data.desc}</p>
        {data.extra && <div className="data-box">{data.extra}</div>}
      </div>
    </div>
  );
}

/* ──────────────────────────── DOWNLOAD UTILS ──────────────────────────── */
function buildTreeText(data, situation, typeMeta) {
  const lines = [];
  lines.push(`# ${typeMeta.title} (${typeMeta.en}) Logic Tree`);
  lines.push("");
  lines.push(`## 핵심 문제: ${data.root.label}`);
  lines.push(`> ${data.root.tag}`);
  if (situation) {
    lines.push("");
    lines.push(`**상황/이슈:** ${situation}`);
  }
  lines.push("");

  data.branches.forEach((b, bi) => {
    lines.push(`### ${b.icon} L1-${bi + 1}. ${b.label}`);
    lines.push(`${b.description || ""}`);
    lines.push("");
    (b.children || []).forEach((l2, l2i) => {
      lines.push(`#### L2-${bi + 1}.${l2i + 1}. ${l2.label}`);
      lines.push(`${l2.description || ""}`);
      lines.push("");
      (l2.children || []).forEach((l3, l3i) => {
        lines.push(`- **${l3.label}**: ${l3.description || ""}`);
      });
      lines.push("");
    });
  });

  lines.push("---");
  lines.push("© 2026 JJ CREATIVE Edu with AI. All Rights Reserved.");
  return lines.join("\n");
}

function downloadBlob(content, filename, mimeType) {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + content], { type: mimeType + ";charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadMD(data, situation, typeMeta) {
  const md = buildTreeText(data, situation, typeMeta);
  downloadBlob(md, `logic-tree-${typeMeta.en.replace(/\s/g, "-")}.md`, "text/markdown");
}

function downloadWord(data, situation, typeMeta) {
  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Logic Tree</title>
<style>
body{font-family:'맑은 고딕','Malgun Gothic',sans-serif;color:#222;padding:30px 40px;line-height:1.8}
h1{font-size:20pt;color:#4338ca;border-bottom:3px solid #6366f1;padding-bottom:8px;margin-bottom:16px}
h2{font-size:14pt;color:#333;margin-top:20px}
h3{font-size:12pt;color:#4338ca;margin-top:14px}
.root-tag{background:#f0f0ff;padding:6px 12px;border-left:4px solid #6366f1;margin:8px 0 16px;font-size:11pt;color:#555}
.situation{background:#fff8f0;padding:8px 12px;border-left:4px solid #f97316;margin-bottom:16px;font-size:10pt;color:#666}
table{border-collapse:collapse;width:100%;margin:6px 0 14px}
td,th{border:1px solid #d4d4d8;padding:6px 10px;font-size:10pt;text-align:left}
th{background:#6366f1;color:#fff;font-weight:600}
.l3-label{font-weight:600;color:#059669;white-space:nowrap}
.footer{text-align:center;margin-top:30px;padding-top:12px;border-top:1px solid #ddd;font-size:9pt;color:#999}
</style></head><body>`;

  html += `<h1>${typeMeta.icon} ${typeMeta.title} (${typeMeta.en}) Logic Tree</h1>`;
  html += `<h2>${data.root.label}</h2>`;
  html += `<div class="root-tag">${data.root.tag}</div>`;
  if (situation) html += `<div class="situation"><b>상황/이슈:</b> ${situation}</div>`;

  data.branches.forEach((b, bi) => {
    html += `<h3>${b.icon} L1-${bi + 1}. ${b.label} <span style="font-size:9pt;color:#888;font-weight:400">${b.subLabel || ""}</span></h3>`;
    html += `<p style="font-size:10pt;color:#555">${b.description || ""}</p>`;

    (b.children || []).forEach((l2, l2i) => {
      html += `<table><tr><th colspan="2">L2-${bi + 1}.${l2i + 1}. ${l2.label} <span style="font-weight:400;font-size:9pt">${l2.subLabel || ""}</span></th></tr>`;
      html += `<tr><td colspan="2" style="font-size:9pt;color:#555">${l2.description || ""}</td></tr>`;
      (l2.children || []).forEach((l3) => {
        html += `<tr><td class="l3-label" style="width:25%">${l3.label}</td><td style="font-size:9pt;color:#444">${l3.description || ""}</td></tr>`;
      });
      html += `</table>`;
    });
  });

  html += `<div class="footer">© 2026 JJ CREATIVE Edu with AI. All Rights Reserved.</div>`;
  html += `</body></html>`;
  downloadBlob(html, `logic-tree-${typeMeta.en.replace(/\s/g, "-")}.doc`, "application/msword");
}

function downloadPDF(data, situation, typeMeta) {
  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Logic Tree</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Noto Sans KR',sans-serif;color:#1a1a2e;padding:40px 50px;line-height:1.7;background:#fff}
h1{font-size:22px;color:#4338ca;border-bottom:3px solid #6366f1;padding-bottom:10px;margin-bottom:20px}
h2{font-size:16px;color:#222;margin-top:6px}
h3{font-size:14px;color:#4338ca;margin-top:18px;margin-bottom:4px}
.root-tag{background:#f0f0ff;padding:8px 14px;border-left:4px solid #6366f1;margin:10px 0 20px;font-size:13px;color:#555}
.situation{background:#fff8f0;padding:8px 14px;border-left:4px solid #f97316;margin-bottom:20px;font-size:12px;color:#666}
table{border-collapse:collapse;width:100%;margin:8px 0 16px}
td,th{border:1px solid #d4d4d8;padding:8px 12px;font-size:12px;text-align:left}
th{background:#6366f1;color:#fff;font-weight:600}
.l3-label{font-weight:600;color:#059669;white-space:nowrap}
.desc{font-size:12px;color:#555;margin-bottom:6px}
.footer{text-align:center;margin-top:40px;padding-top:14px;border-top:1px solid #ddd;font-size:10px;color:#999}
@media print{body{padding:20px 30px}@page{margin:15mm}}
</style></head><body>`;

  html += `<h1>${typeMeta.icon} ${typeMeta.title} (${typeMeta.en}) Logic Tree</h1>`;
  html += `<h2>${data.root.label}</h2>`;
  html += `<div class="root-tag">${data.root.tag}</div>`;
  if (situation) html += `<div class="situation"><b>상황/이슈:</b> ${situation}</div>`;

  data.branches.forEach((b, bi) => {
    html += `<h3>${b.icon} L1-${bi + 1}. ${b.label} <span style="font-size:11px;color:#888;font-weight:400">${b.subLabel || ""}</span></h3>`;
    html += `<p class="desc">${b.description || ""}</p>`;

    (b.children || []).forEach((l2, l2i) => {
      html += `<table><tr><th colspan="2">L2-${bi + 1}.${l2i + 1}. ${l2.label} <span style="font-weight:400;font-size:11px">${l2.subLabel || ""}</span></th></tr>`;
      html += `<tr><td colspan="2" style="font-size:11px;color:#555">${l2.description || ""}</td></tr>`;
      (l2.children || []).forEach((l3) => {
        html += `<tr><td class="l3-label" style="width:25%">${l3.label}</td><td style="font-size:11px;color:#444">${l3.description || ""}</td></tr>`;
      });
      html += `</table>`;
    });
  });

  html += `<div class="footer">© 2026 JJ CREATIVE Edu with AI. All Rights Reserved.</div>`;
  html += `</body></html>`;

  const win = window.open("", "_blank");
  win.document.write(html);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

/* ──────────────────────────── STEP 4: TREE VIEW ──────────────────────────── */
function LogicTreeView({ data, type, situation, onReset, onRegenerate }) {
  const [zoom, setZoom] = useState(1);
  const [tooltip, setTooltip] = useState(null);
  const treeRef = useRef(null);
  const meta = TYPE_META[type];

  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 1.6));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.4));
  const zoomReset = () => setZoom(1);

  const showTip = (tipData) => setTooltip(tipData);

  return (
    <>
      {/* Toolbar */}
      <div className="result-toolbar">
        <div className={`type-indicator ${meta.css}`}>
          {meta.icon} {meta.title} ({meta.en})
        </div>
        <div className="toolbar-sep" />
        <div className="legend">
          <div className="legend-item">
            <div className="legend-dot root" />
            핵심 문제
          </div>
          <div className="legend-item">
            <div className="legend-dot l1" />
            1차 분해
          </div>
          <div className="legend-item">
            <div className="legend-dot l2" />
            2차 분해
          </div>
          <div className="legend-item">
            <div className="legend-dot l3" />
            3차 분해
          </div>
        </div>
        <div className="toolbar-sep" />

        {/* Download Menu */}
        <div className="download-wrapper">
          <button
            className="toolbar-btn download-trigger"
            onClick={() => setShowDownloadMenu((v) => !v)}
          >
            📥 다운로드 ▾
          </button>
          {showDownloadMenu && (
            <div className="download-menu">
              <button onClick={() => { downloadWord(data, situation, meta); setShowDownloadMenu(false); }}>
                📝 Word (.doc)
              </button>
              <button onClick={() => { downloadPDF(data, situation, meta); setShowDownloadMenu(false); }}>
                📄 PDF (인쇄)
              </button>
              <button onClick={() => { downloadMD(data, situation, meta); setShowDownloadMenu(false); }}>
                📋 Markdown (.md)
              </button>
            </div>
          )}
        </div>

        <button className="toolbar-btn" onClick={onRegenerate}>
          🔄 재생성
        </button>
        <button className="toolbar-btn" onClick={onReset}>
          🏠 처음으로
        </button>
        <span style={{ fontSize: 11, color: "#fbbf24" }}>
          💡 노드 클릭 → 상세보기
        </span>
      </div>

      {/* Tree */}
      <div className="tree-wrapper">
        <div
          className="h-tree"
          ref={treeRef}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "left center",
          }}
        >
          {/* ROOT */}
          <div
            className="root-node"
            onClick={() =>
              showTip({
                title: `🚨 ${data.root.label}`,
                desc: situation || "(첨부 파일 기반 분석)",
                extra: data.root.tag,
              })
            }
          >
            <div className="node-icon">🚨</div>
            <div className="node-label">{data.root.label}</div>
            <div className="node-tag">{data.root.tag}</div>
          </div>

          <div className="h-conn root-to-l1" />

          {/* L1 Column */}
          <div className="l1-col">
            {data.branches.map((branch, bi) => (
              <div className="branch-row" key={bi}>
                <div className="h-conn l1-branch" />

                {/* L1 Node */}
                <div
                  className="l1-node"
                  onClick={() =>
                    showTip({
                      title: `${branch.icon} ${branch.label}`,
                      desc: branch.description,
                      extra: `📊 ${branch.dataPoints}`,
                    })
                  }
                >
                  <div className="node-icon">{branch.icon}</div>
                  <div className="node-label">{branch.label}</div>
                  <div className="node-sub">{branch.subLabel}</div>
                </div>

                <div className="h-conn to-l2" />

                {/* L2 Group */}
                <div className="l2-group">
                  {(branch.children || []).map((l2, l2i) => (
                    <div className="l2-row" key={l2i}>
                      <div className="h-conn l2-branch" />

                      <div
                        className="l2-node"
                        onClick={() =>
                          showTip({
                            title: l2.label,
                            desc: l2.description,
                            extra: `🔍 ${l2.practiceQuestion}`,
                          })
                        }
                      >
                        <div className="node-label">{l2.label}</div>
                        <div className="node-sub">{l2.subLabel}</div>
                      </div>

                      <div className="h-conn to-l3" />

                      {/* L3 Group */}
                      <div className="l3-group">
                        {(l2.children || []).map((l3, l3i) => (
                          <div className="l3-row" key={l3i}>
                            <div className="h-conn l3-branch" />
                            <div
                              className="l3-node"
                              onClick={() =>
                                showTip({
                                  title: l3.label,
                                  desc: l3.description,
                                  extra: `📌 ${l3.dataSource}`,
                                })
                              }
                            >
                              <div className="node-label">{l3.label}</div>
                              {l3.description && (
                                <div className="node-desc">{l3.description}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="zoom-controls">
        <button className="zoom-btn" onClick={zoomIn}>
          +
        </button>
        <div className="zoom-label">{Math.round(zoom * 100)}%</div>
        <button className="zoom-btn" onClick={zoomOut}>
          −
        </button>
        <button className="zoom-btn" onClick={zoomReset} style={{ fontSize: 12 }}>
          ↺
        </button>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <TooltipModal data={tooltip} onClose={() => setTooltip(null)} />
      )}
    </>
  );
}

/* ──────────────────────────── MAIN PAGE ──────────────────────────── */
export default function Home() {
  const [step, setStep] = useState("select"); // select | input | loading | result
  const [type, setType] = useState("");
  const [situation, setSituation] = useState("");
  const [l1Count, setL1Count] = useState(4);
  const [l2Count, setL2Count] = useState(3);
  const [l3Count, setL3Count] = useState(2);
  const [filesForRegenerate, setFilesForRegenerate] = useState([]);
  const [treeData, setTreeData] = useState(null);
  const [error, setError] = useState(null);

  const handleTypeSelect = (selectedType) => {
    setType(selectedType);
    setStep("input");
  };

  const handleGenerate = async (sit, c1, c2, c3, files = []) => {
    setSituation(sit);
    setL1Count(c1);
    setL2Count(c2);
    setL3Count(c3);
    setFilesForRegenerate(files);
    setStep("loading");
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situation: sit,
          type,
          l1Count: c1,
          l2Count: c2,
          l3Count: c3,
          files: files,
        }),
      });

      const json = await res.json();

      if (!res.ok || json.error) {
        throw new Error(json.error || "생성 실패");
      }

      setTreeData(json.data);
      setStep("result");
    } catch (err) {
      setError(err.message);
      setStep("input");
    }
  };

  const handleRegenerate = () => {
    handleGenerate(situation, l1Count, l2Count, l3Count, filesForRegenerate);
  };

  const handleReset = () => {
    setStep("select");
    setType("");
    setSituation("");
    setL1Count(4);
    setL2Count(3);
    setL3Count(2);
    setFilesForRegenerate([]);
    setTreeData(null);
  };

  return (
    <>
      <Header />

      {step === "select" && <TypeSelector onSelect={handleTypeSelect} />}

      {step === "input" && (
        <InputForm
          type={type}
          onSubmit={handleGenerate}
          onBack={() => setStep("select")}
        />
      )}

      {step === "loading" && (
        <LoadingScreen type={type} hasFiles={filesForRegenerate.length > 0} />
      )}

      {step === "result" && treeData && (
        <LogicTreeView
          data={treeData}
          type={type}
          situation={situation}
          onReset={handleReset}
          onRegenerate={handleRegenerate}
        />
      )}

      {error && (
        <div className="error-banner">
          ⚠️ {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <Footer />
    </>
  );
}
