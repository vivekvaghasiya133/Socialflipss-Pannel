"use client";

import React, { useState, useEffect } from "react";

export default function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if running in standalone (already installed)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;
    setIsStandalone(standalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // For Android / Chrome
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // If already installed as app, don't show prompt
  if (isStandalone) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      {/* Floating or Header Install Button */}
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer mr-2"
      >
        <span>📲</span>
        <span>Install App</span>
      </button>

      {/* iOS / Step-by-Step Installation Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl animate-slideUp text-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl font-black">
                  SF
                </div>
                <div>
                  <h3 className="font-black text-base text-white">iPhone પર App ઇન્સ્ટોલ કરો</h3>
                  <p className="text-xs text-slate-400">માત્ર ૨ સ્ટેપમાં એપ હોમ સ્ક્રીન પર આવી જશે</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 my-4 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                  ૧
                </span>
                <div>
                  <span className="font-bold text-white block">Safari બ્રાઉઝરમાં નીચેનું Share બટન દબાવો</span>
                  <p className="text-slate-400 mt-0.5">
                    Safari ની નીચે વચ્ચે રહેલું ચોરસ બોક્સ અને ઉપર તીર વાળું આઇકોન <span className="font-mono text-indigo-400 font-bold">[ ⬆️ ]</span> ટેપ કરો.
                  </p>
                  <p className="text-amber-400 text-[10px] mt-1">
                    ⚠️ જો WhatsApp માં લિંક ખોલી હોય, તો પહેલા નીચે જમણી બાજુના Compass 🧭 પર ક્લિક કરીને <strong>"Open in Safari"</strong> કરો.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-3 border-t border-slate-800">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                  ૨
                </span>
                <div>
                  <span className="font-bold text-white block">"Add to Home Screen" સિલેક્ટ કરો</span>
                  <p className="text-slate-400 mt-0.5">
                    નીચે સ્ક્રોલ કરીને <strong className="text-emerald-400">➕ Add to Home Screen</strong> પર ક્લિક કરો અને ઉપર <strong>Add</strong> દબાવો.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl text-xs shadow-lg transition-all"
            >
              સમજાઈ ગયું (Got it!) ✓
            </button>
          </div>
        </div>
      )}
    </>
  );
}
