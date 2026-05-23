"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FiMenu, 
  FiX, 
  FiMail, 
  FiMessageSquare 
} from "react-icons/fi";

const LOGO_SVG = () => (
  <svg width="34" height="40" viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="60,5 110,35 110,70" fill="#B084FF" />
    <polygon points="60,5 10,35 10,70" fill="#7B3FE4" opacity="0.6" />
    <rect x="52" y="30" width="16" height="80" fill="#7B3FE4" />
    <polygon points="60,135 110,105 110,70" fill="#B084FF" opacity="0.8" />
    <polygon points="60,135 10,105 10,70" fill="#7B3FE4" />
  </svg>
);

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Protocol", path: "/protocol" },
  { label: "Results", path: "/results" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" }
];

export default function WebLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-[#020202] text-white min-h-screen flex flex-col justify-between overflow-x-hidden">
      
      {/* ── SHARED NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-4 px-6 md:px-12 ${
        scrolled ? "bg-black/60 backdrop-blur-xl border-b border-primary/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)]" : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 cursor-pointer select-none">
            <LOGO_SVG />
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-[0.2em] uppercase leading-none">SocialFlipss</span>
              <span className="text-[8px] font-bold text-primary tracking-[0.4em] uppercase mt-1">Growth Forge</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-xs font-bold uppercase tracking-[0.3em] transition-colors cursor-pointer ${
                  pathname === link.path ? "text-primary" : "text-white/50 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Action CTA / Menu Toggle */}
          <div className="flex items-center gap-6">
            <Link 
              href="/contact"
              className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 border border-primary/30 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary/20 hover:border-primary transition-all shadow-[0_0_20px_rgba(123,63,228,0.15)] cursor-pointer"
            >
              Get Started
            </Link>
            <button 
              className="lg:hidden text-white/70 hover:text-white transition-colors cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <FiX className="w-7 h-7" /> : <FiMenu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-0 z-40 bg-[#020202]/95 backdrop-blur-2xl flex flex-col justify-center px-12 transition-all duration-500 lg:hidden ${
        menuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
      }`}>
        <div className="flex flex-col gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              onClick={() => setMenuOpen(false)}
              className={`text-3xl font-black uppercase tracking-widest text-left transition-all ${
                pathname === link.path ? "text-primary" : "text-white/60 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link 
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="w-fit px-8 py-4 bg-primary text-white rounded-full font-black text-sm uppercase tracking-widest mt-6 hover:bg-primary-hover shadow-xl shadow-primary/20"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <main className="flex-grow pt-10 min-h-[calc(100vh-600px)]">
        {children}
      </main>

      {/* ── CINEMATIC FOOTER ── */}
      <div
        className="relative h-screen w-full"
        style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
      >
        <footer className="fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-background text-foreground z-0 pb-12">
          
          {/* Breathing Aura */}
          <div className="absolute left-1/2 top-1/2 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[80px] pointer-events-none z-0 bg-primary/5 animate-pulse-slow" />
          <div className="absolute inset-0 bg-grid-white opacity-[0.03] z-0 pointer-events-none" />

          {/* Giant background outline text */}
          <div
            className="absolute bottom-0 md:-bottom-[1vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0 pointer-events-none select-none uppercase tracking-tighter opacity-[0.07] font-black text-transparent text-center"
            style={{ 
              fontSize: 'clamp(5rem, 25vw, 18vw)',
              WebkitTextStroke: "1px rgba(123, 63, 228, 0.4)",
            }}
          >
            FLIPSS
          </div>

          {/* Diagonal Sleek Marquee */}
          <div className="absolute top-24 md:top-20 left-0 w-full overflow-hidden border-y border-white/5 bg-black/60 backdrop-blur-md py-4 z-10 -rotate-1 scale-105 shadow-2xl">
            <div className="flex w-max animate-[shimmer_40s_linear_infinite] text-[9px] md:text-xs font-black tracking-[0.4em] text-white/20 uppercase whitespace-nowrap">
              <div className="flex items-center space-x-12 px-6">
                <span>Digital Dominance</span> <span className="text-primary">✦</span>
                <span>High-End Creative</span> <span className="text-primary">✦</span>
                <span>Conversion Science</span> <span className="text-primary">✦</span>
                <span>Authority Building</span> <span className="text-primary">✦</span>
                <span>Market Control</span> <span className="text-primary">✦</span>
              </div>
              <div className="flex items-center space-x-12 px-6">
                <span>Digital Dominance</span> <span className="text-primary">✦</span>
                <span>High-End Creative</span> <span className="text-primary">✦</span>
                <span>Conversion Science</span> <span className="text-primary">✦</span>
                <span>Authority Building</span> <span className="text-primary">✦</span>
                <span>Market Control</span> <span className="text-primary">✦</span>
              </div>
            </div>
          </div>

          {/* Main Center Content */}
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-16 md:mt-24 w-full max-w-5xl mx-auto">
            <h2
              className="text-4xl md:text-8xl font-black tracking-tighter mb-8 md:mb-12 text-center uppercase leading-[1.1]"
            >
              Ready to give your brand <br />
              <span className="text-gradient-primary">an edge?</span>
            </h2>

            <div className="flex flex-col items-center gap-8 w-full">
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full">
                <a 
                  href="mailto:hello@socialflipss.com" 
                  className="px-10 py-5 bg-white hover:bg-primary text-black hover:text-white rounded-full font-bold text-sm md:text-base flex items-center gap-4 group transition-all duration-500 shadow-2xl"
                >
                  <div className="w-2 h-2 rounded-full bg-primary group-hover:bg-white animate-ping" />
                  Let's Work Together
                </a>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap justify-center gap-4 w-full">
                <a href="#" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-primary/20 text-white/40 hover:text-white font-bold text-xs uppercase tracking-widest transition-all">
                  Instagram
                </a>
                <a href="#" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-primary/20 text-white/40 hover:text-white font-bold text-xs uppercase tracking-widest transition-all">
                  LinkedIn
                </a>
                <a href="#" className="px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:border-primary/20 text-white/40 hover:text-white font-bold text-xs uppercase tracking-widest transition-all">
                  Twitter / X
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="relative z-20 w-full px-8 md:px-16 flex flex-col md:flex-row items-center justify-between gap-8 mt-auto">
            
            <div className="text-white/20 text-[9px] font-black tracking-[0.4em] uppercase order-2 md:order-1 text-center md:text-left">
              © 2026 SocialFlipss. Engineered for Absolute Dominance.
            </div>

            {/* Return to Top */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-6 py-3 bg-white/5 border border-white/10 hover:border-primary/30 rounded-full flex items-center gap-3 order-1 md:order-2 group cursor-pointer transition-colors"
            >
              <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em] group-hover:text-white transition-colors">Return to Top</span>
              <svg className="w-3.5 h-3.5 text-primary transform group-hover:-translate-y-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
            </button>

          </div>
        </footer>
      </div>

    </div>
  );
}
