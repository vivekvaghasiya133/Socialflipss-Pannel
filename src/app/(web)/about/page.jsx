"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  FiZap, 
  FiEye, 
  FiActivity, 
  FiArrowRight, 
  FiCpu, 
  FiUser,
  FiSmile,
  FiAward
} from "react-icons/fi";

const values = [
  {
    icon: FiZap,
    title: "Uncompromising Velocity",
    desc: "The internet moves in microseconds. We distribute visuals, scale ads, and adapt to algorithmic adjustments at extreme speed to capture momentum before your competitors even wake up.",
    color: "#7B3FE4"
  },
  {
    icon: FiEye,
    title: "Conversion Aesthetics",
    desc: "Design is completely useless if it doesn't perform. Every visual asset, carousel structure, reel format, and typography choice we craft is engineered with strict conversion logic to guide viewers into pipelines.",
    color: "#9B6EF3"
  },
  {
    icon: FiActivity,
    title: "Data Over Speculation",
    desc: "We completely banish assumptions. Every strategy blueprint, target audience parameter, and ad dollar allocation is dictated by rigorous backend metrics and growth audits.",
    color: "#B084FF"
  }
];

const teamMembers = [
  {
    name: "Vivek Vaghasiya",
    role: "Strategic Growth Lead",
    tool: "Algorithmic Ad Bidding Arrays",
    motto: "Scale budgets aggressively, eliminate funnel friction.",
    avatar: "VV",
    color: "#7B3FE4"
  },
  {
    name: "Aman Patel",
    role: "Content Forge Director",
    tool: "High-Retention Hook Frameworks",
    motto: "Seize screen time, build undeniable market authority.",
    avatar: "AP",
    color: "#9B6EF3"
  },
  {
    name: "Karan Shah",
    role: "Conversion Science Lead",
    tool: "Next.js High-Performance Systems",
    motto: "Optimize page edge speeds under 500ms.",
    avatar: "KS",
    color: "#B084FF"
  }
];

const milestones = [
  { 
    year: "2024", 
    title: "Protocol Conception", 
    desc: "SocialFlipss was forged in a garage lab with a single mandate: to replace generic templates and slow agencies with high-velocity ROI systems.",
    color: "#7B3FE4"
  },
  { 
    year: "2025", 
    title: "The Velocity Spike", 
    desc: "Scaled over 100+ Indian & Global direct-to-consumer and SaaS brands, generating over 50M+ views and tripling typical ROI coefficients.",
    color: "#9B6EF3"
  },
  { 
    year: "2026", 
    title: "Autonomous Qualifiers HUD", 
    desc: "Integrated real-time metric calculators, phone reel showcases, and diagnostic terminal systems directly into our platform infrastructure.",
    color: "#B084FF"
  }
];

