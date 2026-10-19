// 'use client';

// import React, { useState } from 'react';
// import { X, Ticket, CheckCircle2, ShieldCheck, Phone, Mail, User, CreditCard } from 'lucide-react';
// import axios from 'axios';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// export default function TicketModal({ ticketPriceKES = 500, onClose }) {
//   const [form, setForm] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     quantity: 1
//   });
//   const [status, setStatus] = useState({ loading: false, success: false, error: '', checkoutRequestID: '' });

//   const totalAmountKES = form.quantity * ticketPriceKES;

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus({ loading: true, success: false, error: '', checkoutRequestID: '' });

//     try {
//       const res = await axios.post(`${API_BASE_URL}/last-dance/buy-ticket`, form);
//       if (res.data.success) {
//         const checkoutReqID = res.data.checkoutRequestID;
//         setStatus({
//           loading: false,
//           success: true,
//           error: '',
//           checkoutRequestID: checkoutReqID
//         });

//         // Simulation fallback in test mode
//         try {
//           await axios.post(`${API_BASE_URL}/last-dance/test-simulate-payment`, { checkoutRequestID: checkoutReqID });
//         } catch (simErr) {
//           // Simulation optional
//         }
//       } else {
//         setStatus({ loading: false, success: false, error: res.data.message || 'Payment initiation failed.' });
//       }
//     } catch (err) {
//       setStatus({
//         loading: false,
//         success: false,
//         error: err.response?.data?.message || 'M-Pesa STK push failed to trigger.'
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

//         {/* Modal Header */}
//         <div className="text-center mb-6">
//           <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center mx-auto mb-3">
//             <Ticket className="w-6 h-6" />
//           </div>
//           <h3 className="text-xl font-bold tracking-tight text-slate-900">Event Entry Pass</h3>
//           <p className="text-xs text-slate-500 font-medium mt-0.5">Graduation Eve Send-Off | October 26th</p>
//         </div>

//         {status.success ? (
//           <div className="text-center py-6 space-y-4">
//             <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
//             <h4 className="text-lg font-bold text-slate-900">M-Pesa Payment Triggered</h4>
//             <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
//               Please enter your PIN on your phone to confirm payment of <strong>KES {totalAmountKES.toLocaleString()}</strong>.
//             </p>
//             <p className="text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
//               🎟️ Digital QR tickets will be dispatched to <strong>{form.email}</strong> upon confirmation.
//             </p>
//             <button
//               onClick={onClose}
//               className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition"
//             >
//               Done / Close
//             </button>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit} className="space-y-4 text-xs">
//             {status.error && (
//               <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-bold">
//                 {status.error}
//               </div>
//             )}

//             {/* Quantity Stepper */}
//             <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex items-center justify-between">
//               <div>
//                 <div className="font-bold text-slate-900 text-xs">Ticket Quantity</div>
//                 <div className="text-[11px] text-slate-500 font-medium">KES {ticketPriceKES.toLocaleString()} per ticket</div>
//               </div>
//               <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
//                 <button
//                   type="button"
//                   onClick={() => setForm(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
//                   className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base flex items-center justify-center transition"
//                 >
//                   -
//                 </button>
//                 <span className="font-bold text-slate-900 text-sm px-2">{form.quantity}</span>
//                 <button
//                   type="button"
//                   onClick={() => setForm(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
//                   className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base flex items-center justify-center transition"
//                 >
//                   +
//                 </button>
//               </div>
//             </div>

//             {/* Full Name */}
//             <div>
//               <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Full Name</label>
//               <div className="relative">
//                 <input
//                   type="text"
//                   required
//                   placeholder="John Doe"
//                   value={form.name}
//                   onChange={(e) => setForm({ ...form, name: e.target.value })}
//                   className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900 transition"
//                 />
//                 <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
//               </div>
//             </div>

//             {/* Email Address */}
//             <div>
//               <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
//                 Email Address (For QR Delivery)
//               </label>
//               <div className="relative">
//                 <input
//                   type="email"
//                   required
//                   placeholder="john@example.com"
//                   value={form.email}
//                   onChange={(e) => setForm({ ...form, email: e.target.value })}
//                   className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900 transition"
//                 />
//                 <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
//               </div>
//             </div>

//             {/* M-Pesa Phone */}
//             <div>
//               <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
//                 M-Pesa Phone Number
//               </label>
//               <div className="relative">
//                 <input
//                   type="tel"
//                   required
//                   placeholder="0712345678"
//                   value={form.phone}
//                   onChange={(e) => setForm({ ...form, phone: e.target.value })}
//                   className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-slate-900 transition"
//                 />
//                 <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
//               </div>
//             </div>

