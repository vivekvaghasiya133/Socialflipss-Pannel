"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { 
  FiTrendingUp, 
  FiTarget, 
  FiActivity, 
  FiArrowRight, 
  FiCheckCircle, 
  FiMail, 
  FiMessageSquare,
  FiAward
} from "react-icons/fi";

const stats = [
  { value: "150+", label: "Brands Served", desc: "Digital enterprises scaled across platforms." },
  { value: "3X", label: "Avg. ROI Delivered", desc: "Verified pipeline returns on active spends." },
  { value: "50M+", label: "Impressions Generated", desc: "Organic and paid visual screen attention." },
  { value: "98%", label: "Client Retention", desc: "Continuous strategic scale agreements." },
];

const chartData = {
  follower: {
    title: "Organic Follower Scaling Scale (thousands)",
    unit: "k",
    values: [2, 12, 22, 29, 36, 40],
    color: "#7B3FE4",
    milestones: [
      "Initial hook retention audits and target competitor gap analysis locked in.",
      "First kinetic subtitle video templates deployed. Organic impressions rise 30%.",
      "Dynamic qualifying keyword comments bot launched. Profile conversion rates double.",
      "Organic feed syndication stabilizes, follower count crosses 25,000 threshold.",
      "Algorithm target virality achieved on 3 active reel formats. Impressions cross 5M+.",
      "Target follower profile locked at 40,000 active, highly engaged accounts."
    ]
  },
  roas: {
    title: "Precision Paid Ads ROAS Spike (multipliers)",
    unit: "X",
    values: [1.2, 2.0, 2.8, 3.4, 3.8, 4.5],
    color: "#7B3FE4",
    milestones: [
      "Secured API pixel auditing and tracking parameters to clear funnel leaks.",
      "Initial high-intent lookalike audience ad sets deployed across Meta manager.",
      "CBO testing structures completed and scaled. Return stabilizes at 2.8X ROAS.",
      "Zero-friction qualifying page layouts deployed. Conversion ratios surge.",
      "Scaled budgets aggressively by 45% on top-performing asset bidding sets.",
      "Target high-velocity return stabilized cleanly at 4.5X ROAS metrics."
    ]
  },
  cpl: {
    title: "Strategic Cost-Per-Lead (CPL) Minimization Index (%)",
    unit: "%",
    values: [100, 85, 70, 52, 45, 38],
    color: "#9B6EF3",
    milestones: [
      "Baseline audits completed. Eliminated bid hemorrhaging on broad audiences.",
      "Audience profiling narrowed to high-intent segments. Initial CPL reductions occur.",
      "Conversational qualification DM bots active. Pre-qualifies leads before sales call.",
      "Edge-loading landing webspace speeds optimized under 500ms. CPL drops below 50%.",
      "Lookalike custom bidding parameters fine-tuned. Lead capture stability locked.",
      "Strategic CPL successfully minimized by 62% from initial baseline index."
    ]
  }
};

const testimonials = [
  {
    name: "Riya Mehta",
    company: "FitZone India",
    text: "Social Flipss completely transformed our Instagram footprint. We went from 2k to 40k highly active followers in just 4 months. The cinematic visual quality they deliver is completely unmatched in the industry.",
    avatar: "RM",
  },
  {
    name: "Arjun Shah",
    company: "TechLaunch Startup",
    text: "Their precision paid ads strategy brought our cost-per-lead down by 60% while doubling our qualified conversion volumes. It is the best growth investment our team has ever made.",
    avatar: "AS",
  },
  {
    name: "Priya Desai",
    company: "Bloom Skincare",
    text: "The strategy leads are creative, hyper-responsive, and genuinely passionate about our expansion. Our brand finally has a dominant voice that resonates with our target audience.",
    avatar: "PD",
  },
];

