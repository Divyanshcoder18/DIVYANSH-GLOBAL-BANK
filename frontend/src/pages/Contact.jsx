import React from 'react';
import { Mail, MapPin, Code, MessageSquare, ArrowLeft, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

function Contact() {
  return (
    <div className="min-h-screen bg-slate-950 text-white py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-bold mb-4 uppercase tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Project Inquiry
          </h1>
          <p className="text-slate-400">Get in touch with the developer regarding this portfolio simulation.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Developer Email</h3>
                  <p className="text-slate-400 text-sm">divyanshcoder18@gmail.com</p>
                  <p className="text-slate-500 text-xs mt-1">Response time: &lt; 24 hours</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Mailing Address</h3>
                  <p className="text-slate-400 text-sm">District Kangra, Himachal Pradesh</p>
                  <p className="text-slate-400 text-sm">Pin: 176022, India</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 backdrop-blur-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400">
                  <Code size={24} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Technical Stack</h3>
                  <p className="text-slate-400 text-sm">React, Node.js, Microservices</p>
                  <p className="text-emerald-500 text-xs mt-1">Status: Open for Collaboration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Form Placeholder */}
          <div className="bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
            <h3 className="text-xl font-semibold mb-6 uppercase tracking-tighter">Send a Message</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">Full Name</label>
                <input type="text" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none" placeholder="Enter your name" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Email Address</label>
                <input type="email" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Inquiry Type</label>
                <select className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm focus:border-blue-500 outline-none text-slate-400">
                  <option>Simulation Feedback</option>
                  <option>Technical Question</option>
                  <option>Hiring/Collaboration</option>
                </select>
              </div>
              <button className="w-full py-4 bg-blue-600 hover:bg-blue-500 transition-colors rounded-xl font-semibold uppercase tracking-widest text-xs">
                Submit Inquiry
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
