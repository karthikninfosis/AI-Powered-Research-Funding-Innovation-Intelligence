/* =========================================================
   Innovation Intelligence Platform
   Author: M. Nishandhi
   Pure browser-executable JS — no build step needed
   Uses: React 18 UMD + Recharts UMD (loaded from CDN)
   ========================================================= */

const { useState, useEffect } = React;
const {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} = Recharts;
const h = React.createElement;

// ── DATA ────────────────────────────────────────────────────────
const RAW = [
  { name:"Python",        cat:"Programming Language", year:1991, license:"Open-source",           community:"High, very active community",    jobs:"Data Scientist, Developer" },
  { name:"Java",          cat:"Programming Language", year:1995, license:"Open-source",           community:"High, large community",          jobs:"Software Engineer, Backend Developer" },
  { name:"JavaScript",    cat:"Programming Language", year:1995, license:"Open-source",           community:"Very high, global community",    jobs:"Frontend Developer, Full-stack Developer" },
  { name:"C++",           cat:"Programming Language", year:1985, license:"Open-source",           community:"High, active community",         jobs:"Game Developer, Systems Engineer" },
  { name:"C#",            cat:"Programming Language", year:2000, license:"Proprietary",           community:"High, strong .NET community",    jobs:"Backend Developer, Software Engineer" },
  { name:"Ruby",          cat:"Programming Language", year:1995, license:"Open-source",           community:"Medium, growing community",      jobs:"Full-stack Developer, Web Developer" },
  { name:"PHP",           cat:"Programming Language", year:1995, license:"Open-source",           community:"Large, active community",        jobs:"Web Developer, Backend Developer" },
  { name:"Swift",         cat:"Programming Language", year:2014, license:"Open-source",           community:"High, active community",         jobs:"iOS Developer, Mobile App Developer" },
  { name:"Go",            cat:"Programming Language", year:2009, license:"Open-source",           community:"High, growing community",        jobs:"Backend Developer, Cloud Engineer" },
  { name:"Rust",          cat:"Programming Language", year:2010, license:"Open-source",           community:"High, rapidly growing community",jobs:"Systems Engineer, Embedded Developer" },
  { name:"Kotlin",        cat:"Programming Language", year:2011, license:"Open-source",           community:"High, growing community",        jobs:"Android Developer, Full-stack Developer" },
  { name:"TypeScript",    cat:"Programming Language", year:2012, license:"Open-source",           community:"High, active community",         jobs:"Frontend Developer, Full-stack Developer" },
  { name:"Node.js",       cat:"Runtime Environment",  year:2009, license:"Open-source",           community:"Very high, global community",    jobs:"Backend Developer, Full-stack Developer" },
  { name:"React",         cat:"Library",              year:2013, license:"Open-source",           community:"Very high, active community",    jobs:"Frontend Developer, Full-stack Developer" },
  { name:"Angular",       cat:"Framework",            year:2010, license:"Open-source",           community:"High, large community",          jobs:"Frontend Developer, Full-stack Developer" },
  { name:"Vue.js",        cat:"Framework",            year:2014, license:"Open-source",           community:"High, growing community",        jobs:"Frontend Developer, Full-stack Developer" },
  { name:"Django",        cat:"Framework",            year:2005, license:"Open-source",           community:"High, very active community",    jobs:"Backend Developer, Python Developer" },
  { name:"Flask",         cat:"Framework",            year:2010, license:"Open-source",           community:"High, growing community",        jobs:"Backend Developer, Python Developer" },
  { name:"Spring Boot",   cat:"Framework",            year:2018, license:"Open-source",           community:"High, large community",          jobs:"Backend Developer, Java Developer" },
  { name:"Ruby on Rails", cat:"Framework",            year:2005, license:"Open-source",           community:"High, active community",         jobs:"Web Developer, Ruby Developer" },
  { name:"TensorFlow",    cat:"Library",              year:2015, license:"Open-source",           community:"High, rapidly growing community",jobs:"ML Engineer, AI Researcher" },
  { name:"PyTorch",       cat:"Library",              year:2016, license:"Open-source",           community:"High, rapidly growing community",jobs:"AI Researcher, ML Engineer" },
  { name:"Keras",         cat:"Library",              year:2015, license:"Open-source",           community:"High, established community",    jobs:"ML Engineer, AI Researcher" },
  { name:"Scikit-learn",  cat:"Library",              year:2007, license:"Open-source",           community:"High, stable community",         jobs:"Data Scientist, ML Engineer" },
  { name:"OpenCV",        cat:"Library",              year:2000, license:"Open-source",           community:"High, active community",         jobs:"Computer Vision Engineer, Data Scientist" },
  { name:"Apache Hadoop", cat:"Framework",            year:2006, license:"Open-source",           community:"High, large community",          jobs:"Big Data Engineer, Data Engineer" },
  { name:"Spark",         cat:"Framework",            year:2014, license:"Open-source",           community:"High, large community",          jobs:"Data Engineer, Big Data Architect" },
  { name:"Docker",        cat:"Platform",             year:2013, license:"Open-source",           community:"Very high, active community",    jobs:"DevOps Engineer, Cloud Engineer" },
  { name:"Kubernetes",    cat:"Platform",             year:2014, license:"Open-source",           community:"Very high, growing community",   jobs:"Cloud Engineer, DevOps Engineer" },
  { name:"Terraform",     cat:"Tool",                 year:2014, license:"Open-source",           community:"High, growing community",        jobs:"DevOps Engineer, Cloud Engineer" },
  { name:"Jenkins",       cat:"Tool",                 year:2011, license:"Open-source",           community:"High, large community",          jobs:"DevOps Engineer, CI/CD Engineer" },
  { name:"Git",           cat:"Version Control",      year:2005, license:"Open-source",           community:"Very high, massive community",   jobs:"Software Developer, Backend Developer" },
  { name:"GitHub",        cat:"Platform",             year:2008, license:"Proprietary",           community:"Very high, massive community",   jobs:"Software Developer, Open Source Contributor" },
  { name:"GitLab",        cat:"Platform",             year:2011, license:"Proprietary",           community:"High, growing community",        jobs:"DevOps Engineer, Software Developer" },
  { name:"AWS",           cat:"Cloud Platform",       year:2006, license:"Proprietary",           community:"Very high, massive community",   jobs:"Cloud Engineer, DevOps Engineer" },
  { name:"Google Cloud",  cat:"Cloud Platform",       year:2008, license:"Proprietary",           community:"Very high, growing community",   jobs:"Cloud Engineer, DevOps Engineer" },
  { name:"Microsoft Azure",cat:"Cloud Platform",      year:2010, license:"Proprietary",           community:"Very high, growing community",   jobs:"Cloud Engineer, DevOps Engineer" },
  { name:"Firebase",      cat:"Platform",             year:2011, license:"Proprietary",           community:"High, growing community",        jobs:"Mobile Developer, Backend Developer" },
  { name:"Blockchain",    cat:"Technology",           year:2008, license:"Open-source",           community:"Very high, growing community",   jobs:"Blockchain Developer, Crypto Developer" },
  { name:"Ethereum",      cat:"Blockchain",           year:2015, license:"Open-source",           community:"Very high, growing community",   jobs:"Blockchain Developer, DeFi Developer" },
  { name:"Solidity",      cat:"Language",             year:2014, license:"Open-source",           community:"High, growing community",        jobs:"Smart Contract Developer" },
  { name:"SQL",           cat:"Database Language",    year:1974, license:"Open-source, Proprietary",community:"Very high, massive community", jobs:"Database Administrator, Backend Developer" },
  { name:"NoSQL",         cat:"Database",             year:1998, license:"Open-source",           community:"High, growing community",        jobs:"Database Engineer, Backend Developer" },
  { name:"GraphQL",       cat:"Query Language",       year:2012, license:"Open-source",           community:"Very high, growing community",   jobs:"Frontend Developer, Backend Developer" },
  { name:"REST APIs",     cat:"API Architecture",     year:2000, license:"Open-source",           community:"Very high, massive community",   jobs:"API Developer, Full-stack Developer" },
  { name:"Microservices", cat:"Architecture",         year:2012, license:"Open-source",           community:"High, growing community",        jobs:"Software Architect, DevOps Engineer" },
  { name:"AR",            cat:"Technology",           year:1990, license:"Proprietary, Open-source",community:"High, growing community",      jobs:"AR Developer, Game Developer" },
  { name:"VR",            cat:"Technology",           year:1960, license:"Proprietary, Open-source",community:"High, growing community",      jobs:"VR Developer, Game Developer" },
  { name:"5G",            cat:"Technology",           year:2019, license:"Proprietary",           community:"Very high, growing community",   jobs:"Telecom Engineer, Network Engineer" },
  { name:"Machine Learning",cat:"Technology",         year:1959, license:"Open-source, Proprietary",community:"Very high, growing community", jobs:"Data Scientist, ML Engineer" },
];

