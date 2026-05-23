"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  FiSearch, 
  FiEdit, 
  FiZap, 
  FiBarChart, 
  FiCheckCircle, 
  FiArrowRight,
  FiCpu,
  FiActivity,
  FiSettings,
  FiLock,
  FiCheck
} from "react-icons/fi";

const steps = [
  {
    phase: "PHASE_01",
    title: "Intel Auditing & Gaps Scrutiny",
    desc: "We perform a comprehensive, data-driven analysis of your existing brand footprint, competitor mechanics, and strategic market gaps. This allows us to identify untapped opportunities and engineer a customized positioning blueprint that commands authority from day one.",
    icon: FiSearch,
    color: "#7B3FE4",
    duration: "Days 1 - 5",
    inputs: ["Existing Ad Account Logs", "Audience Demographics", "Competitor Visual Feeds"],
    outputs: ["Unified Market Opportunity Gap Map", "Target Growth Velocity Plan", "Direct Competitor Attack Vector Blueprint"]
  },
  {
    phase: "PHASE_02",
    title: "Creative Content Forge",
    desc: "Our creative team engineers high-end visual and narrative assets tailored to capture and hold screen attention. From high-retention short-form reels and dynamic graphical templates to hyper-persuasive ad copy, we forge assets that position your brand as a market leader.",
    icon: FiEdit,
    color: "#9B6EF3",
    duration: "Days 6 - 15",
    inputs: ["Raw Client Brand Media Assets", "Product Value Proposition Core", "High-Resolution Logotypes"],
    outputs: ["12 Optimized Short-form Reel Assets", "Custom High-Contrast Visual Templates", "High-intent Conversion Copy Arrays"]
  },
  {
    phase: "PHASE_03",
    title: "Systematic Distribution Protocol",
    desc: "We launch your campaigns using highly optimized scheduling arrays, algorithm-triggering hashtag indices, and precision-targeted paid advertising. We continuously test visual logic and ad placements to drive high-velocity lead pipelines and massive organic reach.",
    icon: FiZap,
    color: "#B084FF",
    duration: "Days 16 - 25",
    inputs: ["Approved Content Assets Forge", "Target Monthly Marketing Budgets", "Whitelisted Social Handles"],
    outputs: ["Active Precision Ads Campaigns", "Automated Comment Qualifying DM Bots", "Optimized Daily Distribution Arrays"]
  },
  {
    phase: "PHASE_04",
    title: "Analytical Scale Engineering",
    desc: "Growth is a science. We conduct rigorous weekly and monthly checkpoints to audit your conversion data, organic metrics, and return on ad spend. We refine our visual logic, optimize client retention loops, and scale active channels to secure absolute market dominance.",
    icon: FiBarChart,
    color: "#7B3FE4",
    duration: "Days 26 - 30+",
    inputs: ["Active Ad Campaign Metrics Logs", "Follower Interaction Statistics", "Lead Pipeline Capture Sheets"],
    outputs: ["Rigorous Weekly Metric Checkpoint Report", "Optimized Audience Lookalike Arrays", "Budget Scaling & CPL Reduction Indexes"]
  }
];

