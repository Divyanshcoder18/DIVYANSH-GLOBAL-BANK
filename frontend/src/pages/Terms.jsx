import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ScrollText, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
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
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Terms & Conditions
          </h1>
          <p className="text-slate-400">Last updated: May 4, 2026</p>
        </motion.div>

        {/* Content Section */}
        <div className="space-y-8 text-slate-300 leading-relaxed bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-xl">
          <section>
            <div className="flex items-center gap-3 mb-3">
              <ScrollText className="text-blue-400" size={20} />
              <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
            </div>
            <p>By accessing and using Apex Global Bank, you agree to be bound by these Terms and Conditions. These terms govern your use of our digital banking services, including but not limited to fund transfers, account management, and UPI services.</p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <Lock className="text-blue-400" size={20} />
              <h2 className="text-xl font-semibold text-white">2. User Responsibilities</h2>
            </div>
            <p>You are solely responsible for maintaining the confidentiality of your account password and VPA (UPI ID). Apex Global Bank will never ask for your PIN or Password via email or phone. Any transaction made using your credentials will be considered authorized by you.</p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="text-blue-400" size={20} />
              <h2 className="text-xl font-semibold text-white">3. Transaction Limits</h2>
            </div>
            <p>We reserve the right to set transaction limits on your account for security purposes. High-value transactions may be subject to additional verification by our Fraud Detection System.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Intellectual Property</h2>
            <p>All content, including logos, designs, and code, is the property of Apex Global Bank and is protected by copyright laws.</p>
          </section>

          <div className="pt-8 border-t border-slate-800 text-sm text-slate-500 italic text-center">
            By using this service, you acknowledge that you have read and understood these terms in their entirety.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Terms;