const PATENTS = [
  { title:"Edge Devices — Federated ML",                                     org:"Qualcomm Inc. · filed 2025",  rel:"91% relevant", color:"#b5f333", desc:"This patent describes an advanced federated learning approach for edge devices, minimizing data transfer and improving privacy. Highly relevant to decentralized AI networks." },
  { title:"Adaptive Differential Privacy for Distributed Training",           org:"IBM Research · filed 2024",   rel:"84% relevant", color:"#fb923c", desc:"A novel technique to dynamically adapt privacy budgets during distributed ML model training. Ensures robust privacy guarantees without severely compromising utility." },
  { title:"Lightweight Client Selection for Federated Networks",              org:"Samsung R&D · filed 2025",    rel:"76% relevant", color:"#fb923c", desc:"Introduces a lightweight algorithmic framework to select optimal participating clients in a federated setting, enhancing convergence speed and reducing latency." },
  { title:"Quantum-Resistant Encryption in Distributed Systems",              org:"Google Cloud · filed 2025",   rel:"95% relevant", color:"#00d8ff", desc:"A method for implementing post-quantum cryptographic primitives within large-scale distributed architectures to future-proof secure communications." },
  { title:"Zero-Knowledge Proofs for Autonomous Vehicle Authentication",      org:"Tesla Research · filed 2024", rel:"88% relevant", color:"#a78bfa", desc:"Utilizes ZK-SNARKs to allow autonomous vehicles to prove identity and access rights to infrastructure without revealing vehicle telemetry data." },
];

