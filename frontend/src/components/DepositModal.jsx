import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, QrCode, CheckCircle2, AlertCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';

function DepositModal({ isOpen, onClose, accountId, userEmail, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState(1); // Step 1: Amount, Step 2: QR Code
  const [loading, setLoading] = useState(false);

  // Your real UPI Details
  const upiId = "kaliadivyansh77-1@oksbi";
  const payeeName = "Divyansh Kalia";

  // Generate the Magic UPI Intent Link
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR`;

  const handleGenerateQR = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) {
      return toast.error("Please enter a valid amount");
    }
    setStep(2);
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      // We bypass Razorpay and directly credit the account for the portfolio demo
      const res = await API.post('/transaction/deposit', {
        accountId: accountId,
        amount: parseFloat(amount),
        idempotencyKey: `deposit_${Date.now()}`
      });

      if (res.data.success) {
        toast.success("Payment Verified! Simulator Credits Added.");
        onSuccess();
        setTimeout(() => {
          setStep(1);
          setAmount('');
          onClose();
        }, 1500);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process deposit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl"
          >
            <button onClick={() => { setStep(1); onClose(); }} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400">
                {step === 1 ? <Plus size={24} /> : <QrCode size={24} />}
              </div>
              <div>
                <h2 className="text-xl font-bold">{step === 1 ? "Add Simulator Credits" : "Scan to Pay (Real Money)"}</h2>
                <p className="text-slate-500 text-sm">
                  {step === 1 ? "Enter deposit amount" : "Use GPay, PhonePe, or Paytm"}
                </p>
              </div>
            </div>

            {step === 1 ? (
              /* STEP 1: ENTER AMOUNT */
              <form onSubmit={handleGenerateQR} className="space-y-6">
                <div className="relative group">
                  <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Amount to Add</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-light text-slate-600">₹</span>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      autoFocus
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 pl-10 text-white font-mono text-3xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all placeholder:text-slate-800"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  <span>Generate Payment Link</span>
                  <QrCode size={18} />
                </button>
              </form>
            ) : (
              /* STEP 2: SHOW QR CODE & DIRECT LINK */
              <div className="space-y-6 flex flex-col items-center">
                
                {/* The QR Code Generator */}
                <div className="bg-white p-4 rounded-2xl shadow-xl">
                  <QRCodeSVG 
                    value={upiLink} 
                    size={200}
                    bgColor={"#ffffff"}
                    fgColor={"#0f172a"}
                    level={"H"}
                  />
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-400 mb-1">₹{parseFloat(amount).toLocaleString()}</p>
                  <p className="text-xs text-slate-400">Paying to: <strong className="text-white">{payeeName}</strong></p>
                </div>

                {/* Mobile Deep Link Button */}
                <a 
                  href={upiLink}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 md:hidden"
                >
                  <Plus size={16} />
                  <span>Open in UPI App (Mobile Only)</span>
                </a>

                <div className="w-full border-t border-slate-800 my-2"></div>

                <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl w-full">
                  <div className="flex items-center gap-2 text-orange-400 mb-1">
                    <AlertCircle size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Manual Verification</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    After you successfully pay via your UPI app, click the button below to credit your account.
                  </p>
                </div>

                <button 
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                     <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>I Have Completed Payment</span>
                      <CheckCircle2 size={18} />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default DepositModal;
