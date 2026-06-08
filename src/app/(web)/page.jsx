"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import {
  FiArrowRight, FiArrowUpRight, FiPlus, FiMinus,
  FiInstagram, FiLinkedin, FiChevronLeft, FiChevronRight,
} from "react-icons/fi";

// ── DATA ────────────────────────────────────────────
const services = [
  {
    no: "01",
    title: "Social Media Management",
    desc: "Full-cycle brand presence on Instagram, LinkedIn & X — curated feeds, daily engagement, algorithmic scheduling, and voice-consistent storytelling that builds authority.",
  },
  {
    no: "02",
    title: "Paid Advertising & Performance",
    desc: "Precision Meta, Google & LinkedIn campaigns engineered for ROAS. We audit intent, design creatives, and scale budgets aggressively to fill your sales pipeline.",
  },
  {
    no: "03",
    title: "Reels & Short-Form Content",
    desc: "Scroll-stopping reels, shorts and TikToks with hook-first scripting, kinetic subtitles and trend-aligned edits — built for virality and platform retention.",
  },
  {
    no: "04",
    title: "Brand Strategy & Positioning",
    desc: "We map competitor gaps, define your unique authority, and craft a brand identity that makes you the default choice in your market niche.",
  },
  {
    no: "05",
    title: "Website & Landing Pages",
    desc: "Ultra-fast, conversion-engineered digital experiences. Clean UX hierarchies and persuasive copy that turn visitors into leads.",
  },
  {
    no: "06",
    title: "Growth Analytics & Reporting",
    desc: "Transparent monthly audits. ROAS tracking, CAC analysis, and engagement metrics delivered with zero fluff and complete clarity.",
  },
];

const workItems = [
  {
    label: "Reels & Short-Form",
    bg: "linear-gradient(135deg, #1a0533 0%, #3d1a8a 100%)",
    wide: false,
  },
  {
    label: "Brand Campaigns",
    bg: "linear-gradient(135deg, #0d0d2b 0%, #1a0533 100%)",
    wide: true,
  },
  {
    label: "Paid Ads Creatives",
    bg: "linear-gradient(135deg, #16013d 0%, #4a1fa8 100%)",
    wide: true,
  },
  {
    label: "UGC & Testimonials",
    bg: "linear-gradient(135deg, #0a0a1a 0%, #2d1060 100%)",
    wide: false,
  },
  {
    label: "Social Media Covers",
    bg: "linear-gradient(135deg, #200a4a 0%, #1a0038 100%)",
    wide: false,
  },
  {
    label: "Product Photography",
    bg: "linear-gradient(135deg, #0d0020 0%, #380f7a 100%)",
    wide: false,
  },
];

const testimonials = [
  {
    quote: "SocialFlipss completely transformed our Instagram. We went from 2K to 40K highly active followers in just 4 months. The cinematic quality is completely unmatched.",
    name: "Riya Mehta",
    role: "Founder, FitZone India",
    initials: "RM",
  },
  {
    quote: "Their precision paid ads strategy brought our cost-per-lead down by 60% while doubling our qualified conversions. The best growth investment we've ever made.",
    name: "Arjun Shah",
    role: "CEO, TechLaunch Startup",
    initials: "AS",
  },
  {
    quote: "Creative, hyper-responsive, and genuinely passionate about our brand. Our social presence finally has the dominant voice it needed to compete at scale.",
    name: "Priya Desai",
    role: "CMO, Bloom Skincare",
    initials: "PD",
  },
];

const stats = [
  { value: "150+", label: "Brands Scaled" },
  { value: "50M+", label: "Views Generated" },
  { value: "4.2X", label: "Average ROAS" },
  { value: "98%", label: "Client Retention" },
];

const clients = [
  "FitZone", "TechLaunch", "Bloom Skincare", "BuildCo", "NovaBrands",
  "ClearPath", "UrbanEdge", "MetaScale", "GrowthCo", "BrandForge",
];

const whyUs = [
  { no: "01", title: "Speed Over Slow Agencies", desc: "Assets live in under 7 days. No 30-day approval delays or bloated retainers." },
  { no: "02", title: "Senior-Led Strategy", desc: "Your brand is handled directly by our core leads — not juniors or outsourced teams." },
  { no: "03", title: "Obsessive About ROI", desc: "Every rupee tracked. Weekly reports. Zero speculation — pure data-driven decisions." },
  { no: "04", title: "Full-Stack Creative", desc: "Strategy, content, ads, and web all under one roof — no agency hopping needed." },
];