const PUBLICATIONS = [
  { title:"Attention Mechanisms in Next-Gen Transformers", org:"Journal of AI · 2024",        rel:"Highly Cited",   color:"#b5f333", desc:"Analyzes structural improvements in multi-head attention mechanisms, paving the way for larger context windows and more efficient LLMs." },
  { title:"Survey on Edge Computing Architectures",        org:"IEEE Communications · 2025",  rel:"Trending",       color:"#00d8ff", desc:"A comprehensive survey of current paradigms in Edge and Fog computing, identifying bottlenecks in 5G deployment strategies." },
  { title:"Novel Consensus Algorithms for Scalable Blockchains", org:"Crypto Research · 2024",rel:"Peer-Reviewed",  color:"#a78bfa", desc:"Introduces a hybrid Proof-of-Stake model combined with sharding to achieve unprecedented transaction throughput." },
  { title:"Optimizing GraphQL for Microservices",          org:"WebEng Today · 2025",         rel:"Industry Report",color:"#fb923c", desc:"Explores the transition from REST to GraphQL across major cloud architectures, detailing performance metrics and cost reductions." },
];

const GRANTS = [
  { id:"NSF-2026-AI",    name:"National AI Research Institutes",   amount:"$20M",  deadline:"Oct 15, 2026", match:92 },
  { id:"EU-HORIZON-DL",  name:"Horizon Europe: Decentralized AI",  amount:"€15M",  deadline:"Nov 01, 2026", match:88 },
  { id:"NIH-BD-01",      name:"Biomedical Data Repositories",      amount:"$5M",   deadline:"Sep 30, 2026", match:75 },
  { id:"DARPA-SEC-26",   name:"Secure Federated Analytics",        amount:"$12M",  deadline:"Dec 10, 2026", match:96 },
];

// ── DERIVED ANALYTICS ─────────────────────────────────────────
const categoryCount = {};
RAW.forEach(d => { categoryCount[d.cat] = (categoryCount[d.cat] || 0) + 1; });

const categoryData = Object.entries(categoryCount)
  .map(([cat, count]) => ({ cat: cat.length > 16 ? cat.slice(0, 14) + "…" : cat, count }))
  .sort((a, b) => b.count - a.count).slice(0, 8);

const licenseData = [
  { name:"Open-source", value: RAW.filter(d => d.license.includes("Open-source")).length },
  { name:"Proprietary",  value: RAW.filter(d => d.license.includes("Proprietary")).length },
];

const decadeMap = {"1950s":0,"1960s":0,"1970s":0,"1980s":0,"1990s":0,"2000s":0,"2010s":0,"2020s":0};
RAW.forEach(d => {
  const dec = Math.floor(d.year / 10) * 10;
  const k = dec + "s";
  if (decadeMap[k] !== undefined) decadeMap[k]++;
});
const timelineData = Object.entries(decadeMap)
  .map(([decade, count]) => ({ decade, count }))
  .filter(d => d.count > 0);

const commScore = c => c.includes("Very high") ? 4 : c.includes("Large") ? 3 : c.includes("High") ? 2 : 1;
const topTech = [...RAW].sort((a, b) => commScore(b.community) - commScore(a.community)).slice(0, 8);
const communityData = topTech.map(d => ({
  name: d.name.length > 8 ? d.name.slice(0, 7) + "…" : d.name,
  score: commScore(d.community) * 25
}));

const radarData = [
  { subject:"Libraries",  A: RAW.filter(d => d.cat === "Library").length * 8 },
  { subject:"Frameworks", A: RAW.filter(d => d.cat === "Framework").length * 8 },
  { subject:"Platforms",  A: RAW.filter(d => d.cat === "Platform").length * 10 },
  { subject:"Languages",  A: RAW.filter(d => d.cat === "Programming Language").length * 5 },
  { subject:"Cloud",      A: RAW.filter(d => d.cat === "Cloud Platform").length * 15 },
  { subject:"Tools",      A: RAW.filter(d => ["Tool","Version Control","Architecture"].includes(d.cat)).length * 12 },
];