export default function ResultsPage() {
  const [activeMetric, setActiveMetric] = useState("follower");
  const [selectedMonth, setSelectedMonth] = useState(5); // Month 6 default

  const currentChart = chartData[activeMetric];

  return (
    <div className="bg-black text-white min-h-screen relative  overflow-x-hidden pt-24 pb-12">
      
      {/* Background Glows */}
      <div className="absolute inset-0 bg-grid-white opacity-[0.4] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#020202_100%)] pointer-events-none" />

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
              <span className="text-xs font-bold tracking-[0.5em] uppercase text-[#7B3FE4]">Proven Metrics</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className="text-[clamp(2.2rem,6vw,5rem)] font-black text-white tracking-tighter uppercase leading-[0.95] mb-6"
            >
              SECURED METRICS. <br />
              <span className="text-[#7B3FE4]">ABSOLUTE DOMINANCE.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-white/40 font-light text-base md:text-lg max-w-2xl leading-relaxed mt-6"
            >
              We don't deal in hollow promises or standard vanilla checklists. We design conversion architectures that drive massive engagement, high followership, and real bottom-line returns for your enterprise.
            </motion.p>
          </div>
        </div>
      </section>

      {/* ── 2. INTERACTIVE RESULTS CHART SIMULATOR ── */}
      <section className="py-20 relative z-10 border-y border-white/10 bg-black">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-3xl mb-16 text-center md:text-left">
            <span className="text-[10px] font-bold text-[#7B3FE4] tracking-[0.6em] uppercase mb-4 block">Growth Simulator</span>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
              THE BRAND SCALE <span className="text-[#7B3FE4]">SIMULATOR ENGINE.</span>
            </h2>
            <p className="text-white/40 font-light text-sm mt-4">
              Tap the filter keys below to chart real client acquisition parameters over our typical 6-month ascension curve, and select any bar to scrutinize its milestone.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            {/* Left buttons & month details */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-8">
              
              {/* Metric filter buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setActiveMetric("follower"); setSelectedMonth(5); }}
                  className={`w-full text-left p-6 rounded-[24px] border transition-all duration-300 flex items-center gap-4 cursor-pointer ${
                    activeMetric === "follower"
                      ? "bg-[#7B3FE4]/5 border-[#7B3FE4]/40 shadow-[0_0_20px_rgba(123,63,228,0.08)] scale-[1.01]"
                      : "bg-[#0a0a0a] border-white/10 hover:border-white/10"
                  }`}
                >
                  <FiTrendingUp className={activeMetric === "follower" ? "text-[#7B3FE4] text-lg animate-pulse" : "text-white/30 text-lg"} />
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-wider">Organic Feed Scale</h4>
                    <span className="text-[10px] text-white/40 font-light">Projected Follower Spike</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveMetric("roas"); setSelectedMonth(5); }}
                  className={`w-full text-left p-6 rounded-[24px] border transition-all duration-300 flex items-center gap-4 cursor-pointer ${
                    activeMetric === "roas"
                      ? "bg-[#7B3FE4]/5 border-[#7B3FE4]/40 shadow-[0_0_20px_rgba(123,63,228,0.08)] scale-[1.01]"
                      : "bg-[#0a0a0a] border-white/10 hover:border-white/10"
                  }`}
                >
                  <FiTarget className={activeMetric === "roas" ? "text-[#7B3FE4] text-lg animate-pulse" : "text-white/30 text-lg"} />
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-wider">Paid Ads ROAS Spike</h4>
                    <span className="text-[10px] text-white/40 font-light">Guaranteed Spend Spikes</span>
                  </div>
                </button>

                <button
                  onClick={() => { setActiveMetric("cpl"); setSelectedMonth(5); }}
                  className={`w-full text-left p-6 rounded-[24px] border transition-all duration-300 flex items-center gap-4 cursor-pointer ${
                    activeMetric === "cpl"
                      ? "bg-[#7B3FE4]/5 border-[#7B3FE4]/40 shadow-[0_0_20px_rgba(123,63,228,0.08)] scale-[1.01]"
                      : "bg-[#0a0a0a] border-white/10 hover:border-white/10"
                  }`}
                >
                  <FiActivity className={activeMetric === "cpl" ? "text-[#7B3FE4] text-lg animate-pulse" : "text-white/30 text-lg"} />
                  <div>
                    <h4 className="text-xs font-black uppercase text-white tracking-wider">CPL Minimization</h4>
                    <span className="text-[10px] text-white/40 font-light">Qualifying Cost Control</span>
                  </div>
                </button>
              </div>

              {/* Monthly milestone output */}
              <div className="p-6 rounded-[2rem] bg-[#0a0a0a] border border-white/10 backdrop-blur-xl space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-white/20 tracking-[0.2em] uppercase font-mono">Audited Milestone</span>
                  <span className="text-xs font-black text-white px-3 py-1 rounded-full border border-white/10 bg-white/5 font-mono">
                    MONTH_0{selectedMonth + 1}
                  </span>
                </div>
                <h4 className="text-base font-bold uppercase text-white tracking-tight">
                  {activeMetric === "follower" && "Reel Virality Index"}
                  {activeMetric === "roas" && "Acquisition Bid Lock"}
                  {activeMetric === "cpl" && "Qualifying Funnel Secure"}
                </h4>
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  {currentChart.milestones[selectedMonth]}
                </p>
              </div>

            </div>

            {/* Right chart column */}
            <div className="lg:col-span-7">
              <div className="h-full rounded-[28px] bg-[#0a0a0a] border border-white/10 p-8 md:p-10 flex flex-col justify-between shadow-2xl relative min-h-[380px]">
                
                {/* Chart Title HUD */}
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-8">
                  <div className="flex items-center gap-3 ">
                    <FiAward className="w-5 h-5 text-[#7B3FE4] animate-pulse" />
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-white">SYSTEMS VISUAL DATA ENGINE</h4>
                      <span className="text-[7px] font-bold tracking-widest text-[#7B3FE4] uppercase">Active Metric Matrix</span>
                    </div>
                  </div>
                </div>

                {/* Bars Area */}
                <div className="flex-1 flex items-end justify-between gap-3 md:gap-5 px-4 h-[200px]">
                  {currentChart.values.map((val, idx) => {
                    // Calculate height percentage
                    let percentHeight = 0;
                    if (activeMetric === "follower") {
                      percentHeight = (val / 40) * 100;
                    } else if (activeMetric === "roas") {
                      percentHeight = (val / 4.5) * 100;
                    } else { // cpl
                      percentHeight = val; // value is already percentage
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedMonth(idx)}
                        className="flex-1 flex flex-col items-center gap-4 group/bar cursor-pointer"
                      >
                        {/* The animated vertical bar */}
                        <div className="w-full relative h-[180px] flex items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${percentHeight}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={`w-full rounded-2xl relative shadow-2xl flex items-start justify-center pt-2 ${
                              selectedMonth === idx 
                                ? "shadow-[0_0_20px_rgba(123,63,228,0.3)] bg-gradient-to-t from-primary/80 to-accent"
                                : "bg-white/5 group-hover/bar:bg-white/10"
                            }`}
                          >
                            {/* Glowing cap line */}
                            <div className="h-[2px] w-[60%] rounded-full bg-white opacity-40" />
                          </motion.div>
                        </div>
                        {/* Label Month */}
                        <span className={`text-[8px] font-mono font-bold tracking-wider ${
                          selectedMonth === idx ? "text-[#7B3FE4]" : "text-white/20 group-hover/bar:text-white/60"
                        }`}>
                          M_0{idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Chart Y-Axis legend HUD */}
                <div className="border-t border-white/10 pt-6 mt-8 flex justify-between items-center text-[9px] font-bold text-white/25 uppercase tracking-widest font-mono">
                  <span>Start Pipeline</span>
                  <span className="text-[#7B3FE4] font-black">Peak Performance delta: {currentChart.values[5]}{currentChart.unit}</span>
                  <span>Month 6 Stabilized</span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. TESTIMONIAL DIRECTORY ── */}
      <section className="py-24 relative z-10 border-b border-white/10 bg-black">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="max-w-4xl mb-20 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <span className="h-px w-10 bg-primary" />
              <span className="text-xs font-bold tracking-[0.5em] uppercase text-[#7B3FE4] ">Endorsements</span>
            </div>
            <h3 className="text-3xl md:text-5xl font-black tracking-tighter uppercase">
              WHAT OUR ELITE <span className="text-[#7B3FE4]">PARTNERS</span> SAY.
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group p-8 rounded-[24px] bg-[#0a0a0a] border border-white/10 flex flex-col justify-between hover:bg-zinc-900/30 hover:border-[#7B3FE4]/10 transition-all duration-500 shadow-xl"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-sm text-[#7B3FE4] mb-6 group-hover:scale-105 transition-transform duration-500">
                    {t.avatar}
                  </div>
                  
                  <p className="text-white/45 text-base font-light leading-relaxed mb-8 italic group-hover:text-white/60 transition-colors duration-300">
                    "{t.text}"
                  </p>
                </div>

                <div className="border-t border-white/10 pt-6">
                  <h4 className="font-bold text-white uppercase text-sm">{t.name}</h4>
                  <span className="text-xs font-bold text-[#7B3FE4] tracking-[0.1em] mt-1 block">{t.company}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FROSTED GLASS STATS RESULTS ── */}
      <section className="py-24 relative z-10 bg-black">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group relative p-8 rounded-[24px] bg-[#0a0a0a] border border-white/10 flex flex-col items-center justify-center text-center backdrop-blur-md hover:border-[#7B3FE4]/20 transition-all duration-500 shadow-lg"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.02] bg-primary transition-opacity rounded-[24px] pointer-events-none" />
                <h4 className="text-4xl md:text-6xl font-black text-white tracking-tighter group-hover:scale-105 transition-transform duration-500">
                  {stat.value}
                </h4>
                <span className="text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase mt-4 group-hover:text-[#7B3FE4] transition-colors duration-300">
                  {stat.label}
                </span>
                <p className="text-[10px] text-white/40 font-light mt-3 leading-relaxed max-w-[160px]">
                  {stat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
