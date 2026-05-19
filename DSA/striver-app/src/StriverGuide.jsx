import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { topics } from "./problemData";

const priorityMeta = {
  0: { label: "P0 Must Do", color: "#ef4444", bg: "#ef444418" },
  1: { label: "P1 Important", color: "#f59e0b", bg: "#f59e0b18" },
  2: { label: "P2 Good to Know", color: "#3b82f6", bg: "#3b82f618" },
  3: { label: "P3 Optional", color: "#6b7280", bg: "#6b728018" },
};
const diffMeta = {
  Easy:   { bg: "#064e3b", color: "#6ee7b7", ring: "#6ee7b733" },
  Medium: { bg: "#713f12", color: "#fde68a", ring: "#fde68a33" },
  Hard:   { bg: "#7f1d1d", color: "#fca5a5", ring: "#fca5a533" },
};

export default function StriverGuide() {
  const [activeTopic, setActiveTopic] = useState(topics[0]?.id || "dp");
  const [expandedProblem, setExpandedProblem] = useState(null);
  const [prioFilter, setPrioFilter] = useState("all");
  const [diffFilter, setDiffFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem("striver_done") || "{}"); } catch { return {}; }
  });
  const detailRef = useRef(null);
  const listRef = useRef(null);

  const toggleDone = useCallback((title) => {
    setCompleted(prev => {
      const next = { ...prev, [title]: !prev[title] };
      localStorage.setItem("striver_done", JSON.stringify(next));
      return next;
    });
  }, []);

  const topic = topics.find(t => t.id === activeTopic);

  const filtered = useMemo(() => {
    if (!topic) return [];
    return topic.problems.filter(p => {
      if (prioFilter !== "all" && p.priority !== parseInt(prioFilter)) return false;
      if (diffFilter !== "all" && p.difficulty !== diffFilter) return false;
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      const d = { Hard: 0, Medium: 1, Easy: 2 };
      return (d[a.difficulty] ?? 1) - (d[b.difficulty] ?? 1);
    });
  }, [topic, prioFilter, diffFilter, search]);

  const topicStats = useMemo(() => {
    if (!topic) return { byPrio: {}, byDiff: {}, doneCount: 0 };
    const byPrio = {}, byDiff = { Easy: 0, Medium: 0, Hard: 0 };
    let doneCount = 0;
    topic.problems.forEach(p => {
      byPrio[p.priority] = (byPrio[p.priority] || 0) + 1;
      byDiff[p.difficulty] = (byDiff[p.difficulty] || 0) + 1;
      if (completed[p.title]) doneCount++;
    });
    return { byPrio, byDiff, doneCount };
  }, [topic, completed]);

  const globalStats = useMemo(() => {
    const total = topics.reduce((s, t) => s + t.problems.length, 0);
    const p0 = topics.reduce((s, t) => s + t.problems.filter(p => p.priority === 0).length, 0);
    const hard = topics.reduce((s, t) => s + t.problems.filter(p => p.difficulty === "Hard").length, 0);
    const med = topics.reduce((s, t) => s + t.problems.filter(p => p.difficulty === "Medium").length, 0);
    const easy = total - hard - med;
    let done = 0;
    topics.forEach(t => t.problems.forEach(p => { if (completed[p.title]) done++; }));
    return { total, p0, hard, med, easy, done };
  }, [completed]);

  useEffect(() => {
    if (expandedProblem !== null && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [expandedProblem]);

  useEffect(() => {
    setExpandedProblem(null);
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [activeTopic]);

  const pct = topic ? Math.round((topicStats.doneCount / topic.problems.length) * 100) : 0;
  const globalPct = globalStats.total ? Math.round((globalStats.done / globalStats.total) * 100) : 0;

  return (
    <div style={{ fontFamily: "'Inter', 'IBM Plex Mono', system-ui, sans-serif", background: "#09090b", color: "#e4e4e7", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #3f3f46; }

        .topic-btn { transition: all 0.2s cubic-bezier(.4,0,.2,1); cursor: pointer; border: none; font-family: inherit; user-select: none; }
        .topic-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
        .topic-btn:active { transform: translateY(0); }

        .prob-row { transition: all 0.15s ease; cursor: pointer; user-select: none; }
        .prob-row:hover { background: #18181b !important; transform: translateX(2px); }

        .done-check { transition: all 0.2s; cursor: pointer; }
        .done-check:hover { transform: scale(1.2); }

        @keyframes slideDown { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 2000px; } }
        .detail-panel { animation: slideDown 0.25s ease-out; overflow: hidden; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .fade-in { animation: fadeIn 0.3s ease; }

        .progress-ring { transition: stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1); }

        pre { tab-size: 2; font-family: 'JetBrains Mono', 'Fira Code', monospace; }

        .code-block { position: relative; }
        .code-block:hover .copy-btn { opacity: 1; }
        .copy-btn { opacity: 0; transition: opacity 0.2s; position: absolute; top: 8px; right: 8px; background: #27272a; color: #a1a1aa; border: 1px solid #3f3f46; border-radius: 4px; padding: 3px 8px; font-size: 10px; cursor: pointer; font-family: inherit; }
        .copy-btn:hover { background: #3f3f46; color: #e4e4e7; }

        .search-input:focus { border-color: #52525b; box-shadow: 0 0 0 2px rgba(82,82,91,0.3); }

        @media (max-width: 640px) {
          .topic-btn span:nth-child(2) { display: none; }
          .stats-row { flex-wrap: wrap; }
        }
      `}</style>

      {/* ═══ HEADER ═══ */}
      <header style={{ background: "linear-gradient(180deg, #131316 0%, #09090b 100%)", padding: "24px 20px 18px", borderBottom: "1px solid #1e1e22" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.5px", background: "linear-gradient(135deg, #f472b6 0%, #818cf8 50%, #34d399 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1.1 }}>
              Striver A2Z DSA
            </h1>
            <p style={{ fontSize: 11, color: "#52525b", marginTop: 4, letterSpacing: "0.5px" }}>
              {globalStats.total} problems across {topics.length} topics — SDE-2 / SSE Interview Prep
            </p>
          </div>
          {/* Global progress ring */}
          <div style={{ position: "relative", width: 48, height: 48, flexShrink: 0 }}>
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="#1e1e22" strokeWidth="3" />
              <circle className="progress-ring" cx="24" cy="24" r="20" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * globalPct / 100)}
                transform="rotate(-90 24 24)" />
            </svg>
            <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#34d399" }}>
              {globalPct}%
            </span>
          </div>
        </div>
        {/* Global stat chips */}
        <div className="stats-row" style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
          <StatChip label="Done" value={globalStats.done} total={globalStats.total} color="#34d399" />
          <StatChip label="Must-Do" value={globalStats.p0} color="#ef4444" />
          <StatChip label="Hard" value={globalStats.hard} color="#fca5a5" />
          <StatChip label="Medium" value={globalStats.med} color="#fde68a" />
          <StatChip label="Easy" value={globalStats.easy} color="#6ee7b7" />
        </div>
      </header>

      {/* ═══ TOPIC TABS ═══ */}
      <nav style={{ padding: "10px 16px", borderBottom: "1px solid #1e1e22", overflowX: "auto", display: "flex", gap: 6, whiteSpace: "nowrap", background: "#0c0c0e" }}>
        {topics.map(t => {
          const isActive = activeTopic === t.id;
          const topicDone = t.problems.filter(p => completed[p.title]).length;
          const topicPct = Math.round((topicDone / t.problems.length) * 100);
          return (
            <button
              key={t.id}
              className="topic-btn"
              onClick={() => { setActiveTopic(t.id); setPrioFilter("all"); setDiffFilter("all"); setSearch(""); }}
              style={{
                padding: "7px 14px", borderRadius: 10,
                background: isActive ? t.accent + "20" : "#131316",
                border: isActive ? `1.5px solid ${t.accent}88` : "1px solid #1e1e22",
                color: isActive ? t.accent : "#71717a",
                fontSize: 11, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6,
                position: "relative", overflow: "hidden",
              }}
            >
              {topicPct > 0 && (
                <div style={{ position: "absolute", bottom: 0, left: 0, width: `${topicPct}%`, height: 2, background: t.accent, opacity: 0.5, borderRadius: 1 }} />
              )}
              <span style={{ fontSize: 13 }}>{t.icon}</span>
              <span>{t.name}</span>
              <span style={{ fontSize: 9, opacity: 0.5, fontWeight: 400 }}>
                {topicDone}/{t.problems.length}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ═══ TOPIC INFO + PROGRESS ═══ */}
      {topic && (
        <div className="fade-in" style={{ padding: "14px 20px", borderBottom: "1px solid #1e1e22", background: "#0a0a0d" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{topic.icon}</span>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: topic.accent, letterSpacing: "-0.3px" }}>{topic.name}</h2>
                <span style={{ fontSize: 10, color: "#3f3f46", fontWeight: 400, fontFamily: "'JetBrains Mono', monospace" }}>
                  #{topic.topicPriority}
                </span>
              </div>
              <p style={{ fontSize: 11, color: "#52525b", marginTop: 4, lineHeight: 1.5 }}>{topic.description}</p>
            </div>
            {/* Topic mini progress */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ position: "relative", width: 40, height: 40 }}>
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="16" fill="none" stroke="#1e1e22" strokeWidth="3" />
                  <circle className="progress-ring" cx="20" cy="20" r="16" fill="none" stroke={topic.accent} strokeWidth="3" strokeLinecap="round"
                    strokeDasharray={100.5} strokeDashoffset={100.5 - (100.5 * pct / 100)}
                    transform="rotate(-90 20 20)" />
                </svg>
                <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: topic.accent }}>
                  {pct}%
                </span>
              </div>
              <span style={{ fontSize: 8, color: "#3f3f46" }}>{topicStats.doneCount}/{topic.problems.length}</span>
            </div>
          </div>

          {/* Priority + difficulty breakdown */}
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {Object.entries(topicStats.byPrio).sort(([a],[b]) => a - b).map(([p, c]) => (
              <span key={p} style={{ fontSize: 9, padding: "3px 10px", borderRadius: 12, background: priorityMeta[p]?.bg, color: priorityMeta[p]?.color, fontWeight: 600, letterSpacing: "0.3px" }}>
                P{p}: {c}
              </span>
            ))}
            <span style={{ width: 1, background: "#1e1e22", margin: "0 2px" }} />
            {Object.entries(topicStats.byDiff).filter(([,c]) => c > 0).map(([d, c]) => (
              <span key={d} style={{ fontSize: 9, padding: "3px 10px", borderRadius: 12, background: diffMeta[d]?.bg, color: diffMeta[d]?.color, fontWeight: 600 }}>
                {d}: {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ═══ FILTERS BAR ═══ */}
      <div style={{ padding: "10px 20px", borderBottom: "1px solid #1e1e22", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", background: "#09090b", position: "sticky", top: 0, zIndex: 10 }}>
        <input
          className="search-input"
          placeholder="Search problems..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: "6px 12px", borderRadius: 8, border: "1px solid #27272a", background: "#131316", color: "#e4e4e7",
            fontSize: 11, fontFamily: "inherit", width: 180, outline: "none", transition: "all 0.2s",
          }}
        />
        <div style={{ display: "flex", gap: 3 }}>
          {["all", "0", "1", "2", "3"].map(p => {
            const active = prioFilter === p;
            const c = p === "all" ? "#a1a1aa" : priorityMeta[p]?.color;
            return (
              <button key={p} onClick={() => setPrioFilter(p)} style={{
                padding: "4px 10px", borderRadius: 8, fontSize: 10, fontFamily: "inherit", cursor: "pointer",
                border: active ? `1px solid ${c}66` : "1px solid #1e1e22",
                background: active ? `${c}18` : "transparent",
                color: active ? c : "#3f3f46",
                fontWeight: 600, transition: "all 0.15s",
              }}>
                {p === "all" ? "All" : `P${p}`}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {["all", "Hard", "Medium", "Easy"].map(d => {
            const active = diffFilter === d;
            const m = d !== "all" ? diffMeta[d] : null;
            return (
              <button key={d} onClick={() => setDiffFilter(d)} style={{
                padding: "4px 10px", borderRadius: 8, fontSize: 10, fontFamily: "inherit", cursor: "pointer",
                border: active ? `1px solid ${m?.ring || "#a1a1aa44"}` : "1px solid #1e1e22",
                background: active ? (m?.bg || "#ffffff0a") : "transparent",
                color: active ? (m?.color || "#a1a1aa") : "#3f3f46",
                fontWeight: 600, transition: "all 0.15s",
              }}>
                {d === "all" ? "All" : d}
              </button>
            );
          })}
        </div>
        <span style={{ fontSize: 10, color: "#27272a", marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace" }}>{filtered.length} results</span>
      </div>

      {/* ═══ PROBLEM LIST ═══ */}
      <div ref={listRef} style={{ flex: 1, padding: "6px 12px", overflowY: "auto" }}>
        {filtered.map((p, idx) => {
          const isExpanded = expandedProblem === idx;
          const isDone = completed[p.title];
          const pm = priorityMeta[p.priority] || priorityMeta[3];
          const dm = diffMeta[p.difficulty] || diffMeta.Medium;

          return (
            <div key={p.title + idx} className="fade-in">
              {/* Row */}
              <div
                className="prob-row"
                onClick={() => setExpandedProblem(isExpanded ? null : idx)}
                style={{
                  padding: "10px 14px", margin: "3px 0", borderRadius: 10,
                  background: isExpanded ? "#141417" : "#0c0c0e",
                  border: isExpanded ? `1px solid ${topic.accent}44` : "1px solid transparent",
                  display: "flex", alignItems: "center", gap: 8,
                  opacity: isDone ? 0.5 : 1,
                }}
              >
                {/* Done checkbox */}
                <span
                  className="done-check"
                  onClick={e => { e.stopPropagation(); toggleDone(p.title); }}
                  style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    border: isDone ? `2px solid ${topic.accent}` : "2px solid #27272a",
                    background: isDone ? topic.accent + "22" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: topic.accent,
                  }}
                >
                  {isDone && "✓"}
                </span>

                {/* Priority pill */}
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 6,
                  background: pm.bg, color: pm.color, flexShrink: 0, letterSpacing: "0.3px",
                }}>
                  P{p.priority}
                </span>

                {/* Title */}
                <span style={{
                  fontSize: 12, fontWeight: 500, color: isDone ? "#52525b" : "#d4d4d8",
                  flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  textDecoration: isDone ? "line-through" : "none",
                }}>
                  {p.title}
                </span>

                {/* Difficulty badge */}
                <span style={{
                  fontSize: 9, padding: "2px 8px", borderRadius: 6, flexShrink: 0,
                  background: dm.bg, color: dm.color, fontWeight: 600,
                }}>
                  {p.difficulty}
                </span>

                {/* LC tag */}
                <span style={{ fontSize: 9, color: "#3f3f46", fontFamily: "'JetBrains Mono', monospace", flexShrink: 0 }}>{p.lc}</span>

                {/* Expand arrow */}
                <span style={{
                  fontSize: 11, color: isExpanded ? topic.accent : "#27272a", transition: "transform 0.2s, color 0.2s",
                  transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                }}>
                  ▾
                </span>
              </div>

              {/* ═══ EXPANDED DETAIL ═══ */}
              {isExpanded && (
                <div ref={detailRef} className="detail-panel" style={{
                  margin: "0 6px 8px", borderRadius: 12,
                  border: `1px solid ${topic.accent}22`,
                  background: "linear-gradient(180deg, #111114 0%, #0d0d10 100%)",
                  overflow: "hidden",
                }}>
                  {/* Problem Statement */}
                  <Section color={topic.accent} label="Problem">
                    <p style={{ fontSize: 12, color: "#a1a1aa", lineHeight: 1.7 }}>{p.statement}</p>
                  </Section>

                  {/* Example */}
                  <Section color="#facc15" label="Example">
                    <pre style={{
                      fontSize: 11, color: "#a1a1aa", lineHeight: 1.6, background: "#0a0a0c",
                      padding: 12, borderRadius: 8, overflow: "auto", whiteSpace: "pre-wrap",
                      border: "1px solid #1a1a1e", fontFamily: "'JetBrains Mono', monospace",
                    }}>{p.example}</pre>
                  </Section>

                  {/* Approach */}
                  <Section color="#34d399" label="Approach">
                    <p style={{ fontSize: 12, color: "#a1a1aa", lineHeight: 1.7 }}>{p.approach}</p>
                    <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
                      <ComplexityBadge label="Time" value={p.time} />
                      <ComplexityBadge label="Space" value={p.space} />
                    </div>
                  </Section>

                  {/* Code */}
                  <div style={{ padding: "14px 18px" }}>
                    <SectionLabel color="#818cf8" label="Java Code" />
                    <div className="code-block" style={{ position: "relative", marginTop: 6 }}>
                      <button className="copy-btn" onClick={() => navigator.clipboard?.writeText(p.code)}>
                        Copy
                      </button>
                      <pre style={{
                        fontSize: 11, color: "#c4c4cc", lineHeight: 1.55,
                        background: "#08080a", padding: "14px 16px", borderRadius: 10,
                        overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word",
                        border: "1px solid #1a1a1e", fontFamily: "'JetBrains Mono', monospace",
                        maxHeight: 500,
                      }}>
                        {p.code}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "#27272a", fontSize: 12 }}>
            No problems match your filters.
          </div>
        )}
      </div>

      {/* ═══ FOOTER ═══ */}
      <footer style={{
        padding: "14px 20px", textAlign: "center", borderTop: "1px solid #1e1e22",
        fontSize: 10, color: "#1e1e22", background: "#09090b",
      }}>
        {globalStats.done}/{globalStats.total} solved · {topics.length} topics · Priority-sorted for SDE-2/SSE · Click checkbox to track progress
      </footer>
    </div>
  );
}

function Section({ color, label, children }) {
  return (
    <div style={{ padding: "14px 18px", borderBottom: "1px solid #141418" }}>
      <SectionLabel color={color} label={label} />
      <div style={{ marginTop: 6 }}>{children}</div>
    </div>
  );
}

function SectionLabel({ color, label }) {
  return (
    <div style={{
      fontSize: 9, color, fontWeight: 700, textTransform: "uppercase",
      letterSpacing: "1.5px", display: "flex", alignItems: "center", gap: 6,
    }}>
      <span style={{ width: 10, height: 2, background: color, borderRadius: 1, display: "inline-block" }} />
      {label}
    </div>
  );
}

function ComplexityBadge({ label, value }) {
  return (
    <span style={{
      fontSize: 10, color: "#52525b", display: "flex", alignItems: "center", gap: 4,
      padding: "3px 10px", background: "#0f0f12", borderRadius: 6, border: "1px solid #1a1a1e",
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {label}: <span style={{ color: "#ef4444", fontWeight: 600 }}>{value}</span>
    </span>
  );
}

function StatChip({ label, value, total, color }) {
  return (
    <span style={{
      fontSize: 10, padding: "3px 10px", borderRadius: 8,
      background: `${color}10`, color, fontWeight: 600,
      display: "flex", alignItems: "center", gap: 4,
      border: `1px solid ${color}18`,
    }}>
      <span style={{ opacity: 0.6, fontWeight: 400 }}>{label}</span>
      {value}{total != null && <span style={{ opacity: 0.4 }}>/{total}</span>}
    </span>
  );
}