const openSourcePct = Math.round(RAW.filter(d => d.license.includes("Open-source")).length / RAW.length * 100);
const totalTech     = RAW.length;
const avgYear       = Math.round(RAW.reduce((s, d) => s + d.year, 0) / RAW.length);
const veryHighComm  = RAW.filter(d => d.community.startsWith("Very high")).length;

// ── PALETTE ───────────────────────────────────────────────────
const BAR_COLORS = ["#00d8ff","#a78bfa","#b5f333","#fb923c","#f472b6","#34d399","#fbbf24","#60a5fa"];
const PIE_COLORS = ["#b5f333","#a78bfa"];

const scoreBreakdown = [
  { label:"Novelty",    score:82, color:"#a78bfa", desc:"Based on semantic uniqueness against existing IP databases." },
  { label:"Impact",     score:74, color:"#00d8ff", desc:"Predicted reach measured by citation velocity and media mentions." },
  { label:"Feasibility",score:88, color:"#b5f333", desc:"Evaluated via technical readiness levels (TRL)." },
  { label:"Market Fit", score:61, color:"#fb923c", desc:"Correlated with current venture capital funding trends." },
];

// ── COMPONENTS ────────────────────────────────────────────────

// Custom Tooltip
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return h("div", { className:"custom-tooltip" },
    h("div", { className:"custom-tooltip-label" }, label),
    payload.map((p, i) =>
      h("div", { key:i, style:{ color: p.color } },
        (p.name || "Value") + ": ", h("b", null, p.value)
      )
    )
  );
}

// Stat Card
function StatCard({ label, value, sub, accent = "#b5f333" }) {
  return h("div", { className:"stat-card" },
    h("div", { className:"stat-value", style:{ color: accent } }, value),
    h("div", { className:"stat-label" }, label),
    sub && h("div", { className:"stat-sub" }, sub)
  );
}

// Innovation Gauge SVG
function InnovationGauge({ score }) {
  const r = 52, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const arc  = circ * 0.75;
  const dash = (score / 100) * arc;
  return h("svg", { width:140, height:120, viewBox:"0 0 140 120" },
    h("circle", { cx, cy, r, fill:"none", stroke:"#21262d", strokeWidth:10,
      strokeDasharray:`${arc} ${circ}`, strokeDashoffset: -circ * 0.125, strokeLinecap:"round" }),
    h("circle", { cx, cy, r, fill:"none", stroke:"#b5f333", strokeWidth:10,
      strokeDasharray:`${dash} ${circ}`, strokeDashoffset: -circ * 0.125, strokeLinecap:"round",
      style:{ filter:"drop-shadow(0 0 8px #b5f333)" } }),
    h("text", { x:cx, y:cy-4,  textAnchor:"middle", fill:"#b5f333", fontSize:22, fontWeight:800, fontFamily:"Space Grotesk" }, score),
    h("text", { x:cx, y:cy+14, textAnchor:"middle", fill:"#7d8590", fontSize:10 }, "/ 100")
  );
}

// Modal
function Modal({ item, onClose }) {
  if (!item) return null;
  return h("div", { className:"modal-overlay", onClick: onClose },
    h("div", { className:"modal-box", onClick: e => e.stopPropagation() },
      h("div", { className:"modal-header" },
        h("h3", { className:"modal-title" }, item.title),
        h("button", { className:"modal-close", onClick: onClose }, "✕")
      ),
      h("div", { className:"modal-org" }, item.org),
      h("div", { style:{ marginBottom:16 } },
        h("span", {
          className:"list-item-tag",
          style:{ background:`${item.color}20`, borderColor:`${item.color}40`, color: item.color }
        }, item.rel)
      ),
      h("div", { className:"modal-abstract" },
        h("div", { className:"modal-abstract-label" }, "Description / Abstract"),
        h("p", { className:"modal-abstract-text" }, item.desc)
      ),
      h("button", {
        className:"modal-cta",
        style:{ background: item.color },
        onClick: onClose
      }, "Close Details")
    )
  );
}

// Render a clickable list of patents/publications
function renderList(items, setSelectedItem) {
  return h("div", null,
    items.map((p, i) =>
      h("div", {
        key: i,
        className:"list-item",
        style:{ borderColor:"#21262d" },
        onClick: () => setSelectedItem(p),
        onMouseEnter: e => { e.currentTarget.style.borderColor = p.color; e.currentTarget.style.background = "#222831"; },
        onMouseLeave: e => { e.currentTarget.style.borderColor = "#21262d"; e.currentTarget.style.background = "var(--card)"; }
      },
        h("div", { className:"list-item-row" },
          h("div", null,
            h("div", { className:"list-item-title" }, p.title),
            h("div", { className:"list-item-org" }, p.org)
          ),
          h("span", {
            className:"list-item-tag",
            style:{ background:`${p.color}18`, borderColor:`${p.color}40`, color: p.color }
          }, p.rel)
        )
      )
    )
  );
}

