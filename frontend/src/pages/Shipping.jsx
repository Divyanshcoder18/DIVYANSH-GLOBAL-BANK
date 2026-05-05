import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Zap, ArrowLeft, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

function Shipping() {
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
            <Truck size={32} />
          </div>
          <h1 className="text-4xl font-bold mb-2 uppercase tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Service Delivery
          </h1>
          <p className="text-slate-400">Mode: Instant Digital Simulation Access</p>
        </motion.div>

        {/* IMPORTANT DISCLOSURE */}
        <div className="mb-8 p-6 bg-blue-600/10 border border-blue-500/30 rounded-3xl flex gap-4 items-start">
          <Info className="text-blue-400 shrink-0" size={24} />
          <div>
            <h3 className="font-bold text-blue-400 uppercase text-xs tracking-widest mb-1">Service Nature</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              **Apex Digital Portfolio** is a 100% digital platform. We do not ship physical products or debit cards.
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-8 text-slate-300 leading-relaxed bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-xl">
          <section>
            <div className="flex items-center gap-3 mb-3">
              <Zap className="text-blue-400" size={20} />
              <h2 className="text-xl font-semibold text-white">1. Delivery Timeline</h2>
            </div>
            <p>Access to the simulation profiles and dashboard features is provided instantly upon successful login. There is no waiting period for "delivery" as the service is strictly software-based.</p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="text-blue-400" size={20} />
              <h2 className="text-xl font-semibold text-white">2. Geographic Availability</h2>
            </div>
            <p>The simulation project is accessible globally via the web browser. Users in any region can access the IT architecture demonstration without geographic restrictions.</p>
          </section>

          <div className="pt-8 border-t border-slate-800 text-sm text-slate-500 italic text-center">
            Digital Portfolio Demo by Divyansh.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Shipping;
