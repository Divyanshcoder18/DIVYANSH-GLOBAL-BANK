import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, CheckCircle2, QrCode, Plus } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';

function TransferModal({ isOpen, onClose, fromAccountId, userEmail, onSuccess, initialRecipient }) {
  const [step, setStep] = useState(1);
  const [toAccount, setToAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  // VALIDATION STATE
  const [recipientName, setRecipientName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Auto-fill when scanned
  React.useEffect(() => {
    if (initialRecipient) {
      setToAccount(initialRecipient);
    }
  }, [initialRecipient]);

  // VPA LOOKUP LOGIC (Debounced)
  React.useEffect(() => {
    if (toAccount.includes('@')) {
      setIsValidating(true);
      setRecipientName('');
      setValidationError('');

      const delayDebounceFn = setTimeout(async () => {
        try {
          const res = await API.get(`/users/info/vpa/${toAccount}`);
          setRecipientName(res.data.name);
          setValidationError('');
        } catch (err) {
          setRecipientName('');
          setValidationError('Recipient not found on local network, but external UPI is supported!');
        } finally {
          setIsValidating(false);
        }
      }, 600);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setRecipientName('');
      setValidationError('');
      setIsValidating(false);
    }
  }, [toAccount]);

  // Magic UPI Link Generation
  const upiLink = step === 2 
    ? `upi://pay?pa=${toAccount}&pn=${encodeURIComponent(recipientName || 'External User')}&am=${amount}&cu=INR` 
    : '';

  const handleGenerateQR = (e) => {
    e.preventDefault();
    if (!toAccount || !amount) return toast.error("Please fill all fields");
    if (!toAccount.includes('@')) return toast.error("Real UPI transfers require an '@' VPA (e.g. friend@bank)");
    setStep(2);
  };

  const handleTransfer = async (e) => {
    if (e) e.preventDefault();
    if (!toAccount || !amount) return toast.error("Please fill all fields");

    setLoading(true);
    try {
      // Execute the transfer on the backend (deducts simulator credits, adds to recipient)
      await API.post('/transaction/transfer', {
        fromaccount: fromAccountId,
        toaccount: toAccount,
        amount: parseFloat(amount),
        idempotencyKey: `tx-${Date.now()}-${Math.random()}`,
        email: userEmail
      });
      
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-slate-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 border border-emerald-500/50`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-white">Transfer Logged!</p>
                <p className="mt-1 text-sm text-slate-400">Transaction recorded in your simulation history.</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-slate-800">
            <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-500 hover:text-blue-400">Close</button>
          </div>
        </div>
      ));
      
      onSuccess();
      setStep(1);
      setToAccount('');
      setAmount('');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Transfer failed");
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
              <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-400">
                {step === 1 ? <Send size={24} /> : <QrCode size={24} />}
              </div>
              <div>
                <h2 className="text-xl font-bold">{step === 1 ? "Transfer Money" : "Pay via Real UPI"}</h2>
                <p className="text-slate-500 text-sm">
                  {step === 1 ? "Send funds to another account" : "Scan to complete transfer"}
                </p>
              </div>
            </div>

            {step === 1 ? (
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Recipient (Account ID or UPI ID)</label>
                  <input 
                    type="text" 
                    value={toAccount}
                    onChange={(e) => setToAccount(e.target.value)}
                    placeholder="e.g. friend@oksbi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                  
                  {/* VALIDATION FEEDBACK UI */}
                  <AnimatePresence>
                    {isValidating && (
                      <motion.p 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mt-2 ml-1 animate-pulse"
                      >
                        Checking VPA...
                      </motion.p>
                    )}

                    {recipientName && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-500/5"
                      >
                        <CheckCircle2 size={16} className="text-emerald-400" />
                        <span className="text-xs font-bold text-emerald-400">Paying: {recipientName}</span>
                      </motion.div>
                    )}

                    {validationError && !isValidating && (
                      <motion.p 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }}
                        className="text-orange-400 text-[10px] font-bold uppercase tracking-widest mt-2 ml-1"
                      >
                        {validationError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Amount (₹)</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-mono text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={handleTransfer}
                    disabled={loading}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all border border-slate-700 flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <span>Simulated Transfer</span>
                    )}
                  </button>
                  <button 
                    type="button"
                    onClick={handleGenerateQR}
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-sm"
                  >
                    <span>Real UPI Transfer</span>
                    <QrCode size={16} />
                  </button>
                </div>
              </form>
            ) : (
              /* STEP 2: SHOW QR CODE & DIRECT LINK */
              <div className="space-y-6 flex flex-col items-center">
                
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
                  <p className="text-2xl font-bold text-blue-400 mb-1">₹{parseFloat(amount).toLocaleString()}</p>
                  <p className="text-xs text-slate-400">Paying: <strong className="text-white">{toAccount}</strong></p>
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

                <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl w-full">
                  <div className="flex items-center gap-2 text-blue-400 mb-1">
                    <AlertCircle size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Manual Verification</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    After you successfully pay via your UPI app, click below to log the transfer in your dashboard.
                  </p>
                </div>

                <button 
                  onClick={handleTransfer}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  {loading ? (
                     <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>I Have Paid via UPI</span>
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

export default TransferModal;