// ── COMPONENT ────────────────────────────────────────
export default function HomePage() {
  const [openService, setOpenService] = useState(null);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Refs for scroll tracking
  const heroRef = useRef(null);
  const workSectionRef = useRef(null);
  const clientsRef = useRef(null);
  const statsSectionRef = useRef(null);

  // ── Hero parallax
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(heroProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(heroProgress, [0, 0.55], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.08]);

  // ── OUR WORK text horizontal scroll (HOS SHOWREEL effect)
  const { scrollYProgress: workProgress } = useScroll({ target: workSectionRef, offset: ["start end", "end start"] });
  const workTextX = useTransform(workProgress, [0, 1], ["0%", "-25%"]);
  const workTextXSmooth = useSpring(workTextX, { stiffness: 60, damping: 20 });

  // ── Stats counter section parallax
  const { scrollYProgress: statsProgress } = useScroll({ target: statsSectionRef, offset: ["start end", "end start"] });
  const statsY = useTransform(statsProgress, [0, 1], [40, -40]);

  const prevT = () => setTestimonialIdx(i => (i === 0 ? testimonials.length - 1 : i - 1));
  const nextT = () => setTestimonialIdx(i => (i === testimonials.length - 1 ? 0 : i + 1));

  return (
    <div className="bg-black text-white overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ══════════════════════════════════════
          1. HERO — Full viewport, dark bg, centered
      ══════════════════════════════════════ */}
      <section ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">

      {/* Cinematic dark photo background — parallax scale on scroll */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img
            src="/images/hero_bg.png"
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.35) saturate(1.2)", y: heroY, scale: heroScale }}
          />
          {/* Dark overlay gradient */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 40%, rgba(0,0,0,0.75) 100%)"
          }} />
          {/* Purple tint overlay */}
          <div className="absolute inset-0" style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(123,63,228,0.15) 0%, transparent 70%)"
          }} />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-6 w-full max-w-5xl mx-auto flex flex-col items-center"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs font-semibold uppercase tracking-[0.4em] mb-8"
            style={{ color: "#9B6EF3" }}
          >
            Social Media Growth Agency
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-black text-white mb-6"
            style={{ fontSize: "clamp(2.8rem, 6.5vw, 6rem)", letterSpacing: "-0.03em", lineHeight: "1.05" }}
          >
            Scaling Brands,<br />
            <span style={{ color: "#9B6EF3" }}>One Reel</span> at a Time.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-white/50 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-16"
          >
            We create high-impact social media content, paid ads, and brand strategies —
            bringing your ideas to life with precision, creativity, and measurable results.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link href="/contact" className="hos-btn-primary">
              Let's Get Started <FiArrowRight />
            </Link>
            <Link href="/results" className="hos-btn-outline">
              View Our Work
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-10 flex flex-col items-center gap-3 opacity-40">
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/50"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
            Scroll
          </span>
          <div className="w-px h-14 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>


      {/* ══════════════════════════════════════
          2. OUR WORK — HOS SHOWREEL exact style
             Giant text scrolls horizontally with page scroll
      ══════════════════════════════════════ */}
      <section ref={workSectionRef} className="relative bg-black overflow-hidden" style={{ paddingBottom: "60px" }}>

        {/* Giant "OUR WORK" text — spans full width, clearly visible like HOS SHOWREEL */}
        <div className="relative select-none pointer-events-none overflow-hidden" style={{ marginBottom: "-60px" }}>
          <motion.div
            style={{ x: workTextXSmooth }}
            className="flex items-center justify-start pl-4 md:pl-8"
          >
            <span
              className="font-black uppercase text-white leading-none tracking-tighter whitespace-nowrap"
              style={{
                fontSize: "clamp(5rem, 18vw, 18rem)",
                letterSpacing: "-0.04em",
                opacity: 0.85,
                WebkitTextStroke: "1px rgba(255,255,255,0.1)",
                background: "linear-gradient(180deg, rgba(255,255,255,0.90) 0%, rgba(255,255,255,0.25) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              OUR WORK
            </span>
          </motion.div>
        </div>

        {/* 3 image panels — overlapping on top of the giant text */}
        <div className="relative z-10 grid grid-cols-3 gap-3 px-6 max-w-7xl mx-auto">
          {[
            { label: "Social Media Campaigns", sub: "Instagram · LinkedIn · X", img: "/images/work_panel1.png" },
            { label: "Paid Ad Creatives", sub: "Meta · Google · LinkedIn", img: "/images/work_panel2.png" },
            { label: "Reels & Short-Form", sub: "YouTube · TikTok · Instagram", img: "/images/work_panel3.png" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: "easeOut" }}
              className="relative rounded-2xl overflow-hidden cursor-pointer group"
              style={{ height: "340px" }}
            >
              {/* BG Image */}
              <img
                src={item.img}
                alt={item.label}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                style={{ filter: "brightness(0.5) saturate(1.1)" }}
              />
              {/* Dark overlay */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }} />
              {/* Purple hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "radial-gradient(circle at 50% 80%, rgba(123,63,228,0.3), transparent 60%)" }} />

              <div className="absolute bottom-6 left-6 right-6 z-10">
                <p className="text-white font-semibold text-base">{item.label}</p>
                <p className="text-white/40 text-xs mt-1">{item.sub}</p>
                <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  <span className="text-xs uppercase tracking-widest" style={{ color: "#9B6EF3" }}>View Work</span>
                  <FiArrowUpRight className="w-3 h-3" style={{ color: "#9B6EF3" }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>



      {/* ══════════════════════════════════════
          3. CLIENTS — "Standing Tall" + logo marquee
      ══════════════════════════════════════ */}
      <section className="py-16 bg-black border-y border-white/8">
        <div className="max-w-7xl mx-auto px-6 mb-10">
          <h2 className="text-center font-bold text-lg text-white/70 tracking-wide">
            Standing Tall with Our Clients
          </h2>
        </div>
        <div className="overflow-hidden">
          <div className="flex w-max animate-marquee items-center gap-10">
            {[...clients, ...clients].map((c, i) => (
              <div key={i} className="px-7 py-3 rounded-full border border-white/12 bg-white/3 flex-shrink-0">
                <span className="text-sm font-semibold text-white/55 uppercase tracking-widest">{c}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════
          4. FROM CONCEPT TO CREATION — Services (HOS exact layout)
      ══════════════════════════════════════ */}
      <section className="py-24 bg-black border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

            {/* Left: sticky title + CTA */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 self-start">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] mb-4" style={{ color: "#9B6EF3" }}>
                What We Do
              </p>
              <h2 className="font-black text-white leading-tight mb-8"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}>
                From Concept<br />to Creation
              </h2>
              <Link href="/services" className="hos-btn-primary inline-flex">
                Explore Services <FiArrowRight />
              </Link>
            </div>

            {/* Right: accordion service list */}
            <div className="lg:col-span-8">
              {services.map((svc, i) => (
                <div key={i} className="service-card">
                  <button
                    onClick={() => setOpenService(openService === i ? null : i)}
                    className="w-full flex items-center justify-between gap-6 py-6 px-2 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-5 flex-1">
                      <span className="text-xs font-mono text-white/25 w-6 flex-shrink-0">{svc.no}</span>
                      <span className={`font-semibold text-base transition-colors ${openService === i ? "text-white" : "text-white/70 group-hover:text-white"}`}>
                        {svc.title}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0 transition-all"
                      style={openService === i ? { background: "#7B3FE4", borderColor: "#7B3FE4" } : {}}>
                      {openService === i
                        ? <FiMinus className="w-4 h-4 text-white" />
                        : <FiPlus className="w-4 h-4 text-white/50" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {openService === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pb-6 px-2 pl-11">
                          <p className="text-white/50 text-sm leading-relaxed">{svc.desc}</p>
                          <Link href="/contact"
                            className="inline-flex items-center gap-2 mt-4 text-xs font-semibold uppercase tracking-widest transition-colors hover:text-white"
                            style={{ color: "#9B6EF3" }}>
                            Learn More <FiArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════
          5. WORK GRID — Image cards with labels (HOS style)
      ══════════════════════════════════════ */}
      <section className="py-24 bg-black border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] mb-3" style={{ color: "#9B6EF3" }}>Portfolio</p>
              <h2 className="font-black text-white" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}>
                Content We Create
              </h2>
            </div>
            <Link href="/results" className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-white/50 hover:text-white transition-colors uppercase tracking-widest">
              See All Work <FiArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* HOS-style masonry grid */}
          <div className="grid grid-cols-12 grid-rows-2 gap-3" style={{ height: "560px" }}>
            {/* Large left — Reels */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="col-span-3 row-span-2 relative rounded-2xl overflow-hidden cursor-pointer group"
            >
              <img src="/images/work_panel1.png" alt="Reels" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ filter: "brightness(0.45)" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 60%)" }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(123,63,228,0.2)" }} />
              <div className="absolute bottom-6 left-6 right-6 z-10">
                <p className="text-white font-semibold text-sm">Reels & Short-Form</p>
                <p className="text-white/40 text-xs mt-1">Instagram · YouTube · TikTok</p>
              </div>
            </motion.div>

            {/* Top center — Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 }}
              className="col-span-5 row-span-1 relative rounded-2xl overflow-hidden cursor-pointer group"
            >
              <img src="/images/work_panel2.png" alt="Brand" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ filter: "brightness(0.4)" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)" }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(123,63,228,0.15)" }} />
              <div className="absolute bottom-5 left-5 z-10">
                <p className="text-white font-semibold text-sm">Brand Campaigns</p>
                <p className="text-white/40 text-xs mt-1">Strategy · Identity · Launch</p>
              </div>
            </motion.div>

            {/* Top right — Ads */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.12 }}
              className="col-span-4 row-span-1 relative rounded-2xl overflow-hidden cursor-pointer group"
            >
              <img src="/images/work_panel3.png" alt="Ads" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ filter: "brightness(0.4)" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)" }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(123,63,228,0.15)" }} />
              <div className="absolute bottom-5 left-5 z-10">
                <p className="text-white font-semibold text-sm">Paid Ad Creatives</p>
                <p className="text-white/40 text-xs mt-1">Meta · Google · LinkedIn</p>
              </div>
            </motion.div>

            {/* Bottom center — UGC */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.16 }}
              className="col-span-3 row-span-1 relative rounded-2xl overflow-hidden cursor-pointer group"
            >
              <img src="/images/grid_ugc.png" alt="UGC" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ filter: "brightness(0.4)" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)" }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(123,63,228,0.15)" }} />
              <div className="absolute bottom-5 left-5 z-10">
                <p className="text-white font-semibold text-sm">UGC Content</p>
                <p className="text-white/40 text-xs mt-1">Reviews · Testimonials</p>
              </div>
            </motion.div>

            {/* Bottom right — Social Media */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="col-span-6 row-span-1 relative rounded-2xl overflow-hidden cursor-pointer group"
            >
              <img src="/images/grid_social.png" alt="Social" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ filter: "brightness(0.4)" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)" }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(123,63,228,0.12)" }} />
              <div className="absolute bottom-5 left-5 z-10">
                <p className="text-white font-semibold text-sm">Social Media Management</p>
                <p className="text-white/40 text-xs mt-1">Daily posts · Stories · Engagement</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════
          6. WHY SOCIALFLIPSS — 2-column text layout (HOS About style)
      ══════════════════════════════════════ */}
      <section className="py-24 bg-black border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-16">
            <div className="lg:col-span-4">
              <h2 className="font-black text-white leading-tight"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em" }}>
                Why SocialFlipss?
              </h2>
            </div>
            <div className="lg:col-span-8">
              <p className="text-xl md:text-2xl font-semibold text-white leading-snug mb-6" style={{ letterSpacing: "-0.01em" }}>
                We're a top-tier Digital Growth Agency built for brands that want to dominate their market — not just show up.
              </p>
              <p className="text-white/45 text-base leading-relaxed">
                As social media strategists and content creators, we bring your vision to life with high-impact production
                and data-driven digital strategies. From reels to paid ads to full brand systems — we go all in.
              </p>
            </div>
          </div>

          {/* 4 numbered reasons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px border border-white/10 rounded-2xl overflow-hidden">
            {whyUs.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="p-8 bg-[#080808] hover:bg-[#0d0d0d] transition-colors group"
              >
                <div className="flex items-start gap-5">
                  <span className="text-xs font-mono mt-1 flex-shrink-0" style={{ color: "#9B6EF3" }}>{item.no}</span>
                  <div>
                    <h3 className="font-bold text-white text-base mb-2">{item.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════
          7. STATS — 4 numbers (HOS style)
      ══════════════════════════════════════ */}
      <section ref={statsSectionRef} className="py-20 bg-black border-b border-white/8">
        <motion.div className="max-w-7xl mx-auto px-6" style={{ y: statsY }}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center text-center py-10 px-6 rounded-2xl border border-white/10 bg-[#080808]"
              >
                <span className="font-black text-white" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)", letterSpacing: "-0.04em" }}>
                  {s.value}
                </span>
                <span className="text-xs font-semibold text-white/35 uppercase tracking-[0.2em] mt-3">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>


      {/* ══════════════════════════════════════
          8. TESTIMONIALS — Slider with arrows (HOS style)
      ══════════════════════════════════════ */}
      <section className="py-24 bg-black border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <h2 className="font-black text-white" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", letterSpacing: "-0.02em" }}>
              What Our Partners Say
            </h2>
            <div className="flex gap-3">
              <button onClick={prevT}
                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all cursor-pointer">
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextT}
                className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-all cursor-pointer">
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIdx}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
            >
              {/* Quote */}
              <div className="lg:col-span-8">
                <div className="text-6xl font-black mb-6 leading-none" style={{ color: "rgba(123,63,228,0.25)" }}>"</div>
                <p className="text-xl md:text-2xl font-semibold text-white leading-snug mb-8" style={{ letterSpacing: "-0.01em" }}>
                  {testimonials[testimonialIdx].quote}
                </p>
                <div>
                  <p className="font-bold text-white text-sm">{testimonials[testimonialIdx].name}</p>
                  <p className="text-white/40 text-xs mt-1">{testimonials[testimonialIdx].role}</p>
                </div>
              </div>

              {/* Logo card */}
              <div className="lg:col-span-4 flex justify-center lg:justify-end">
                <div className="w-32 h-32 rounded-3xl border border-white/10 bg-[#0d0d0d] flex items-center justify-center"
                  style={{ boxShadow: "0 0 60px rgba(123,63,228,0.15)" }}>
                  <span className="text-3xl font-black" style={{ color: "#9B6EF3" }}>
                    {testimonials[testimonialIdx].initials}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex items-center gap-2 mt-10">
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setTestimonialIdx(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${i === testimonialIdx ? "w-8 bg-[#7B3FE4]" : "w-1.5 bg-white/20"}`}
              />
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════
          9. WAIT, THERE'S MORE — Feature grid (HOS extra section)
      ══════════════════════════════════════ */}
      <section className="py-24 bg-black border-b border-white/8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] mb-4" style={{ color: "#9B6EF3" }}>
              What's Included
            </p>
            <h2 className="font-black text-white" style={{ fontSize: "clamp(2rem, 4vw, 3.2rem)", letterSpacing: "-0.02em" }}>
              Wait! There's More.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { no: "01", title: "Monthly Reporting", desc: "Full transparency. ROAS, reach, engagement, and CAC — all in one clean monthly report." },
              { no: "02", title: "Competitor Analysis", desc: "We audit your rivals and identify the gaps your brand can exploit for market dominance." },
              { no: "03", title: "Content Calendar", desc: "Structured 30-day content calendar with topics, formats, and posting times pre-approved." },
              { no: "04", title: "A/B Ad Testing", desc: "We test creatives, headlines, and audiences to find what converts at the lowest cost." },
              { no: "05", title: "Community Management", desc: "Active comment replies and DM management to build loyalty and authentic connections." },
              { no: "06", title: "Dedicated Account Manager", desc: "One point of contact. Always on. Always accountable for your brand's performance." },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="p-7 rounded-2xl border border-white/10 bg-[#080808] hover:border-white/20 transition-colors group"
              >
                <span className="text-xs font-mono mb-4 block" style={{ color: "#9B6EF3" }}>{item.no}</span>
                <h3 className="font-bold text-white text-base mb-3">{item.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
