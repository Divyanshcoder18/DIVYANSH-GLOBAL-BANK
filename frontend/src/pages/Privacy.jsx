import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Shield, Database, UserCheck } from 'lucide-react';

function Privacy() {
  return (
    <div className="min-h-screen bg-slate-950 text-white py-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 mb-4">
            <Eye size={32} />
          </div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Privacy Policy
          </h1>
          <p className="text-slate-400">Your data security is our top priority.</p>
        </motion.div>

        {/* Content Section */}
        <div className="space-y-8 text-slate-300 leading-relaxed bg-slate-900/50 p-8 rounded-3xl border border-slate-800 backdrop-blur-xl">
          <section>
            <div className="flex items-center gap-3 mb-3">
              <Database className="text-indigo-400" size={20} />
              <h2 className="text-xl font-semibold text-white">1. Data Collection</h2>
            </div>
            <p>We collect basic information such as your name, email address, and transaction history to provide you with a seamless banking experience. We do not collect or store your sensitive payment passwords on our servers.</p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <Shield className="text-indigo-400" size={20} />
              <h2 className="text-xl font-semibold text-white">2. Security Measures</h2>
            </div>
            <p>All transaction data is encrypted using industry-standard SSL technology. Your session is protected by secure JWT tokens, ensuring that only you can access your personal financial information.</p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3">
              <UserCheck className="text-indigo-400" size={20} />
              <h2 className="text-xl font-semibold text-white">3. Third-Party Sharing</h2>
            </div>
            <p>We share necessary data with our payment partner, <strong>Razorpay</strong>, solely for the purpose of processing your transactions. We never sell your personal data to any marketing agencies or third parties.</p>
          </section>

          <div className="pt-8 border-t border-slate-800 text-sm text-slate-500 italic text-center">
            For any privacy-related concerns, please contact our Data Protection Officer at privacy@apexbank.example.com
          </div>
        </div>
      </div>
    </div>
  );
}

export default Privacy;