//             {/* Total Price & Submit */}
//             <div className="pt-3 border-t border-slate-100 space-y-3">
//               <div className="flex justify-between items-center text-xs font-bold text-slate-900">
//                 <span>Total Amount:</span>
//                 <span className="text-rose-600 text-base font-extrabold">KES {totalAmountKES.toLocaleString()}</span>
//               </div>

//               <button
//                 type="submit"
//                 disabled={status.loading}
//                 className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
//               >
//                 <CreditCard className="w-4 h-4" />
//                 {status.loading ? 'Initiating M-Pesa Payment...' : `Purchase Ticket(s) (KES ${totalAmountKES.toLocaleString()})`}
//               </button>

//               <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-medium">
//                 <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Instant M-Pesa Daraja Checkout
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

import { X, CheckCircle2, Clock, RefreshCw, Download } from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://lastdance.co.ke/api';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  'https://lastdance.co.ke';

const SOCKET_PATH =
  process.env.NEXT_PUBLIC_SOCKET_PATH ||
  '/api/socket.io';

/* =========================================================
   IMAGE URLS
========================================================= */

const TICKET_IMAGE =
  'https://ik.imagekit.io/rhjfaafsm/ticketpageticketpageLD.png';

const MPESA_SECURE_IMAGE =
  'https://ik.imagekit.io/rhjfaafsm/paysecurely.svg';

/* =========================================================
   TICKET MODAL
========================================================= */

