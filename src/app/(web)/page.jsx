"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useSpring, useTransform, useScroll } from "framer-motion";
import { 
  FiArrowRight, 
  FiPlay, 
  FiTrendingUp, 
  FiTarget, 
  FiZap, 
  FiSearch,
  FiEdit,
  FiGlobe,
  FiBarChart,
  FiChevronDown,
  FiSend,
  FiMail,
  FiMessageSquare,
  FiCheckCircle,
  FiActivity,
  FiDollarSign,
  FiPercent,
  FiHeart,
  FiMessageCircle,
  FiBookmark,
  FiAlertTriangle,
  FiCpu,
  FiRefreshCw
} from "react-icons/fi";
const LOGO_SVG = () => (
  <svg width="40" height="46" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="60,5 110,35 110,70" fill="#B084FF" />
    <polygon points="60,5 10,35 10,70" fill="#7B3FE4" opacity="0.6" />
    <rect x="52" y="30" width="16" height="80" fill="#7B3FE4" />
    <polygon points="60,135 110,105 110,70" fill="#B084FF" opacity="0.8" />
    <polygon points="60,135 10,105 10,70" fill="#7B3FE4" />
  </svg>
);

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

const stats = [
  { value: "150+", label: "Brands Served" },
  { value: "3X", label: "Avg. ROI Delivered" },
  { value: "50M+", label: "Impressions Generated" },
  { value: "98%", label: "Client Retention" },
];

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

const faqs = [
  {
    q: "What makes Social Flipss different from other agencies?",
    a: "We don't just post content — we build strategies. Every piece of content is backed by data, creativity, and a deep understanding of your audience. We're not an agency; we're your growth partner.",
  },
  {
    q: "How soon can I expect results?",
    a: "Most clients see measurable engagement growth within 30 days. Significant follower growth and lead generation typically peak between 60–90 days.",
  },
  {
    q: "Do you work with small businesses?",
    a: "Absolutely. We work with startups, SMEs, and established brands. Our packages are flexible and built around your goals and budget.",
  },
  {
    q: "Which platforms do you manage?",
    a: "Instagram, Facebook, LinkedIn, X (Twitter), YouTube Shorts, and Google. We go where your audience is.",
  },
];

