import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCcw, Ban, ArrowLeft, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

function Refund() {
  return (
    <div className="min-h-screen bg-slate-950 text-white py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>

        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-3 bg-blue-500/10 rounded-2xl text-blue-400 mb-4">
            <RefreshCcw size={32} />
          </div>
          <h1 className="text-4xl font-bold mb-2 uppercase tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Refund Policy
          </h1>
          <p className="text-slate-400">Project Focus: Simulated Financial Environment</p>
        </motion.div>

        {/* IMPORTANT DISCLOSURE */}
        <div className="mb-8 p-6 bg-blue-600/10 border border-blue-500/30 rounded-3xl flex gap-4 items-start">
          <Info className="text-blue-400 shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-blue-400 uppercase text-xs tracking-widest mb-1">Currency Disclosure</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              **Apex Digital Portfolio** is a simulated environment. No real-world currency is used, processed, or accepted. 
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-8 text-slate-300 leading-relaxed bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-xl">
          <section>
            <div className="flex items-center gap-3 mb-3">
              <Ban className="text-blue-400" size={20} />
              <h2 className="text-xl font-semibold text-white">1. Refund Eligibility</h2>
            </div>
            <p>As this is a simulation project where no real financial transactions occur, refund requests for "simulated credits" are not applicable. All currency shown on the dashboard is for educational demonstration purposes only.</p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="text-blue-400" size={20} />
              <h2 className="text-xl font-semibold text-white">2. Simulation Errors</h2>
            </div>
            <p>If you encounter a logic error in the simulation (e.g., incorrect credit balance display), please report it to the developer via the Contact page for troubleshooting. We will manually adjust your simulation profile.</p>
          </section>

          <div className="pt-8 border-t border-slate-800 text-sm text-slate-500 italic text-center">
            Educational Simulation by Divyansh.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Refund;