// ── VIEWS ─────────────────────────────────────────────────────

function OverviewView() {
  return h("div", null,
    // Stat row
    h("div", { className:"stat-row" },
      h(StatCard, { label:"Total Technologies",   value: totalTech,    sub:"Across all categories",    accent:"#b5f333" }),
      h(StatCard, { label:"Open-Source",           value:`${openSourcePct}%`, sub:"License distribution", accent:"#00d8ff" }),
      h(StatCard, { label:"Avg Launch Year",        value: avgYear,      sub:"Dataset average",         accent:"#a78bfa" }),
      h(StatCard, { label:"Very High Community",    value: veryHighComm, sub:"Massive adoption",        accent:"#fb923c" }),
      h(StatCard, { label:"Categories Tracked",     value: Object.keys(categoryCount).length, sub:"Tech ecosystem", accent:"#f472b6" }),
    ),

    // Row 1: Bar + Pie
    h("div", { className:"grid-2-col" },
      h("div", { className:"panel" },
        h("div", { className:"section-title" }, "Technologies by Category"),
        h(ResponsiveContainer, { width:"100%", height:220 },
          h(BarChart, { data: categoryData, barSize:24 },
            h(CartesianGrid, { strokeDasharray:"3 3", stroke:"#21262d", vertical:false }),
            h(XAxis, { dataKey:"cat", tick:{ fill:"#7d8590", fontSize:10 }, axisLine:false, tickLine:false }),
            h(YAxis, { tick:{ fill:"#7d8590", fontSize:10 }, axisLine:false, tickLine:false }),
            h(Tooltip, { content: h(CustomTooltip) }),
            h(Bar, { dataKey:"count", radius:[4,4,0,0] },
              categoryData.map((_, i) => h(Cell, { key:i, fill: BAR_COLORS[i % BAR_COLORS.length] }))
            )
          )
        )
      ),
      h("div", { className:"panel" },
        h("div", { className:"section-title" }, "License Distribution"),
        h("div", { style:{ display:"flex", flexDirection:"column", alignItems:"center", paddingTop:8 } },
          h(ResponsiveContainer, { width:"100%", height:180 },
            h(PieChart, null,
              h(Pie, { data: licenseData, cx:"50%", cy:"50%", innerRadius:55, outerRadius:80,
                dataKey:"value", stroke:"none", paddingAngle:3 },
                licenseData.map((_, i) => h(Cell, { key:i, fill: PIE_COLORS[i] }))
              ),
              h(Tooltip, { content: h(CustomTooltip) })
            )
          ),
          h("div", { className:"pie-legend" },
            licenseData.map((d, i) =>
              h("div", { key:i, className:"pie-legend-item" },
                h("span", { className:"pie-legend-dot", style:{ background: PIE_COLORS[i] } }),
                h("span", { style:{ color:"#7d8590" } }, d.name),
                h("span", { style:{ fontWeight:700, color:"#e6edf3" } }, d.value)
              )
            )
          )
        )
      )
    ),

    // Row 2: Timeline + Radar + Score
    h("div", { className:"grid-3-col" },
      h("div", { className:"panel" },
        h("div", { className:"section-title" }, "Adoption Timeline by Decade"),
        h(ResponsiveContainer, { width:"100%", height:200 },
          h(LineChart, { data: timelineData },
            h(CartesianGrid, { strokeDasharray:"3 3", stroke:"#21262d", vertical:false }),
            h(XAxis, { dataKey:"decade", tick:{ fill:"#7d8590", fontSize:10 }, axisLine:false, tickLine:false }),
            h(YAxis, { tick:{ fill:"#7d8590", fontSize:10 }, axisLine:false, tickLine:false }),
            h(Tooltip, { content: h(CustomTooltip) }),
            h(Line, { type:"monotone", dataKey:"count", stroke:"#b5f333", strokeWidth:3,
              dot:{ fill:"#b5f333", r:4, strokeWidth:0 }, activeDot:{ r:7 } })
          )
        )
      ),
      h("div", { className:"panel" },
        h("div", { className:"section-title" }, "Ecosystem Radar"),
        h(ResponsiveContainer, { width:"100%", height:200 },
          h(RadarChart, { data: radarData, cx:"50%", cy:"50%", outerRadius:70 },
            h(PolarGrid, { stroke:"#21262d" }),
            h(PolarAngleAxis, { dataKey:"subject", tick:{ fill:"#7d8590", fontSize:10 } }),
            h(PolarRadiusAxis, { tick:false, axisLine:false }),
            h(Radar, { dataKey:"A", stroke:"#00d8ff", fill:"#00d8ff", fillOpacity:0.2, strokeWidth:2 })
          )
        )
      ),
      h("div", { className:"panel", style:{ display:"flex", flexDirection:"column", justifyContent:"center" } },
        h("div", { className:"section-title" }, "Innovation Score"),
        h("div", { style:{ display:"flex", flexDirection:"column", alignItems:"center" } },
          h(InnovationGauge, { score:78 }),
          h("div", { style:{ width:"100%", marginTop:16 } },
            scoreBreakdown.map(s =>
              h("div", { key: s.label, className:"progress-row" },
                h("span", { className:"progress-label" }, s.label),
                h("div", { className:"progress-track" },
                  h("div", { className:"progress-fill", style:{ width:`${s.score}%`, background: s.color, boxShadow:`0 0 6px ${s.color}60` } })
                ),
                h("span", { className:"progress-value", style:{ color: s.color } }, s.score)
              )
            )
          )
        )
      )
    )
  );
}