const steps = [
  {
    phase: "PHASE_01",
    title: "Intel Auditing & Gaps Scrutiny",
    desc: "We perform a comprehensive, data-driven analysis of your existing brand footprint, competitor mechanics, and strategic market gaps. This allows us to identify untapped opportunities and engineer a customized positioning blueprint.",
    icon: FiSearch,
    color: "#7B3FE4"
  },
  {
    phase: "PHASE_02",
    title: "Creative Content Forge",
    desc: "Our creative team engineers high-end visual and narrative assets tailored to capture and hold screen attention. From high-retention short-form reels and templates to copy, we forge assets that position your brand as a market leader.",
    icon: FiEdit,
    color: "#9B6EF3"
  },
  {
    phase: "PHASE_03",
    title: "Systematic Distribution Protocol",
    desc: "We launch your campaigns using highly optimized scheduling arrays, algorithm-triggering hashtag indices, and precision-targeted paid advertising. We continuously test visual logic and ad placements to drive high-velocity lead pipelines.",
    icon: FiZap,
    color: "#B084FF"
  },
  {
    phase: "PHASE_04",
    title: "Analytical Scale Engineering",
    desc: "We conduct rigorous weekly and monthly checkpoints to audit your conversion data, organic metrics, and return on ad spend. We refine our visual logic, optimize client retention loops, and scale active channels.",
    icon: FiBarChart,
    color: "#7B3FE4"
  }
];

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [liveFollowers, setLiveFollowers] = useState(24785);

  // ── A. ROI CALCULATOR STATE ──
  const [adSpend, setAdSpend] = useState(100000); // 1 Lakh INR default

  // ── B. REELS SIMULATOR STATE ──
  const [activeReelTab, setActiveReelTab] = useState("hook");
  const [hearts, setHearts] = useState([]);
  const [reelLikes, setReelLikes] = useState(48259);
  const [hasLikedReel, setHasLikedReel] = useState(false);

  const handleReelLike = () => {
    if (!hasLikedReel) {
      setReelLikes(prev => prev + 1);
      setHasLikedReel(true);
    } else {
      setReelLikes(prev => prev - 1);
      setHasLikedReel(false);
    }
    const newHearts = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: (Math.random() - 0.5) * 160,
      y: -50 - Math.random() * 100,
      scale: 0.5 + Math.random() * 0.8,
    }));
    setHearts(prev => [...prev, ...newHearts]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => !newHearts.find(nh => nh.id === h.id)));
    }, 1000);
  };

  // ── C. BOTTLENECK AUDITOR STATE ──
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [highlightMessage, setHighlightMessage] = useState(false);

  const diagnosticChallenges = [
    {
      id: "reach",
      title: "Algorithmic Shadow-lock",
      subtitle: "Low Organic Traffic & Impressions",
      diagnosis: "Algorithm indexing failure due to low initial velocity hooks and generic video SEO architecture.",
      resolution: "Deploy custom SEO-driven video metadata indexes, dynamic hook frameworks, and auto-distribution scheduling arrays.",
      steps: [
        "Audit initial 3-second hook structure using predictive attention modeling.",
        "Implement organic content syndication schedule across Instagram and YouTube.",
        "Set up high-intent engagement loops to trigger feed recommendation algorithm within 15 minutes of posting."
      ],
      color: "#7B3FE4"
    },
    {
      id: "retention",
      title: "Retention Vaporization",
      subtitle: "Low Watch Time & High Drop-offs",
      diagnosis: "Severe attention leakage in mid-video segments caused by static audio/visual pacing.",
      resolution: "Introduce cinematic visual pattern interrupts, pacing speed variation, and localized subtitle kinetics.",
      steps: [
        "Deploy active zoom-ins and frame micro-movements every 2.4 seconds.",
        "Integrate dynamic progress cues to visually signal value retention to viewers.",
        "Re-write script bridges to eliminate logical content gaps that invite users to swipe away."
      ],
      color: "#9B6EF3"
    },
    {
      id: "ads",
      title: "Ad Spend Hemorrhaging",
      subtitle: "Unreasonably High Cost-Per-Lead",
      diagnosis: "Poor ad relevancy scoring and friction-heavy landing page layout targeting low-intent cohorts.",
      resolution: "Launch hyper-targeted custom lookalike audiences and build unified zero-friction conversion pipelines.",
      steps: [
        "Audit and scale high-intent Google Search and Meta lookalike ad sets.",
        "Deploy conversational automated DM response sequences to qualify leads instantly.",
        "Optimize page bundle load time to sub-500ms to eliminate pre-click drop-offs."
      ],
      color: "#B084FF"
    },
    {
      id: "conversion",
      title: "Pipeline Leakage",
      subtitle: "High Impressions, Low Purchases",
      diagnosis: "Mismatch between content hook expectations and landing page conversion calls-to-action.",
      resolution: "Align brand storytelling assets directly to single-point value-proposition landing paths.",
      steps: [
        "Restructure landing page hero assets to exactly replicate the creative hook that drove the click.",
        "Deploy trust badges, immediate testimonials, and responsive live HUD trackers.",
        "Integrate interactive multi-choice qualification wizards to simplify acquisition."
      ],
      color: "#7B3FE4"
    }
  ];

  const runDiagnostic = (challenge) => {
    setSelectedChallenge(challenge);
    setScanning(true);
    setScanProgress(0);
    setShowResult(false);
    setScanLogs([]);

    const logsList = [
      `[SYS_INTEL] Initiating secure audit pipeline for challenge: ${challenge.title.toUpperCase()}`,
      `[ALGO_AUDIT] Scrutinizing metric indices and retention graphs...`,
      `[CONV_LOGIC] Auditing funnel friction and page speed indices...`,
      `[INTELLIGENCE_REPORT] Compiling tailored strategic blueprints...`,
    ];

    let progress = 0;
    const interval = setInterval(() => {
      progress += 25;
      setScanProgress(progress);
      
      const logIndex = Math.floor(progress / 25) - 1;
      if (logsList[logIndex]) {
        setScanLogs(prev => [...prev, logsList[logIndex]]);
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setScanning(false);
          setShowResult(true);
        }, 300);
      }
    }, 450);
  };

  const injectDiagnosticPayload = () => {
    if (!selectedChallenge) return;
    
    setFormData(prev => ({
      ...prev,
      message: `[HUD_DIAGNOSTIC_REPORT_PAYLOAD]\nChallenge Identified: ${selectedChallenge.title}\nPrimary Bottleneck: ${selectedChallenge.subtitle}\nDiagnosis: ${selectedChallenge.diagnosis}\nRecommended Solution: ${selectedChallenge.resolution}\n\nPlease prepare our custom brand dominance blueprint accordingly.`
    }));
    
    scrollToSection("contact");
    setHighlightMessage(true);
    setTimeout(() => setHighlightMessage(false), 2000);
  };

  const heroRef = useRef(null);
  const servicesRef = useRef(null);

  // Mouse tracking for interactive background aura
  const mouseX = useSpring(0, { stiffness: 60, damping: 25 });
  const mouseY = useSpring(0, { stiffness: 60, damping: 25 });

  const tiltX = useTransform(mouseY, [-500, 500], [4, -4]);
  const tiltY = useTransform(mouseX, [-500, 500], [-4, 4]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set(clientX - innerWidth / 2);
      mouseY.set(clientY - innerHeight / 2);
    };

    // Live followers counter simulator
    const interval = setInterval(() => {
      setLiveFollowers(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 2500);

    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      clearInterval(interval);
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, [mouseX, mouseY]);

  // Scroll animations
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });

  const heroOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);
  const heroScale = useTransform(heroScroll, [0, 0.6], [1, 0.95]);
  const heroTextY = useTransform(heroScroll, [0, 1], [0, 150]);

  const { scrollYProgress: servicesScroll } = useScroll({
    target: servicesRef,
    offset: ["start end", "end start"]
  });

  const serviceX1 = useTransform(servicesScroll, [0, 1], [-150, 150]);
  const serviceX2 = useTransform(servicesScroll, [0, 1], [150, -150]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", message: "" });
      setSubmitted(false);
    }, 4000);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bg-[#020202] text-white min-h-screen relative font-sans overflow-x-hidden">
      
      {/* ── 1. HERO SECTION ── */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex flex-col justify-center overflow-hidden perspective-[1000px] pt-24 pb-12 bg-[#020202]"
      >
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0">
          
          {/* Giant Background Outline Text */}
          <motion.div 
            style={{ 
              y: useTransform(heroScroll, [0, 1], [0, 400]),
              opacity: useTransform(heroScroll, [0, 0.5], [0.12, 0])
            }}
            className="absolute inset-0 flex items-center justify-center select-none pointer-events-none hidden md:flex"
          >
            <span className="text-[25vw] font-black text-transparent uppercase tracking-tighter" style={{ WebkitTextStroke: "2px rgba(123, 63, 228, 0.08)" }}>
              FLIPSS
            </span>
          </motion.div>

          {/* Follow-Mouse Glowing Aura (Purple/Indigo) */}
          <motion.div 
            style={{ x: mouseX, y: mouseY }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] bg-primary/20 rounded-full blur-[200px] mix-blend-screen opacity-100 shadow-[0_0_120px_rgba(123,63,228,0.2)]"
          />

          {/* Parallax Cyber Grid */}
          <motion.div 
            style={{ 
              y: useTransform(heroScroll, [0, 1], [0, 300]),
              rotateX: tiltX,
              rotateY: tiltY
            }}
            className="absolute inset-0 bg-[linear-gradient(to_right,#7B3FE415_1px,transparent_1px),linear-gradient(to_bottom,#7B3FE415_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]"
          />

          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,#020202_100%)]" />
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-6 relative z-10 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <motion.div 
              style={{ 
                opacity: heroOpacity, 
                scale: heroScale, 
                y: heroTextY,
                rotateX: tiltX,
                rotateY: tiltY,
                transformStyle: "preserve-3d"
              }}
              className="lg:col-span-7 text-center lg:text-left flex flex-col items-center lg:items-start"
            >
              <span className="inline-block text-[9px] font-black text-primary tracking-[0.8em] uppercase mb-8 shadow-sm">
                🚀 THE DIGITAL INTEL AGENCY • 2026
              </span>
              
              <h1 
                className="text-[clamp(3rem,8vw,7.5rem)] font-black tracking-tighter leading-[0.85] uppercase mb-10 select-none text-huge"
                style={{ transform: "translateZ(80px)" }}
              >
                <span className="block text-white">SocialFlipss</span>
                <span className="block text-gradient-primary">Growth Forge.</span>
              </h1>

              <p className="text-white/30 text-lg md:text-xl max-w-lg font-light leading-snug mb-12" style={{ transform: "translateZ(30px)" }}>
                WE ENGINEER THE <span className="text-white font-medium">INFRASTRUCTURE</span> OF <span className="text-primary font-medium">DIGITAL DOMINANCE</span>. NO RETAINER BLOAT. JUST HIGH-VELOCITY ROI.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6" style={{ transform: "translateZ(40px)" }}>
                <button 
                  onClick={() => scrollToSection("services")}
                  className="group relative inline-flex items-center justify-center h-16 px-10 text-xs font-black bg-white text-black hover:bg-primary hover:text-white transition-all duration-500 rounded-full uppercase tracking-widest shadow-2xl cursor-pointer"
                >
                  Explore Capabilities
                  <FiArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform" />
                </button>

                <button 
                  onClick={() => scrollToSection("contact")}
                  className="group relative flex items-center justify-center px-8 h-16 rounded-full border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-500 text-xs uppercase tracking-widest font-black cursor-pointer"
                >
                  Initiate Audit
                </button>
              </div>
            </motion.div>

            {/* Right Creative Column: Live Brand HUD Widget! */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative"
            >
              {/* Frosted Glass Widget Container */}
              <div className="glass-card p-6 md:p-8 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-black/80 max-w-md mx-auto">
                <div className="absolute inset-0 opacity-[0.03] bg-primary pointer-events-none" />
                
                {/* Header Widget */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <LOGO_SVG />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-white">HUD Growth Monitor</h4>
                      <span className="text-[7px] font-bold tracking-widest text-primary uppercase animate-pulse">Live Feed Protocol</span>
                    </div>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </div>

                {/* Main live metric showcase */}
                <div className="space-y-6">
                  
                  {/* Followers tracker box */}
                  <div className="p-5 rounded-2xl bg-zinc-950/60 border border-white/5 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] font-bold text-white/30 tracking-[0.15em] uppercase">Simulated Followers</span>
                      <h5 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
                        {liveFollowers.toLocaleString()}
                      </h5>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400 leading-none block">+1,240%</span>
                      <span className="text-[7px] font-bold text-white/20 tracking-[0.1em] uppercase">This Month</span>
                    </div>
                  </div>

                  {/* ROI metric box */}
                  <div className="p-5 rounded-2xl bg-zinc-950/60 border border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-bold text-white/30 tracking-[0.15em] uppercase">Target Ad ROAS Spike</span>
                      <span className="text-xs font-black text-primary uppercase">3.8X ROI</span>
                    </div>
                    {/* Glowing progress line */}
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "76%" }}
                        transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_10px_rgba(123,63,228,0.5)]"
                      />
                    </div>
                  </div>

                  {/* Active Campaigns HUD logs */}
                  <div className="space-y-2 border-t border-white/5 pt-4">
                    <span className="text-[7px] font-bold text-white/20 tracking-[0.2em] uppercase block mb-2">Protocol Console Logs</span>
                    <div className="flex items-center justify-between text-[9px] font-bold text-white/40 font-mono">
                      <span>SECURE_JWT_TOKEN</span>
                      <span className="text-emerald-400">ACTIVE</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-bold text-white/40 font-mono">
                      <span>PRECISION_META_ADS</span>
                      <span className="text-primary animate-pulse">SCALING</span>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>

          </div>
        </div>

        {/* Scroll Indicator */}
        <div 
          onClick={() => scrollToSection("results-preview")}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 cursor-pointer select-none opacity-60 hover:opacity-100 transition-opacity"
        >
          <span className="text-[7px] font-bold text-white/20 tracking-[0.6em] uppercase">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ── 2. STATS RESULTS SECTION ── */}
      <section id="results-preview" className="py-24 relative bg-[#020202] border-y border-white/5">
        <div className="absolute inset-0 bg-grid-white opacity-[0.4] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#020202_100%)] pointer-events-none" />

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group relative p-8 rounded-3xl bg-zinc-950/40 border border-white/5 flex flex-col items-center justify-center text-center backdrop-blur-md hover:border-primary/20 transition-all duration-500 shadow-lg"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.02] bg-primary transition-opacity rounded-3xl pointer-events-none" />
                <h4 className="text-4xl md:text-6xl font-black text-white tracking-tighter group-hover:scale-105 transition-transform duration-500">
                  {stat.value}
                </h4>
                <span className="text-[10px] font-bold text-white/30 tracking-[0.2em] uppercase mt-4 group-hover:text-primary transition-colors">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 2A. INTERACTIVE ROI PROJECTION ENGINE ── */}
      <section className="py-32 relative overflow-hidden bg-[#020202] border-b border-white/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="max-w-4xl mb-20 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <span className="h-px w-10 bg-primary" />
              <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-primary">ROI Projection</h2>
            </div>
            
            <h3 className="text-[clamp(2rem,5vw,4rem)] font-black text-white tracking-tighter uppercase leading-[0.95]">
              CALCULATE YOUR <br />
              <span className="text-gradient-primary">BRAND DOMINANCE MULTIPLIER.</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Slider Control */}
            <div className="lg:col-span-5 p-8 md:p-10 rounded-[2.5rem] bg-zinc-950/40 border border-white/5 backdrop-blur-xl shadow-2xl space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white/30 tracking-[0.15em] uppercase">Target Monthly Ad Spend</span>
                  <span className="text-xl font-black text-white">₹{adSpend.toLocaleString()}</span>
                </div>
                <p className="text-xs text-white/40 font-light leading-normal">
                  Adjust the slider to match your direct marketing pipeline acquisition goals.
                </p>
              </div>

              {/* Slider Input with Purple/Indigo track */}
              <div className="relative pt-4 pb-2">
                <input 
                  type="range" 
                  min="20000" 
                  max="500000" 
                  step="10000"
                  value={adSpend}
                  onChange={(e) => setAdSpend(Number(e.target.value))}
                  className="w-full h-2 bg-white/5 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
                  style={{
                    background: `linear-gradient(to right, #7B3FE4 0%, #7B3FE4 ${((adSpend - 20000) / 480000) * 100}%, rgba(255,255,255,0.05) ${((adSpend - 20000) / 480000) * 100}%, rgba(255,255,255,0.05) 100%)`
                  }}
                />
                
                {/* Min / Max Labels */}
                <div className="flex justify-between text-[9px] font-bold text-white/20 uppercase tracking-[0.1em] mt-3">
                  <span>₹20k</span>
                  <span>₹2.5L</span>
                  <span>₹5L+</span>
                </div>
              </div>

              {/* Core Contrast Comparison Cards */}
              <div className="border-t border-white/5 pt-6 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase text-white/30 tracking-[0.2em]">
                  <span>Model Comparison</span>
                  <span className="text-emerald-400">SocialFlipss Advantage</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-950/20 border border-white/5">
                    <span className="text-[8px] font-bold text-white/20 tracking-[0.1em] uppercase block">Typical Agency</span>
                    <span className="text-xs font-black text-rose-400 block mt-1">₹40k Retainer</span>
                    <span className="text-[8px] font-bold text-white/20 tracking-[0.05em] block mt-1 leading-tight">No guaranteed metrics scale.</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 shadow-[0_0_15px_rgba(123,63,228,0.1)]">
                    <span className="text-[8px] font-bold text-primary tracking-[0.1em] uppercase block">High-Velocity Protocol</span>
                    <span className="text-xs font-black text-emerald-400 block mt-1">4.2X Avg ROAS</span>
                    <span className="text-[8px] font-bold text-white/40 tracking-[0.05em] block mt-1 leading-tight">Hyper-targeted conversion loop.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Projected Output Metrics */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Metric Card 1: Impressions */}
              <motion.div 
                layout
                className="p-6 rounded-3xl bg-zinc-950/40 border border-white/5 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-primary/20 transition-all duration-300"
              >
                <div>
                  <div className="mb-4 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary text-sm">
                    <FiGlobe />
                  </div>
                  <span className="text-[9px] font-bold text-white/30 tracking-[0.2em] uppercase">Projected Impressions</span>
                  <h4 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-2">
                    {Math.floor(adSpend * 12).toLocaleString()}+
                  </h4>
                </div>
                <p className="text-[10px] text-white/40 font-light mt-4 leading-relaxed">
                  High-velocity targeting parameters deploying custom algorithm bypass indices.
                </p>
              </motion.div>

              {/* Metric Card 2: Clicks */}
              <motion.div 
                layout
                className="p-6 rounded-3xl bg-zinc-950/40 border border-white/5 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-primary/20 transition-all duration-300"
              >
                <div>
                  <div className="mb-4 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary text-sm">
                    <FiActivity />
                  </div>
                  <span className="text-[9px] font-bold text-white/30 tracking-[0.2em] uppercase">Qualified Clicks</span>
                  <h4 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-2">
                    {Math.floor(adSpend * 0.45).toLocaleString()}+
                  </h4>
                </div>
                <p className="text-[10px] text-white/40 font-light mt-4 leading-relaxed">
                  Clean click triggers directing warm traffic straight onto conversion logic pages.
                </p>
              </motion.div>

              {/* Metric Card 3: Leads */}
              <motion.div 
                layout
                className="p-6 rounded-3xl bg-zinc-950/40 border border-white/5 backdrop-blur-md shadow-xl flex flex-col justify-between hover:border-primary/20 transition-all duration-300"
              >
                <div>
                  <div className="mb-4 w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 text-sm">
                    <FiTarget />
                  </div>
                  <span className="text-[9px] font-bold text-white/30 tracking-[0.2em] uppercase">Monthly Strategy Leads</span>
                  <h4 className="text-3xl md:text-4xl font-black text-emerald-400 tracking-tight mt-2">
                    {Math.floor(adSpend * 0.0075).toLocaleString()}
                  </h4>
                </div>
                <p className="text-[10px] text-white/40 font-light mt-4 leading-relaxed">
                  Verified leads fully filtered through automated qualifying diagnostic pipelines.
                </p>
              </motion.div>

              {/* Metric Card 4: Revenue Scale */}
              <motion.div 
                layout
                className="p-6 rounded-3xl bg-primary/5 border border-primary/20 backdrop-blur-md shadow-2xl shadow-primary/5 flex flex-col justify-between"
              >
                <div>
                  <div className="mb-4 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary text-sm shadow-[0_0_15px_rgba(123,63,228,0.3)]">
                    <FiTrendingUp />
                  </div>
                  <span className="text-[9px] font-bold text-primary tracking-[0.2em] uppercase">Est. Revenue Spike</span>
                  <h4 className="text-3xl md:text-4xl font-black text-white tracking-tight mt-2">
                    ₹{Math.floor(adSpend * 4.2).toLocaleString()}
                  </h4>
                </div>
                <p className="text-[10px] text-white/50 font-light mt-4 leading-relaxed">
                  Engineered using a targeted 4.2x ROI acquisition blueprint.
                </p>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* ── 3. SERVICES SECTION ── */}
      <section 
        id="services" 
        ref={servicesRef}
        className="min-h-screen py-32 relative overflow-hidden bg-[#020202] flex flex-col justify-center border-b border-white/5"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[-15%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-[20%] right-[-15%] w-[700px] h-[700px] bg-accent/5 rounded-full blur-[150px]" />
        </div>

        {/* Floating Outline watermark text */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
          <motion.div style={{ x: serviceX1 }} className="text-[18vw] font-black leading-none uppercase whitespace-nowrap mb-6 text-white">
            STRATEGY • CREATIVE • ENGAGEMENT •
          </motion.div>
          <motion.div style={{ x: serviceX2 }} className="text-[18vw] font-black leading-none uppercase whitespace-nowrap text-primary">
            ADVERTISING • REELS • DOMINANCE •
          </motion.div>
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="max-w-4xl mb-24">
            <div className="flex items-center gap-4 mb-4">
              <span className="h-px w-10 bg-primary" />
              <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-primary">Capabilities</h2>
            </div>
            
            <h3 className="text-[clamp(2rem,6vw,4.5rem)] font-black text-white tracking-tighter uppercase leading-[0.95]">
              WE ENGINEER THE <br />
              <span className="text-gradient-primary">GROWTH PROTOCOLS</span> <br />
              OF MODERN BRANDS.
            </h3>
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
                  transition={{ delay: index * 0.08 }}
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
                    
                    <Link href="/services" className="mt-8 flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-all group-hover:translate-x-1.5">
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

      {/* ── 3A. INTERACTIVE CREATIVE SHOWCASE (REELS SIMULATOR) ── */}
      <section className="py-32 relative overflow-hidden bg-[#020202] border-b border-white/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[30%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-[10%] right-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Column: Interactive Copywriting & Selector Tabs */}
            <div className="lg:col-span-7 space-y-10">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="h-px w-10 bg-primary" />
                  <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-primary">Creative Showcase</h2>
                </div>
                
                <h3 className="text-[clamp(2rem,5vw,4.2rem)] font-black text-white tracking-tighter uppercase leading-[0.95]">
                  HIGH-VELOCITY <br />
                  <span className="text-gradient-primary">ATTENTION ARCHITECTURES.</span>
                </h3>
                
                <p className="text-white/40 text-base md:text-lg font-light leading-relaxed max-w-xl">
                  We don't buy attention; we forge it. Tap the options below to see how our content asset forge maps different stages of algorithmic conversion.
                </p>
              </div>

              {/* Selector Tabs */}
              <div className="space-y-4">
                {/* Tab 1: Scroll-Stopping Hook */}
                <button 
                  onClick={() => setActiveReelTab("hook")}
                  className={`w-full text-left p-6 rounded-3xl border transition-all duration-500 flex items-start gap-5 group cursor-pointer ${
                    activeReelTab === "hook" 
                      ? "bg-primary/5 border-primary/30 shadow-[0_0_20px_rgba(123,63,228,0.08)]" 
                      : "bg-zinc-950/20 border-white/5 hover:border-white/10 hover:bg-zinc-950/40"
                  }`}
                >
                  <div className={`p-3 rounded-xl border transition-colors shrink-0 ${
                    activeReelTab === "hook" ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/10 text-white/40 group-hover:text-white"
                  }`}>
                    <FiPlay className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">01_THE SCROLL-STOPPING HOOK</h4>
                    <p className="text-xs text-white/40 font-light leading-normal group-hover:text-white/60 transition-colors">
                      High-contrast visual patterns paired with dynamic kinetic subtitles. Engineered to seize screen time within the first 1.8 seconds.
                    </p>
                  </div>
                </button>

                {/* Tab 2: High-Value Script */}
                <button 
                  onClick={() => setActiveReelTab("value")}
                  className={`w-full text-left p-6 rounded-3xl border transition-all duration-500 flex items-start gap-5 group cursor-pointer ${
                    activeReelTab === "value" 
                      ? "bg-primary/5 border-primary/30 shadow-[0_0_20px_rgba(123,63,228,0.08)]" 
                      : "bg-zinc-950/20 border-white/5 hover:border-white/10 hover:bg-zinc-950/40"
                  }`}
                >
                  <div className={`p-3 rounded-xl border transition-colors shrink-0 ${
                    activeReelTab === "value" ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/10 text-white/40 group-hover:text-white"
                  }`}>
                    <FiZap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">02_ALGORITHMIC VALUE BAIT</h4>
                    <p className="text-xs text-white/40 font-light leading-normal group-hover:text-white/60 transition-colors">
                      Actionable industry benchmarks backed by high-fidelity motion graphics. Keeps audience watch time locked past the crucial 15-second benchmark.
                    </p>
                  </div>
                </button>

                {/* Tab 3: Offer Conversion */}
                <button 
                  onClick={() => setActiveReelTab("offer")}
                  className={`w-full text-left p-6 rounded-3xl border transition-all duration-500 flex items-start gap-5 group cursor-pointer ${
                    activeReelTab === "offer" 
                      ? "bg-primary/5 border-primary/30 shadow-[0_0_20px_rgba(123,63,228,0.08)]" 
                      : "bg-zinc-950/20 border-white/5 hover:border-white/10 hover:bg-zinc-950/40"
                  }`}
                >
                  <div className={`p-3 rounded-xl border transition-colors shrink-0 ${
                    activeReelTab === "offer" ? "bg-primary/10 border-primary/20 text-primary" : "bg-white/5 border-white/10 text-white/40 group-hover:text-white"
                  }`}>
                    <FiTarget className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-1">03_HIGH-VELOCITY CONVERSION CTA</h4>
                    <p className="text-xs text-white/40 font-light leading-normal group-hover:text-white/60 transition-colors">
                      Proprietary keyword response sequences. Prompts direct keyword comments inside the comments box, deploying our qualifying bots instantly into DMs.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Right Column: High-Fidelity Reel Phone Simulator */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-[320px] h-[600px] rounded-[3.2rem] border-4 border-zinc-800 bg-black shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-between p-4 group/simulator">
                
                {/* Glowing phone aura */}
                <div className="absolute inset-0 opacity-[0.08] group-hover/simulator:opacity-[0.15] bg-gradient-to-t from-primary to-accent transition-opacity pointer-events-none" />

                {/* Phone Speaker Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 rounded-full bg-zinc-900 z-30" />

                {/* Reels Header */}
                <div className="relative z-20 flex justify-between items-center text-xs font-bold uppercase tracking-widest text-white/80 px-2 mt-4 select-none">
                  <span>Reels</span>
                  <div className="flex gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  </div>
                </div>

                {/* Active Video Screen Content */}
                <div className="absolute inset-0 z-10 overflow-hidden flex flex-col justify-end p-4">
                  {/* Dynamic background visualization depending on the selected tab */}
                  {activeReelTab === "hook" && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-950 via-zinc-950 to-indigo-950 flex flex-col items-center justify-center p-6 text-center select-none animate-[pulse_3s_infinite]">
                      <span className="text-[9px] font-black text-primary tracking-[0.4em] uppercase mb-4 animate-bounce">01 / HOOK PROTOCOL</span>
                      <h4 className="text-xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                        “3 SIMPLE HACKS <br />
                        <span className="text-primary font-black">TO TRIPLE YOUR</span> <br />
                        META ROAS”
                      </h4>
                      <div className="mt-4 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[9px] font-mono text-white/60">
                        [Kinetic Subtitles Running]
                      </div>
                    </div>
                  )}

                  {activeReelTab === "value" && (
                    <div className="absolute inset-0 bg-gradient-to-bl from-zinc-950 via-purple-950 to-zinc-950 flex flex-col items-center justify-center p-6 text-center select-none">
                      <span className="text-[9px] font-black text-primary tracking-[0.4em] uppercase mb-4">02 / VALUE BAIT</span>
                      <div className="w-full space-y-2 max-w-[200px]">
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary w-[88%] animate-[pulse_1.5s_infinite]" />
                        </div>
                        <div className="flex justify-between text-[8px] font-mono text-white/40">
                          <span>ROAS Index</span>
                          <span>88% Efficiency</span>
                        </div>
                      </div>
                      <p className="text-xs text-white/60 font-light mt-4 max-w-[180px] leading-relaxed">
                        Data audited live using dynamic customer conversion APIs.
                      </p>
                    </div>
                  )}

                  {activeReelTab === "offer" && (
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-zinc-950 to-purple-950 flex flex-col items-center justify-center p-6 text-center select-none">
                      <span className="text-[9px] font-black text-primary tracking-[0.4em] uppercase mb-4">03 / CONVERSION CTA</span>
                      <h4 className="text-lg font-black text-white uppercase tracking-tighter leading-none mb-3">
                        COMMENT <span className="text-emerald-400 font-black">“DOMINANCE”</span> <br />
                        FOR OUR SECRET <br />
                        GROWTH DECK.
                      </h4>
                      <div className="p-3 bg-zinc-950/80 border border-white/5 rounded-2xl flex items-center gap-2 text-[9px] font-bold text-white/60">
                        <FiMessageSquare className="text-emerald-400 animate-pulse" />
                        DM Qualified Auto-Trigger
                      </div>
                    </div>
                  )}

                  {/* Gradient Overlay for subtitle readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none z-10" />

                  {/* Simulated Floating Particle Hearts */}
                  {hearts.map(heart => (
                    <motion.div
                      key={heart.id}
                      initial={{ opacity: 1, scale: 0.2, x: 180, y: 150 }}
                      animate={{ 
                        opacity: 0, 
                        scale: heart.scale,
                        x: 180 + heart.x,
                        y: 150 + heart.y 
                      }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="absolute z-40 text-primary text-xl pointer-events-none select-none"
                    >
                      ❤️
                    </motion.div>
                  ))}

                  {/* Interactive HUD Overlay Overlay inside phone */}
                  <div className="relative z-20 flex justify-between items-end w-full select-none">
                    
                    {/* Left Meta text */}
                    <div className="space-y-3 max-w-[180px]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-[7px] font-black">SF</div>
                        <div>
                          <span className="text-[9px] font-bold block text-white">@socialflipss</span>
                          <span className="text-[6px] font-bold text-white/40 tracking-wider">Growth Architect</span>
                        </div>
                      </div>
                      <p className="text-[8px] text-white/60 leading-relaxed font-light">
                        {activeReelTab === "hook" && "Seize attention first. Swipe proof system details inside."}
                        {activeReelTab === "value" && "Data structures representing absolute market control."}
                        {activeReelTab === "offer" && "Comment below to inject strategy payload into your feed."}
                      </p>
                    </div>

                    {/* Right side interaction buttons */}
                    <div className="flex flex-col items-center gap-4 text-white">
                      
                      {/* Heart Button */}
                      <button 
                        onClick={handleReelLike}
                        className="flex flex-col items-center gap-1 group/btn cursor-pointer"
                      >
                        <div className={`p-2.5 rounded-full border transition-all duration-300 ${
                          hasLikedReel 
                            ? "bg-rose-500/20 border-rose-500 text-rose-500 scale-110" 
                            : "bg-black/60 border-white/10 text-white hover:bg-white/5 hover:border-white/20"
                        }`}>
                          <FiHeart className={`w-4 h-4 ${hasLikedReel ? "fill-rose-500" : ""}`} />
                        </div>
                        <span className="text-[7px] font-bold tracking-wider">{reelLikes.toLocaleString()}</span>
                      </button>

                      {/* Comment mock */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="p-2.5 rounded-full border bg-black/60 border-white/10 text-white select-none">
                          <FiMessageCircle className="w-4 h-4" />
                        </div>
                        <span className="text-[7px] font-bold tracking-wider">1,482</span>
                      </div>

                      {/* Save mock */}
                      <div className="flex flex-col items-center gap-1">
                        <div className="p-2.5 rounded-full border bg-black/60 border-white/10 text-white select-none">
                          <FiBookmark className="w-4 h-4" />
                        </div>
                        <span className="text-[7px] font-bold tracking-wider">3,924</span>
                      </div>

                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. PROCESS SECTION (ASCENSION PROTOCOL) ── */}
      <section 
        id="process" 
        className="min-h-screen py-32 relative bg-[#020202] overflow-hidden border-b border-white/5"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] right-[-15%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[180px]" />
          <div className="absolute bottom-[20%] left-[-15%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="max-w-4xl mb-32">
            <div className="flex items-center gap-4 mb-4">
              <span className="h-px w-10 bg-primary" />
              <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-primary">The Process</h2>
            </div>
            <h3 className="text-[clamp(2rem,6vw,4.5rem)] font-black text-white tracking-tighter uppercase leading-[0.95]">
              SYSTEMATIC <br />
              <span className="text-gradient-primary">ASCENSION PROTOCOL.</span>
            </h3>
          </div>

          <div className="relative">
            {/* Timeline thread */}
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
                    
                    {/* Ring Marker */}
                    <div 
                      className="relative z-10 w-16 h-16 shrink-0 rounded-full bg-zinc-950 border border-white/10 flex items-center justify-center transition-all duration-700 shadow-2xl"
                      style={{ boxShadow: `0 0 30px ${step.color}10` }}
                    >
                      <StepIcon className="w-5 h-5 text-white/50 group-hover:scale-105 transition-transform" style={{ color: step.color }} />
                      <div className="absolute inset-0 blur-xl opacity-0 group-hover:opacity-40 transition-opacity rounded-full" style={{ backgroundColor: step.color }} />
                      <div className="absolute inset-0 border border-white/20 rounded-full group-hover:scale-115 transition-transform duration-500" style={{ borderColor: step.color }} />
                    </div>

                    <div className="flex-1 mt-2">
                      <span className="font-bold text-[8px] tracking-[0.4em] uppercase mb-2 block" style={{ color: step.color }}>
                        {step.phase}
                      </span>
                      <h4 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase mb-4 transition-colors duration-300 group-hover:text-primary">
                        {step.title}
                      </h4>
                      <p className="text-white/40 text-base md:text-lg font-light max-w-2xl leading-relaxed group-hover:text-white/60 transition-colors">
                        {step.desc}
                      </p>
                    </div>

                    {/* Numeric watermark watermark */}
                    <div 
                      className="absolute right-0 top-1/2 -translate-y-1/2 text-[10vw] font-black opacity-[0.05] group-hover:opacity-[0.12] select-none pointer-events-none uppercase transition-all duration-700 group-hover:translate-x-6 hidden lg:block"
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

      {/* ── 5. TESTIMONIALS SECTION ── */}
      <section id="testimonials" className="py-32 relative overflow-hidden bg-[#020202] border-b border-white/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[-15%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-[20%] right-[-15%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="max-w-4xl mb-20">
            <div className="flex items-center gap-4 mb-4">
              <span className="h-px w-10 bg-primary" />
              <span className="text-xs font-bold tracking-[0.5em] uppercase text-primary font-sans">Endorsements</span>
            </div>
            <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
              SECURED BY <span className="text-gradient-primary">PARTNERS.</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-8 rounded-3xl bg-zinc-950/40 border border-white/5 flex flex-col justify-between hover:bg-zinc-900/30 hover:border-primary/10 transition-all duration-500 shadow-xl"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-sm text-primary mb-6 group-hover:scale-105 transition-transform duration-500">
                    {t.avatar}
                  </div>
                  <p className="text-white/40 text-base font-light leading-relaxed mb-8 italic group-hover:text-white/60 transition-colors">
                    "{t.text}"
                  </p>
                </div>

                <div className="border-t border-white/5 pt-6">
                  <h4 className="font-bold text-white uppercase text-sm">{t.name}</h4>
                  <span className="text-xs font-bold text-primary tracking-[0.1em] mt-1 block">{t.company}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5A. DIGITAL DOMINANCE BOTTLENECK AUDITOR ── */}
      <section className="py-32 relative overflow-hidden bg-[#020202] border-b border-white/5">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <div className="max-w-4xl mb-20 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <span className="h-px w-10 bg-primary" />
              <h2 className="text-xs font-bold tracking-[0.5em] uppercase text-primary">Diagnostic HUD</h2>
            </div>
            
            <h3 className="text-[clamp(2rem,5vw,4.2rem)] font-black text-white tracking-tighter uppercase leading-[0.95]">
              DIAGNOSE YOUR <br />
              <span className="text-gradient-primary">GROWTH BOTTLENECK.</span>
            </h3>
            
            <p className="text-white/40 text-base md:text-lg font-light mt-6 max-w-xl leading-relaxed">
              Identify the exact mechanical friction locking your account's distribution algorithms. Choose a symptom below to deploy our diagnostic auditor.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            {/* Left Column: Challenge Selectors */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {diagnosticChallenges.map((challenge) => (
                <button
                  key={challenge.id}
                  onClick={() => runDiagnostic(challenge)}
                  disabled={scanning}
                  className={`w-full text-left p-6 rounded-3xl border transition-all duration-500 flex flex-col gap-2 group cursor-pointer disabled:opacity-55 ${
                    selectedChallenge?.id === challenge.id
                      ? "bg-primary/5 border-primary/40 shadow-[0_0_20px_rgba(123,63,228,0.08)]"
                      : "bg-zinc-950/20 border-white/5 hover:border-white/10 hover:bg-zinc-950/40"
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-xs font-black uppercase tracking-wider" style={{ color: challenge.color }}>
                      {challenge.title}
                    </span>
                    {selectedChallenge?.id === challenge.id && (
                      <span className="h-1.5 w-1.5 rounded-full animate-ping" style={{ backgroundColor: challenge.color }} />
                    )}
                  </div>
                  <span className="text-sm font-bold text-white uppercase tracking-tight">
                    {challenge.subtitle}
                  </span>
                </button>
              ))}
            </div>

            {/* Right Column: Console Auditor HUD */}
            <div className="lg:col-span-7">
              <div className="h-full rounded-[2.5rem] bg-zinc-950/60 border border-white/5 p-8 md:p-10 flex flex-col justify-between font-mono shadow-2xl relative overflow-hidden min-h-[380px]">
                
                {/* Background scanning wave effect */}
                {scanning && (
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(123,63,228,0.06)_50%,transparent_100%)] w-full h-[20%] animate-[shimmer_1.5s_linear_infinite] pointer-events-none" />
                )}

                {/* HUD Header */}
                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6 select-none font-sans">
                  <div className="flex items-center gap-3">
                    <FiCpu className="w-5 h-5 text-primary animate-pulse" />
                    <div>
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-white">SYSTEMS DIAGNOSTIC AUDITOR</h4>
                      <span className="text-[7px] font-bold tracking-widest text-primary uppercase">Security Session Layer</span>
                    </div>
                  </div>
                  
                  {scanning ? (
                    <div className="flex items-center gap-2 text-[10px] font-black text-primary animate-pulse font-sans">
                      <FiRefreshCw className="animate-spin text-sm" />
                      <span>{scanProgress}% SCANNING</span>
                    </div>
                  ) : selectedChallenge ? (
                    <span className="text-[9px] font-bold text-emerald-400 border border-emerald-400/20 bg-emerald-500/5 px-3 py-1 rounded-full font-sans">DIAGNOSIS_COMPILED</span>
                  ) : (
                    <span className="text-[9px] font-bold text-white/30 tracking-wider">AWAITING_INPUT</span>
                  )}
                </div>

                {/* HUD Console Terminal Content */}
                <div className="flex-1 space-y-4 font-mono">
                  {scanning ? (
                    <div className="space-y-2 text-[11px] text-white/60 leading-relaxed">
                      {scanLogs.map((log, idx) => (
                        <div key={idx} className="flex gap-2">
                          <span className="text-primary font-bold">▶</span>
                          <span>{log}</span>
                        </div>
                      ))}
                    </div>
                  ) : showResult && selectedChallenge ? (
                    <div className="space-y-6 font-sans">
                      {/* Analysis Block */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-white/20 tracking-[0.2em] uppercase font-mono block">Core Bottleneck Analysis</span>
                        <h4 className="text-lg md:text-xl font-bold uppercase text-white tracking-tight">{selectedChallenge.title}</h4>
                        <p className="text-white/40 text-sm font-light leading-relaxed">{selectedChallenge.diagnosis}</p>
                      </div>

                      {/* Action Steps */}
                      <div className="space-y-3 border-t border-white/5 pt-5">
                        <span className="text-[9px] font-bold text-white/20 tracking-[0.2em] uppercase font-mono block">Recommended Ascension Steps</span>
                        <ul className="space-y-2.5">
                          {selectedChallenge.steps.map((step, idx) => (
                            <li key={idx} className="flex gap-3 text-xs text-white/60 leading-normal">
                              <span className="text-primary font-bold">0{idx + 1}.</span>
                              <span className="font-light">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Diagnostic Action CTA Button */}
                      <div className="border-t border-white/5 pt-6 flex justify-end font-sans">
                        <button
                          onClick={injectDiagnosticPayload}
                          className="px-8 h-14 rounded-full bg-white hover:bg-primary text-black hover:text-white text-xs font-black uppercase tracking-widest flex items-center gap-2.5 cursor-pointer transition-all duration-500 shadow-xl"
                        >
                          Inject Strategy Payload
                          <FiSend className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col justify-center items-center text-center p-8 select-none font-sans">
                      <FiAlertTriangle className="w-10 h-10 text-white/10 mb-4 animate-bounce" />
                      <h5 className="text-xs font-black uppercase tracking-wider text-white/40 mb-1">Audit Protocol Suspended</h5>
                      <p className="text-[10px] text-white/20 font-light max-w-[240px] leading-relaxed">
                        Please select one of the marketing bottlenecks on the left to deploy the scanning array.
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 6. FAQ SECTION ── */}
      <section id="faq" className="py-32 relative bg-[#020202] border-b border-white/5">
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          
          <div className="text-center mb-20">
            <span className="text-[10px] font-bold text-primary tracking-[0.6em] uppercase mb-4 block">Faq</span>
            <h3 className="text-4xl md:text-6xl font-black tracking-tight uppercase">
              GENERAL <span className="text-gradient-primary">INTEL.</span>
            </h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="border border-white/5 rounded-3xl overflow-hidden bg-zinc-950/20 backdrop-blur-md"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-6 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <h4 className="font-bold text-white uppercase tracking-tight text-sm md:text-base">{faq.q}</h4>
                  <FiChevronDown className={`w-5 h-5 text-white/40 shrink-0 transition-transform duration-500 ${openFaq === index ? "rotate-180 text-primary" : ""}`} />
                </button>
                
                <div 
                  className={`transition-all duration-500 overflow-hidden ${openFaq === index ? "max-h-[300px] border-t border-white/5" : "max-h-0"}`}
                >
                  <p className="p-6 text-white/40 font-light text-sm md:text-base leading-relaxed bg-black/20">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CONTACT FORGE FORM ── */}
      <section id="contact" className="py-32 relative bg-[#020202] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-[10%] right-[-15%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
        </div>

        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4">
                <span className="h-px w-10 bg-primary" />
                <span className="text-xs font-bold tracking-[0.5em] uppercase text-primary">Initiate Protocol</span>
              </div>
              <h3 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.95] mb-8">
                LAUNCH YOUR <br />
                <span className="text-gradient-primary">DOMINANCE.</span>
              </h3>
              <p className="text-white/40 font-light text-base md:text-lg leading-relaxed mb-12 max-w-md">
                Contact our agency protocol team to lock in your brand authority audit and schedule a session.
              </p>

              <div className="space-y-6">
                <div className="flex items-center gap-6 p-5 rounded-2xl bg-zinc-950/40 border border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary text-lg">
                    <FiMail />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-white/30 tracking-[0.2em] uppercase">Email Intel</span>
                    <a href="mailto:hello@socialflipss.com" className="block text-white font-bold text-sm hover:text-primary transition-colors">hello@socialflipss.com</a>
                  </div>
                </div>

                <div className="flex items-center gap-6 p-5 rounded-2xl bg-zinc-950/40 border border-white/5">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary text-lg">
                    <FiMessageSquare />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-white/30 tracking-[0.2em] uppercase">Instagram DM</span>
                    <a href="#" className="block text-white font-bold text-sm hover:text-primary transition-colors">@socialflipss</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-12 rounded-3xl bg-zinc-950/20 border border-white/5 backdrop-blur-md shadow-2xl relative">
              <div className="absolute inset-0 opacity-[0.02] bg-primary rounded-3xl pointer-events-none" />
              
              <h4 className="text-2xl font-black uppercase tracking-tight mb-8">Secure Audit Protocol</h4>

              {submitted ? (
                <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary text-xl mb-6 animate-pulse">
                    ✓
                  </div>
                  <h5 className="text-xl font-bold uppercase mb-2">Protocol Deployed!</h5>
                  <p className="text-white/40 font-light text-sm">
                    Your brand details have been successfully transmitted. Our strategy lead will secure contact with you within 24 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-[9px] font-bold text-white/45 tracking-[0.2em] uppercase mb-2 block">Name / Identity</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. FitZone Founder"
                      className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 text-sm transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-white/45 tracking-[0.2em] uppercase mb-2 block">Secure Email</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. founder@fitzone.in"
                      className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 text-sm transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-white/45 tracking-[0.2em] uppercase mb-2 block">Brand Strategy Notes</label>
                    <textarea 
                      required
                      rows="4"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Detail your goals, followers state, or target growth ROI..."
                      className={`w-full px-5 py-4 rounded-xl bg-white/5 border text-white placeholder-white/20 focus:outline-none focus:border-primary/50 text-sm transition-all duration-500 resize-none ${
                        highlightMessage 
                          ? "border-emerald-400 bg-emerald-500/5 shadow-[0_0_20px_rgba(52,211,153,0.3)] scale-[1.01]" 
                          : "border-white/10"
                      }`}
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full h-16 bg-white hover:bg-primary hover:text-white text-black rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-500 shadow-xl cursor-pointer"
                  >
                    Transmit Details
                    <FiSend className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