export default function AboutPage() {
  const [hoveredArchitect, setHoveredArchitect] = useState(null);

  return (
    <div className="bg-[#020202] text-white min-h-screen relative font-sans overflow-x-hidden pt-24 pb-12">
      
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[-15%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[20%] right-[-15%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
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
              <span className="text-xs font-bold tracking-[0.5em] uppercase text-primary">Our Mission</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-[clamp(2.2rem,6vw,5rem)] font-black text-white tracking-tighter uppercase leading-[0.95] mb-6"
            >
              THE GROWTH ARCHITECTS <br />
              <span className="text-gradient-primary">OF DIGITAL DOMINANCE.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-white/40 font-light text-base md:text-lg max-w-2xl leading-relaxed mt-6"
            >
              Traditional agency frameworks are broken. They rely on slow retainers, generic templates, and metric speculations. 
              SocialFlipss was forged with a single, uncompromising mandate: **to engineer the conversion and creative infrastructure that positions our partners as the defaults in their industries.**
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── 2. MEET THE ARCHITECTS PROFILE CONSOLE ── */}
      <section className="py-20 relative z-10 border-t border-white/5 bg-[#020202]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl mb-16 text-center md:text-left">
            <span className="text-[10px] font-bold text-primary tracking-[0.6em] uppercase mb-4 block">The Team</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
              MEET THE <span className="text-gradient-primary">GROWTH ARCHITECTS.</span>
            </h2>
            <p className="text-white/40 font-light text-sm mt-4">
              Hover over any profile to scrutinize their primary tactical tools and core operational motto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredArchitect(idx)}
                onMouseLeave={() => setHoveredArchitect(null)}
                className="group relative p-8 rounded-[2rem] bg-zinc-950/40 border border-white/5 backdrop-blur-md shadow-xl flex flex-col justify-between hover:bg-zinc-900/40 transition-all duration-500 min-h-[340px] overflow-hidden"
              >
                {/* Glow Aura specific to color */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none"
                  style={{ backgroundColor: member.color }}
                />

                <div className="relative z-10 space-y-6">
                  {/* Avatar bubble */}
                  <div 
                    className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-lg transition-all duration-500 group-hover:scale-105"
                    style={{ borderColor: member.color, color: member.color }}
                  >
                    {member.avatar}
                  </div>

                  <div>
                    <h3 className="text-2xl font-black uppercase text-white tracking-tight">{member.name}</h3>
                    <span className="text-xs font-bold tracking-widest uppercase block mt-1" style={{ color: member.color }}>{member.role}</span>
                  </div>
                </div>

                {/* Animated description drawer */}
                <div className="relative z-10 border-t border-white/5 pt-6 mt-6">
                  <AnimatePresence mode="wait">
                    {hoveredArchitect === idx ? (
                      <motion.div
                        key="motto"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-2 font-mono text-[10px]"
                      >
                        <span className="text-white/30 uppercase block">Operational Motto</span>
                        <p className="text-emerald-400 font-bold leading-normal font-sans text-xs italic">
                          "{member.motto}"
                        </p>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="tool"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-2 font-mono text-[10px]"
                      >
                        <span className="text-white/30 uppercase block">Primary Tactical Tool</span>
                        <p className="text-white/60 font-bold uppercase tracking-wider font-sans text-xs">
                          {member.tool}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div 
                  className="absolute bottom-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"
                  style={{ backgroundColor: member.color }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. INTERACTIVE CORE MILESTONES TIMELINE ── */}
      <section className="py-24 relative z-10 border-t border-white/5 bg-[#020202]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl mb-24 text-center md:text-left">
            <span className="text-[10px] font-bold text-primary tracking-[0.6em] uppercase mb-4 block">Historical Records</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
              THE ASCENSION <span className="text-gradient-primary">MILESTONES.</span>
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-4 bottom-4 w-px bg-gradient-to-b from-primary/50 via-zinc-900 to-accent/50 hidden md:block" />

            <div className="space-y-20">
              {milestones.map((m, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="relative flex items-start gap-8 md:gap-12 group"
                >
                  <div 
                    className="relative z-10 w-16 h-16 shrink-0 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center transition-all duration-700 shadow-2xl"
                    style={{ boxShadow: `0 0 30px ${m.color}10` }}
                  >
                    <FiAward className="w-5 h-5 transition-transform duration-500 group-hover:scale-110" style={{ color: m.color }} />
                    <div className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-40 transition-opacity rounded-full" style={{ backgroundColor: m.color }} />
                    <div className="absolute inset-0 border border-white/20 rounded-full group-hover:scale-115 transition-transform duration-500" style={{ borderColor: m.color }} />
                  </div>

                  <div className="flex-1 mt-1">
                    <span className="font-bold text-sm tracking-[0.4em] uppercase mb-2 block font-mono" style={{ color: m.color }}>
                      {m.year}
                    </span>
                    <h4 className="text-2xl font-black text-white tracking-tight uppercase mb-4 transition-colors duration-300 group-hover:text-primary">
                      {m.title}
                    </h4>
                    <p className="text-white/40 text-base font-light max-w-3xl leading-relaxed group-hover:text-white/60 transition-colors duration-300">
                      {m.desc}
                    </p>
                  </div>

                  <div 
                    className="absolute right-0 top-1/2 -translate-y-1/2 text-[10vw] font-black opacity-[0.04] group-hover:opacity-[0.1] select-none pointer-events-none uppercase transition-all duration-700 group-hover:translate-x-6 hidden lg:block"
                    style={{ color: m.color }}
                  >
                    {m.year}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. NARRATIVE & VALUES GRID ── */}
      <section className="py-24 relative z-10 border-t border-white/5 bg-[#020202]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl mb-20 text-center md:text-left">
            <span className="text-[10px] font-bold text-primary tracking-[0.6em] uppercase mb-4 block">Core Values</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
              GROWTH BELIEFS & <span className="text-gradient-primary">COMMITMENTS.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {values.map((v, index) => {
              const ValueIcon = v.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -6 }}
                  className="group p-8 rounded-3xl bg-zinc-950/40 border border-white/5 flex flex-col justify-between hover:border-primary/20 transition-all duration-500 shadow-xl"
                >
                  <div>
                    <div 
                      className="mb-8 p-4 w-fit rounded-2xl bg-white/5 border border-white/10 group-hover:scale-105 group-hover:border-primary/20 transition-all duration-500"
                    >
                      <ValueIcon className="w-6 h-6" style={{ color: v.color }} />
                    </div>
                    
                    <h4 className="text-xl font-bold text-white uppercase tracking-tight mb-4">
                      {v.title}
                    </h4>
                    
                    <p className="text-white/40 text-sm leading-relaxed font-light group-hover:text-white/60 transition-colors duration-300">
                      {v.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
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
            READY TO OUTSCALE <br />
            <span className="text-gradient-primary">YOUR COMPETITION?</span>
          </h2>
          
          <p className="text-white/40 font-light text-base md:text-lg max-w-lg mx-auto leading-relaxed">
            Contact our strategic leads to schedule a session, audit marketing friction, and unlock massive ROI loops.
          </p>

          <div className="flex flex-wrap justify-center gap-6 pt-4">
            <Link
              href="/contact"
              className="group relative inline-flex items-center justify-center h-16 px-10 text-xs font-black bg-white text-black hover:bg-primary hover:text-white transition-all duration-500 rounded-full uppercase tracking-widest shadow-2xl cursor-pointer"
            >
              Initiate Growth Audit
              <FiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
