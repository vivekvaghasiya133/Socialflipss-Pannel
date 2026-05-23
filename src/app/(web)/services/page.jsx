"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  FiMessageSquare, 
  FiTarget, 
  FiEdit, 
  FiTrendingUp, 
  FiGlobe, 
  FiBarChart, 
  FiArrowRight,
  FiCpu,
  FiCheckCircle,
  FiX,
  FiActivity,
  FiSettings
} from "react-icons/fi";

const services = [
  {
    icon: FiMessageSquare,
    title: "Social Media Management",
    desc: "Bespoke brand position architecture. We build highly curated organic feeds, deploy automated distribution scripts, and manage daily engagements on Instagram, LinkedIn, and X to establish undeniable market authority.",
    color: "#7B3FE4",
  },
  {
    icon: FiTarget,
    title: "Paid Advertising Protocols",
    desc: "High-velocity client acquisition funnels. Precision-targeted Meta, Google, and LinkedIn campaigns engineered to convert cold attention into direct customer pipeline. We audit intent and scale budgets aggressively.",
    color: "#9B6EF3",
  },
  {
    icon: FiEdit,
    title: "Content Asset Forge",
    desc: "Visual storytelling designed to seize screen time. High-end video production, scroll-stopping reels, interactive carousel architectures, and persuasive copy engineered to capture and retain customer interest.",
    color: "#B084FF",
  },
  {
    icon: FiTrendingUp,
    title: "Brand Position Strategy",
    desc: "Custom identity engineering. We map out strategic market gaps, analyze competitor mechanics, and formulate authority blueprints that position your business as the default choice in your niche.",
    color: "#7B3FE4",
  },
  {
    icon: FiGlobe,
    title: "Conversion Logic Webspaces",
    desc: "High-performance digital ecosystems. Ultra-fast, visually premium websites and landing pages custom-engineered with logical UX hierarchies to guide users straight into your sales pipeline.",
    color: "#9B6EF3",
  },
  {
    icon: FiBarChart,
    title: "Growth Analytics & Audits",
    desc: "Uncompromised metrics transparency. Rigorous monthly audits checking customer acquisition costs, return on ad spend, and organic engagement gains, providing you absolute clarity on your expansion.",
    color: "#B084FF",
  },
];

const blueprintData = [
  {
    title: "Social Media Management",
    techStack: ["Algorithmic Syndication Arrays", "Dynamic Engagement Bots", "Automated Scheduling Protocols", "Brand Voice Vectors"],
    velocity: "2-3 Weeks",
    multiplier: "3.2X Reach",
    color: "#7B3FE4",
    terminalLogs: [
      "[INFO] Connecting feed syndicator to active brand channels...",
      "[ALGO] Resolving algorithmic hash indices for optimal drop-times...",
      "[BOT] Initializing real-time engagement monitoring protocol...",
      "[COMPLETE] Feeds secured. Channel authority established."
    ]
  },
  {
    title: "Paid Advertising Protocols",
    techStack: ["Meta Lookalike Bidding Engines", "Custom Retargeting Funnels", "CBO Optimization Scripts", "Audience Intent Mapping"],
    velocity: "1-2 Weeks",
    multiplier: "4.5X ROAS",
    color: "#9B6EF3",
    terminalLogs: [
      "[INFO] Auditing ad manager tracking codes and pixel APIs...",
      "[PIPELINE] Initializing high-intent custom lookalike cohorts...",
      "[BIDDING] Spreading active daily budgets across high-yield assets...",
      "[COMPLETE] Bids stabilized. Cost-Per-Lead reduced by 60%."
    ]
  },
  {
    title: "Content Asset Forge",
    techStack: ["4K Kinetic Editing Suites", "Pattern-Interrupt Templates", "Kinetic Subtitle Composers", "High-Retention Hook Frameworks"],
    velocity: "3-4 Weeks",
    multiplier: "50M+ Views",
    color: "#B084FF",
    terminalLogs: [
      "[INFO] Initializing asset forge suite with raw media uploads...",
      "[RENDER] Rendering cinematic pattern interrupts every 2.4 seconds...",
      "[SUBTITLES] Compiling localized kinetic typography overlay maps...",
      "[COMPLETE] Visual assets optimized. Retention ceiling secured."
    ]
  },
  {
    title: "Brand Position Strategy",
    techStack: ["Competitor Vector Scrutinizer", "Market Gap Map Vectors", "Default Choice Frameworks", "Authority Blueprints"],
    velocity: "4-6 Weeks",
    multiplier: "10X Authority",
    color: "#7B3FE4",
    terminalLogs: [
      "[INFO] Initializing competitor intelligence auditing scripts...",
      "[MATRIX] Mapping competitor positioning voids and category gaps...",
      "[STRATEGY] Formulating default-choice brand identity architecture...",
      "[COMPLETE] Blueprint compiled. Market dominance index locked."
    ]
  },
  {
    title: "Conversion Logic Webspaces",
    techStack: ["Next.js App Router Core", "Tailwind 4 Stylesheets", "Sub-500ms Edge Loaders", "Qualifying CRM Connectors"],
    velocity: "4-5 Weeks",
    multiplier: "+62% Leads Increase",
    color: "#9B6EF3",
    terminalLogs: [
      "[INFO] Deploying high-performance digital edge node layouts...",
      "[SPEED] Optimizing image asset bundles and visual rendering cycles...",
      "[Qualify] Connecting conversational CRM forms to active API...",
      "[COMPLETE] Webspace deployed. Funnel friction eliminated."
    ]
  },
  {
    title: "Growth Analytics & Audits",
    techStack: ["Rigorous Metrics Auditing API", "Real-Time HUD Dashboards", "ROAS Performance Trackers", "Custom CAC Minimizers"],
    velocity: "1 Week",
    multiplier: "100% Transparency",
    color: "#B084FF",
    terminalLogs: [
      "[INFO] Securely fetching transaction APIs and ad spend logs...",
      "[AUDIT] Running performance delta comparisons vs baseline index...",
      "[METRICS] Compiling granular client cost-acquisition matrices...",
      "[COMPLETE] Audits compiled. Direct scale options delivered."
    ]
  }
];

