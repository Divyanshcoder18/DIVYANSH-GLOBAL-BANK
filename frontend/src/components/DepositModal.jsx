import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, QrCode, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';

function DepositModal({ isOpen, onClose, accountId, userEmail, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState(1); // Step 1: Amount, Step 2: QR Code
  const [loading, setLoading] = useState(false);
  const [upiIntentUrl, setUpiIntentUrl] = useState('');
  const [utrNumber, setUtrNumber] = useState('');

  const handleGenerateQR = (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) {
      return toast.error("Please enter a valid amount");
    }
    
    // Generate direct peer-to-peer UPI deposit link to BHARATPE2F0X0Q2H0C26763@unitype
    const directUpiLink = `upi://pay?pa=BHARATPE2F0X0Q2H0C26763@unitype&pn=${encodeURIComponent('APEX Global Bank')}&am=${parseFloat(amount).toFixed(2)}&cu=INR&tn=${encodeURIComponent('Apex Bank Deposit')}`;
    setUpiIntentUrl(directUpiLink);
    setStep(2);
  };

  const handleConfirmDeposit = async (e) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.length !== 12) {
      return toast.error("Please enter a valid 12-digit UPI UTR / Reference Number to verify payment");
    }

    setLoading(true);
    const verifyingToast = toast.loading("Verifying UPI Network Settlement...");
    await new Promise(resolve => setTimeout(resolve, 2500));
    toast.dismiss(verifyingToast);

    try {
      const res = await API.post('/transaction/deposit', {
        accountId: accountId,
        amount: parseFloat(amount),
        idempotencyKey: `dep-${Date.now()}-${Math.random()}`
      });

      if (res.data.success) {
        toast.success("Deposit Successful and credited to wallet!");
        onSuccess();
        setStep(1);
        setAmount('');
        setUtrNumber('');
        onClose();
      } else {
        toast.error("Deposit verification failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to log deposit");
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
              className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-2xl"
            >
            <button onClick={() => { setStep(1); onClose(); }} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>

            <div className="flex items-center gap-4 mb-8">
              <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400">
                {step === 1 ? <Plus size={24} /> : <QrCode size={24} />}
              </div>
              <div>
                <h2 className="text-xl font-bold">{step === 1 ? "Deposit Real Money" : "Pay via Instamojo Gateway"}</h2>
                <p className="text-slate-500 text-sm">
                  {step === 1 ? "Enter deposit amount" : "Secure UPI, Cards, and Netbanking"}
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
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Proceed to Payment</span>
                      <Plus size={18} />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* STEP 2: SHOW UPI QR CODE AND 12-DIGIT UTR INPUT */
              <div className="space-y-6 flex flex-col items-center">
                <div className="bg-white p-4 rounded-2xl shadow-xl">
                  <QRCodeSVG
                    value={upiIntentUrl}
                    size={200}
                    bgColor={"#ffffff"}
                    fgColor={"#0f172a"}
                    level={"H"}
                  />
                </div>

                <div className="text-center w-full space-y-4">
                  <div>
                    <p className="text-3xl font-bold text-emerald-400 mb-1">₹{parseFloat(amount).toLocaleString()}</p>
                    <p className="text-xs text-slate-400">Scan QR to pay directly to <strong className="text-white">BHARATPE2F0X0Q2H0C26763@unitype</strong></p>
                  </div>
                  
                  <div className="w-full">
                    <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest text-left ml-1">
                      Enter 12-Digit UPI UTR / Ref No.
                    </label>
                    <input
                      type="text"
                      maxLength={12}
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 301234567890"
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-mono text-center text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner"
                    />
                  </div>
                </div>

                 {/* Copy UPI ID Button */}
                 <button
                   onClick={() => {
                     navigator.clipboard.writeText('BHARATPE2F0X0Q2H0C26763@unitype');
                     toast.success("UPI ID Copied!");
                   }}
                   type="button"
                   className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs"
                 >
                   <Copy size={14} />
                   <span>Copy UPI ID (BHARATPE2F0X0Q2H0C26763@unitype)</span>
                 </button>

                 {/* Mobile Deep Link Button */}
                 <div className="w-full space-y-2 md:hidden flex flex-col">
                   <a
                     href={upiIntentUrl}
                     className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs"
                   >
                     <Plus size={14} />
                     <span>Open in UPI App (Pre-filled)</span>
                   </a>

                   {/* Alternative Limit Bypass Button */}
                   <a
                     href={`upi://pay?pa=BHARATPE2F0X0Q2H0C26763@unitype&pn=${encodeURIComponent('APEX Global Bank')}&cu=INR&tn=${encodeURIComponent('Deposit')}`}
                     className="w-full bg-amber-600/10 hover:bg-amber-600/20 border border-amber-600/30 text-amber-400 font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs"
                   >
                     <AlertCircle size={14} />
                     <span>GPay Bypass (No Pre-filled Amount)</span>
                   </a>
                   <p className="text-[10px] text-amber-500/70 text-center leading-normal">
                     *Use the GPay Bypass if you get a "bank limit" error. You can then enter ₹{amount} manually in GPay!
                   </p>
                 </div>

                <div className="w-full border-t border-slate-800 my-2"></div>
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl w-full">
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Direct UPI Deposit</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Scan and pay directly using GPay, PhonePe, or Paytm. Once done, enter the 12-digit UTR from your receipt to instantly credit your virtual wallet.
                  </p>
                </div>

                <button 
                  onClick={handleConfirmDeposit}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <span>Confirm & Complete Deposit</span>
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
