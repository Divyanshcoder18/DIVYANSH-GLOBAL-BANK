import React from 'react';
import { motion } from 'framer-motion';
import { Truck, Zap, Globe, Clock, ArrowLeft } from 'lucide-react';
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
            <Zap size={32} />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Shipping & Delivery
          </h1>
          <p className="text-slate-400">Policy for Digital Service Delivery</p>
        </motion.div>

        {/* Content Section */}
        <div className="space-y-8 text-slate-300 leading-relaxed bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-xl">
          <section>
            <div className="flex items-center gap-3 mb-3">
              <Zap className="text-blue-400" size={20} />
              <h2 className="text-xl font-semibold text-white">1. Digital Delivery</h2>
            </div>
            <p>Apex Global Bank provides purely digital financial services. There is no physical shipping involved. All services, including account activation, fund transfers, and virtual card issuance, are delivered instantly through our secure web platform.</p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <Clock className="text-blue-400" size={20} />
              <h2 className="text-xl font-semibold text-white">2. Timeline</h2>
            </div>
            <p>Transaction receipts and account updates are reflected in real-time (within seconds) upon successful completion of the action by the user.</p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <Globe className="text-blue-400" size={20} />
              <h2 className="text-xl font-semibold text-white">3. Service Access</h2>
            </div>
            <p>Access to our services is available 24/7 globally, provided the user has a stable internet connection and a valid registered account.</p>
          </section>

          <div className="pt-8 border-t border-slate-800 text-sm text-slate-500 italic text-center">
            Since we do not ship physical products, there are no shipping charges or logistics-related delays.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Shipping;