function FundingView() {
  return h("div", null,
    h("div", { className:"stat-row" },
      h(StatCard, { label:"Active Grants",    value:"4",     accent:"#b5f333" }),
      h(StatCard, { label:"Total Available",  value:"$37M+", accent:"#00d8ff" }),
      h(StatCard, { label:"Avg Match Score",  value:"87%",   accent:"#a78bfa" }),
    ),
    h("div", { className:"panel" },
      h("div", { className:"section-title" }, "Recommended Funding Opportunities"),
      h("div", { className:"table-scroll", style:{ marginTop:16 } },
        h("table", { className:"grants-table" },
          h("thead", null,
            h("tr", null,
              ["Grant ID","Program Name","Amount","Deadline","Match Score","Action"].map(col =>
                h("th", { key: col }, col)
              )
            )
          ),
          h("tbody", null,
            GRANTS.map(g =>
              h("tr", { key: g.id },
                h("td", { style:{ color:"#00d8ff", fontWeight:600 } }, g.id),
                h("td", { style:{ color:"#e6edf3", fontWeight:600 } }, g.name),
                h("td", { style:{ color:"#e6edf3" } }, g.amount),
                h("td", { style:{ color:"#fb923c" } }, g.deadline),
                h("td", null,
                  h("div", { className:"match-cell" },
                    h("div", { className:"match-bar" },
                      h("div", { className:"match-fill", style:{ width:`${g.match}%` } })
                    ),
                    h("span", { className:"match-pct" }, g.match + "%")
                  )
                ),
                h("td", null, h("button", { className:"apply-btn" }, "Apply"))
              )
            )
          )
        )
      )
    )
  );
}

function ResearchTrendsView() {
  const [search, setSearch]     = useState("");
  const [filterCat, setFilter]  = useState("All");
  const cats = ["All", ...Object.keys(categoryCount).sort()];
  const filtered = RAW.filter(d =>
    (filterCat === "All" || d.cat === filterCat) &&
    (d.name.toLowerCase().includes(search.toLowerCase()) || d.cat.toLowerCase().includes(search.toLowerCase()))
  );

  return h("div", { style:{ display:"grid", gap:16 } },
    h("div", { className:"flex-row" },
      h("div", { className:"panel flex-1" },
        h("div", { className:"section-title" }, "Adoption Timeline by Decade"),
        h(ResponsiveContainer, { width:"100%", height:300 },
          h(LineChart, { data: timelineData },
            h(CartesianGrid, { strokeDasharray:"3 3", stroke:"#21262d", vertical:false }),
            h(XAxis, { dataKey:"decade", tick:{ fill:"#7d8590", fontSize:11 }, axisLine:false, tickLine:false }),
            h(YAxis, { tick:{ fill:"#7d8590", fontSize:11 }, axisLine:false, tickLine:false }),
            h(Tooltip, { content: h(CustomTooltip) }),
            h(Line, { type:"monotone", dataKey:"count", stroke:"#b5f333", strokeWidth:3,
              dot:{ fill:"#b5f333", r:5, strokeWidth:0 }, activeDot:{ r:8 } })
          )
        )
      ),
      h("div", { className:"panel flex-1" },
        h("div", { className:"section-title" }, "Community Strength (Top Technologies)"),
        h(ResponsiveContainer, { width:"100%", height:300 },
          h(BarChart, { data: communityData, layout:"vertical", barSize:16 },
            h(CartesianGrid, { strokeDasharray:"3 3", stroke:"#21262d", horizontal:false }),
            h(XAxis, { type:"number", domain:[0,100], tick:{ fill:"#7d8590", fontSize:11 }, axisLine:false, tickLine:false }),
            h(YAxis, { dataKey:"name", type:"category", width:80, tick:{ fill:"#e6edf3", fontSize:12 }, axisLine:false, tickLine:false }),
            h(Tooltip, { content: h(CustomTooltip) }),
            h(Bar, { dataKey:"score", radius:[0,4,4,0] },
              communityData.map((_, i) => h(Cell, { key:i, fill: i % 2 === 0 ? "#a78bfa" : "#00d8ff" }))
            )
          )
        )
      )
    ),
    h("div", { className:"panel" },
      h("div", { className:"section-title" }, `Technology Registry (${filtered.length} records)`),
      h("div", { className:"filter-row" },
        h("input", { className:"search-input", value: search, placeholder:"Search technologies…",
          onChange: e => setSearch(e.target.value) }),
        h("select", { className:"filter-select", value: filterCat, onChange: e => setFilter(e.target.value) },
          cats.map(c => h("option", { key:c, value:c }, c))
        )
      ),
      h("div", { className:"table-scroll" },
        h("table", { className:"data-table" },
          h("thead", null,
            h("tr", null,
              ["Technology","Category","Year","License","Community","Job Roles"].map(col =>
                h("th", { key: col }, col)
              )
            )
          ),
          h("tbody", null,
            filtered.slice(0, 10).map((d, i) =>
              h("tr", { key:i },
                h("td", { style:{ fontWeight:700, color:"#e6edf3" } }, d.name),
                h("td", null,
                  h("span", { className:"badge", style:{ background:"rgba(167,139,250,0.18)", color:"#a78bfa" } }, d.cat)
                ),
                h("td", { style:{ color:"#7d8590" } }, d.year),
                h("td", null,
                  h("span", { style:{ color: d.license.includes("Open-source") ? "#b5f333" : "#fb923c", fontWeight:600 } },
                    d.license.includes("Open-source") ? "Open-source" : "Proprietary"
                  )
                ),
                h("td", { style:{ color:"#7d8590", fontSize:12 } }, d.community.split(",")[0]),
                h("td", { style:{ color:"#00d8ff", fontSize:12 } }, d.jobs.split(",")[0].trim())
              )
            )
          )
        )
      )
    )
  );
}

