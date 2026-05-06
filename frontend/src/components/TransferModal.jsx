import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, CheckCircle2, QrCode, Plus, Landmark } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';

function TransferModal({ isOpen, onClose, fromAccountId, userEmail, onSuccess, initialRecipient }) {
  const [step, setStep] = useState(1);
  const [transferType, setTransferType] = useState('UPI'); // 'UPI' or 'BANK'

  // Form State
  const [toAccount, setToAccount] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [amount, setAmount] = useState('');

  const [loading, setLoading] = useState(false);

  // VALIDATION STATE
  const [recipientName, setRecipientName] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Auto-fill when scanned
  React.useEffect(() => {
    if (initialRecipient) {
      setTransferType('UPI');
      setToAccount(initialRecipient);
    }
  }, [initialRecipient]);

  // VPA LOOKUP LOGIC (Debounced)
  React.useEffect(() => {
    if (transferType === 'UPI' && toAccount.includes('@')) {
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
          setValidationError('Recipient not found on local network. Will be processed as External UPI.');
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
  }, [toAccount, transferType]);

  // Magic UPI Link Generation (Only for UPI transfers)
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

    // Validate based on type
    if (transferType === 'UPI') {
      if (!toAccount || !amount) return toast.error("Please fill all fields");
    } else {
      if (!accountNumber || !ifscCode || !amount) return toast.error("Please fill all Bank details");
    }

    setLoading(true);
    try {
      // If it's a Bank Transfer, we construct a fake VPA to trick our robust backend into logging it!
      const finalToAccount = transferType === 'BANK' ? `${accountNumber}@${ifscCode}.ifsc` : toAccount;

      const res = await API.post('/transaction/transfer', {
        fromaccount: fromAccountId,
        toaccount: finalToAccount,
        amount: parseFloat(amount),
        idempotencyKey: `tx-${Date.now()}-${Math.random()}`,
        email: userEmail
      });

      // PASS TRANSACTION DATA BACK FOR THE FULL-SCREEN OVERLAY
      if (res.data.transaction) {
        onSuccess({ ...res.data.transaction, type: 'TRANSFER_SENT' });
      } else {
        // Fallback if transaction object isn't returned
        onSuccess({
          amount: parseFloat(amount),
          from: fromAccountId,
          type: 'TRANSFER_SENT'
        });
      }

      // Reset Modal State
      setStep(1);
      setToAccount('');
      setAccountNumber('');
      setIfscCode('');
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
                  {step === 1 ? "Send funds securely" : "Scan to complete transfer"}
                </p>
              </div>
            </div>

            {step === 1 ? (
              <form className="space-y-6">

                {/* TRANSFER TYPE TOGGLE */}
                <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-2xl">
                  <button
                    type="button"
                    onClick={() => setTransferType('UPI')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${transferType === 'UPI' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    <QrCode size={14} /> UPI ID
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransferType('BANK')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${transferType === 'BANK' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    <Landmark size={14} /> Bank / IMPS
                  </button>
                </div>

                {/* CONDITIONAL INPUT FIELDS */}
                <AnimatePresence mode="wait">
                  {transferType === 'UPI' ? (
                    <motion.div
                      key="upi"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                    >
                      <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Recipient UPI ID</label>
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
                    </motion.div>
                  ) : (
                    <motion.div
                      key="bank"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Account Number</label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="0000 0000 0000"
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">IFSC Code</label>
                        <input
                          type="text"
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                          placeholder="e.g. SBIN0001234"
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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
                    className={`${transferType === 'BANK' ? 'w-full' : 'flex-1'} bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-white font-bold py-4 rounded-2xl transition-all border border-slate-700 flex items-center justify-center gap-2 text-sm`}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <span>{transferType === 'BANK' ? 'Simulate IMPS Transfer' : 'Simulated Transfer'}</span>
                    )}
                  </button>

                  {transferType === 'UPI' && (
                    <button
                      type="button"
                      onClick={handleGenerateQR}
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-sm"
                    >
                      <span>Real UPI Transfer</span>
                      <QrCode size={16} />
                    </button>
                  )}
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
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl w-full">
                  <div className="flex items-center gap-2 text-emerald-400 mb-1">
                    <CheckCircle2 size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider">Direct UPI Payment</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Scan and pay directly using any UPI app. Since this is an external payment, your personal bank statement will reflect the transaction.
                  </p>
                </div>

                <button 
                  onClick={() => { setStep(1); onClose(); }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl transition-all border border-slate-700 flex items-center justify-center gap-2"
                >
                  <span>Done / Close</span>
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
