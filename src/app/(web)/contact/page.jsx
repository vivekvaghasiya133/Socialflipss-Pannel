"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiMail, FiMessageSquare, FiSend } from "react-icons/fi";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", message: "" });
      setSubmitted(false);
    }, 4000);
  };

  return (
    <section className="py-20 relative bg-black" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Background ambient light */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] rounded-full blur-[150px]" style={{ background: "rgba(123,63,228,0.06)" }} />
        <div className="absolute bottom-[10%] right-[-15%] w-[600px] h-[600px] rounded-full blur-[150px]" style={{ background: "rgba(123,63,228,0.04)" }} />
      </div>

      <div className="container mx-auto px-6 max-w-6xl relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          {/* Info Details */}
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-4"
            >
              <span className="h-px w-10 bg-[#7B3FE4]" />
              <span className="text-xs font-semibold tracking-[0.4em] uppercase" style={{ color: "#7B3FE4" }}>Reach Out</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-6xl font-black leading-[0.92] mb-8" style={{ letterSpacing: "-0.03em" }}>
              Launch Your<br />
              <span style={{ color: "#7B3FE4" }}>Dominance.</span>
            </h1>
            
            <p className="text-white/40 font-light text-lg leading-relaxed mb-12 max-w-md">
              Secure a consultation session with our growth leads. Let's audit your competitors, identify brand position gaps, and build your ascension roadmap.
            </p>

            <div className="space-y-6 max-w-sm">
              <div className="flex items-center gap-5 p-5 rounded-[18px] bg-[#0a0a0a] border border-white/10">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: "rgba(123,63,228,0.12)", color: "#7B3FE4" }}>
                  <FiMail />
                </div>
                <div>
                  <span className="text-[9px] font-bold text-white/30 tracking-[0.2em] uppercase">Email Intel</span>
                  <a href="mailto:hello@socialflipss.com" className="block text-white font-bold text-sm hover:text-primary transition-colors">hello@socialflipss.com</a>
                </div>
              </div>

              <div className="flex items-center gap-6 p-5 rounded-2xl bg-zinc-950/40 border border-white/5 shadow-md">
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

          {/* Form Card */}
          <div className="p-8 md:p-10 rounded-[24px] bg-[#0a0a0a] border border-white/10">
            <div className="absolute inset-0 rounded-[24px] pointer-events-none" style={{ background: "rgba(123,63,228,0.01)" }} />
            
            <h4 className="text-2xl font-bold mb-6" style={{ letterSpacing: "-0.01em" }}>Get in Touch</h4>

            {submitted ? (
              <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl mb-6" style={{ background: "rgba(123,63,228,0.15)", color: "#7B3FE4" }}>
                    ✓
                  </div>
                  <h5 className="text-xl font-bold mb-2">Message Sent!</h5>
                  <p className="text-white/40 text-sm">
                    Your details have been sent. Our growth lead will contact you within 24 hours.
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
                  className="w-full px-5 py-4 rounded-[14px] border text-white placeholder-white/25 focus:outline-none text-sm transition-colors"
                  style={{ background: "#0d0d0d", borderColor: "rgba(255,255,255,0.12)" }}
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
                  className="w-full px-5 py-4 rounded-[14px] border text-white placeholder-white/25 focus:outline-none text-sm transition-colors"
                  style={{ background: "#0d0d0d", borderColor: "rgba(255,255,255,0.12)" }}
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-white/45 tracking-[0.2em] uppercase mb-2 block">Brand Strategy Notes</label>
                  <textarea 
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Detail your goals, current state, or target growth metrics..."
                  className="w-full px-5 py-4 rounded-[14px] border text-white placeholder-white/25 focus:outline-none text-sm transition-colors resize-none"
                  style={{ background: "#0d0d0d", borderColor: "rgba(255,255,255,0.12)" }}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 rounded-full font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer text-white"
                  style={{ background: "#7B3FE4" }}
                  onMouseOver={e => e.currentTarget.style.background = "#6030c0"}
                  onMouseOut={e => e.currentTarget.style.background = "#7B3FE4"}
                >
                  Send Message
                  <FiSend className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
