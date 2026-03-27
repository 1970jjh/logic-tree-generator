"use client";
import { useState, useRef } from "react";

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

function InputForm({ type, onSubmit, onBack }) {
  const [situation, setSituation] = useState("");
  const [l1Count, setL1Count] = useState(4);
  const [l2Count, setL2Count] = useState(3);
  const [l3Count, setL3Count] = useState(2);
  const meta = TYPE_META[type];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!situation.trim()) return;
    onSubmit(situation.trim(), l1Count, l2Count, l3Count);
  };

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
            <span className="hint">구체적일수록 정확한 결과가 나옵니다</span>
          </label>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            placeholder={meta.placeholder}
          />
        </div>

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
            disabled={!situation.trim()}
          >
            🌳 Logic Tree 생성하기
          </button>
        </div>
      </form>
    </section>
  );
}

/* ──────────────────────────── STEP 3: LOADING ──────────────────────────── */
function LoadingScreen({ type }) {
  const meta = TYPE_META[type];
  return (
    <section className="loading-section">
      <div className="spinner" />
      <div className="loading-text">
        {meta.icon} {meta.title} Logic Tree 생성 중...
      </div>
      <div className="loading-sub">
        AI가 MECE 원칙에 따라 구조화하고 있습니다
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

/* ──────────────────────────── STEP 4: TREE VIEW ──────────────────────────── */
function LogicTreeView({ data, type, situation, onReset, onRegenerate }) {
  const [zoom, setZoom] = useState(1);
  const [tooltip, setTooltip] = useState(null);
  const treeRef = useRef(null);
  const meta = TYPE_META[type];

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
                desc: situation,
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
  const [treeData, setTreeData] = useState(null);
  const [error, setError] = useState(null);

  const handleTypeSelect = (selectedType) => {
    setType(selectedType);
    setStep("input");
  };

  const handleGenerate = async (sit, c1, c2, c3) => {
    setSituation(sit);
    setL1Count(c1);
    setL2Count(c2);
    setL3Count(c3);
    setStep("loading");
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ situation: sit, type, l1Count: c1, l2Count: c2, l3Count: c3 }),
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
    handleGenerate(situation, l1Count, l2Count, l3Count);
  };

  const handleReset = () => {
    setStep("select");
    setType("");
    setSituation("");
    setL1Count(4);
    setL2Count(3);
    setL3Count(2);
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

      {step === "loading" && <LoadingScreen type={type} />}

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
