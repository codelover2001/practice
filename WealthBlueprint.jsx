import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Shield,
  AlertTriangle,
  BookOpen,
  Coins,
  Briefcase,
  ArrowUpRight,
  CircleDot,
} from "lucide-react";

/**
 * Personal Wealth Blueprint
 * A single-file React dashboard consolidating the user's investing plan,
 * tax notes, year-by-year roadmap, and crisis playbook.
 *
 * Style: editorial / private-briefing. Dark ink + cream + burnished gold.
 * Font pairing: Fraunces (display serif) + Manrope (body sans).
 */

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=Manrope:wght@300;400;500;600;700;800&display=swap');
`;

const palette = {
  ink: "#0C0C0A",
  ink2: "#15140F",
  card: "#1A1812",
  line: "#2A2820",
  cream: "#F4EFE3",
  muted: "#8F8775",
  gold: "#C8A155",
  goldSoft: "#8A6E3B",
  brick: "#C46A5C",
  sage: "#8AA67A",
};

// --- DATA ----------------------------------------------------------------

const profile = {
  name: "Himanshu",
  age: 25,
  city: "Bangalore",
  employer: "Intuit India",
  salaryMonthly: 125000,
  monthlySIP: 40000,
  horizonYears: 20,
  risk: "Medium–High",
};

const allocation = [
  {
    key: "nifty50",
    label: "Nifty 50 Index",
    fund: "UTI Nifty 50 Index Fund — Direct, Growth",
    amount: 14000,
    pct: 35,
    role: "Foundation. Top 50 Indian companies. Lowest volatility in equity.",
    color: palette.gold,
  },
  {
    key: "next50",
    label: "Nifty Next 50 Index",
    fund: "UTI Nifty Next 50 Index Fund — Direct, Growth",
    amount: 10000,
    pct: 25,
    role: "Wealth engine. Tomorrow's large-caps. Higher long-term return.",
    color: "#D9B97A",
  },
  {
    key: "midcap",
    label: "Nifty Midcap 150 Index",
    fund: "Motilal Oswal Midcap 150 Index Fund — Direct, Growth",
    amount: 10000,
    pct: 25,
    role: "Growth booster. Volatile short-term, powerful long-term.",
    color: "#A98A4F",
  },
  {
    key: "gold",
    label: "Gold (SGB / ETF)",
    fund: "SGB tranche when open · else HDFC Gold ETF",
    amount: 4000,
    pct: 10,
    role: "Inflation hedge. Portfolio shock absorber. Not for returns.",
    color: palette.sage,
  },
  {
    key: "liquid",
    label: "Liquid Fund",
    fund: "Parag Parikh Liquid Fund — Direct, Growth",
    amount: 2000,
    pct: 5,
    role: "Cash buffer. Stops you from breaking equity SIPs in a panic.",
    color: "#6E8B7A",
  },
];

// Realistic SIP step-up projection at ~12% CAGR.
const projection = [
  { year: 1, sip: 40, invested: 4.8, value: 5.1 },
  { year: 2, sip: 45, invested: 10.2, value: 11.5 },
  { year: 3, sip: 50, invested: 16.2, value: 19.3 },
  { year: 5, sip: 60, invested: 30.0, value: 41 },
  { year: 7, sip: 72, invested: 47, value: 73 },
  { year: 10, sip: 95, invested: 80, value: 152 },
  { year: 12, sip: 115, invested: 108, value: 226 },
  { year: 15, sip: 150, invested: 161, value: 380 },
  { year: 18, sip: 195, invested: 230, value: 580 },
  { year: 20, sip: 235, invested: 285, value: 760 },
];

const yearlySteps = [
  { year: 1, sip: 40000, focus: "Start. Same date every month. Don't tinker." },
  { year: 2, sip: 45000, focus: "Step up by ₹5k. Verify funds are Direct + Growth." },
  { year: 3, sip: 50000, focus: "First rebalance in Jan. Bring weights back to target." },
  { year: 5, sip: 60000, focus: "Review risk. Most volatility now feels normal." },
  { year: 7, sip: 72000, focus: "Consider adding term insurance separately if not yet." },
  { year: 10, sip: 95000, focus: "First crore likely crossed. Do nothing dramatic." },
  { year: 15, sip: 150000, focus: "Begin partial de-risking only if a goal approaches." },
  { year: 20, sip: 235000, focus: "Portfolio earns more than salary. Plan FI exit." },
];

const commandments = [
  "Never stop SIPs during a crash — that's when wealth transfers happen.",
  "Don't withdraw before 5–7 years.",
  "Don't check the portfolio daily. Once a month, max.",
  "Step up SIP by at least 10% every year.",
  "No stock tips, no Telegram groups, no 'multibagger' YouTube.",
  "Use Direct, Growth plans only. Never Regular.",
  "Buy term insurance separately. Never ULIP.",
  "Rebalance once a year, in January. 10 minutes.",
  "Emergency fund stays untouched for non-emergencies.",
  "Behaviour matters more than fund selection.",
];

const taxRows = [
  { type: "STCG (equity, ≤12 mo)", rate: "20%", cess: "4%", total: "20.8%" },
  { type: "LTCG (equity, >12 mo)", rate: "12.5%", cess: "4%", total: "~13% on gains > ₹1.25L/yr" },
  { type: "First ₹1.25L LTCG / year", rate: "0%", cess: "—", total: "Exempt" },
  { type: "SGB held to 8-yr maturity", rate: "0%", cess: "—", total: "Capital gains tax-free" },
  { type: "Liquid / Debt fund gains", rate: "Slab rate", cess: "4%", total: "Taxed as income" },
];

const crisisSteps = [
  {
    n: 1,
    title: "Pause SIPs immediately",
    body: "Not failure — discipline. SIPs are a tool, not a vow. Zero guilt.",
  },
  {
    n: 2,
    title: "Run on emergency fund first",
    body: "₹2–3L in HDFC savings or liquid fund. Should give 3–6 months runway.",
  },
  {
    n: 3,
    title: "Then the liquid fund SIP corpus",
    body: "Parag Parikh Liquid. No volatility. Redeem in tranches as needed.",
  },
  {
    n: 4,
    title: "Then gold",
    body: "Sell Gold ETF / SGB before touching equity. Gold often holds value when equity dips.",
  },
  {
    n: 5,
    title: "Equity — only if forced",
    body: "Sell Nifty 50 first, never midcap first. Withdraw only what's needed.",
  },
  {
    n: 6,
    title: "Restart SIPs the month income returns",
    body: "Don't wait for the 'right time'. The market doesn't wait for confidence.",
  },
];

const setupChecklist = [
  "PAN verified (Profile → Personal Details)",
  "KYC completed (Profile → KYC Details)",
  "Bank account verified, name matches PAN exactly",
  "Nominee added with 100% allocation (SEBI requirement)",
  "Every fund shows: Plan = Direct, Option = Growth",
  "Demat & Trading account = Active (needed for Gold ETF)",
  "Autopay mandate Active, limit ≥ ₹40,000",
  "Transaction email + SMS alerts ON",
  "Capital Gains Statement downloadable",
  "Done a ₹500–1000 test buy + sell once",
];

// --- HELPERS -------------------------------------------------------------

const inr = (n) =>
  n >= 10000000
    ? `₹${(n / 10000000).toFixed(2)} Cr`
    : n >= 100000
    ? `₹${(n / 100000).toFixed(2)} L`
    : `₹${n.toLocaleString("en-IN")}`;

// --- UI PRIMITIVES -------------------------------------------------------

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: "'Manrope', sans-serif",
        fontWeight: 600,
        fontSize: 11,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: palette.gold,
      }}
    >
      {children}
    </div>
  );
}

function Display({ children, size = 56, italic = false }) {
  return (
    <h1
      style={{
        fontFamily: "'Fraunces', serif",
        fontWeight: 400,
        fontSize: size,
        lineHeight: 1.02,
        letterSpacing: "-0.02em",
        color: palette.cream,
        fontStyle: italic ? "italic" : "normal",
        margin: 0,
      }}
    >
      {children}
    </h1>
  );
}

function Body({ children, color = palette.cream, size = 15 }) {
  return (
    <p
      style={{
        fontFamily: "'Manrope', sans-serif",
        fontWeight: 400,
        fontSize: size,
        lineHeight: 1.6,
        color,
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        background: palette.card,
        border: `1px solid ${palette.line}`,
        borderRadius: 4,
        padding: 28,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// --- TABS ----------------------------------------------------------------

const TABS = [
  { id: "overview", label: "Overview", icon: CircleDot },
  { id: "portfolio", label: "Portfolio", icon: Coins },
  { id: "roadmap", label: "Roadmap", icon: TrendingUp },
  { id: "tax", label: "Tax", icon: BookOpen },
  { id: "rules", label: "Rules", icon: Shield },
  { id: "crisis", label: "Crisis Plan", icon: AlertTriangle },
  { id: "setup", label: "Groww Setup", icon: Briefcase },
];

// --- TAB CONTENT ---------------------------------------------------------

function Overview() {
  const total = allocation.reduce((s, a) => s + a.amount, 0);
  return (
    <div style={{ display: "grid", gap: 28 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 1,
          background: palette.line,
          border: `1px solid ${palette.line}`,
        }}
      >
        {[
          { k: "Monthly SIP", v: inr(profile.monthlySIP) },
          { k: "Risk profile", v: profile.risk },
          { k: "Horizon", v: `${profile.horizonYears} yrs` },
          { k: "10-yr target", v: "≈ ₹1.5 Cr" },
          { k: "20-yr target", v: "₹5–7 Cr" },
        ].map((s) => (
          <div
            key={s.k}
            style={{ background: palette.card, padding: "22px 24px" }}
          >
            <SectionLabel>{s.k}</SectionLabel>
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 28,
                color: palette.cream,
                marginTop: 8,
                letterSpacing: "-0.01em",
              }}
            >
              {s.v}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 28 }}>
        <Card>
          <SectionLabel>The plan, in one paragraph</SectionLabel>
          <div style={{ marginTop: 18 }}>
            <Body size={17}>
              Invest <em style={{ color: palette.gold }}>{inr(profile.monthlySIP)}</em> every
              month into a low-cost, mostly-equity index portfolio. Step it up
              by 10–15% each year. Don't touch it for at least 5–7 years.
              Rebalance once annually. Ignore everything else — relationship
              managers, ULIPs, hot tips, daily charts.
            </Body>
            <div style={{ marginTop: 22 }}>
              <Body color={palette.muted}>
                The two things that make this work are <em>time</em> and{" "}
                <em>behaviour</em>. Fund choice is a distant third.
              </Body>
            </div>
          </div>
        </Card>

        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "28px 28px 0" }}>
            <SectionLabel>Monthly allocation</SectionLabel>
          </div>
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocation}
                  dataKey="amount"
                  nameKey="label"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                  stroke={palette.card}
                >
                  {allocation.map((a) => (
                    <Cell key={a.key} fill={a.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: palette.ink2,
                    border: `1px solid ${palette.line}`,
                    borderRadius: 4,
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: 13,
                    color: palette.cream,
                  }}
                  formatter={(v) => inr(v)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ padding: "0 28px 24px" }}>
            <Body color={palette.muted} size={13}>
              Total {inr(total)} / month · 85% equity, 10% gold, 5% liquid
            </Body>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Portfolio() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <Card>
        <SectionLabel>The five line items</SectionLabel>
        <div style={{ marginTop: 22, display: "grid", gap: 14 }}>
          {allocation.map((a) => (
            <div
              key={a.key}
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr 140px",
                gap: 24,
                alignItems: "start",
                padding: "18px 0",
                borderTop: `1px solid ${palette.line}`,
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 8,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: a.color,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Manrope', sans-serif",
                      fontSize: 12,
                      color: palette.muted,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {a.pct}%
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: 22,
                    color: palette.cream,
                    lineHeight: 1.1,
                  }}
                >
                  {a.label}
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: 14,
                    color: palette.cream,
                    marginBottom: 6,
                    fontWeight: 600,
                  }}
                >
                  {a.fund}
                </div>
                <Body color={palette.muted} size={13}>
                  {a.role}
                </Body>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: 24,
                    color: palette.gold,
                  }}
                >
                  {inr(a.amount)}
                </div>
                <div
                  style={{
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: 11,
                    color: palette.muted,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  per month
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <Card>
          <SectionLabel>Why this mix</SectionLabel>
          <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
            <Body>
              <strong style={{ color: palette.gold }}>Index funds, not active.</strong>{" "}
              Lower cost, and they quietly beat ~80% of active funds over a
              decade. No fund-manager risk.
            </Body>
            <Body>
              <strong style={{ color: palette.gold }}>Direct, not regular.</strong>{" "}
              Zero commission. The cost difference compounds into lakhs over
              15–20 years.
            </Body>
            <Body>
              <strong style={{ color: palette.gold }}>SGB beats digital gold.</strong>{" "}
              2.5% annual interest, no GST, no storage cost, tax-free at
              8-year maturity. Skip PhonePe / GPay gold.
            </Body>
          </div>
        </Card>
        <Card>
          <SectionLabel>What to actively avoid</SectionLabel>
          <div style={{ marginTop: 18, display: "grid", gap: 10 }}>
            {[
              "ULIPs (any insurance-cum-investment product)",
              "Regular plans of any mutual fund",
              "Digital gold from PhonePe / GPay / Paytm",
              "Telegram tip channels & 'multibagger' YouTubers",
              "Bank RM recommendations (commission-driven)",
              "F&O, intraday trading, IPO punting",
            ].map((x) => (
              <div
                key={x}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  paddingBottom: 10,
                  borderBottom: `1px dashed ${palette.line}`,
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 1,
                    background: palette.brick,
                  }}
                />
                <Body size={14}>{x}</Body>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Roadmap() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 20,
          }}
        >
          <div>
            <SectionLabel>Wealth projection · ₹L</SectionLabel>
            <Display size={28}>The compounding curve</Display>
          </div>
          <Body color={palette.muted} size={13}>
            Assumes 12% CAGR · SIP stepped up annually
          </Body>
        </div>
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projection} margin={{ top: 10, right: 20, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="2 4" stroke={palette.line} />
              <XAxis
                dataKey="year"
                stroke={palette.muted}
                tick={{ fontFamily: "Manrope", fontSize: 12, fill: palette.muted }}
                label={{
                  value: "Year",
                  position: "insideBottom",
                  offset: -2,
                  fill: palette.muted,
                  fontFamily: "Manrope",
                  fontSize: 12,
                }}
              />
              <YAxis
                stroke={palette.muted}
                tick={{ fontFamily: "Manrope", fontSize: 12, fill: palette.muted }}
              />
              <Tooltip
                contentStyle={{
                  background: palette.ink2,
                  border: `1px solid ${palette.line}`,
                  borderRadius: 4,
                  fontFamily: "Manrope",
                  color: palette.cream,
                }}
                formatter={(v, name) => [`₹${v}L`, name === "value" ? "Portfolio" : "Invested"]}
              />
              <Legend
                wrapperStyle={{
                  fontFamily: "Manrope",
                  fontSize: 12,
                  color: palette.muted,
                }}
              />
              <Line
                type="monotone"
                dataKey="invested"
                stroke={palette.muted}
                strokeWidth={1.5}
                dot={{ r: 3, fill: palette.muted }}
                name="Invested"
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={palette.gold}
                strokeWidth={2.5}
                dot={{ r: 4, fill: palette.gold }}
                name="Portfolio"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <SectionLabel>Year-by-year SIP step-up</SectionLabel>
        <div style={{ marginTop: 20 }}>
          {yearlySteps.map((y, i) => (
            <div
              key={y.year}
              style={{
                display: "grid",
                gridTemplateColumns: "70px 140px 1fr",
                gap: 24,
                padding: "16px 0",
                borderTop: i === 0 ? "none" : `1px solid ${palette.line}`,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 32,
                  color: palette.gold,
                  fontStyle: "italic",
                }}
              >
                Y{y.year}
              </div>
              <div
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 16,
                  color: palette.cream,
                  fontWeight: 600,
                }}
              >
                {inr(y.sip)}/mo
              </div>
              <Body color={palette.muted}>{y.focus}</Body>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function TaxTab() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <Card>
        <SectionLabel>What you actually pay</SectionLabel>
        <div style={{ marginTop: 20 }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            <thead>
              <tr style={{ textAlign: "left", color: palette.muted, fontSize: 11, letterSpacing: "0.12em" }}>
                <th style={{ padding: "10px 0", textTransform: "uppercase" }}>Gain type</th>
                <th style={{ padding: "10px 0", textTransform: "uppercase" }}>Tax</th>
                <th style={{ padding: "10px 0", textTransform: "uppercase" }}>Cess</th>
                <th style={{ padding: "10px 0", textTransform: "uppercase" }}>Effective</th>
              </tr>
            </thead>
            <tbody>
              {taxRows.map((r, i) => (
                <tr
                  key={i}
                  style={{ borderTop: `1px solid ${palette.line}` }}
                >
                  <td style={{ padding: "16px 0", color: palette.cream, fontSize: 14 }}>{r.type}</td>
                  <td style={{ padding: "16px 0", color: palette.gold, fontSize: 14 }}>{r.rate}</td>
                  <td style={{ padding: "16px 0", color: palette.muted, fontSize: 14 }}>{r.cess}</td>
                  <td style={{ padding: "16px 0", color: palette.cream, fontSize: 14 }}>{r.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <Card>
          <SectionLabel>ESPP / RSU — capital gains</SectionLabel>
          <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
            <Body>
              The discount on ESPP shows up on your payslip as a{" "}
              <em>perquisite</em> — meaning it has already been taxed as
              salary. India can't tax it again as capital gain.
            </Body>
            <Body>
              So your <strong style={{ color: palette.gold }}>cost basis = FMV on purchase date</strong>,
              not the discounted purchase price. Use the <em>Adjusted Cost
              Basis</em> column from E*Trade.
            </Body>
            <Body>
              Convert both buy-side and sell-side to INR using SBI TTBR on
              the trade dates. Not your HDFC credit rate.
            </Body>
          </div>
        </Card>
        <Card>
          <SectionLabel>Advance tax — when it applies</SectionLabel>
          <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
            <Body>
              Required only if total tax (after TDS) for the year exceeds
              ₹10,000. Employer TDS on salary usually covers most of it.
            </Body>
            <Body>
              On small foreign capital gains (a few thousand rupees), advance
              tax typically isn't needed. If short-paid, you pay interest
              under §234B / 234C — not a fine, just compounding cost.
            </Body>
            <Body color={palette.muted} size={13}>
              Pay via incometax.gov.in → e-Pay Tax → Advance Tax or
              Self-Assessment Tax. The portal does not compute it for you.
            </Body>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Rules() {
  return (
    <Card>
      <SectionLabel>Ten commandments</SectionLabel>
      <Display size={36} italic>
        Break these and the plan dies.
      </Display>
      <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        {commandments.map((c, i) => (
          <div
            key={i}
            style={{
              padding: "22px 24px",
              borderTop: `1px solid ${palette.line}`,
              borderLeft: i % 2 === 1 ? `1px solid ${palette.line}` : "none",
              display: "flex",
              gap: 18,
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontStyle: "italic",
                fontSize: 28,
                color: palette.gold,
                lineHeight: 1,
                minWidth: 36,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <Body size={15}>{c}</Body>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Crisis() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <Card style={{ borderLeft: `3px solid ${palette.brick}` }}>
        <SectionLabel>If you lose your job</SectionLabel>
        <div style={{ marginTop: 14, maxWidth: 720 }}>
          <Display size={32}>
            Cash saves your life. Liquidity saves your plan. Equity is the last to touch.
          </Display>
        </div>
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 1,
          background: palette.line,
          border: `1px solid ${palette.line}`,
        }}
      >
        {crisisSteps.map((s) => (
          <div
            key={s.n}
            style={{
              background: palette.card,
              padding: "28px 26px",
              display: "grid",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 40,
                  color: palette.gold,
                  fontStyle: "italic",
                  lineHeight: 1,
                }}
              >
                {String(s.n).padStart(2, "0")}
              </div>
              <ArrowUpRight size={16} color={palette.muted} />
            </div>
            <div
              style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 20,
                color: palette.cream,
                lineHeight: 1.2,
              }}
            >
              {s.title}
            </div>
            <Body color={palette.muted} size={14}>
              {s.body}
            </Body>
          </div>
        ))}
      </div>
    </div>
  );
}

function Setup() {
  return (
    <div style={{ display: "grid", gap: 24 }}>
      <Card>
        <SectionLabel>Groww — make sure these are all green</SectionLabel>
        <div style={{ marginTop: 8 }}>
          <Body color={palette.muted}>
            Do this once. Test-buy ₹500, test-sell after two days. Then
            forget the app for a month at a time.
          </Body>
        </div>
        <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
          {setupChecklist.map((item, i) => (
            <label
              key={i}
              style={{
                display: "flex",
                gap: 14,
                alignItems: "center",
                padding: "12px 16px",
                background: palette.ink2,
                border: `1px solid ${palette.line}`,
                borderRadius: 3,
                cursor: "pointer",
                fontFamily: "'Manrope', sans-serif",
                fontSize: 14,
                color: palette.cream,
              }}
            >
              <input
                type="checkbox"
                style={{
                  accentColor: palette.gold,
                  width: 16,
                  height: 16,
                  cursor: "pointer",
                }}
              />
              {item}
            </label>
          ))}
        </div>
      </Card>

      <Card style={{ background: palette.ink2, borderColor: palette.goldSoft }}>
        <SectionLabel>One thing to never do</SectionLabel>
        <div style={{ marginTop: 14 }}>
          <Body size={16}>
            Do not share account-opening forms, PAN, Aadhaar, or KYC
            screenshots with ChatGPT, advisors over chat, or anyone other
            than the regulated platform itself. Everything you need can be
            verified inside the Groww app — no one else needs to see it.
          </Body>
        </div>
      </Card>
    </div>
  );
}

// --- ROOT ----------------------------------------------------------------

export default function WealthBlueprint() {
  const [tab, setTab] = useState("overview");

  const tabContent = {
    overview: <Overview />,
    portfolio: <Portfolio />,
    roadmap: <Roadmap />,
    tax: <TaxTab />,
    rules: <Rules />,
    crisis: <Crisis />,
    setup: <Setup />,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: palette.ink,
        color: palette.cream,
        fontFamily: "'Manrope', sans-serif",
        padding: "48px 32px 80px",
      }}
    >
      <style>{FONTS}</style>

      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        {/* HEADER */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "end",
            gap: 32,
            paddingBottom: 32,
            borderBottom: `1px solid ${palette.line}`,
            marginBottom: 36,
          }}
        >
          <div>
            <SectionLabel>Personal wealth blueprint · FY 2026</SectionLabel>
            <div style={{ marginTop: 14 }}>
              <Display size={64}>
                A plan, not a <em style={{ color: palette.gold }}>punt.</em>
              </Display>
            </div>
            <div style={{ marginTop: 18, maxWidth: 580 }}>
              <Body color={palette.muted} size={16}>
                Built for {profile.name} · {profile.age}, {profile.city},{" "}
                {profile.employer}. Designed to compound quietly for two
                decades while you ignore relationship managers, hot tips, and
                ULIPs.
              </Body>
            </div>
          </div>
          <div
            style={{
              textAlign: "right",
              fontFamily: "'Fraunces', serif",
              fontStyle: "italic",
              fontSize: 14,
              color: palette.muted,
              maxWidth: 220,
            }}
          >
            "Compounding rewards the calm, not the emotional."
          </div>
        </div>

        {/* TABS */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 28,
            borderBottom: `1px solid ${palette.line}`,
            flexWrap: "wrap",
          }}
        >
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 18px",
                  background: "transparent",
                  border: "none",
                  borderBottom: `2px solid ${active ? palette.gold : "transparent"}`,
                  color: active ? palette.cream : palette.muted,
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  marginBottom: -1,
                }}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* CONTENT */}
        <div>{tabContent[tab]}</div>

        {/* FOOTER */}
        <div
          style={{
            marginTop: 56,
            paddingTop: 28,
            borderTop: `1px solid ${palette.line}`,
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "'Manrope', sans-serif",
            fontSize: 12,
            color: palette.muted,
            letterSpacing: "0.05em",
          }}
        >
          <span>For personal use · Not financial advice</span>
          <span style={{ fontStyle: "italic", fontFamily: "'Fraunces', serif" }}>
            Built from your own working notes
          </span>
        </div>
      </div>
    </div>
  );
}