function PublicationsView({ setSelectedItem }) {
  return h("div", { className:"grid-equal-2" },
    h("div", { className:"flex-col" },
      h("div", { className:"flex-row" },
        h(StatCard, { label:"Total Papers", value:"1,248", accent:"#a78bfa" }),
        h(StatCard, { label:"Citations",    value:"34.2K", accent:"#00d8ff" }),
      ),
      h("div", { className:"panel", style:{ flex:1 } },
        h("div", { className:"section-title" }, "Citations Over Time"),
        h(ResponsiveContainer, { width:"100%", height:260 },
          h(BarChart, {
            data:[{year:"2021",c:4000},{year:"2022",c:6500},{year:"2023",c:8200},{year:"2024",c:11000},{year:"2025",c:4500}],
            barSize:30
          },
            h(CartesianGrid, { strokeDasharray:"3 3", stroke:"#21262d", vertical:false }),
            h(XAxis, { dataKey:"year", tick:{ fill:"#7d8590", fontSize:11 }, axisLine:false, tickLine:false }),
            h(YAxis, { tick:{ fill:"#7d8590", fontSize:11 }, axisLine:false, tickLine:false }),
            h(Tooltip, { content: h(CustomTooltip) }),
            h(Bar, { dataKey:"c", name:"Citations", fill:"#a78bfa", radius:[4,4,0,0] })
          )
        )
      )
    ),
    h("div", { className:"panel" },
      h("div", { className:"section-title" }, "Top Impact Publications (Click for Details)"),
      renderList(PUBLICATIONS, setSelectedItem)
    )
  );
}

function PatentsView({ setSelectedItem }) {
  return h("div", null,
    h("div", { className:"stat-row" },
      h(StatCard, { label:"Patents Filed", value:"342", accent:"#fb923c" }),
      h(StatCard, { label:"Granted",       value:"218", accent:"#b5f333" }),
      h(StatCard, { label:"Pending",       value:"124", accent:"#00d8ff" }),
    ),
    h("div", { className:"panel" },
      h("div", { className:"section-title" }, "Intellectual Property Registry (Click for Details)"),
      renderList(PATENTS, setSelectedItem)
    )
  );
}

function InnovationScoreView() {
  return h("div", { className:"score-page-grid" },
    h("div", { className:"panel score-center-panel" },
      h("div", { className:"section-title" }, "Global Innovation Score"),
      h("div", { style:{ transform:"scale(1.5)", marginTop:20, marginBottom:30 } },
        h(InnovationGauge, { score:78 })
      ),
      h("div", { className:"score-rank-note" },
        "Your organization ranks in the top ",
        h("strong", null, "12%"),
        " of all tracked research institutions globally."
      )
    ),
    h("div", { className:"panel" },
      h("div", { className:"section-title" }, "Score Breakdown & Methodology"),
      h("div", { style:{ marginTop:20 } },
        scoreBreakdown.map(s =>
          h("div", { key: s.label, className:"score-detail-row" },
            h("div", { className:"score-detail-header" },
              h("span", { className:"score-detail-name" }, s.label),
              h("span", { className:"score-detail-value", style:{ color: s.color } }, `${s.score}/100`)
            ),
            h("div", { className:"score-detail-bar" },
              h("div", { className:"score-detail-fill", style:{ width:`${s.score}%`, background: s.color, boxShadow:`0 0 6px ${s.color}60` } })
            ),
            h("div", { className:"score-detail-desc" }, s.desc)
          )
        )
      )
    )
  );
}

