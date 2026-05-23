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
    <section className="py-20 relative bg-[#020202]">
      
      {/* Background ambient light */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-15%] w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] right-[-15%] w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
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
              <span className="h-px w-10 bg-primary" />
              <span className="text-xs font-bold tracking-[0.5em] uppercase text-primary">Initiate Protocol</span>
            </motion.div>
            
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-[0.95] mb-8">
              LAUNCH YOUR <br />
              <span className="text-gradient-primary">DOMINANCE.</span>
            </h1>
            
            <p className="text-white/40 font-light text-lg leading-relaxed mb-12 max-w-md">
              Secure a consultation session with our growth leads. Let's audit your competitors, identify brand position gaps, and build your ascension roadmap.
            </p>

            <div className="space-y-6 max-w-sm">
              <div className="flex items-center gap-6 p-5 rounded-2xl bg-zinc-950/40 border border-white/5 shadow-md">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary text-lg">
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
                  Your brand details have been successfully transmitted. Our growth strategy lead will contact you within 24 hours.
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
                    placeholder="Detail your goals, current state, or target growth metrics..."
                    className="w-full px-5 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-primary/50 text-sm transition-colors resize-none"
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
  );
}
