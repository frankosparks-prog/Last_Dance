// 'use client';

// import React, { useState } from 'react';
// import { X, Vote, CheckCircle2, ShieldCheck, Phone, Zap } from 'lucide-react';
// import axios from 'axios';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// const VOTE_PACKAGES = [
//   { label: 'Single Vote', votes: 1, priceKES: 10, discountText: '', isPopular: false },
//   { label: '10-Vote Power Pack', votes: 10, priceKES: 90, discountText: 'Save 10%', isPopular: true },
//   { label: '25-Vote Boost Pack', votes: 25, priceKES: 200, discountText: 'Save 20%', isPopular: false },
//   { label: '50-Vote Legend Pack', votes: 50, priceKES: 380, discountText: 'Save 24%', isPopular: false }
// ];

// export default function VoteModal({ candidate, onClose, onSuccess }) {
//   const [selectedPkg, setSelectedPkg] = useState(VOTE_PACKAGES[1]);
//   const [customVotes, setCustomVotes] = useState('');
//   const [phone, setPhone] = useState('');
//   const [status, setStatus] = useState({ loading: false, success: false, error: '', checkoutRequestID: '' });

//   if (!candidate) return null;

//   const votesCount = customVotes && Number(customVotes) > 0 ? Number(customVotes) : selectedPkg.votes;
//   const amountKES = customVotes && Number(customVotes) > 0 ? Number(customVotes) * 10 : selectedPkg.priceKES;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus({ loading: true, success: false, error: '', checkoutRequestID: '' });

//     try {
//       const res = await axios.post(`${API_BASE_URL}/last-dance/cast-vote`, {
//         candidateId: candidate._id,
//         votesCount,
//         phone
//       });

//       if (res.data.success) {
//         const checkoutReqID = res.data.checkoutRequestID;
//         setStatus({
//           loading: false,
//           success: true,
//           error: '',
//           checkoutRequestID: checkoutReqID
//         });

//         // Trigger simulation fallback in test mode after 1.5s if needed
//         try {
//           await axios.post(`${API_BASE_URL}/last-dance/test-simulate-payment`, { checkoutRequestID: checkoutReqID });
//         } catch (simErr) {
//           // Simulation optional
//         }

//         if (onSuccess) onSuccess();
//       } else {
//         setStatus({ loading: false, success: false, error: res.data.message || 'Vote payment failed.' });
//       }
//     } catch (err) {
//       setStatus({
//         loading: false,
//         success: false,
//         error: err.response?.data?.message || 'M-Pesa STK push failed.'
//       });
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto font-sans">
//       <div className="relative bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl w-full max-w-md text-slate-900 shadow-2xl my-auto">
        
//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition"
//         >
//           <X className="w-4 h-4" />
//         </button>

//         {/* Candidate Profile Header */}
//         <div className="text-center mb-6">
//           <div className="relative inline-block mb-3">
//             <img
//               src={candidate.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
//               alt={candidate.name}
//               className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100 shadow-sm mx-auto"
//             />
//           </div>
//           <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
//             {candidate.category}
//           </span>
//           <h3 className="text-xl font-bold tracking-tight text-slate-900 mt-2">{candidate.name}</h3>
//           <p className="text-xs text-slate-500 font-medium mt-0.5">
//             Current Score: <span className="font-bold text-slate-900">{(candidate.voteCount || 0).toLocaleString()} votes</span>
//           </p>
//         </div>

//         {status.success ? (
//           <div className="text-center py-6 space-y-4">
//             <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
//             <h4 className="text-lg font-bold text-slate-900">M-Pesa STK Prompt Triggered!</h4>
//             <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
//               Please enter your M-Pesa PIN on your phone to cast <strong>{votesCount} votes</strong> for <strong>{candidate.name}</strong> (KES {amountKES}).
//             </p>
//             <button
//               onClick={onClose}
//               className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition"
//             >
//               Done / Close
//             </button>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {status.error && (
//               <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold">
//                 {status.error}
//               </div>
//             )}