const traditionalVsFlipss = [
  {
    criteria: "Turnaround Speed",
    traditional: "30-45 Day delays for asset approval & campaigns.",
    flipss: "High-velocity execution. Assets forged & deployed in under 7 days.",
    status: true
  },
  {
    criteria: "Talent Access",
    traditional: "Junior account executives managing client strategies.",
    flipss: "Direct elite pipeline strategy engineered by core senior directors.",
    status: true
  },
  {
    criteria: "Financial Overhead",
    traditional: "Massive retainer bloat covering agency brick-and-mortar overhead.",
    flipss: "Zero bloat. Strategic pricing tailored directly to ad ROAS spikes.",
    status: true
  },
  {
    criteria: "Distribution & Reach",
    traditional: "Static schedule posts with no algorithm targeting vectors.",
    flipss: "Algorithmic organic scheduling arrays paired with targeted paid campaigns.",
    status: true
  },
  {
    criteria: "Conversion Focus",
    traditional: "Aesthetic metrics (likes, saves) without customer pipelines.",
    flipss: "Obsessive conversion logic funnel tracking focused on sales and qualified leads.",
    status: true
  }
];

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState([]);

  // Trigger terminal printing when active tab changes
  useEffect(() => {
    setTerminalLogs([]);
    
    const activeBlueprint = blueprintData[activeTab];
    let step = 0;
    const interval = setInterval(() => {
      if (activeBlueprint.terminalLogs[step]) {
        setTerminalLogs(prev => [...prev, activeBlueprint.terminalLogs[step]]);
        step++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [activeTab]);

  return (
    <div className="bg-[#020202] text-white min-h-screen relative font-sans overflow-x-hidden pt-24 pb-12">
      
      {/* ── BACKGROUND GLOWS ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
      </div>

      {/* ── 1. CINEMATIC HERO TITLE ── */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-4xl text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-center md:justify-start gap-4 mb-4"
            >
              <span className="h-px w-10 bg-primary" />
              <span className="text-xs font-bold tracking-[0.5em] uppercase text-primary">Capabilities</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-[clamp(2.2rem,6vw,5rem)] font-black text-white tracking-tighter uppercase leading-[0.95] mb-6"
            >
              WE ENGINEER THE <br />
              <span className="text-gradient-primary">GROWTH PROTOCOLS</span> <br />
              OF DOMINANT BRANDS.
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-white/40 font-light text-base md:text-lg max-w-2xl leading-relaxed mt-6"
            >
              Our processes completely bypass traditional, slow agency frameworks. We design and execute aggressive media campaigns built around speed, absolute visual excellence, and measurable conversion logic.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── 2. INTERACTIVE BLUEPRINT CONSOLE ── */}
      <section className="py-20 relative z-10 border-t border-white/5 bg-[#020202]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl mb-16 text-center md:text-left">
            <span className="text-[10px] font-bold text-primary tracking-[0.6em] uppercase mb-4 block">Interactive HUD</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
              CAPABILITY <span className="text-gradient-primary">BLUEPRINT CONSOLE.</span>
            </h2>
            <p className="text-white/40 font-light text-sm mt-4">
              Click any protocol on the left to scrutinize its dynamic technical structure and expected growth velocity.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            {/* Left selector keys */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              {blueprintData.map((blueprint, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`w-full text-left p-6 rounded-3xl border transition-all duration-500 flex items-center justify-between group cursor-pointer ${
                    activeTab === index 
                      ? "bg-primary/5 border-primary/30 shadow-[0_0_20px_rgba(123,63,228,0.08)] scale-[1.02]" 
                      : "bg-zinc-950/20 border-white/5 hover:border-white/10 hover:bg-zinc-950/40"
                  }`}
                >
                  <span className={`text-xs font-black uppercase tracking-wider transition-colors ${
                    activeTab === index ? "text-primary" : "text-white/50 group-hover:text-white"
                  }`}>
                    {blueprint.title}
                  </span>
                  <FiArrowRight className={`w-4 h-4 transition-all ${
                    activeTab === index ? "text-primary translate-x-1" : "text-white/20 group-hover:text-white group-hover:translate-x-1"
                  }`} />
                </button>
              ))}
            </div>

            {/* Right blueprint HUD details */}
            <div className="lg:col-span-8">
              <div className="h-full rounded-[2.5rem] bg-zinc-950/60 border border-white/5 p-8 md:p-10 flex flex-col justify-between shadow-2xl relative min-h-[420px]">
                
                {/* HUD Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-5 mb-6">
                  <div className="flex items-center gap-3 font-sans">
                    <FiCpu className="w-5 h-5 text-primary animate-pulse" />
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-white">Capability Blueprint</h4>
                      <span className="text-[7px] font-bold tracking-widest text-primary uppercase">Active HUD Segment</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest block font-sans">Expected impact</span>
                      <span className="text-xs font-black text-emerald-400 font-mono mt-0.5 block">{blueprintData[activeTab].multiplier}</span>
                    </div>
                  </div>
                </div>

                {/* HUD Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1">
                  {/* Stats Column */}
                  <div className="md:col-span-6 space-y-6">
                    <div>
                      <span className="text-[9px] font-bold text-white/20 tracking-[0.2em] uppercase font-mono block mb-2">Selected Protocol</span>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight">{blueprintData[activeTab].title}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-zinc-950/40 border border-white/5">
                        <span className="text-[8px] font-bold text-white/20 tracking-[0.1em] uppercase block">Velocity time</span>
                        <span className="text-xs font-black text-white mt-1 block">{blueprintData[activeTab].velocity}</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-zinc-950/40 border border-white/5">
                        <span className="text-[8px] font-bold text-white/20 tracking-[0.1em] uppercase block">Est. Return</span>
                        <span className="text-xs font-black text-primary mt-1 block">{blueprintData[activeTab].multiplier}</span>
                      </div>
                    </div>

                    {/* Tech Stack badging */}
                    <div className="space-y-2.5">
                      <span className="text-[9px] font-bold text-white/20 tracking-[0.2em] uppercase font-mono block">Integrated Technology Stack</span>
                      <div className="flex flex-wrap gap-2">
                        {blueprintData[activeTab].techStack.map((tech, idx) => (
                          <span key={idx} className="text-[9px] font-bold text-white/60 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Terminal Column */}
                  <div className="md:col-span-6 flex flex-col justify-stretch">
                    <div className="flex-1 rounded-2xl bg-black/40 border border-white/5 p-5 font-mono text-[10px] text-white/50 space-y-2 flex flex-col justify-start min-h-[180px]">
                      <div className="flex justify-between items-center text-[7px] text-white/25 border-b border-white/5 pb-2 mb-2 uppercase select-none">
                        <span>Terminal Output</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </div>
                      {terminalLogs.map((log, idx) => (
                        <div key={idx} className="flex gap-2 leading-relaxed">
                          <span className="text-primary font-bold">▶</span>
                          <span>{log}</span>
                        </div>
                      ))}
                      {terminalLogs.length === 0 && (
                        <span className="text-white/25 italic">Initializing secure console logs...</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* HUD Footer Action */}
                <div className="border-t border-white/5 pt-6 mt-6 flex justify-end font-sans">
                  <Link
                    href="/contact"
                    className="px-8 h-12 rounded-full bg-white hover:bg-primary text-black hover:text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all duration-500 shadow-xl"
                  >
                    Initiate Audit Protocol
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. DETAILED CORE CAPABILITIES DIRECTORY ── */}
      <section className="py-28 relative z-10 border-t border-white/5 bg-[#020202]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl mb-20 text-center md:text-left">
            <span className="text-[10px] font-bold text-primary tracking-[0.6em] uppercase mb-4 block">Services Directory</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
              CORE METRIC <span className="text-gradient-primary">CAPABILITIES.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const IconComp = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="group relative p-8 bg-zinc-950/40 border border-white/5 rounded-[2rem] hover:bg-zinc-900/40 transition-all duration-500 overflow-hidden shadow-xl"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none" style={{ backgroundColor: service.color }} />
                  
                  <div className="relative z-10">
                    <div className="mb-8 p-4 w-fit rounded-2xl bg-white/5 border border-white/10 group-hover:scale-105 group-hover:border-primary/20 transition-all duration-500">
                      <IconComp className="w-7 h-7" style={{ color: service.color }} />
                    </div>
                    
                    <h4 className="text-xl font-bold text-white uppercase tracking-tight mb-3">
                      {service.title}
                    </h4>
                    <p className="text-white/40 text-sm leading-relaxed font-light group-hover:text-white/60 transition-colors">
                      {service.desc}
                    </p>
                    
                    <Link href="/contact" className="mt-8 flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-all group-hover:translate-x-1.5">
                      <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: service.color }}>Learn More</span>
                      <FiArrowRight className="w-3.5 h-3.5" style={{ color: service.color }} />
                    </Link>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" style={{ backgroundColor: service.color }} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 4. THE INTERACTIVE FRAMEWORK BATTLE (Agency vs. SocialFlipss) ── */}
      <section className="py-28 relative z-10 border-t border-white/5 bg-[#020202]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl mb-20 text-center md:text-left">
            <span className="text-[10px] font-bold text-primary tracking-[0.6em] uppercase mb-4 block">Competitor Scrutiny</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
              THE HIGH-VELOCITY <br />
              <span className="text-gradient-primary">FRAMEWORK BATTLE.</span>
            </h2>
            <p className="text-white/40 font-light text-sm mt-4">
              Audit how our proprietary systematic protocols stack against obsolete typical retainers.
            </p>
          </div>

          {/* Grid Layout Comparison table */}
          <div className="p-8 rounded-[2.5rem] bg-zinc-950/20 border border-white/5 backdrop-blur-xl shadow-2xl overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-left select-none">
              <thead>
                <tr className="border-b border-white/5 pb-4 text-[10px] font-black uppercase text-white/30 tracking-[0.2em]">
                  <th className="py-4 pr-6">Audited Criteria</th>
                  <th className="py-4 px-6 text-rose-400">Typical Slow Agency</th>
                  <th className="py-4 pl-6 text-primary">SocialFlipss Protocol</th>
                </tr>
              </thead>
              <tbody>
                {traditionalVsFlipss.map((battle, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/2 transition-colors duration-300">
                    <td className="py-5 pr-6 font-bold text-white uppercase text-xs tracking-wider">
                      {battle.criteria}
                    </td>
                    <td className="py-5 px-6 text-xs text-white/35 font-light leading-relaxed">
                      <div className="flex items-center gap-3">
                        <FiX className="text-rose-500 shrink-0 text-base" />
                        <span>{battle.traditional}</span>
                      </div>
                    </td>
                    <td className="py-5 pl-6 text-xs text-white/70 font-bold leading-relaxed">
                      <div className="flex items-center gap-3">
                        <FiCheckCircle className="text-emerald-400 shrink-0 text-base" />
                        <span>{battle.flipss}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── 5. ULTIMATE CALL TO ACTION BANNER ── */}
      <section className="py-32 relative z-10 border-t border-white/5 bg-[#020202] overflow-hidden">
        <div className="absolute inset-0 bg-grid-white opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-6 max-w-5xl relative z-10 text-center space-y-10">
          <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">
            READY TO AUDIT <br />
            <span className="text-gradient-primary">YOUR PIPELINE?</span>
          </h2>
          
          <p className="text-white/40 font-light text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Lock in a custom systems auditing session with our strategic lead. Let's analyze your bottlenecks and map a default choice dominance blueprint.
          </p>

          <div className="flex flex-wrap justify-center gap-6 pt-4">
            <Link
              href="/contact"
              className="group relative inline-flex items-center justify-center h-16 px-10 text-xs font-black bg-white text-black hover:bg-primary hover:text-white transition-all duration-500 rounded-full uppercase tracking-widest shadow-2xl cursor-pointer"
            >
              Initiate Strategy Audit
              <FiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