// ── MAIN DASHBOARD ────────────────────────────────────────────
function Dashboard() {
  const [activeTab,     setActiveTab]     = useState("researcher");
  const [activeSection, setActiveSection] = useState("Overview");
  const [selectedItem,  setSelectedItem]  = useState(null);

  const tabs = [
    { id:"researcher", label:"Researcher",        sub:"Grants · Trends · IP" },
    { id:"startup",    label:"Startup",           sub:"Funding · Tech · Commercialize" },
    { id:"manager",    label:"Innovation Manager",sub:"Portfolio · Pipeline" },
    { id:"admin",      label:"Admin",             sub:"Platform · Governance" },
  ];

  const sections = ["Overview","Funding Recommendations","Research Trends","Publication Analytics","Patent Insights","Innovation Score"];

  const activeTabObj = tabs.find(t => t.id === activeTab);
  const pageTitle    = activeSection === "Overview" ? "Research Funding & Innovation Intelligence Platform" : activeSection;

  return h("div", { className:"layout" },
    h(Modal, { item: selectedItem, onClose: () => setSelectedItem(null) }),

    // ── SIDEBAR ──
    h("nav", { className:"sidebar" },
      // Logo
      h("div", { className:"sidebar-logo" },
        h("div", { className:"sidebar-logo-row" },
          h("div", { className:"logo-icon" }, "🔬"),
          h("div", null,
            h("div", { className:"logo-text" }, "Innovation", h("br"), "Intelligence")
          )
        ),
        h("div", { className:"logo-tagline" }, "RESEARCH · FUNDING · IP")
      ),

      // Nav
      h("div", { className:"sidebar-nav" },
        h("div", { className:"nav-section-label" }, "USER PERSONAS"),
        tabs.map(t =>
          h("div", {
            key: t.id,
            className: "nav-item" + (activeTab === t.id ? " active" : ""),
            onClick: () => setActiveTab(t.id)
          },
            h("div", { className:"nav-item-label" }, t.label),
            h("div", { className:"nav-item-sub" }, t.sub)
          )
        ),
        h("div", { className:"nav-spacer" },
          h("div", { className:"nav-section-label" }, "DASHBOARD SECTIONS"),
          sections.map(s =>
            h("div", {
              key: s,
              className: "section-item" + (activeSection === s ? " active" : ""),
              onClick: () => setActiveSection(s)
            },
              h("span", null, s),
              activeSection !== s && h("span", { className:"section-arrow" }, "›")
            )
          )
        )
      ),

      // User footer
      h("div", { className:"sidebar-user" },
        h("div", { className:"user-avatar" }, "MN"),
        h("div", null,
          h("div", { className:"user-name" }, "M Nishandhi"),
          h("div", { className:"user-role" }, "Researcher")
        ),
        h("div", { className:"user-settings" }, "⚙")
      )
    ),

    // ── MAIN ──
    h("main", { className:"main" },
      // Topbar
      h("div", { className:"topbar" },
        h("div", null,
          h("div", { className:"breadcrumb" },
            "Innovation Intelligence › ", activeTabObj?.label, " › ", h("span", null, activeSection)
          ),
          h("h1", { className:"page-title" }, pageTitle)
        ),
        h("div", { className:"topbar-actions" },
          h("div", { className:"live-badge" },
            h("span", { className:"live-dot" }), "Live data"
          ),
          h("div", { className:"icon-btn" }, "🔔"),
          h("div", { className:"icon-btn" }, "⚙️")
        )
      ),

      // Active view
      activeSection === "Overview"                && h(OverviewView),
      activeSection === "Funding Recommendations" && h(FundingView),
      activeSection === "Research Trends"         && h(ResearchTrendsView),
      activeSection === "Publication Analytics"   && h(PublicationsView, { setSelectedItem }),
      activeSection === "Patent Insights"         && h(PatentsView, { setSelectedItem }),
      activeSection === "Innovation Score"        && h(InnovationScoreView),

      // Footer
      h("div", { className:"footer" },
        `Innovation Intelligence Platform · M Nishandhi · Dataset: ${totalTech} technologies · ${new Date().getFullYear()}`
      )
    )
  );
}

// ── MOUNT ─────────────────────────────────────────────────────
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(h(Dashboard));