//             {/* Select Vote Package Grid */}
//             <div>
//               <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
//                 Select Vote Package
//               </label>
//               <div className="grid grid-cols-2 gap-2.5">
//                 {VOTE_PACKAGES.map((pkg) => {
//                   const isSelected = !customVotes && selectedPkg.votes === pkg.votes;
//                   return (
//                     <button
//                       type="button"
//                       key={pkg.votes}
//                       onClick={() => {
//                         setSelectedPkg(pkg);
//                         setCustomVotes('');
//                       }}
//                       className={`relative p-3.5 rounded-xl border text-left transition ${
//                         isSelected
//                           ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
//                           : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100 text-slate-900'
//                       }`}
//                     >
//                       {pkg.isPopular && (
//                         <span className={`absolute -top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
//                           isSelected ? 'bg-amber-400 text-slate-950' : 'bg-slate-900 text-amber-400'
//                         }`}>
//                           Popular
//                         </span>
//                       )}
//                       <div className="font-bold text-xs">{pkg.votes} Vote{pkg.votes > 1 ? 's' : ''}</div>
//                       <div className={`font-extrabold text-sm mt-0.5 ${isSelected ? 'text-amber-300' : 'text-rose-600'}`}>
//                         KES {pkg.priceKES}
//                       </div>
//                       {pkg.discountText && (
//                         <div className={`text-[10px] font-bold mt-1 ${isSelected ? 'text-slate-300' : 'text-emerald-700'}`}>
//                           {pkg.discountText}
//                         </div>
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Custom Vote Input */}
//             <div>
//               <div className="flex justify-between items-center mb-1">
//                 <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Custom Vote Quantity</label>
//                 <span className="text-[10px] text-slate-400 font-semibold">1 Vote = KES 10</span>
//               </div>
//               <input
//                 type="number"
//                 min="1"
//                 placeholder="Enter custom vote count..."
//                 value={customVotes}
//                 onChange={(e) => setCustomVotes(e.target.value)}
//                 className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-slate-900 transition"
//               />
//             </div>

//             {/* M-Pesa Phone Input */}
//             <div>
//               <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
//                 M-Pesa Phone Number
//               </label>
//               <div className="relative">
//                 <input
//                   type="tel"
//                   required
//                   placeholder="0712345678"
//                   value={phone}
//                   onChange={(e) => setPhone(e.target.value)}
//                   className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-slate-900 transition"
//                 />
//                 <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
//               </div>
//             </div>

//             {/* Total Payable Summary */}
//             <div className="pt-3 border-t border-slate-100 space-y-3">
//               <div className="flex justify-between items-center text-xs font-bold text-slate-900">
//                 <span>Total Amount Payable:</span>
//                 <span className="text-rose-600 text-base font-extrabold">KES {amountKES.toLocaleString()}</span>
//               </div>

//               <button
//                 type="submit"
//                 disabled={status.loading}
//                 className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
//               >
//                 <Vote className="w-4 h-4 text-amber-300" />
//                 {status.loading ? 'Sending M-Pesa Prompt...' : `Cast ${votesCount} Vote${votesCount > 1 ? 's' : ''} (KES ${amountKES.toLocaleString()})`}
//               </button>

//               <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
//                 <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Instant M-Pesa Integration
//               </div>
//             </div>
//           </form>
//         )}
//       </div>
//     </div>
//   );
// }








