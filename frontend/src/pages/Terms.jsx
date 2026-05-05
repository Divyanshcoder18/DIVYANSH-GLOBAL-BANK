import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ScrollText, Lock, AlertCircle, ArrowLeft, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

function Terms() {
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
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl font-bold mb-2 uppercase tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Project Terms
          </h1>
          <p className="text-slate-400">Last updated: May 5, 2026</p>
        </motion.div>

        {/* IMPORTANT DISCLOSURE FOR COMPLIANCE */}
        <div className="mb-8 p-6 bg-blue-600/10 border border-blue-500/30 rounded-3xl flex gap-4 items-start">
          <Info className="text-blue-400 shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-blue-400 uppercase text-xs tracking-widest mb-1">Educational Disclosure</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              This website is a **Developer Portfolio Project** and an **Educational Financial Simulation**. 
              All services provided are for demonstration purposes only. We do not offer real-world banking or wallet services to the public.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-8 text-slate-300 leading-relaxed bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-xl">
          <section>
            <div className="flex items-center gap-3 mb-3">
              <ScrollText className="text-blue-400" size={20} />
              <h2 className="text-xl font-semibold text-white">1. Use of Simulation</h2>
            </div>
            <p>By accessing Apex Digital Portfolio, you agree to use this platform for its intended educational purposes. Users may simulate transactions, manage demo profiles, and explore the IT architecture of this portfolio simulation.</p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <Lock className="text-blue-400" size={20} />
              <h2 className="text-xl font-semibold text-white">2. Data Privacy</h2>
            </div>
            <p>Your data is stored securely for the duration of the simulation. As this is a portfolio project, we recommend not using sensitive personal passwords. We do not share simulator data with any third parties.</p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="text-blue-400" size={20} />
              <h2 className="text-xl font-semibold text-white">3. Limitation of Liability</h2>
            </div>
            <p>This is a simulated environment. No actual currency is exchanged, stored, or processed. Apex Digital is not responsible for any misunderstanding of the platform's simulated nature.</p>
          </section>

          <div className="pt-8 border-t border-slate-800 text-sm text-slate-500 italic text-center">
            This project is part of a professional IT portfolio by Divyansh.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Terms;
