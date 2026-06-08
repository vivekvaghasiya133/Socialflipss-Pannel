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
    color: "#7B3FE4"
  },
  {
    icon: FiActivity,
    title: "Data Over Speculation",
    desc: "We completely banish assumptions. Every strategy blueprint, target audience parameter, and ad dollar allocation is dictated by rigorous backend metrics and growth audits.",
    color: "#7B3FE4"
  }
];

const teamMembers = [
  {
    name: "Vivek Vaghasiya",
    role: "Founder",
    tool: "Algorithmic Ad Bidding Arrays",
    motto: "Scale budgets aggressively, eliminate funnel friction.",
    avatar: "VV",
    color: "#7B3FE4"
  },
  {
    name: "Kuldeep Vaghasiya",
    role: "Founder",
    tool: "High-Retention Hook Frameworks",
    motto: "Build brands that dominate. Seize screen time, build undeniable market authority.",
    avatar: "KV",
    color: "#7B3FE4"
  }
];

const milestones = [
  { 
    year: "2022", 
    title: "Agency Founded", 
    desc: "SocialFlipss was built with a single mandate: to replace generic templates and slow agencies with high-velocity creative and growth systems.",
    color: "#7B3FE4"
  },
  { 
    year: "2024", 
    title: "The Growth Spike", 
    desc: "Scaled over 100+ Indian & Global brands, generating over 50M+ views and tripling typical ROI coefficients across social platforms.",
    color: "#7B3FE4"
  },
  { 
    year: "2026", 
    title: "Full-Scale Growth Forge", 
    desc: "Integrated real-time metric systems, diagnostic tools, and AI-powered content workflows to scale brands faster than ever before.",
    color: "#7B3FE4"
  }
];

export default function AboutPage() {
  const [hoveredArchitect, setHoveredArchitect] = useState(null);

  return (
    <div className="bg-black text-white min-h-screen relative overflow-x-hidden pt-24 pb-12" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[-15%] w-[600px] h-[600px] rounded-full blur-[150px]" style={{ background: "rgba(123,63,228,0.06)" }} />
        <div className="absolute bottom-[20%] right-[-15%] w-[600px] h-[600px] rounded-full blur-[150px]" style={{ background: "rgba(123,63,228,0.04)" }} />
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
              <span className="h-px w-10 bg-[#7B3FE4]" />
              <span className="text-xs font-semibold tracking-[0.4em] uppercase" style={{ color: "#7B3FE4" }}>Our Mission</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="font-black text-white leading-[0.92] mb-6"
              style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)", letterSpacing: "-0.03em" }}
            >
              The Growth Architects<br />
              <span style={{ color: "#7B3FE4" }}>of Digital Dominance.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-white/45 text-base md:text-lg max-w-2xl leading-relaxed mt-6 font-normal"
            >
              Traditional agency frameworks are broken. They rely on slow retainers, generic templates, and guesswork.
              SocialFlipss was built with one mandate: to engineer the creative infrastructure that positions our partners as the default choice in their industry.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── 2. MEET THE ARCHITECTS PROFILE CONSOLE ── */}
      <section className="py-20 relative z-10 border-t border-white/8 bg-black">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl mb-16 text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] mb-4 block" style={{ color: "#7B3FE4" }}>The Team</span>
            <h2 className="text-3xl md:text-5xl font-black leading-tight" style={{ letterSpacing: "-0.02em" }}>
              Meet the <span style={{ color: "#7B3FE4" }}>Growth Architects</span>
            </h2>
            <p className="text-white/40 text-sm mt-4 font-normal">
              Hover over any profile to see their primary tools and core motto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredArchitect(idx)}
                onMouseLeave={() => setHoveredArchitect(null)}
                className="group relative p-8 rounded-[24px] bg-[#0a0a0a] border border-white/10 flex flex-col justify-between hover:border-white/20 transition-all duration-400 min-h-[320px] overflow-hidden cursor-pointer"
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
      <section className="py-24 relative z-10 border-t border-white/8 bg-black">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl mb-16 text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] mb-4 block" style={{ color: "#7B3FE4" }}>Our Journey</span>
            <h2 className="text-3xl md:text-5xl font-black" style={{ letterSpacing: "-0.02em" }}>
              The Ascension <span style={{ color: "#7B3FE4" }}>Milestones</span>
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-4 bottom-4 w-px hidden md:block" style={{ background: "linear-gradient(to bottom, rgba(123,63,228,0.5), rgba(123,63,228,0.1))" }} />

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
      <section className="py-24 relative z-10 border-t border-white/8 bg-black">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl mb-16 text-center md:text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.4em] mb-4 block" style={{ color: "#7B3FE4" }}>Core Values</span>
            <h2 className="text-3xl md:text-5xl font-black" style={{ letterSpacing: "-0.02em" }}>
              Our Values: The Secret <span style={{ color: "#7B3FE4" }}>Sauce</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {values.map((v, index) => {
              const ValueIcon = v.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="group p-8 rounded-[24px] bg-[#0a0a0a] border border-white/10 hover:border-white/20 transition-all duration-400"
                >
                  <div>
                    <div className="mb-6 w-12 h-12 rounded-xl bg-[#7B3FE4]/10 flex items-center justify-center group-hover:bg-[#7B3FE4]/20 transition-colors">
                      <ValueIcon className="w-6 h-6" style={{ color: v.color }} />
                    </div>
                    
                    <h4 className="text-lg font-bold text-white mb-3">{v.title}</h4>
                    
                    <p className="text-white/45 text-sm leading-relaxed">{v.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. ULTIMATE CALL TO ACTION BANNER ── */}
      <section className="py-24 relative z-10 border-t border-white/8 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-grid-white opacity-20 pointer-events-none" />
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[150px]" style={{ background: "rgba(123,63,228,0.08)" }} />
        </div>

        <div className="container mx-auto px-6 max-w-4xl relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-black text-white leading-tight mb-4" style={{ letterSpacing: "-0.03em" }}>
            Ready to Outscale<br />
            <span style={{ color: "#7B3FE4" }}>Your Competition?</span>
          </h2>
          
          <p className="text-white/40 text-base max-w-md mx-auto leading-relaxed mb-10">
            Contact our strategic leads to schedule a session, audit marketing friction, and unlock massive ROI loops.
          </p>

          <Link
            href="/contact"
            className="inline-flex items-center gap-3 px-8 py-4 bg-[#7B3FE4] text-white rounded-full font-semibold text-sm hover:bg-[#6030c0] transition-all cursor-pointer"
          >
            Request a Growth Audit
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