export default function ProtocolPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [checklist, setChecklist] = useState([true, true, false, false, false]);

  const toggleCheck = (idx) => {
    const nextCheck = [...checklist];
    nextCheck[idx] = !nextCheck[idx];
    setChecklist(nextCheck);
  };

  const completedCount = checklist.filter(Boolean).length;
  const progressPercent = Math.floor((completedCount / checklist.length) * 100);

  return (
    <div className="bg-[#020202] text-white min-h-screen relative font-sans overflow-x-hidden pt-24 pb-12">
      
      {/* Background Glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[15%] right-[-10%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[180px]" />
        <div className="absolute bottom-[15%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
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
              <span className="text-xs font-bold tracking-[0.5em] uppercase text-primary">The Protocol</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-[clamp(2.2rem,6vw,5rem)] font-black text-white tracking-tighter uppercase leading-[0.95] mb-6"
            >
              SYSTEMATIC <br />
              <span className="text-gradient-primary">ASCENSION PROTOCOLS.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-white/40 font-light text-base md:text-lg max-w-2xl leading-relaxed mt-6"
            >
              We follow a rigorous, scientific growth model designed to eliminate guesswork. Every creative decision, ad placement, and strategy pivot is backed by uncompromising data analysis and conversion optimization.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── 2. INTERACTIVE MILESTONES BLUEPRINT HUD ── */}
      <section className="py-20 relative z-10 border-t border-white/5 bg-[#020202]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl mb-16 text-center md:text-left">
            <span className="text-[10px] font-bold text-primary tracking-[0.6em] uppercase mb-4 block">Process Dashboard</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
              ASCENSION <span className="text-gradient-primary">MILESTONES HUD.</span>
            </h2>
            <p className="text-white/40 font-light text-sm mt-4">
              Select an active phase below to explore direct strategy targets, timelines, required inputs, and compiled strategic outputs.
            </p>
          </div>

          {/* Interactive HUD console */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            {/* Left timeline buttons */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`w-full text-left p-6 rounded-3xl border transition-all duration-500 flex items-start gap-5 group cursor-pointer ${
                    activeStep === index 
                      ? "bg-primary/5 border-primary/40 shadow-[0_0_20px_rgba(123,63,228,0.08)] scale-[1.01]" 
                      : "bg-zinc-950/20 border-white/5 hover:border-white/10 hover:bg-zinc-950/40"
                  }`}
                >
                  <div className={`p-3 rounded-2xl border transition-colors shrink-0 ${
                    activeStep === index ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/10 text-white/40 group-hover:text-white"
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <span className="text-[8px] font-mono tracking-widest uppercase mb-1 block" style={{ color: step.color }}>{step.phase} ({step.duration})</span>
                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">{step.title}</h4>
                  </div>
                </button>
              ))}
            </div>

            {/* Right details HUD panel */}
            <div className="lg:col-span-7">
              <div className="h-full rounded-[2.5rem] bg-zinc-950/60 border border-white/5 p-8 md:p-10 flex flex-col justify-between shadow-2xl relative min-h-[420px]">
                
                {/* HUD Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-5 mb-6">
                  <div className="flex items-center gap-3">
                    <FiCpu className="w-5 h-5 text-primary animate-pulse" />
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-white">ASCENSION PROTOCOL METRICS</h4>
                      <span className="text-[7px] font-bold tracking-widest text-primary uppercase">Security Timeline HUD</span>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-primary px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
                    {steps[activeStep].duration}
                  </span>
                </div>

                {/* HUD details grid */}
                <div className="space-y-6 flex-1">
                  <div>
                    <span className="text-[9px] font-bold text-white/20 tracking-[0.2em] uppercase font-mono block mb-1">Active Step Overview</span>
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">{steps[activeStep].title}</h3>
                    <p className="text-white/40 text-xs font-light leading-relaxed mt-2">{steps[activeStep].desc}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-5">
                    {/* Inputs */}
                    <div className="space-y-3">
                      <span className="text-[9px] font-bold text-white/20 tracking-[0.2em] uppercase font-mono block">Required Protocol Inputs</span>
                      <ul className="space-y-2">
                        {steps[activeStep].inputs.map((inp, idx) => (
                          <li key={idx} className="flex items-center gap-2.5 text-xs text-white/60">
                            <span className="h-1 w-1 rounded-full bg-primary" />
                            <span className="font-light">{inp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Outputs */}
                    <div className="space-y-3">
                      <span className="text-[9px] font-bold text-emerald-400/40 tracking-[0.2em] uppercase font-mono block">Compiled Deliverable Outputs</span>
                      <ul className="space-y-2">
                        {steps[activeStep].outputs.map((out, idx) => (
                          <li key={idx} className="flex items-center gap-2.5 text-xs text-emerald-400">
                            <FiCheck className="shrink-0 text-sm" />
                            <span className="font-light">{out}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* HUD CTA */}
                <div className="border-t border-white/5 pt-6 mt-6 flex justify-end font-sans">
                  <Link
                    href="/contact"
                    className="px-8 h-12 rounded-full bg-white hover:bg-primary text-black hover:text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer transition-all duration-500 shadow-xl"
                  >
                    Initiate Audit Pipeline
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. INTERACTIVE SYSTEM ASCENSION CHECKLIST ── */}
      <section className="py-24 relative z-10 border-t border-white/5 bg-[#020202]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left side: Checklist content */}
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-primary tracking-[0.6em] uppercase block">Interactive Diagnostics</span>
                <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                  DOMINANCE <span className="text-gradient-primary">CHECKLIST MATRIX.</span>
                </h3>
                <p className="text-white/40 font-light text-sm leading-relaxed max-w-xl">
                  Select your current pipeline checkpoints to diagnose your scaling safety index. Clicking items computes active scaling benchmarks in real-time.
                </p>
              </div>

              {/* Checkbox matrix */}
              <div className="space-y-4">
                {[
                  "Complete competitor attention void mapping and ad audits.",
                  "Forge 12 scroll-stopping cinematic vertical visual assets.",
                  "Establish automated comment qualifiers and DM indexing hooks.",
                  "Banish templated retainers and stabilize advertising ROAS > 3X.",
                  "Deploy ultra-fast Conversion Logic webspaces under 500ms."
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleCheck(idx)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center gap-4 cursor-pointer select-none ${
                      checklist[idx] 
                        ? "bg-emerald-500/5 border-emerald-500/30" 
                        : "bg-zinc-950/20 border-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                      checklist[idx] ? "bg-emerald-500 border-emerald-500 text-black" : "border-white/20 bg-black"
                    }`}>
                      {checklist[idx] && <FiCheck className="text-xs stroke-[3px]" />}
                    </div>
                    <span className={`text-xs md:text-sm font-light leading-snug transition-colors ${
                      checklist[idx] ? "text-emerald-300" : "text-white/40 hover:text-white/60"
                    }`}>
                      {item}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Right side: Circular progress gauge */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="p-8 md:p-10 rounded-[3rem] bg-zinc-950/40 border border-white/5 flex flex-col items-center text-center shadow-2xl relative w-full max-w-sm">
                
                {/* SVG Progress Ring */}
                <div className="relative w-48 h-48 mb-8">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background line */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke="rgba(255,255,255,0.03)" 
                      strokeWidth="6" 
                      fill="transparent" 
                    />
                    {/* Glowing progress line */}
                    <motion.circle 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      stroke="#7B3FE4" 
                      strokeWidth="6" 
                      fill="transparent" 
                      strokeDasharray="251.2"
                      animate={{ strokeDashoffset: 251.2 - (251.2 * progressPercent) / 100 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{ strokeLinecap: "round" }}
                    />
                  </svg>
                  {/* Floating percentage text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center select-none font-mono">
                    <span className="text-4xl font-black text-white">{progressPercent}%</span>
                    <span className="text-[7px] font-bold text-white/30 tracking-[0.2em] uppercase mt-1">Scaling Index</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-white/30 tracking-[0.15em] uppercase font-mono">System Integrity Report</span>
                  <h4 className="text-base font-black text-white uppercase tracking-tight">
                    {progressPercent === 100 
                      ? "DOMINANCE LEVEL ACCESSED" 
                      : progressPercent >= 60 
                        ? "ASCENSION PROTOCOL SCALING" 
                        : "ACQUISITION FRICTION DETECTED"
                    }
                  </h4>
                  <p className="text-[10px] text-white/40 font-light leading-relaxed max-w-[220px] mx-auto">
                    {progressPercent === 100 
                      ? "Your brand features optimized retention pipelines ready to scale budgets aggressively." 
                      : "Secure the remaining audit protocols to stabilization pipeline conversions."
                    }
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. DETAILED TIMELINE DIRECTORY ── */}
      <section className="py-24 relative z-10 border-t border-white/5 bg-[#020202]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl mb-24 text-center md:text-left">
            <span className="text-[10px] font-bold text-primary tracking-[0.6em] uppercase mb-4 block">Ascension Sequence</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
              THE ASCENSION <span className="text-gradient-primary">TIMELINE PATH.</span>
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-4 bottom-4 w-px bg-gradient-to-b from-primary/50 via-zinc-900 to-accent/50 hidden md:block" />

            <div className="space-y-24">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="relative flex items-start gap-8 md:gap-12 group"
                  >
                    <div 
                      className="relative z-10 w-16 h-16 shrink-0 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center transition-all duration-700 shadow-2xl"
                      style={{ boxShadow: `0 0 30px ${step.color}10` }}
                    >
                      <StepIcon className="w-5 h-5 transition-transform duration-500 group-hover:scale-110" style={{ color: step.color }} />
                      <div className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-40 transition-opacity rounded-full" style={{ backgroundColor: step.color }} />
                      <div className="absolute inset-0 border border-white/20 rounded-full group-hover:scale-115 transition-transform duration-500" style={{ borderColor: step.color }} />
                    </div>

                    <div className="flex-1 mt-1">
                      <span className="font-bold text-[9px] tracking-[0.4em] uppercase mb-2 block" style={{ color: step.color }}>
                        {step.phase} • {step.duration}
                      </span>
                      <h4 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase mb-4 transition-colors duration-300 group-hover:text-primary">
                        {step.title}
                      </h4>
                      <p className="text-white/40 text-base md:text-lg font-light max-w-3xl leading-relaxed group-hover:text-white/60 transition-colors duration-300">
                        {step.desc}
                      </p>
                    </div>

                    <div 
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-[10vw] font-black opacity-[0.04] group-hover:opacity-[0.1] select-none pointer-events-none uppercase transition-all duration-700 group-hover:translate-x-6 hidden lg:block"
                      style={{ color: step.color }}
                    >
                      0{index + 1}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
