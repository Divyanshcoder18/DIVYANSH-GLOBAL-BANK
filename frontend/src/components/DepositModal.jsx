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
  const [upiIntentUrl, setUpiIntentUrl] = useState('');
  const [clientTxnId, setClientTxnId] = useState('');

  const handleGenerateQR = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) {
      return toast.error("Please enter a valid amount");
    }
    
    setLoading(true);
    try {
      const res = await API.post('/transaction/deposit/instamojo', {
        accountId: accountId,
        amount: parseFloat(amount)
      });

      if (res.data.success) {
        setUpiIntentUrl(res.data.payment_url);
        setClientTxnId(res.data.payment_request_id);
        // Open the secure Instamojo payment link in a new tab
        window.open(res.data.payment_url, '_blank', 'noopener,noreferrer');
        setStep(2);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to contact payment gateway");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (step !== 2 || !clientTxnId) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const res = await API.get(`/transaction/deposit/status/${clientTxnId}`);
        if (res.data.success && res.data.status === 'SUCCESS') {
          clearInterval(interval);
          if (isMounted) {
            toast.success("Deposit Successful!");
            onSuccess();
            onClose();
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [step, clientTxnId, onSuccess, onClose]);

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
              /* STEP 2: OPEN CHEKOUT LINK */
              <div className="space-y-6 flex flex-col items-center">

                <div className="text-center my-4">
                  <p className="text-4xl font-bold text-emerald-400 mb-2">₹{parseFloat(amount).toLocaleString()}</p>
                  <p className="text-xs text-slate-400">Secure transaction handled by Instamojo</p>
                </div>

                <a
                  href={upiIntentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                >
                  <QrCode size={18} />
                  <span>Click to Pay (Real Money)</span>
                </a>

                <p className="text-[10px] text-slate-500 text-center">
                  *If the checkout page did not open automatically, click the button above to pay.
                </p>

                <div className="w-full border-t border-slate-800 my-2"></div>

                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl w-full">
                  <div className="flex items-center gap-2 text-blue-400 mb-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold uppercase tracking-wider">Listening for Payment...</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Once you complete the payment on the Instamojo page, this modal will automatically close and credit your wallet instantly.
                  </p>
                </div>

                <div className="w-full bg-slate-800/50 border border-slate-800 text-slate-400 font-bold py-4 rounded-2xl flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-slate-500/30 border-t-slate-400 rounded-full animate-spin"></div>
                  <span>Awaiting Bank Confirmation</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default DepositModal;