export default function TicketModal({
  ticketPriceKES: initialTicketPrice = 500,
  onClose,
}) {
  const [ticketPriceKES, setTicketPriceKES] = useState(initialTicketPrice);
  const [form, setForm] =
    useState({
      name: '',
      email: '',
      phone: '',
      quantity: 1,
    });

  // 'idle' | 'initiating' | 'awaiting_pin' | 'confirmed' | 'failed'
  const [paymentStage, setPaymentStage] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [checkoutRequestID, setCheckoutRequestID] = useState('');
  const [confirmedTicket, setConfirmedTicket] = useState(null);
  const [pollCountdown, setPollCountdown] = useState(90);
  const [isVerifyingManually, setIsVerifyingManually] = useState(false);

  const pollIntervalRef = useRef(null);
  const socketRef = useRef(null);

  // Fetch live ticket price from admin settings & sync via WebSocket
  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/last-dance/settings`);
        if (res.data?.success && res.data.settings?.ticketPriceKES) {
          if (isMounted) {
            setTicketPriceKES(Number(res.data.settings.ticketPriceKES));
          }
        }
      } catch (err) {
        // Fallback to initial prop
      }
    };

    fetchSettings();

    try {
      const socket = io(SOCKET_URL, {
        path: SOCKET_PATH,
        transports: ['websocket', 'polling']
      });

      socket.on('last_dance:settings_updated', (data) => {
        if (data && data.ticketPriceKES && Number(data.ticketPriceKES) > 0) {
          if (isMounted) {
            setTicketPriceKES(Number(data.ticketPriceKES));
          }
        }
      });

      return () => {
        isMounted = false;
        socket.off('last_dance:settings_updated');
        socket.disconnect();
      };
    } catch (wsErr) {
      return () => {
        isMounted = false;
      };
    }
  }, []);

  const totalAmountKES =
    form.quantity *
    ticketPriceKES;

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

  const handlePaymentSuccess = (ticketDetails) => {
    stopPolling();
    setConfirmedTicket(ticketDetails);
    setPaymentStage('confirmed');
    setErrorMessage('');
    setIsVerifyingManually(false);
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
        handlePaymentSuccess(res.data.details);
      } else if (res.data?.status === 'failed') {
        handlePaymentFailure('Payment was cancelled or failed on your mobile device.');
      } else {
        setErrorMessage('Payment is still awaiting confirmation from M-Pesa. If you entered your PIN, please wait a moment and tap verify again.');
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

    // 1. Instant WebSocket push notification
    try {
      const socket = io(SOCKET_URL, {
        path: SOCKET_PATH,
        transports: ['websocket', 'polling']
      });
      socketRef.current = socket;

      socket.on(`last_dance:ticket_paid:${reqId}`, (data) => {
        console.log('[LastDance] Instant real-time ticket payment confirmation:', data);
        handlePaymentSuccess(data.ticketOrder || data);
      });

      socket.on(`last_dance:ticket_failed:${reqId}`, (data) => {
        console.log('[LastDance] Ticket payment failed:', data);
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
          handlePaymentSuccess(res.data.details);
          return;
        } else if (res.data?.status === 'failed') {
          handlePaymentFailure('Payment was cancelled or failed on your mobile device.');
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
    setConfirmedTicket(null);
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
     ESC KEY CLOSE
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

  /* =======================================================
     FORM UPDATE
  ======================================================= */

  const updateForm = (
    field,
    value
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* =======================================================
     PAYMENT
  ======================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setPaymentStage('initiating');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/last-dance/buy-ticket`,
        form
      );

      if (response.data?.success) {
        const reqId = response.data.checkoutRequestID;
        setCheckoutRequestID(reqId);
        setPaymentStage('awaiting_pin');
        startPollingPayment(reqId);
        return;
      }

      setPaymentStage('idle');
      setErrorMessage(response.data?.message || 'Payment initiation failed.');
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
            CLOSE BUTTON
        ==================================================== */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close ticket purchase"
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
            TICKET SVG

            Height: 125px
            Full modal width
            No border
            No radius
            No background/frame
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
            src={TICKET_IMAGE}
            alt="Last Dance ticket"
            width={489}
            height={184}
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
            MODAL CONTENT
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
          {paymentStage === 'confirmed' ? (
            /* =================================================
                CONFIRMED SUCCESS STATE
            ================================================= */

            <div className="text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 text-2xl font-bold">
                ✓
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Payment Verified & Confirmed
              </div>

              <h3 className="mt-3 text-[24px] font-semibold leading-[1.2] tracking-[-0.02em] text-black">
                Official Festival Pass Issued!
              </h3>

              <p className="mt-2 text-[13.5px] font-normal leading-[1.65] text-[#242424]">
                Your pass has been generated and sent to <strong className="text-black">{form.email}</strong>.
              </p>

              <div className="mt-5 rounded-2xl border border-black/10 bg-[#f7f7f7] p-4 text-[12.5px] space-y-2">
                <div className="flex justify-between items-center text-black/60 pb-2 border-b border-black/[0.08]">
                  <span>M-Pesa Receipt Code</span>
                  <span className="font-mono font-bold text-black bg-white px-2 py-0.5 rounded border border-black/10">
                    {confirmedTicket?.mpesaReceiptNumber || 'Verified'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-black/60">
                  <span>Pass Quantity</span>
                  <span className="font-semibold text-black">{form.quantity} Admission Pass(es)</span>
                </div>
                <div className="flex justify-between items-center text-black/60">
                  <span>Amount Paid</span>
                  <span className="font-bold text-emerald-700">KES {totalAmountKES.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <a
                  href={`${API_BASE_URL}/last-dance/tickets/${confirmedTicket?._id || confirmedTicket?.ticketId}/pass`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] px-5 py-3.5 text-[14px] font-medium text-white shadow-md hover:opacity-90 transition-all active:scale-[0.99]"
                >
                  <Download className="w-4 h-4" />
                  View & Download Official Pass (.HTML)
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-full border border-black/15 py-3 text-[13px] font-medium text-black hover:bg-black/5 transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : paymentStage === 'awaiting_pin' ? (
            /* =================================================
                AWAITING PIN & REAL PAYMENT STATE
            ================================================= */

            <div className="text-left">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#ff914d] text-white shadow-md shadow-[#ff914d]/30">
                <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '6s' }} />
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-800">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                Awaiting PIN Entry on Phone
              </div>

              <h3 className="mt-3 text-[24px] font-medium leading-[1.2] tracking-[-0.02em] text-black">
                Check your phone.
              </h3>

              <p className="mt-2 text-[13.5px] font-normal leading-[1.65] text-[#242424]">
                An M-Pesa prompt for <strong>KES {totalAmountKES.toLocaleString()}</strong> was sent to <strong className="text-black">{form.phone}</strong>.
              </p>

              <div className="mt-4 rounded-2xl border border-black/10 bg-[#f7f7f7] p-3.5 text-[12px] text-black/70 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-black/10 text-[10px] font-bold text-black">1</span>
                  <span>Unlock your phone screen now.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-black/10 text-[10px] font-bold text-black">2</span>
                  <span>Enter your M-Pesa PIN on the prompt to authorize payment.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-black/10 text-[10px] font-bold text-black">3</span>
                  <span>Keep this modal open; pass loads automatically once paid.</span>
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
                      ? `Verifying payment with M-Pesa (${pollCountdown}s)`
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
                      I have entered my PIN — Verify Payment
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
                PAYMENT FORM
            ================================================= */

            <form
              onSubmit={
                handleSubmit
              }
            >
              {/* ===========================================
                  SMALL CHECKOUT HEADER
              ============================================ */}

              <div
                className="
                  border-b
                  border-black/[0.08]
                  pb-5
                "
              >
                <p
                  className="
                    text-[12px]
                    font-medium
                    text-[#ff914d]
                  "
                >
                  Secure checkout
                </p>

                <h3
                  className="
                    mt-1
                    text-[25px]
                    font-medium
                    leading-[1.2]
                    tracking-[-0.02em]
                    text-black
                  "
                >
                  Purchase your ticket
                </h3>
              </div>

              {/* ===========================================
                  ERROR
              ============================================ */}

              {errorMessage && (
                <div
                  className="
                    mt-5
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
                  QUANTITY
              ============================================ */}

              <div
                className="
                  mt-6
                  flex
                  items-center
                  justify-between
                  gap-5
                  border-b
                  border-black/[0.08]
                  pb-6
                "
              >
                <div>
                  <p
                    className="
                      text-[14px]
                      font-medium
                      text-black
                    "
                  >
                    Ticket quantity
                  </p>

                  <p
                    className="
                      mt-1
                      text-[12px]
                      text-black/45
                    "
                  >
                    KES{' '}
                    {ticketPriceKES.toLocaleString()}{' '}
                    per ticket
                  </p>
                </div>

                <div
                  className="
                    flex
                    items-center
                    border
                    border-black/15
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      setForm(
                        (
                          previous
                        ) => ({
                          ...previous,

                          quantity:
                            Math.max(
                              1,
                              previous.quantity -
                                1
                            ),
                        })
                      )
                    }
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      text-[18px]
                      text-black
                      transition-colors

                      hover:bg-[#f4f4f4]
                      hover:text-[#ff914d]
                    "
                  >
                    −
                  </button>

                  <span
                    className="
                      flex
                      h-10
                      min-w-[44px]
                      items-center
                      justify-center
                      border-x
                      border-black/15
                      text-[15px]
                      font-medium
                      text-black
                    "
                  >
                    {form.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setForm(
                        (
                          previous
                        ) => ({
                          ...previous,

                          quantity:
                            previous.quantity +
                            1,
                        })
                      )
                    }
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      text-[18px]
                      text-black
                      transition-colors

                      hover:bg-[#f4f4f4]
                      hover:text-[#ff914d]
                    "
                  >
                    +
                  </button>
                </div>
              </div>

              {/* ===========================================
                  FULL NAME
              ============================================ */}

              <div
                className="
                  mt-6
                "
              >
                <label
                  htmlFor="modal-ticket-name"
                  className="
                    block
                    text-[13px]
                    font-medium
                    text-black
                  "
                >
                  Full name
                </label>

                <input
                  id="modal-ticket-name"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Your full name"
                  value={
                    form.name
                  }
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      'name',
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
                  EMAIL
              ============================================ */}

              <div
                className="
                  mt-5
                "
              >
                <label
                  htmlFor="modal-ticket-email"
                  className="
                    block
                    text-[13px]
                    font-medium
                    text-black
                  "
                >
                  Email address
                </label>

                <p
                  className="
                    mt-1
                    text-[11px]
                    text-black/45
                  "
                >
                  Your QR ticket will
                  be delivered here.
                </p>

                <input
                  id="modal-ticket-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={
                    form.email
                  }
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      'email',
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
                  htmlFor="modal-ticket-phone"
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
                  We'll send the STK
                  Push to this number.
                </p>

                <input
                  id="modal-ticket-phone"
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="0712345678"
                  value={
                    form.phone
                  }
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      'phone',
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
                  TOTAL
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
                      {form.quantity}{' '}
                      ticket
                      {form.quantity >
                      1
                        ? 's'
                        : ''}
                    </p>
                  </div>

                  <p
                    className="
                      text-[25px]
                      font-medium
                      tracking-[-0.02em]
                      text-black
                    "
                  >
                    KES{' '}
                    {totalAmountKES.toLocaleString()}
                  </p>
                </div>

                {/* =========================================
                    PURCHASE BUTTON
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
                  {paymentStage === 'initiating' ? (
                    <span className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Sending STK Push to Phone...
                    </span>
                  ) : (
                    `Pay KES ${totalAmountKES.toLocaleString()} with M-Pesa`
                  )}
                </button>

                {/* =========================================
                    M-PESA SECURITY SVG

                    Original SVG dimensions:
                    489 × 184
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