"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FiMenu, FiX, FiInstagram, FiLinkedin, FiArrowRight, FiArrowUpRight } from "react-icons/fi";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Protocol", path: "/protocol" },
  { label: "Results", path: "/results" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const tickerItems = [
  "Social Media Management",
  "Paid Advertising",
  "Content Creation",
  "Brand Strategy",
  "Growth Analytics",
  "Reels & Shorts",
  "Conversion Funnels",
  "Market Dominance",
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
    <div className="bg-black text-white min-h-screen flex flex-col justify-between overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 py-4 px-6 md:px-12 ${
        scrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/8 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"
          : "bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer select-none">
            <span className="font-black text-xl tracking-tight text-white leading-none">
              Social<span style={{ color: "#9B6EF3" }}>Flipss</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`relative text-sm font-medium transition-colors cursor-pointer pb-1 ${
                    isActive
                      ? "text-white"
                      : "text-white/55 hover:text-white"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full" style={{ background: "#7B3FE4" }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 bg-white text-black rounded-full text-sm font-semibold hover:bg-gray-100 transition-all duration-200 cursor-pointer"
            >
              Let's Talk
            </Link>
            <button
              className="lg:hidden text-white/70 hover:text-white transition-colors cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 z-40 bg-black/98 backdrop-blur-2xl flex flex-col justify-center px-10 transition-all duration-400 lg:hidden ${
        menuOpen ? "opacity-100 translate-x-0 pointer-events-auto" : "opacity-0 translate-x-full pointer-events-none"
      }`}>
        <div className="flex flex-col gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setMenuOpen(false)}
                className={`text-4xl font-black uppercase tracking-tight text-left transition-all ${
                  isActive ? "text-[#9B6EF3]" : "text-white/60 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/contact"
            onClick={() => setMenuOpen(false)}
            className="w-fit mt-4 px-8 py-4 text-white rounded-full font-bold text-sm uppercase tracking-widest transition-all"
            style={{ background: "#7B3FE4" }}
          >
            Let's Talk
          </Link>
        </div>
      </div>

      {/* ── PAGE CONTENT ── */}
      <main className="flex-grow min-h-screen">
        {children}
      </main>

      {/* ── FOOTER ── */}
      <footer className="bg-black border-t border-white/8 pt-4 pb-8 px-6 md:px-12">

        {/* Services Ticker */}
        <div className="overflow-hidden border-y border-white/8 py-4 mb-8">
          <div className="flex w-max animate-marquee whitespace-nowrap">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <React.Fragment key={i}>
                <span className="text-sm font-medium text-white/50 uppercase tracking-widest px-2">{item}</span>
                <span className="text-xs mx-4 self-center" style={{ color: "#9B6EF3" }}>•</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Pre-footer CTA Card */}
        <div className="relative max-w-7xl mx-auto mb-6 overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a0a]">
          {/* Purple glow left */}
          <div className="absolute left-0 top-0 bottom-0 w-1/2 pointer-events-none"
            style={{ background: "radial-gradient(circle at 0% 50%, rgba(123, 63, 228, 0.25) 0%, transparent 65%)" }}
          />
          <div className="relative z-10 flex flex-col items-center justify-center text-center px-8 py-16 md:py-20">
            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-3 max-w-2xl" style={{ letterSpacing: "-0.02em" }}>
              Not limited to ads,<br />we're your growth partners.
            </h2>
            <p className="text-white/50 text-base mb-8 max-w-lg">
              Got questions, project ideas, or just want to say hi? We're all ears!
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 px-10 py-4 text-white rounded-full font-semibold text-base transition-all duration-200"
              style={{ background: "#7B3FE4" }}
            >
              Let's Collaborate
              <FiArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Footer Info Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-1">

          {/* Contact Info */}
          <div className="rounded-[20px] border border-white/10 bg-[#0a0a0a] p-7">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Contact</p>
            <div className="space-y-3 text-sm text-white/65">
              <p><span className="text-white font-semibold">Email:</span> hello@socialflipss.com</p>
              <p><span className="text-white font-semibold">Phone:</span> +91 98765 43210</p>
              <p><span className="text-white font-semibold">Hours:</span> Mon–Fri, 10am to 7pm IST</p>
              <p><span className="text-white font-semibold">Based in:</span> India 🇮🇳</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-[20px] border border-white/10 bg-[#0a0a0a] p-7">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Quick Links</p>
            <div className="flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-sm font-medium uppercase tracking-wider transition-colors ${
                   pathname === link.path ? "text-[#9B6EF3]" : "text-white/55 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Social & Legal */}
          <div className="rounded-[20px] border border-white/10 bg-[#0a0a0a] p-7">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-4">Connect</p>
            <div className="flex flex-col gap-3 mb-6">
              <a
                href="https://instagram.com/socialflipss"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-white/55 hover:text-white transition-colors"
              >
                <FiInstagram className="w-4 h-4" />
                Instagram
                <FiArrowUpRight className="w-3 h-3 ml-auto" />
              </a>
              <a
                href="https://linkedin.com/company/socialflipss"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium text-white/55 hover:text-white transition-colors"
              >
                <FiLinkedin className="w-4 h-4" />
                LinkedIn
                <FiArrowUpRight className="w-3 h-3 ml-auto" />
              </a>
            </div>
            <div className="border-t border-white/8 pt-4">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-2">Legal</p>
              <Link href="/privacy" className="text-sm text-white/40 hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto mt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25 font-medium tracking-widest uppercase">
            © 2026 SocialFlipss. All Rights Reserved.
          </p>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 text-xs text-white/30 hover:text-white transition-colors cursor-pointer uppercase tracking-widest font-medium"
          >
            Back to Top ↑
          </button>
        </div>
      </footer>
    </div>
  );
}
