import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

function Refund() {
  return (
    <div className="min-h-screen bg-slate-950 text-white py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 mb-4">
            <RefreshCcw size={32} />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Refund & Cancellation
          </h1>
          <p className="text-slate-400">Clear policies on transactions and refunds.</p>
        </motion.div>

        {/* Content Section */}
        <div className="space-y-8 text-slate-300 leading-relaxed bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-xl">
          <section>
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="text-emerald-400" size={20} />
              <h2 className="text-xl font-semibold text-white">1. Transaction Cancellation</h2>
            </div>
            <p>Once a fund transfer or payment is successfully initiated and authorized by the user, it cannot be cancelled or reversed. Please verify the recipient's VPA or Account details carefully before confirming any payment.</p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <Clock className="text-emerald-400" size={20} />
              <h2 className="text-xl font-semibold text-white">2. Failed Transactions</h2>
            </div>
            <p>In case a transaction fails but the amount is debited from your account, the amount will be automatically refunded to your original payment source within <strong>5 to 7 business days</strong> as per standard banking protocols.</p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle className="text-emerald-400" size={20} />
              <h2 className="text-xl font-semibold text-white">3. Account Closure</h2>
            </div>
            <p>Users may close their account at any time. Upon closure, any remaining balance will be transferred to the user's linked external bank account after verifying all pending transactions.</p>
          </section>

          <div className="pt-8 border-t border-slate-800 text-sm text-slate-500 italic text-center">
            For assistance with any failed transactions, please raise a ticket in the "Support" section of your dashboard.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Refund;