'use client';

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import { X, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://lastdance.co.ke/api';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  'https://lastdance.co.ke';

/* =========================================================
   IMAGE URLS
========================================================= */

const VOTE_TICKET_IMAGE =
  'https://ik.imagekit.io/rhjfaafsm/Voteticketlastdance.svg';

const MPESA_SECURE_IMAGE =
  'https://ik.imagekit.io/rhjfaafsm/paysecurely.svg';

const FALLBACK_CANDIDATE_IMAGE =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';

/* =========================================================
   VOTE PACKAGES
========================================================= */

const VOTE_PACKAGES = [
  {
    label: 'Single Vote',
    votes: 1,
    priceKES: 10,
    discountText: '',
    isPopular: false,
  },

  {
    label: '10-Vote Power Pack',
    votes: 10,
    priceKES: 90,
    discountText: 'Save 10%',
    isPopular: true,
  },

  {
    label: '25-Vote Boost Pack',
    votes: 25,
    priceKES: 200,
    discountText: 'Save 20%',
    isPopular: false,
  },

  {
    label: '50-Vote Legend Pack',
    votes: 50,
    priceKES: 380,
    discountText: 'Save 24%',
    isPopular: false,
  },
];

/* =========================================================
   VOTE MODAL
========================================================= */

export default function VoteModal({
  candidate,
  onClose,
  onSuccess,
}) {
  const [
    selectedPkg,
    setSelectedPkg,
  ] = useState(
    VOTE_PACKAGES[1]
  );

  const [
    customVotes,
    setCustomVotes,
  ] = useState('');

  const [
    phone,
    setPhone,
  ] = useState('');

  // 'idle' | 'initiating' | 'awaiting_pin' | 'confirmed' | 'failed'
  const [paymentStage, setPaymentStage] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [checkoutRequestID, setCheckoutRequestID] = useState('');
  const [pollCountdown, setPollCountdown] = useState(90);
  const [isVerifyingManually, setIsVerifyingManually] = useState(false);

  const pollIntervalRef = useRef(null);
  const socketRef = useRef(null);

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopPolling();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handlePaymentSuccess = () => {
    stopPolling();
    setPaymentStage('confirmed');
    setErrorMessage('');
    setIsVerifyingManually(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  const handlePaymentFailure = (msg) => {
    stopPolling();
    setPaymentStage('failed');
    setErrorMessage(msg || 'Payment was cancelled or failed on your mobile device. Please try again.');
    setIsVerifyingManually(false);
  };

  const checkStatusManually = async () => {
    if (!checkoutRequestID || isVerifyingManually) return;
    setIsVerifyingManually(true);
    setErrorMessage('');

    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/payment-status/${checkoutRequestID}`);
      if (res.data?.success && res.data.status === 'completed') {
        handlePaymentSuccess();
      } else if (res.data?.status === 'failed') {
        handlePaymentFailure('Payment was cancelled or failed on your mobile device.');
      } else {
        setErrorMessage('Vote payment is still awaiting confirmation from M-Pesa. If you have entered your PIN, please wait a moment and tap verify again.');
      }
    } catch (err) {
      setErrorMessage('Could not query payment status right now. Please ensure you entered your PIN and tap Verify again.');
    } finally {
      setIsVerifyingManually(false);
    }
  };

  const startPollingPayment = (reqId) => {
    stopPolling();
    let seconds = 90;
    setPollCountdown(seconds);

    // 1. WebSocket real-time push
    try {
      const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
      socketRef.current = socket;

      socket.on(`last_dance:vote_paid:${reqId}`, (data) => {
        console.log('[LastDance] Instant real-time vote payment confirmation:', data);
        handlePaymentSuccess();
      });

      socket.on(`last_dance:vote_failed:${reqId}`, (data) => {
        console.log('[LastDance] Vote payment failed:', data);
        handlePaymentFailure(data.message);
      });
    } catch (wsErr) {
      console.warn('[LastDance] WebSocket error:', wsErr.message);
    }

    // 2. High-frequency 2-second HTTP polling with in-flight lock
    let inFlight = false;
    pollIntervalRef.current = setInterval(async () => {
      seconds -= 2;
      setPollCountdown(Math.max(0, Math.round(seconds)));

      if (inFlight) return;
      inFlight = true;

      try {
        const res = await axios.get(`${API_BASE_URL}/last-dance/payment-status/${reqId}`);
        if (res.data?.success && res.data.status === 'completed') {
          handlePaymentSuccess();
          return;
        } else if (res.data?.status === 'failed') {
          handlePaymentFailure('Payment was cancelled or failed on your device.');
          return;
        }
      } catch (err) {
        // Continue polling until countdown expires
      } finally {
        inFlight = false;
      }

      if (seconds <= 0) {
        stopPolling();
      }
    }, 2000);
  };

  const resetForm = () => {
    stopPolling();
    setPaymentStage('idle');
    setErrorMessage('');
    setCheckoutRequestID('');
    setIsVerifyingManually(false);
  };

  /* =======================================================
     LOCK BODY SCROLL
  ======================================================= */

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      'hidden';

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, []);

  /* =======================================================
     ESCAPE KEY
  ======================================================= */

  useEffect(() => {
    const handleKeyDown =
      (event) => {
        if (
          event.key === 'Escape'
        ) {
          onClose?.();
        }
      };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [onClose]);

  if (!candidate) {
    return null;
  }

  /* =======================================================
     VOTE / PAYMENT CALCULATIONS
  ======================================================= */

  const hasCustomVotes =
    customVotes &&
    Number(customVotes) > 0;

  const votesCount =
    hasCustomVotes
      ? Number(customVotes)
      : selectedPkg.votes;

  const amountKES =
    hasCustomVotes
      ? Number(customVotes) * 10
      : selectedPkg.priceKES;

  /* =======================================================
     SUBMIT VOTE
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setPaymentStage('initiating');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/last-dance/cast-vote`,
        {
          candidateId: candidate._id,
          votesCount,
          phone,
        }
      );

      if (response.data?.success) {
        const reqId = response.data.checkoutRequestID;
        setCheckoutRequestID(reqId);
        setPaymentStage('awaiting_pin');
        startPollingPayment(reqId);
        return;
      }

      setPaymentStage('idle');
      setErrorMessage(response.data?.message || 'Vote payment initiation failed.');
    } catch (error) {
      setPaymentStage('idle');
      setErrorMessage(
        error.response?.data?.message ||
        'M-Pesa STK push prompt failed to trigger. Please check your phone number and network.'
      );
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[9999]
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-black/65
        p-4
        backdrop-blur-sm

        sm:p-6
      "
      style={{
        fontFamily:
          'Roboto, sans-serif',
      }}
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      {/* =====================================================
          MODAL
      ====================================================== */}

      <div
        className="
          relative
          my-auto
          w-full
          max-w-[460px]
          overflow-hidden
          bg-white
          shadow-[0_24px_70px_rgba(0,0,0,0.22)]
        "
      >
        {/* ===================================================
            CLOSE
        ==================================================== */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close voting modal"
          className="
            absolute
            right-3
            top-3
            z-30
            flex
            h-9
            w-9
            items-center
            justify-center
            bg-black/65
            text-white
            backdrop-blur-sm
            transition-colors

            hover:bg-[#762e99]
          "
        >
          <X
            className="
              h-4
              w-4
            "
          />
        </button>

        {/* ===================================================
            VOTE TICKET ARTWORK

            125px high
            Full modal width
            No border
            No frame
            No radius
        ==================================================== */}

        <div
          className="
            flex
            h-[125px]
            w-full
            items-center
            justify-center
            overflow-hidden
            bg-transparent
          "
        >
          <img
            src={
              VOTE_TICKET_IMAGE
            }
            alt="Last Dance voting"
            className="
              block
              h-full
              w-full
              object-contain
              object-center
            "
          />
        </div>

        {/* ===================================================
            CONTENT
        ==================================================== */}

        <div
          className="
            px-6
            pb-7
            pt-6

            sm:px-8
            sm:pb-8
          "
        >
          {/* =================================================
              CANDIDATE SUMMARY
          ================================================= */}

          <div
            className="
              flex
              items-center
              gap-4
              border-b
              border-black/[0.08]
              pb-5
            "
          >
            <div
              className="
                h-[64px]
                w-[64px]
                shrink-0
                overflow-hidden
                bg-[#eeeeee]
              "
            >
              <img
                src={
                  candidate.photoUrl ||
                  FALLBACK_CANDIDATE_IMAGE
                }
                alt={
                  candidate.name
                }
                className="
                  h-full
                  w-full
                  object-cover
                  object-top
                "
              />
            </div>

            <div
              className="
                min-w-0
                flex-1
              "
            >
              <p
                className="
                  truncate
                  text-[11px]
                  font-medium
                  text-[#ff914d]
                "
              >
                {
                  candidate.category
                }
              </p>

              <h3
                className="
                  mt-1
                  truncate
                  text-[21px]
                  font-medium
                  leading-[1.2]
                  tracking-[-0.02em]
                  text-black
                "
              >
                {candidate.name}
              </h3>

              <p
                className="
                  mt-1
                  text-[12px]
                  text-black/45
                "
              >
                Current score:{' '}

                <span
                  className="
                    font-medium
                    text-black
                  "
                >
                  {(
                    candidate.voteCount ||
                    0
                  ).toLocaleString()}{' '}
                  votes
                </span>
              </p>
            </div>
          </div>

          {paymentStage === 'confirmed' ? (
            /* =================================================
                CONFIRMED SUCCESS
            ================================================= */

            <div className="py-7 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 text-2xl font-bold">
                ✓
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Votes Verified & Counted
              </div>

              <h4 className="mt-3 text-[24px] font-semibold leading-[1.2] tracking-[-0.02em] text-black">
                Votes Successfully Recorded!
              </h4>

              <p className="mt-2 text-[13.5px] font-normal leading-[1.65] text-[#242424]">
                You have officially cast <strong>{votesCount} vote{votesCount > 1 ? 's' : ''}</strong> for <strong>{candidate.name}</strong>.
              </p>

              {/* =========================================
                  VOTE SUMMARY
              ========================================== */}

              <div className="mt-5 rounded-2xl border border-black/10 bg-[#f7f7f7] p-4 text-[12.5px] space-y-2">
                <div className="flex justify-between items-center text-black/60 pb-2 border-b border-black/[0.08]">
                  <span>Candidate</span>
                  <span className="font-semibold text-black">{candidate.name}</span>
                </div>
                <div className="flex justify-between items-center text-black/60">
                  <span>Votes Added</span>
                  <span className="font-semibold text-emerald-700">+{votesCount} Votes</span>
                </div>
                <div className="flex justify-between items-center text-black/60">
                  <span>Amount Paid</span>
                  <span className="font-bold text-black">KES {amountKES.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-6 w-full rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] px-5 py-3.5 text-[14px] font-medium text-white shadow-md hover:opacity-90 transition-all active:scale-[0.99]"
              >
                Close & Return
              </button>
            </div>
          ) : paymentStage === 'awaiting_pin' ? (
            /* =================================================
                AWAITING PIN STATE
            ================================================= */

            <div className="py-7 text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff914d] text-white shadow-md shadow-[#ff914d]/30">
                <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-800">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                Awaiting PIN Entry on Phone
              </div>

              <h4 className="mt-3 text-[24px] font-medium leading-[1.2] tracking-[-0.02em] text-black">
                Check your phone.
              </h4>

              <p className="mt-2 text-[13.5px] font-normal leading-[1.65] text-[#242424]">
                An M-Pesa prompt for <strong>KES {amountKES.toLocaleString()}</strong> has been sent to <strong className="text-black">{phone}</strong> for {votesCount} vote{votesCount > 1 ? 's' : ''}.
              </p>

              <div className="mt-4 rounded-2xl border border-black/10 bg-[#f7f7f7] p-3.5 text-[12px] text-black/70 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-black/10 text-[10px] font-bold text-black">1</span>
                  <span>Unlock your phone screen now.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-black/10 text-[10px] font-bold text-black">2</span>
                  <span>Enter your M-Pesa PIN on the prompt to authorize your vote.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-black/10 text-[10px] font-bold text-black">3</span>
                  <span>Votes will be credited immediately upon confirmation.</span>
                </div>
              </div>

              {errorMessage && (
                <div className="mt-3 border-l-2 border-amber-500 bg-amber-50 px-3.5 py-2.5 text-[12px] leading-[1.5] text-amber-800 rounded-r-lg">
                  {errorMessage}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-3 text-[12px] text-black/50">
                <div className="flex items-center gap-2">
                  <RefreshCw className={`w-3.5 h-3.5 ${pollCountdown > 0 ? 'animate-spin' : ''} text-[#762e99]`} />
                  <span>
                    {pollCountdown > 0 
                      ? `Verifying vote payment (${pollCountdown}s)`
                      : 'Waiting for network confirmation...'}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                <button
                  type="button"
                  onClick={checkStatusManually}
                  disabled={isVerifyingManually}
                  className="w-full rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] py-3 px-4 text-[13px] font-medium text-white shadow-md hover:opacity-95 transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isVerifyingManually ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Checking with M-Pesa / PayHero...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      I have entered my PIN — Verify Vote
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full rounded-full border border-black/15 py-2.5 text-[12.5px] font-medium text-black hover:bg-black/5 transition"
                >
                  Cancel / Change Number
                </button>
              </div>
            </div>
          ) : (
            /* =================================================
                FORM
            ================================================= */

            <form
              onSubmit={
                handleSubmit
              }
              className="
                pt-6
              "
            >
              {/* ===========================================
                  HEADER
              ============================================ */}

              <div
                className="
                  mb-5
                "
              >
                <p
                  className="
                    text-[12px]
                    font-medium
                    text-[#ff914d]
                  "
                >
                  Cast your vote
                </p>

                <h4
                  className="
                    mt-1
                    text-[25px]
                    font-medium
                    leading-[1.2]
                    tracking-[-0.02em]
                    text-black
                  "
                >
                  Choose a voting package
                </h4>

                <p
                  className="
                    mt-2
                    text-[12px]
                    leading-[1.55]
                    text-black/45
                  "
                >
                  Select a package or enter
                  a custom number of votes.
                </p>
              </div>

              {/* ===========================================
                  ERROR
              ============================================ */}

              {errorMessage && (
                <div
                  className="
                    mb-5
                    border-l-2
                    border-red-500
                    bg-red-50
                    px-4
                    py-3
                    text-[13px]
                    leading-[1.5]
                    text-red-700
                  "
                >
                  {errorMessage}
                </div>
              )}

              {/* ===========================================
                  VOTE PACKAGES
              ============================================ */}

              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                "
              >
                {VOTE_PACKAGES.map(
                  (pkg) => {
                    const isSelected =
                      !customVotes &&
                      selectedPkg.votes ===
                        pkg.votes;

                    return (
                      <button
                        key={
                          pkg.votes
                        }
                        type="button"
                        onClick={() => {
                          setSelectedPkg(
                            pkg
                          );

                          setCustomVotes(
                            ''
                          );
                        }}
                        className={`
                          relative
                          min-h-[112px]
                          border
                          p-4
                          text-left
                          transition-all
                          duration-200

                          ${
                            isSelected
                              ? `
                                border-[#762e99]
                                bg-[#762e99]
                                text-white
                                shadow-[0_10px_25px_rgba(118,46,153,0.18)]
                              `
                              : `
                                border-black/10
                                bg-white
                                text-black

                                hover:border-[#762e99]/45
                              `
                          }
                        `}
                      >
                        {/* Popular */}

                        {pkg.isPopular && (
                          <span
                            className={`
                              absolute
                              right-3
                              top-3
                              text-[9px]
                              font-medium
                              uppercase
                              tracking-[0.08em]

                              ${
                                isSelected
                                  ? 'text-[#ffb47f]'
                                  : 'text-[#ff914d]'
                              }
                            `}
                          >
                            Popular
                          </span>
                        )}

                        {/* Vote count */}

                        <p
                          className={`
                            text-[12px]
                            font-medium

                            ${
                              isSelected
                                ? 'text-white/70'
                                : 'text-black/50'
                            }
                          `}
                        >
                          {pkg.votes}{' '}
                          vote
                          {pkg.votes >
                          1
                            ? 's'
                            : ''}
                        </p>

                        {/* Premium price */}

                        <div
                          className="
                            mt-3
                            flex
                            items-baseline
                            gap-1
                          "
                        >
                          <span
                            className={`
                              text-[11px]
                              font-medium

                              ${
                                isSelected
                                  ? 'text-white/60'
                                  : 'text-black/45'
                              }
                            `}
                          >
                            KES
                          </span>

                          <span
                            className={`
                              text-[25px]
                              font-medium
                              leading-none
                              tracking-[-0.03em]

                              ${
                                isSelected
                                  ? 'text-[#ff914d]'
                                  : 'text-[#762e99]'
                              }
                            `}
                          >
                            {
                              pkg.priceKES
                            }
                          </span>
                        </div>

                        {/* Package name */}

                        <p
                          className={`
                            mt-3
                            pr-4
                            text-[10px]
                            leading-[1.4]

                            ${
                              isSelected
                                ? 'text-white/65'
                                : 'text-black/45'
                            }
                          `}
                        >
                          {pkg.label}
                        </p>

                        {/* Discount */}

                        {pkg.discountText && (
                          <div
                            className={`
                              mt-2
                              inline-block
                              border-l-2
                              pl-2
                              text-[10px]
                              font-medium

                              ${
                                isSelected
                                  ? `
                                    border-[#ff914d]
                                    text-[#ffb47f]
                                  `
                                  : `
                                    border-[#ff914d]
                                    text-[#762e99]
                                  `
                              }
                            `}
                          >
                            {
                              pkg.discountText
                            }
                          </div>
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              {/* ===========================================
                  CUSTOM VOTES
              ============================================ */}

              <div
                className="
                  mt-6
                "
              >
                <div
                  className="
                    flex
                    items-end
                    justify-between
                    gap-4
                  "
                >
                  <div>
                    <label
                      htmlFor="vote-custom-quantity"
                      className="
                        block
                        text-[13px]
                        font-medium
                        text-black
                      "
                    >
                      Custom vote quantity
                    </label>

                    <p
                      className="
                        mt-1
                        text-[11px]
                        text-black/45
                      "
                    >
                      Choose any number of
                      votes you want.
                    </p>
                  </div>

                  <span
                    className="
                      shrink-0
                      text-[11px]
                      font-medium
                      text-[#ff914d]
                    "
                  >
                    1 vote = KES 10
                  </span>
                </div>

                <input
                  id="vote-custom-quantity"
                  type="number"
                  min="1"
                  inputMode="numeric"
                  placeholder="Enter custom vote count"
                  value={
                    customVotes
                  }
                  onChange={(
                    event
                  ) =>
                    setCustomVotes(
                      event.target
                        .value
                    )
                  }
                  className="
                    mt-2
                    w-full
                    border
                    border-black/15
                    bg-white
                    px-4
                    py-3.5
                    text-[14px]
                    text-black
                    outline-none
                    transition-colors

                    placeholder:text-black/30

                    focus:border-[#762e99]
                  "
                />
              </div>

              {/* ===========================================
                  M-PESA PHONE
              ============================================ */}

              <div
                className="
                  mt-5
                "
              >
                <label
                  htmlFor="vote-phone"
                  className="
                    block
                    text-[13px]
                    font-medium
                    text-black
                  "
                >
                  M-Pesa phone number
                </label>

                <p
                  className="
                    mt-1
                    text-[11px]
                    text-black/45
                  "
                >
                  We'll send the STK Push
                  to this number.
                </p>

                <input
                  id="vote-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="0712345678"
                  value={
                    phone
                  }
                  onChange={(
                    event
                  ) =>
                    setPhone(
                      event.target
                        .value
                    )
                  }
                  className="
                    mt-2
                    w-full
                    border
                    border-black/15
                    bg-white
                    px-4
                    py-3.5
                    text-[14px]
                    text-black
                    outline-none
                    transition-colors

                    placeholder:text-black/30

                    focus:border-[#762e99]
                  "
                />
              </div>

              {/* ===========================================
                  PAYMENT SUMMARY
              ============================================ */}

              <div
                className="
                  mt-7
                  border-t
                  border-black/[0.08]
                  pt-6
                "
              >
                <div
                  className="
                    flex
                    items-end
                    justify-between
                    gap-5
                  "
                >
                  <div>
                    <p
                      className="
                        text-[12px]
                        text-black/50
                      "
                    >
                      Total payable
                    </p>

                    <p
                      className="
                        mt-1
                        text-[12px]
                        text-black/40
                      "
                    >
                      {votesCount}{' '}
                      vote
                      {votesCount > 1
                        ? 's'
                        : ''}
                    </p>
                  </div>

                  {/* Premium total price */}

                  <div
                    className="
                      text-right
                    "
                  >
                    <div
                      className="
                        flex
                        items-baseline
                        justify-end
                        gap-1.5
                      "
                    >
                      <span
                        className="
                          text-[12px]
                          font-medium
                          text-black/45
                        "
                      >
                        KES
                      </span>

                      <span
                        className="
                          text-[30px]
                          font-medium
                          leading-none
                          tracking-[-0.03em]
                          text-[#762e99]
                        "
                      >
                        {amountKES.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* =========================================
                    CAST VOTE
                ========================================== */}

                <button
                  type="submit"
                  disabled={
                    paymentStage === 'initiating'
                  }
                  className="
                    mt-6
                    w-full
                    rounded-full
                    bg-gradient-to-r
                    from-[#5e2590]
                    to-[#762e99]
                    px-5
                    py-4
                    text-[14px]
                    font-medium
                    text-white
                    transition-all
                    duration-200

                    hover:opacity-90

                    active:scale-[0.99]

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {paymentStage === 'initiating'
                    ? 'Sending M-Pesa request...'
                    : `Cast ${votesCount} Vote${
                        votesCount >
                        1
                          ? 's'
                          : ''
                      } • KES ${amountKES.toLocaleString()}`}
                </button>

                {/* =========================================
                    M-PESA SECURE IMAGE
                ========================================== */}

                <div
                  className="
                    mt-5
                    flex
                    items-center
                    justify-center
                  "
                >
                  <img
                    src={
                      MPESA_SECURE_IMAGE
                    }
                    alt="Pay securely with M-Pesa"
                    width={489}
                    height={184}
                    className="
                      h-auto
                      w-[145px]
                      object-contain

                      sm:w-[155px]
                    "
                  />
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}