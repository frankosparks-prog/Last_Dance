// // 'use client';

// // import React, { useState } from 'react';
// // import { 
// //   Ticket, CheckCircle2, ShieldCheck, Sparkles, CreditCard, 
// //   User, Mail, Phone, QrCode, Music, Gift, Star, Disc
// // } from 'lucide-react';
// // import axios from 'axios';

// // const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// // export default function TicketsPage() {
// //   const [form, setForm] = useState({
// //     name: '',
// //     email: '',
// //     phone: '',
// //     quantity: 1
// //   });
// //   const [ticketPriceKES, setTicketPriceKES] = useState(500);
// //   const [status, setStatus] = useState({ loading: false, success: false, error: '', checkoutRequestID: '' });

// //   const totalAmountKES = form.quantity * ticketPriceKES;

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setStatus({ loading: true, success: false, error: '', checkoutRequestID: '' });

// //     try {
// //       const res = await axios.post(`${API_BASE_URL}/last-dance/buy-ticket`, form);
// //       if (res.data.success) {
// //         const checkoutReqID = res.data.checkoutRequestID;
// //         setStatus({
// //           loading: false,
// //           success: true,
// //           error: '',
// //           checkoutRequestID: checkoutReqID
// //         });

// //         // Simulation fallback in test mode
// //         try {
// //           await axios.post(`${API_BASE_URL}/last-dance/test-simulate-payment`, { checkoutRequestID: checkoutReqID });
// //         } catch (simErr) {
// //           // Simulation optional
// //         }
// //       } else {
// //         setStatus({ loading: false, success: false, error: res.data.message || 'Payment initiation failed.' });
// //       }
// //     } catch (err) {
// //       setStatus({
// //         loading: false,
// //         success: false,
// //         error: err.response?.data?.message || 'M-Pesa STK push failed to trigger.'
// //       });
// //     }
// //   };

// //   return (
// //     <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans space-y-12">
      
// //       {/* Hero Header */}
// //       <div className="text-center max-w-3xl mx-auto space-y-4">
// //         <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-200/80 px-4 py-1.5 rounded-full text-indigo-700 text-xs font-black uppercase tracking-wider shadow-xs">
// //           <Ticket className="w-4 h-4 text-indigo-600" />
// //           <span>Official Event Access Pass</span>
// //         </div>
// //         <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
// //           SECURE YOUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600">LAST DANCE</span> ENTRY PASS
// //         </h1>
// //         <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
// //           October 26th, 2026 &bull; Graduation Eve Send-Off. Digital QR tickets are delivered straight to your email upon instant M-Pesa payment.
// //         </p>
// //       </div>

// //       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
// //         {/* Left Column: Perks & Ticket Preview (7 Cols) */}
// //         <div className="lg:col-span-7 space-y-6">
          
// //           {/* Included Perks Grid */}
// //           <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
// //             <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2">
// //               <Sparkles className="w-5 h-5 text-indigo-600" />
// //               <span>What Your Pass Unlocks</span>
// //             </h3>

// //             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
// //               <div className="bg-white/80 border border-indigo-100 p-4 rounded-2xl space-y-2 neu-flat">
// //                 <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600">
// //                   <QrCode className="w-5 h-5" />
// //                 </div>
// //                 <h4 className="text-sm font-bold text-slate-900">Express QR Gate Entry</h4>
// //                 <p className="text-xs text-slate-500">Instant scan-and-go digital ticket code delivered to your email.</p>
// //               </div>

// //               <div className="bg-white/80 border border-indigo-100 p-4 rounded-2xl space-y-2 neu-flat">
// //                 <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600">
// //                   <Gift className="w-5 h-5" />
// //                 </div>
// //                 <h4 className="text-sm font-bold text-slate-900">Complimentary Welcome Drink</h4>
// //                 <p className="text-xs text-slate-500">Redeemable signature Graduation Eve cocktail or mocktail.</p>
// //               </div>

// //               <div className="bg-white/80 border border-indigo-100 p-4 rounded-2xl space-y-2 neu-flat">
// //                 <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600">
// //                   <Music className="w-5 h-5" />
// //                 </div>
// //                 <h4 className="text-sm font-bold text-slate-900">All-Night DJ Afterparty</h4>
// //                 <p className="text-xs text-slate-500">Non-stop performances by guest DJs, hype MCs, and live music.</p>
// //               </div>

// //               <div className="bg-white/80 border border-indigo-100 p-4 rounded-2xl space-y-2 neu-flat">
// //                 <div className="w-10 h-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600">
// //                   <Star className="w-5 h-5" />
// //                 </div>
// //                 <h4 className="text-sm font-bold text-slate-900">360° Photobooth Access</h4>
// //                 <p className="text-xs text-slate-500">Unlimited high-definition glam photo & video sessions for your squad.</p>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Sample Digital Ticket Preview Card */}
// //           <div className="glass-panel-dark text-white rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl relative overflow-hidden">
// //             <div className="flex items-center justify-between border-b border-indigo-800/80 pb-4">
// //               <div>
// //                 <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Sample Ticket Pass</span>
// //                 <h4 className="text-xl font-black text-white">LAST DANCE 2026 ENTRY PASS</h4>
// //               </div>
// //               <div className="bg-indigo-500 text-white font-black text-xs px-3.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
// //                 VALID ENTRY
// //               </div>
// //             </div>

// //             <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
// //               <div className="space-y-1 text-center sm:text-left">
// //                 <p className="text-xs text-indigo-300 font-medium">Ticket Holder</p>
// //                 <p className="text-base font-bold text-white">{form.name || 'Your Full Name'}</p>
// //                 <p className="text-xs text-indigo-200 font-mono tracking-widest pt-1">CODE: LD-2026-X89F2</p>
// //               </div>

// //               <div className="p-2 bg-white rounded-2xl shadow-md border-2 border-indigo-400">
// //                 <img
// //                   src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=LD-2026-PREVIEW"
// //                   alt="QR Code Ticket Preview"
// //                   className="w-24 h-24 rounded-lg"
// //                 />
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         {/* Right Column: Checkout Form (5 Cols) */}
// //         <div className="lg:col-span-5">
// //           <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 shadow-md sticky top-28">
// //             <div className="border-b border-indigo-100 pb-4">
// //               <h3 className="text-xl font-black text-slate-900 flex items-center space-x-2">
// //                 <CreditCard className="w-5 h-5 text-indigo-600" />
// //                 <span>Instant Ticket Purchase</span>
// //               </h3>
// //               <p className="text-xs text-slate-500 mt-1">Direct M-Pesa STK Push Integration</p>
// //             </div>

// //             {status.success ? (
// //               <div className="text-center py-8 space-y-4">
// //                 <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
// //                 <h4 className="text-xl font-black text-slate-900">M-Pesa STK Prompt Triggered!</h4>
// //                 <p className="text-xs text-slate-600 leading-relaxed">
// //                   Please enter your M-Pesa PIN on your phone to confirm payment of <strong>KES {totalAmountKES.toLocaleString()}</strong> for <strong>{form.quantity} Ticket(s)</strong>.
// //                 </p>
// //                 <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-[11px] text-indigo-950 font-bold">
// //                   🎟️ QR tickets dispatched to: <strong className="text-indigo-600">{form.email}</strong>
// //                 </div>
// //                 <button
// //                   onClick={() => setStatus({ loading: false, success: false, error: '', checkoutRequestID: '' })}
// //                   className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-md"
// //                 >
// //                   Buy More Tickets
// //                 </button>
// //               </div>
// //             ) : (
// //               <form onSubmit={handleSubmit} className="space-y-4 text-xs">
// //                 {status.error && (
// //                   <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 font-bold">
// //                     {status.error}
// //                   </div>
// //                 )}

// //                 {/* Quantity Stepper */}
// //                 <div className="neu-flat p-4 rounded-2xl flex items-center justify-between">
// //                   <div>
// //                     <div className="font-bold text-slate-900 text-sm">Ticket Quantity</div>
// //                     <div className="text-xs text-slate-500">KES {ticketPriceKES.toLocaleString()} / ticket</div>
// //                   </div>
// //                   <div className="flex items-center space-x-2 bg-white border border-indigo-200 rounded-xl p-1 shadow-xs">
// //                     <button
// //                       type="button"
// //                       onClick={() => setForm(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
// //                       className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-black text-base flex items-center justify-center transition"
// //                     >
// //                       -
// //                     </button>
// //                     <span className="font-black text-indigo-600 text-base px-3">{form.quantity}</span>
// //                     <button
// //                       type="button"
// //                       onClick={() => setForm(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
// //                       className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-black text-base flex items-center justify-center transition"
// //                     >
// //                       +
// //                     </button>
// //                   </div>
// //                 </div>

// //                 {/* Name */}
// //                 <div>
// //                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Full Name</label>
// //                   <div className="relative">
// //                     <input
// //                       type="text"
// //                       required
// //                       placeholder="e.g. Alexandre Vance"
// //                       value={form.name}
// //                       onChange={(e) => setForm({ ...form, name: e.target.value })}
// //                       className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-indigo-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-indigo-500 transition shadow-inner"
// //                     />
// //                     <User className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
// //                   </div>
// //                 </div>

// //                 {/* Email */}
// //                 <div>
// //                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
// //                     Email Address (For Delivery)
// //                   </label>
// //                   <div className="relative">
// //                     <input
// //                       type="email"
// //                       required
// //                       placeholder="alexandre@example.com"
// //                       value={form.email}
// //                       onChange={(e) => setForm({ ...form, email: e.target.value })}
// //                       className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-indigo-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-indigo-500 transition shadow-inner"
// //                     />
// //                     <Mail className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
// //                   </div>
// //                 </div>

// //                 {/* M-Pesa Phone */}
// //                 <div>
// //                   <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
// //                     M-Pesa Phone Number
// //                   </label>
// //                   <div className="relative">
// //                     <input
// //                       type="tel"
// //                       required
// //                       placeholder="0712345678"
// //                       value={form.phone}
// //                       onChange={(e) => setForm({ ...form, phone: e.target.value })}
// //                       className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-indigo-200 rounded-2xl text-slate-900 font-medium focus:outline-none focus:border-indigo-500 transition shadow-inner"
// //                     />
// //                     <Phone className="w-4 h-4 text-indigo-400 absolute left-3 top-3" />
// //                   </div>
// //                 </div>

// //                 {/* Total & Submit */}
// //                 <div className="pt-3 border-t border-indigo-100 space-y-3">
// //                   <div className="flex justify-between items-center text-sm font-bold text-slate-900">
// //                     <span>Total Amount Payable:</span>
// //                     <span className="text-indigo-600 text-lg font-black">KES {totalAmountKES.toLocaleString()}</span>
// //                   </div>

// //                   <button
// //                     type="submit"
// //                     disabled={status.loading}
// //                     className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-700 hover:to-indigo-600 text-white font-black text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center space-x-2"
// //                   >
// //                     <CreditCard className="w-4 h-4 text-indigo-200" />
// //                     <span>{status.loading ? 'Sending M-Pesa STK Push...' : `Pay KES ${totalAmountKES.toLocaleString()} via M-Pesa`}</span>
// //                   </button>

// //                   <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-semibold pt-1">
// //                     <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Secure M-Pesa STK Push Gateway
// //                   </div>
// //                 </div>
// //               </form>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }







// 'use client';

// import React, {
//   useEffect,
//   useRef,
//   useState,
// } from 'react';

// import axios from 'axios';

// const API_BASE_URL =
//   process.env.NEXT_PUBLIC_API_URL ||
//   'http://localhost:5000/api';

// /* =========================================================
//    IMAGE URLS

//    Replace these mock URLs with your final ImageKit URLs.
// ========================================================= */

// const TICKET_IMAGE =
//   'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1400&q=90';

// const PASS_BENEFITS = [
//   {
//     title: 'Express QR Gate Entry',

//     description:
//       'Your digital ticket includes a unique QR code for quick verification and smooth entry at the event gate.',

//     image:
//       'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=90',

//     imageAlt:
//       'Guests entering an event',
//   },

//   {
//     title: 'Complimentary Welcome Drink',

//     description:
//       'Start your Graduation Eve experience with a complimentary welcome cocktail or mocktail available after entry.',

//     image:
//       'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1000&q=90',

//     imageAlt:
//       'Welcome drinks at an event',
//   },

//   {
//     title: 'All-Night DJ Afterparty',

//     description:
//       'Enjoy a full night of music, guest DJs, hype MCs and performances as we celebrate one final campus experience together.',

//     image:
//       'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1000&q=90',

//     imageAlt:
//       'DJ performing at a live event',
//   },

//   {
//     title: '360° Photobooth Access',

//     description:
//       'Capture the night with your friends using the event photobooth and create photos and videos you can keep long after Graduation Eve.',

//     image:
//       'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=90',

//     imageAlt:
//       'Friends enjoying an event',
//   },
// ];

// /* =========================================================
//    SCROLL REVEAL COMPONENT
// ========================================================= */

// function RevealBenefit({
//   benefit,
//   index,
// }) {
//   const ref = useRef(null);

//   const [visible, setVisible] =
//     useState(false);

//   useEffect(() => {
//     const element = ref.current;

//     if (!element) return;

//     const observer =
//       new IntersectionObserver(
//         ([entry]) => {
//           if (entry.isIntersecting) {
//             setVisible(true);

//             observer.unobserve(
//               entry.target
//             );
//           }
//         },
//         {
//           threshold: 0.15,
//           rootMargin:
//             '0px 0px -60px 0px',
//         }
//       );

//     observer.observe(element);

//     return () => {
//       observer.disconnect();
//     };
//   }, []);

//   return (
//     <article
//       ref={ref}
//       className={`
//         overflow-hidden
//         border-b
//         border-black/[0.08]
//         pb-10
//         transition-all
//         duration-700
//         ease-out

//         sm:pb-12

//         ${
//           visible
//             ? `
//               translate-y-0
//               scale-100
//               opacity-100
//             `
//             : `
//               translate-y-8
//               scale-[0.97]
//               opacity-0
//             `
//         }
//       `}
//       style={{
//         transitionDelay: `${
//           Math.min(index * 80, 240)
//         }ms`,
//       }}
//     >
//       <div
//         className="
//           grid
//           grid-cols-1
//           gap-7

//           lg:grid-cols-[300px_1fr]
//           lg:items-center
//           lg:gap-8

//           xl:grid-cols-[360px_1fr]
//         "
//       >
//         {/* =============================================
//             IMAGE
//         ============================================= */}

//         <div
//           className="
//             relative
//             h-[420px]
//             w-full
//             overflow-hidden
//             bg-[#eeeeee]

//             sm:h-[480px]

//             lg:h-[430px]

//             xl:h-[480px]
//             xl:w-[360px]
//           "
//         >
//           <img
//             src={benefit.image}
//             alt={benefit.imageAlt}
//             loading="lazy"
//             className="
//               absolute
//               inset-0
//               h-full
//               w-full
//               object-cover
//               object-center
//               transition-transform
//               duration-700
//               ease-out

//               hover:scale-[1.02]
//             "
//           />
//         </div>

//         {/* =============================================
//             TEXT
//         ============================================= */}

//         <div
//           className="
//             max-w-[380px]
//           "
//         >
//           <p
//             className="
//               text-[12px]
//               font-medium
//               text-[#762e99]
//             "
//           >
//             0{index + 1}
//           </p>

//           <h3
//             className="
//               mt-3
//               text-[26px]
//               font-medium
//               leading-[1.2]
//               tracking-[-0.02em]
//               text-black

//               sm:text-[28px]

//               lg:text-[30px]
//             "
//           >
//             {benefit.title}
//           </h3>

//           <p
//             className="
//               mt-5
//               text-[15px]
//               font-normal
//               leading-[1.65]
//               text-[#242424]

//               lg:text-[16px]
//             "
//           >
//             {benefit.description}
//           </p>
//         </div>
//       </div>
//     </article>
//   );
// }

// /* =========================================================
//    PAGE
// ========================================================= */

// export default function TicketsPage() {
//   const checkoutRef =
//     useRef(null);

//   const [form, setForm] =
//     useState({
//       name: '',
//       email: '',
//       phone: '',
//       quantity: 1,
//     });

//   const ticketPriceKES = 500;

//   const [status, setStatus] =
//     useState({
//       loading: false,
//       success: false,
//       error: '',
//       checkoutRequestID: '',
//     });

//   const totalAmountKES =
//     form.quantity *
//     ticketPriceKES;

//   /* =======================================================
//      SCROLL TO CHECKOUT
//   ======================================================= */

//   const scrollToCheckout = () => {
//     checkoutRef.current?.scrollIntoView({
//       behavior: 'smooth',
//       block: 'start',
//     });
//   };

//   /* =======================================================
//      PAYMENT
//   ======================================================= */

//   const handleSubmit =
//     async (event) => {
//       event.preventDefault();

//       setStatus({
//         loading: true,
//         success: false,
//         error: '',
//         checkoutRequestID: '',
//       });

//       try {
//         const response =
//           await axios.post(
//             `${API_BASE_URL}/last-dance/buy-ticket`,
//             form
//           );

//         if (
//           response.data?.success
//         ) {
//           const checkoutRequestID =
//             response.data
//               .checkoutRequestID;

//           setStatus({
//             loading: false,
//             success: true,
//             error: '',
//             checkoutRequestID,
//           });

//           /* -----------------------------------------
//              Optional development payment simulation
//           ------------------------------------------ */

//           try {
//             await axios.post(
//               `${API_BASE_URL}/last-dance/test-simulate-payment`,
//               {
//                 checkoutRequestID,
//               }
//             );
//           } catch (simulationError) {
//             // Optional test-mode simulation.
//           }

//           return;
//         }

//         setStatus({
//           loading: false,
//           success: false,
//           error:
//             response.data
//               ?.message ||
//             'Payment initiation failed.',
//           checkoutRequestID: '',
//         });
//       } catch (error) {
//         setStatus({
//           loading: false,
//           success: false,
//           error:
//             error.response?.data
//               ?.message ||
//             'M-Pesa STK push failed to trigger.',
//           checkoutRequestID: '',
//         });
//       }
//     };

//   return (
//     <main
//       className="
//         w-full
//         bg-[#f7f7f7]
//       "
//       style={{
//         fontFamily:
//           'Roboto, sans-serif',
//       }}
//     >
//       {/* =====================================================
//           PAGE INTRO
//       ====================================================== */}

//       <section
//         className="
//           bg-white
//           pb-12
//           pt-14

//           sm:pb-14
//           sm:pt-16

//           lg:pb-16
//           lg:pt-20
//         "
//       >
//         <div
//           className="
//             mx-auto
//             w-full
//             max-w-[1180px]
//             px-4

//             sm:px-6

//             lg:px-4
//           "
//         >
//           <div
//             className="
//               max-w-[820px]
//             "
//           >
//             <p
//               className="
//                 text-[13px]
//                 font-medium
//                 text-[#762e99]
//               "
//             >
//               Official event access
//             </p>

//             <h1
//               className="
//                 mt-3
//                 text-[34px]
//                 font-medium
//                 leading-[1.12]
//                 tracking-[-0.02em]
//                 text-black

//                 sm:text-[40px]

//                 lg:text-[44px]
//               "
//             >
//               Secure your Last Dance
//               entry pass.
//             </h1>

//             <p
//               className="
//                 mt-5
//                 max-w-[680px]
//                 text-[16px]
//                 font-normal
//                 leading-[1.65]
//                 text-[#242424]

//                 lg:text-[17px]
//               "
//             >
//               Book your Graduation Eve
//               ticket online and pay
//               securely through M-Pesa.
//               Your digital entry pass is
//               delivered directly to your
//               email after payment.
//             </p>

//             <p
//               className="
//                 mt-5
//                 text-[14px]
//                 font-medium
//                 text-black/55
//               "
//             >
//               October 26th, 2026
//               <span className="mx-2">
//                 •
//               </span>
//               Graduation Eve Send-Off
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* =====================================================
//           MAIN TICKETING AREA
//       ====================================================== */}

//       <section
//         className="
//           py-12

//           sm:py-14

//           lg:py-20
//         "
//       >
//         <div
//           className="
//             mx-auto
//             grid
//             w-full
//             max-w-[1180px]
//             grid-cols-1
//             gap-10
//             px-4

//             sm:px-6

//             lg:grid-cols-12
//             lg:gap-x-10
//             lg:gap-y-8
//             lg:px-4
//           "
//         >
//           {/* =================================================
//               TICKET ARTWORK

//               Mobile: first.
//               Desktop: right column above checkout.
//           ================================================== */}

//           <button
//             type="button"
//             onClick={
//               scrollToCheckout
//             }
//             className="
//               group
//               relative
//               order-1
//               h-[250px]
//               w-full
//               overflow-hidden
//               bg-black
//               text-left

//               lg:col-span-5
//               lg:col-start-8
//               lg:row-start-1
//             "
//             aria-label="Go to ticket checkout"
//           >
//             <img
//               src={TICKET_IMAGE}
//               alt="Last Dance event ticket"
//               className="
//                 absolute
//                 inset-0
//                 h-full
//                 w-full
//                 object-cover
//                 object-center
//                 transition-transform
//                 duration-700

//                 group-hover:scale-[1.02]
//               "
//             />

//             <div
//               className="
//                 absolute
//                 inset-0
//                 bg-gradient-to-t
//                 from-black/70
//                 via-black/10
//                 to-transparent
//               "
//             />

//             <div
//               className="
//                 absolute
//                 bottom-0
//                 left-0
//                 right-0
//                 p-5

//                 sm:p-6
//               "
//             >
//               <p
//                 className="
//                   text-[12px]
//                   font-medium
//                   text-white/70
//                 "
//               >
//                 Last Dance 2026
//               </p>

//               <div
//                 className="
//                   mt-1
//                   flex
//                   items-end
//                   justify-between
//                   gap-5
//                 "
//               >
//                 <h2
//                   className="
//                     text-[22px]
//                     font-medium
//                     leading-[1.2]
//                     tracking-[-0.02em]
//                     text-white

//                     sm:text-[24px]
//                   "
//                 >
//                   Official entry pass
//                 </h2>

//                 <span
//                   className="
//                     shrink-0
//                     text-[12px]
//                     font-medium
//                     text-white
//                     transition-colors

//                     group-hover:text-[#ff914d]
//                   "
//                 >
//                   Buy ticket →
//                 </span>
//               </div>
//             </div>
//           </button>

//           {/* =================================================
//               WHAT THE PASS UNLOCKS
//           ================================================== */}

//           <div
//             className="
//               order-2

//               lg:col-span-7
//               lg:col-start-1
//               lg:row-start-1
//               lg:row-span-2
//             "
//           >
//             <div
//               className="
//                 mb-10
//                 max-w-[620px]

//                 sm:mb-12
//               "
//             >
//               <p
//                 className="
//                   text-[13px]
//                   font-medium
//                   text-[#762e99]
//                 "
//               >
//                 Your entry pass
//               </p>

//               <h2
//                 className="
//                   mt-2
//                   text-[30px]
//                   font-medium
//                   leading-[1.15]
//                   tracking-[-0.02em]
//                   text-black

//                   sm:text-[36px]

//                   lg:text-[40px]
//                 "
//               >
//                 What your pass unlocks
//               </h2>

//               <p
//                 className="
//                   mt-5
//                   max-w-[560px]
//                   text-[16px]
//                   font-normal
//                   leading-[1.65]
//                   text-[#242424]
//                 "
//               >
//                 One pass gives you
//                 access to the complete
//                 Last Dance Graduation
//                 Eve experience.
//               </p>
//             </div>

//             <div
//               className="
//                 space-y-10

//                 sm:space-y-12
//               "
//             >
//               {PASS_BENEFITS.map(
//                 (
//                   benefit,
//                   index
//                 ) => (
//                   <RevealBenefit
//                     key={
//                       benefit.title
//                     }
//                     benefit={
//                       benefit
//                     }
//                     index={index}
//                   />
//                 )
//               )}
//             </div>
//           </div>

//           {/* =================================================
//               CHECKOUT
//           ================================================== */}

//           <div
//             ref={checkoutRef}
//             className="
//               order-3
//               scroll-mt-28

//               lg:col-span-5
//               lg:col-start-8
//               lg:row-start-2
//             "
//           >
//             <div
//               className="
//                 bg-white
//                 p-6
//                 shadow-[0_14px_40px_rgba(0,0,0,0.06)]

//                 sm:p-8

//                 lg:sticky
//                 lg:top-28
//               "
//             >
//               {/* =========================================
//                   CHECKOUT HEADING
//               ========================================== */}

//               <div
//                 className="
//                   border-b
//                   border-black/[0.08]
//                   pb-5
//                 "
//               >
//                 <p
//                   className="
//                     text-[12px]
//                     font-medium
//                     text-[#762e99]
//                   "
//                 >
//                   Secure checkout
//                 </p>

//                 <h2
//                   className="
//                     mt-2
//                     text-[26px]
//                     font-medium
//                     leading-[1.2]
//                     tracking-[-0.02em]
//                     text-black

//                     sm:text-[28px]
//                   "
//                 >
//                   Purchase your ticket
//                 </h2>

//                 <p
//                   className="
//                     mt-2
//                     text-[13px]
//                     font-normal
//                     leading-[1.55]
//                     text-black/55
//                   "
//                 >
//                   Pay securely using
//                   M-Pesa STK Push.
//                 </p>
//               </div>

//               {/* =========================================
//                   SUCCESS
//               ========================================== */}

//               {status.success ? (
//                 <div
//                   className="
//                     py-8
//                   "
//                 >
//                   <div
//                     className="
//                       flex
//                       h-12
//                       w-12
//                       items-center
//                       justify-center
//                       rounded-full
//                       bg-[#5e2590]
//                       text-[22px]
//                       text-white
//                     "
//                   >
//                     ✓
//                   </div>

//                   <h3
//                     className="
//                       mt-6
//                       text-[24px]
//                       font-medium
//                       leading-[1.2]
//                       tracking-[-0.02em]
//                       text-black
//                     "
//                   >
//                     Check your phone.
//                   </h3>

//                   <p
//                     className="
//                       mt-3
//                       text-[14px]
//                       font-normal
//                       leading-[1.65]
//                       text-[#242424]
//                     "
//                   >
//                     We sent an M-Pesa
//                     payment request for{' '}
//                     <strong>
//                       KES{' '}
//                       {totalAmountKES.toLocaleString()}
//                     </strong>
//                     . Enter your M-Pesa
//                     PIN to complete the
//                     purchase.
//                   </p>

//                   <div
//                     className="
//                       mt-6
//                       border-l-2
//                       border-[#762e99]
//                       bg-[#f7f7f7]
//                       px-4
//                       py-4
//                     "
//                   >
//                     <p
//                       className="
//                         text-[12px]
//                         leading-[1.6]
//                         text-black/65
//                       "
//                     >
//                       Your QR ticket will
//                       be delivered to
//                     </p>

//                     <p
//                       className="
//                         mt-1
//                         break-all
//                         text-[13px]
//                         font-medium
//                         text-black
//                       "
//                     >
//                       {form.email}
//                     </p>
//                   </div>

//                   <button
//                     type="button"
//                     onClick={() =>
//                       setStatus({
//                         loading:
//                           false,
//                         success:
//                           false,
//                         error: '',
//                         checkoutRequestID:
//                           '',
//                       })
//                     }
//                     className="
//                       mt-7
//                       w-full
//                       rounded-full
//                       bg-gradient-to-r
//                       from-[#5e2590]
//                       to-[#762e99]
//                       px-5
//                       py-3.5
//                       text-[14px]
//                       font-medium
//                       text-white
//                       transition-opacity

//                       hover:opacity-90
//                     "
//                   >
//                     Buy more tickets
//                   </button>
//                 </div>
//               ) : (
//                 /* =========================================
//                     PAYMENT FORM
//                 ========================================== */

//                 <form
//                   onSubmit={
//                     handleSubmit
//                   }
//                   className="
//                     pt-6
//                   "
//                 >
//                   {/* Error */}

//                   {status.error && (
//                     <div
//                       className="
//                         mb-5
//                         border-l-2
//                         border-red-500
//                         bg-red-50
//                         px-4
//                         py-3
//                         text-[13px]
//                         leading-[1.5]
//                         text-red-700
//                       "
//                     >
//                       {status.error}
//                     </div>
//                   )}

//                   {/* =====================================
//                       QUANTITY
//                   ====================================== */}

//                   <div
//                     className="
//                       flex
//                       items-center
//                       justify-between
//                       gap-5
//                       border-b
//                       border-black/[0.08]
//                       pb-6
//                     "
//                   >
//                     <div>
//                       <p
//                         className="
//                           text-[14px]
//                           font-medium
//                           text-black
//                         "
//                       >
//                         Ticket quantity
//                       </p>

//                       <p
//                         className="
//                           mt-1
//                           text-[12px]
//                           text-black/50
//                         "
//                       >
//                         KES{' '}
//                         {ticketPriceKES.toLocaleString()}{' '}
//                         per ticket
//                       </p>
//                     </div>

//                     <div
//                       className="
//                         flex
//                         items-center
//                         border
//                         border-black/15
//                       "
//                     >
//                       <button
//                         type="button"
//                         onClick={() =>
//                           setForm(
//                             (
//                               previous
//                             ) => ({
//                               ...previous,
//                               quantity:
//                                 Math.max(
//                                   1,
//                                   previous.quantity -
//                                     1
//                                 ),
//                             })
//                           )
//                         }
//                         className="
//                           flex
//                           h-10
//                           w-10
//                           items-center
//                           justify-center
//                           text-[18px]
//                           text-black
//                           transition-colors

//                           hover:bg-[#f3f3f3]
//                           hover:text-[#ff914d]
//                         "
//                       >
//                         −
//                       </button>

//                       <span
//                         className="
//                           flex
//                           h-10
//                           min-w-[45px]
//                           items-center
//                           justify-center
//                           border-x
//                           border-black/15
//                           text-[15px]
//                           font-medium
//                           text-black
//                         "
//                       >
//                         {form.quantity}
//                       </span>

//                       <button
//                         type="button"
//                         onClick={() =>
//                           setForm(
//                             (
//                               previous
//                             ) => ({
//                               ...previous,
//                               quantity:
//                                 previous.quantity +
//                                 1,
//                             })
//                           )
//                         }
//                         className="
//                           flex
//                           h-10
//                           w-10
//                           items-center
//                           justify-center
//                           text-[18px]
//                           text-black
//                           transition-colors

//                           hover:bg-[#f3f3f3]
//                           hover:text-[#ff914d]
//                         "
//                       >
//                         +
//                       </button>
//                     </div>
//                   </div>

//                   {/* =====================================
//                       FULL NAME
//                   ====================================== */}

//                   <div className="mt-6">
//                     <label
//                       htmlFor="ticket-name"
//                       className="
//                         block
//                         text-[13px]
//                         font-medium
//                         text-black
//                       "
//                     >
//                       Full name
//                     </label>

//                     <input
//                       id="ticket-name"
//                       type="text"
//                       required
//                       autoComplete="name"
//                       placeholder="Your full name"
//                       value={form.name}
//                       onChange={(
//                         event
//                       ) =>
//                         setForm({
//                           ...form,
//                           name:
//                             event.target
//                               .value,
//                         })
//                       }
//                       className="
//                         mt-2
//                         w-full
//                         border
//                         border-black/15
//                         bg-white
//                         px-4
//                         py-3.5
//                         text-[14px]
//                         text-black
//                         outline-none
//                         transition-colors

//                         placeholder:text-black/35

//                         focus:border-[#762e99]
//                       "
//                     />
//                   </div>

//                   {/* =====================================
//                       EMAIL
//                   ====================================== */}

//                   <div className="mt-5">
//                     <label
//                       htmlFor="ticket-email"
//                       className="
//                         block
//                         text-[13px]
//                         font-medium
//                         text-black
//                       "
//                     >
//                       Email address
//                     </label>

//                     <p
//                       className="
//                         mt-1
//                         text-[11px]
//                         text-black/45
//                       "
//                     >
//                       Your digital ticket
//                       will be sent here.
//                     </p>

//                     <input
//                       id="ticket-email"
//                       type="email"
//                       required
//                       autoComplete="email"
//                       placeholder="you@example.com"
//                       value={
//                         form.email
//                       }
//                       onChange={(
//                         event
//                       ) =>
//                         setForm({
//                           ...form,
//                           email:
//                             event.target
//                               .value,
//                         })
//                       }
//                       className="
//                         mt-2
//                         w-full
//                         border
//                         border-black/15
//                         bg-white
//                         px-4
//                         py-3.5
//                         text-[14px]
//                         text-black
//                         outline-none
//                         transition-colors

//                         placeholder:text-black/35

//                         focus:border-[#762e99]
//                       "
//                     />
//                   </div>

//                   {/* =====================================
//                       PHONE
//                   ====================================== */}

//                   <div className="mt-5">
//                     <label
//                       htmlFor="ticket-phone"
//                       className="
//                         block
//                         text-[13px]
//                         font-medium
//                         text-black
//                       "
//                     >
//                       M-Pesa phone number
//                     </label>

//                     <p
//                       className="
//                         mt-1
//                         text-[11px]
//                         text-black/45
//                       "
//                     >
//                       We'll send the STK
//                       Push to this number.
//                     </p>

//                     <input
//                       id="ticket-phone"
//                       type="tel"
//                       required
//                       autoComplete="tel"
//                       inputMode="tel"
//                       placeholder="0712345678"
//                       value={
//                         form.phone
//                       }
//                       onChange={(
//                         event
//                       ) =>
//                         setForm({
//                           ...form,
//                           phone:
//                             event.target
//                               .value,
//                         })
//                       }
//                       className="
//                         mt-2
//                         w-full
//                         border
//                         border-black/15
//                         bg-white
//                         px-4
//                         py-3.5
//                         text-[14px]
//                         text-black
//                         outline-none
//                         transition-colors

//                         placeholder:text-black/35

//                         focus:border-[#762e99]
//                       "
//                     />
//                   </div>

//                   {/* =====================================
//                       TOTAL
//                   ====================================== */}

//                   <div
//                     className="
//                       mt-7
//                       border-t
//                       border-black/[0.08]
//                       pt-6
//                     "
//                   >
//                     <div
//                       className="
//                         flex
//                         items-end
//                         justify-between
//                         gap-5
//                       "
//                     >
//                       <div>
//                         <p
//                           className="
//                             text-[12px]
//                             text-black/50
//                           "
//                         >
//                           Total payable
//                         </p>

//                         <p
//                           className="
//                             mt-1
//                             text-[12px]
//                             text-black/40
//                           "
//                         >
//                           {form.quantity}{' '}
//                           ticket
//                           {form.quantity >
//                           1
//                             ? 's'
//                             : ''}
//                         </p>
//                       </div>

//                       <p
//                         className="
//                           text-[26px]
//                           font-medium
//                           tracking-[-0.02em]
//                           text-black
//                         "
//                       >
//                         KES{' '}
//                         {totalAmountKES.toLocaleString()}
//                       </p>
//                     </div>

//                     {/* Submit */}

//                     <button
//                       type="submit"
//                       disabled={
//                         status.loading
//                       }
//                       className="
//                         mt-6
//                         w-full
//                         rounded-full
//                         bg-gradient-to-r
//                         from-[#5e2590]
//                         to-[#762e99]
//                         px-5
//                         py-4
//                         text-[14px]
//                         font-medium
//                         text-white
//                         transition-all
//                         duration-200

//                         hover:opacity-90

//                         active:scale-[0.99]

//                         disabled:cursor-not-allowed
//                         disabled:opacity-50
//                       "
//                     >
//                       {status.loading
//                         ? 'Sending M-Pesa request...'
//                         : `Pay KES ${totalAmountKES.toLocaleString()} with M-Pesa`}
//                     </button>

//                     <div
//                       className="
//                         mt-4
//                         flex
//                         items-center
//                         justify-center
//                         gap-2
//                         text-center
//                         text-[11px]
//                         leading-[1.5]
//                         text-black/45
//                       "
//                     >
//                       <span
//                         className="
//                           inline-block
//                           h-1.5
//                           w-1.5
//                           rounded-full
//                           bg-[#5e2590]
//                         "
//                       />

//                       Secure M-Pesa STK
//                       Push payment
//                     </div>
//                   </div>
//                 </form>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }









'use client';

import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import axios from 'axios';
import { io } from 'socket.io-client';
import { CheckCircle2, Clock, AlertCircle, RefreshCw, Download, ShieldCheck } from 'lucide-react';

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

   Ticket artwork:
   - SVG supported
   - Full checkout width
   - 125px high
   - No frame
   - No border
   - No background
   - No stretching

   Benefit artwork:
   Recommended source size = 360 × 250
========================================================= */

const TICKET_IMAGE =
  'https://ik.imagekit.io/rhjfaafsm/LastDanceTickets2.svg';

const PASS_BENEFITS = [
  {
    title: 'Express QR Gate Entry',

    description:
      'Your digital ticket includes a unique QR code for quick verification and smooth entry at the event gate.',

    image:
      'https://ik.imagekit.io/rhjfaafsm/TICKETqrcode.png',

    imageAlt:
      'Guests entering an event',
  },

  {
    title: 'Complimentary Welcome Drink',

    description:
      'Start your Graduation Eve experience with a complimentary welcome cocktail or mocktail available after entry.',

    image:
      'https://ik.imagekit.io/rhjfaafsm/drinkslastdance.png',

    imageAlt:
      'Welcome drinks at an event',
  },

  {
    title: 'All-Night DJ Afterparty',

    description:
      'Enjoy a full night of music, guest DJs, hype MCs and performances as we celebrate one final campus experience together.',

    image:
      'https://ik.imagekit.io/rhjfaafsm/partysoundlastdance.png',

    imageAlt:
      'DJ performing at a live event',
  },

  {
    title: '360° Photobooth Access',

    description:
      'Capture the night with your friends using the event photobooth and create photos and videos you can keep long after Graduation Eve.',

    image:
      'https://ik.imagekit.io/rhjfaafsm/photoboothlastdance.svg',

    imageAlt:
      'Friends enjoying an event',
  },
];

/* =========================================================
   SCROLL REVEAL BENEFIT
========================================================= */

function RevealBenefit({
  benefit,
  index,
}) {
  const ref = useRef(null);

  const [visible, setVisible] =
    useState(false);

  useEffect(() => {
    const element =
      ref.current;

    if (!element) {
      return;
    }

    const observer =
      new IntersectionObserver(
        ([entry]) => {
          if (
            entry.isIntersecting
          ) {
            setVisible(true);

            observer.unobserve(
              entry.target
            );
          }
        },
        {
          threshold: 0.15,

          rootMargin:
            '0px 0px -40px 0px',
        }
      );

    observer.observe(
      element
    );

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <article
      ref={ref}
      className={`
        border-b
        border-black/[0.08]
        pb-9
        transition-all
        duration-700
        ease-out

        sm:pb-10

        ${
          visible
            ? `
              translate-y-0
              scale-100
              opacity-100
            `
            : `
              translate-y-7
              scale-[0.98]
              opacity-0
            `
        }
      `}
      style={{
        transitionDelay: `${Math.min(
          index * 70,
          210
        )}ms`,
      }}
    >
      <div
        className="
          grid
          grid-cols-1
          gap-6

          sm:gap-7

          lg:grid-cols-[250px_1fr]
          lg:items-center
          lg:gap-9
        "
      >
        {/* =================================================
            BENEFIT IMAGE
        ================================================== */}

        <div
          className="
            relative
            aspect-[36/25]
            w-full
            max-w-[360px]

            lg:aspect-auto
            lg:h-[250px]
            lg:w-[250px]
          "
        >
          <img
            src={benefit.image}
            alt={
              benefit.imageAlt
            }
            loading="lazy"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-contain
              object-center
              transition-transform
              duration-700
              ease-out

              hover:scale-[1.02]
            "
          />
        </div>

        {/* =================================================
            BENEFIT TEXT
        ================================================== */}

        <div
          className="
            max-w-[400px]
          "
        >
          <p
            className="
              text-[12px]
              font-medium
              text-[#ff914d]
            "
          >
            0{index + 1}
          </p>

          <h3
            className="
              mt-2
              text-[25px]
              font-medium
              leading-[1.2]
              tracking-[-0.02em]
              text-black

              sm:text-[27px]

              lg:text-[29px]
            "
          >
            {benefit.title}
          </h3>

          <p
            className="
              mt-4
              text-[15px]
              font-normal
              leading-[1.65]
              text-[#242424]

              lg:text-[16px]
            "
          >
            {benefit.description}
          </p>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function TicketsPage() {
  const checkoutRef =
    useRef(null);

  const [form, setForm] =
    useState({
      name: '',
      email: '',
      phone: '',
      quantity: 1,
    });

  const [ticketPriceKES, setTicketPriceKES] = useState(500);
  const totalAmountKES = form.quantity * ticketPriceKES;

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
        console.warn('[TicketsPage] Could not load live ticket price, defaulting to 500:', err.message);
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
          console.log('[TicketsPage] Real-time ticket price updated by admin:', data.ticketPriceKES);
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

  // 'idle' | 'initiating' | 'awaiting_pin' | 'confirmed' | 'failed'
  const [paymentStage, setPaymentStage] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [checkoutRequestID, setCheckoutRequestID] = useState('');
  const [confirmedTicket, setConfirmedTicket] = useState(null);
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

  // Manual payment verification trigger (e.g. if countdown ended or user already entered PIN)
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
        setErrorMessage('Payment is still awaiting confirmation from M-Pesa. If you have keyed in your PIN, please give it a few seconds and tap verify again.');
      }
    } catch (err) {
      setErrorMessage('Could not query payment gateway. Please ensure you authorized the M-Pesa prompt and tap Verify again.');
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

  /* =======================================================
     SCROLL TO CHECKOUT
  ======================================================= */

  const scrollToCheckout = () => {
    checkoutRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
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

  const resetForm = () => {
    stopPolling();
    setPaymentStage('idle');
    setErrorMessage('');
    setCheckoutRequestID('');
    setConfirmedTicket(null);
  };

  return (
    <main
      className="
        w-full
        bg-[#f7f7f7]
      "
      style={{
        fontFamily:
          'Roboto, sans-serif',
      }}
    >
      {/* =====================================================
          COMPACT PAGE INTRO
      ====================================================== */}

      <section
        className="
          flex
          min-h-[100px]
          w-full
          items-center
          border-b
          border-black/[0.06]
          bg-white
          py-3

          sm:h-[100px]
          sm:py-0
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1180px]
            px-4

            sm:px-6

            lg:px-4
          "
        >
          <div
            className="
              max-w-[820px]
            "
          >
            <h1
              className="
                text-[32px]
                font-medium
                leading-[1.05]
                tracking-[-0.02em]
                text-black

                sm:text-[38px]

                lg:text-[44px]
              "
            >
              Secure your Last Dance
              entry pass.
            </h1>

            <p
              className="
                mt-2
                text-[14px]
                font-normal
                leading-none
                text-black/55

                sm:text-[15px]
              "
            >
              November 26th, 2026

              <span
                className="
                  mx-2
                  text-[#ff914d]
                "
              >
                •
              </span>

              Graduation Eve Send-Off
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <section
        className="
          py-8

          sm:py-10

          lg:py-12
        "
      >
        <div
          className="
            mx-auto
            grid
            w-full
            max-w-[1180px]
            grid-cols-1
            gap-12
            px-4

            sm:px-6

            lg:grid-cols-[minmax(0,7fr)_minmax(380px,5fr)]
            lg:items-start
            lg:gap-10
            lg:px-4
          "
        >
          {/* =================================================
              RIGHT CHECKOUT COLUMN
          ================================================== */}

          <aside
            className="
              order-1
              w-full

              lg:order-2
              lg:min-w-0
              lg:self-start
            "
          >
            <div
              className="
                w-full

                lg:sticky
                lg:top-[112px]
                lg:max-h-[calc(100vh-132px)]
                lg:overflow-y-auto
                lg:overscroll-contain
              "
            >
              {/* =================================================
                  TICKET ARTWORK

                  FULL checkout width.

                  Vertical height = 125px
                  on BOTH mobile and desktop.

                  No frame.
                  No border.
                  No background.
                  No radius.
                  No shadow.

                  SVG compatible.
              ================================================== */}

              <button
                type="button"
                onClick={
                  scrollToCheckout
                }
                aria-label="Go to ticket checkout"
                className="
                  group
                  block
                  h-[125px]
                  w-full
                  overflow-hidden
                  border-0
                  bg-transparent
                  p-0
                  text-left
                  outline-none
                "
              >
                <img
                  src={
                    TICKET_IMAGE
                  }
                  alt="Last Dance event ticket"
                  className="
                    block
                    h-full
                    w-full
                    object-contain
                    object-center
                    transition-transform
                    duration-500
                    ease-out

                    group-hover:scale-[1.005]
                  "
                />
              </button>

              {/* =================================================
                  CHECKOUT
              ================================================== */}

              <div
                ref={
                  checkoutRef
                }
                className="
                  w-full
                  scroll-mt-28
                  bg-white
                  p-6
                  shadow-[0_14px_40px_rgba(0,0,0,0.055)]

                  sm:p-8
                "
              >
                {/* =========================================
                    CHECKOUT HEADER
                ========================================== */}

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

                  <h2
                    className="
                      mt-2
                      text-[25px]
                      font-medium
                      leading-[1.2]
                      tracking-[-0.02em]
                      text-black

                      sm:text-[28px]
                    "
                  >
                    Purchase your ticket
                  </h2>

                  <p
                    className="
                      mt-2
                      text-[13px]
                      font-normal
                      leading-[1.55]
                      text-black/55
                    "
                  >
                    Pay securely using
                    M-Pesa STK Push.
                  </p>
                </div>

                {/* =========================================
                    CHECKOUT CONTENT BY PAYMENT STAGE
                ========================================== */}

                {paymentStage === 'confirmed' ? (
                  <div className="py-7 text-left">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 text-2xl font-bold">
                      ✓
                    </div>
                    <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-semibold text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Payment Verified & Confirmed
                    </div>
                    <h3 className="mt-3 text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] text-black">
                      Official Festival Pass Issued!
                    </h3>
                    <p className="mt-2 text-[14px] leading-[1.65] text-[#242424]">
                      Your entry pass has been generated and sent to <strong className="text-black font-semibold">{form.email}</strong>.
                    </p>

                    <div className="mt-6 rounded-2xl border border-black/10 bg-[#f7f7f7] p-4 text-[13px] space-y-2.5">
                      <div className="flex justify-between items-center text-black/60 pb-2 border-b border-black/[0.08]">
                        <span>M-Pesa Receipt Code</span>
                        <span className="font-mono font-bold text-black bg-white px-2 py-0.5 rounded border border-black/10">
                          {confirmedTicket?.mpesaReceiptNumber || 'Verified'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-black/60">
                        <span>Admission Passes</span>
                        <span className="font-semibold text-black">{form.quantity} Pass(es)</span>
                      </div>
                      <div className="flex justify-between items-center text-black/60">
                        <span>Total Paid</span>
                        <span className="font-bold text-emerald-700">KES {totalAmountKES.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="mt-7 flex flex-col gap-3">
                      <a
                        href={`${API_BASE_URL}/last-dance/tickets/${confirmedTicket?._id || confirmedTicket?.ticketId}/pass`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] px-5 py-4 text-[14px] font-medium text-white shadow-md hover:opacity-90 transition-all active:scale-[0.99]"
                      >
                        <Download className="w-4 h-4" />
                        View & Download Official Pass (.HTML)
                      </a>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="w-full rounded-full border border-black/15 py-3 text-[13px] font-medium text-black hover:bg-black/5 transition"
                      >
                        Buy More Tickets
                      </button>
                    </div>
                  </div>
                ) : paymentStage === 'awaiting_pin' ? (
                  <div className="py-7 text-left">
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

                    <p className="mt-3 text-[14px] leading-[1.65] text-[#242424]">
                      An M-Pesa prompt for <strong>KES {totalAmountKES.toLocaleString()}</strong> has been sent to <strong className="text-black">{form.phone}</strong>.
                    </p>

                    <div className="mt-5 rounded-2xl border border-black/10 bg-[#f7f7f7] p-4 text-[12px] text-black/70 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/10 text-[11px] font-bold text-black">1</span>
                        <span>Unlock your phone screen now.</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/10 text-[11px] font-bold text-black">2</span>
                        <span>Enter your M-Pesa PIN on the prompt to authorize payment.</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-black/10 text-[11px] font-bold text-black">3</span>
                        <span>Keep this window open; ticket pass loads automatically.</span>
                      </div>
                    </div>

                    {errorMessage && (
                      <div className="mt-4 border-l-2 border-amber-500 bg-amber-50 px-4 py-3 text-[13px] leading-[1.5] text-amber-800 rounded-r-lg">
                        {errorMessage}
                      </div>
                    )}

                    <div className="mt-5 flex items-center justify-between border-t border-black/10 pt-4 text-[12px] text-black/50">
                      <div className="flex items-center gap-2">
                        <RefreshCw className={`w-3.5 h-3.5 ${pollCountdown > 0 ? 'animate-spin' : ''} text-[#762e99]`} />
                        <span>
                          {pollCountdown > 0 
                            ? `Verifying payment with M-Pesa (${pollCountdown}s)` 
                            : 'Waiting for network confirmation...'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 space-y-3">
                      <button
                        type="button"
                        onClick={checkStatusManually}
                        disabled={isVerifyingManually}
                        className="w-full rounded-full bg-gradient-to-r from-[#5e2590] to-[#762e99] py-3.5 px-4 text-[13px] font-medium text-white shadow-md hover:opacity-95 transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
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
                        className="w-full rounded-full border border-black/15 py-3 text-[13px] font-medium text-black hover:bg-black/5 transition"
                      >
                        Cancel / Change Number
                      </button>
                    </div>
                  </div>
                ) : (
                  /* =========================================
                      PAYMENT FORM
                  ========================================== */

                  <form
                    onSubmit={
                      handleSubmit
                    }
                    className="
                      pt-6
                    "
                  >
                    {/* ERROR */}

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

                    {/* =====================================
                        QUANTITY
                    ====================================== */}

                    <div
                      className="
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
                            text-black/50
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
                            min-w-[45px]
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

                    {/* =====================================
                        FULL NAME
                    ====================================== */}

                    <div className="mt-6">
                      <label
                        htmlFor="ticket-name"
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
                        id="ticket-name"
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
                          setForm({
                            ...form,

                            name:
                              event
                                .target
                                .value,
                          })
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

                          placeholder:text-black/35

                          focus:border-[#762e99]
                        "
                      />
                    </div>

                    {/* =====================================
                        EMAIL
                    ====================================== */}

                    <div className="mt-5">
                      <label
                        htmlFor="ticket-email"
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
                        Your digital ticket
                        will be sent here.
                      </p>

                      <input
                        id="ticket-email"
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
                          setForm({
                            ...form,

                            email:
                              event
                                .target
                                .value,
                          })
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

                          placeholder:text-black/35

                          focus:border-[#762e99]
                        "
                      />
                    </div>

                    {/* =====================================
                        M-PESA PHONE
                    ====================================== */}

                    <div className="mt-5">
                      <label
                        htmlFor="ticket-phone"
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
                        id="ticket-phone"
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
                          setForm({
                            ...form,

                            phone:
                              event
                                .target
                                .value,
                          })
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

                          placeholder:text-black/35

                          focus:border-[#762e99]
                        "
                      />
                    </div>

                    {/* =====================================
                        TOTAL
                    ====================================== */}

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
                            text-[26px]
                            font-medium
                            tracking-[-0.02em]
                            text-black
                          "
                        >
                          KES{' '}
                          {totalAmountKES.toLocaleString()}
                        </p>
                      </div>

                      {/* PAYMENT BUTTON */}

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

                      <div
                        className="
                          mt-4
                          flex
                          items-center
                          justify-center
                          gap-2
                          text-center
                          text-[11px]
                          leading-[1.5]
                          text-black/45
                        "
                      >
                        <span
                          className="
                            inline-block
                            h-1.5
                            w-1.5
                            rounded-full
                            bg-[#ff914d]
                          "
                        />

                        Secure M-Pesa STK
                        Push payment
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </aside>

          {/* =================================================
              LEFT SIDE — BENEFITS
          ================================================== */}

          <div
            className="
              order-2
              min-w-0

              lg:order-1
            "
          >
            <div
              className="
                mb-9
                max-w-[600px]

                sm:mb-10
              "
            >
              <p
                className="
                  text-[13px]
                  font-medium
                  text-[#ff914d]
                "
              >
                Your entry pass
              </p>

              <h2
                className="
                  mt-2
                  text-[30px]
                  font-medium
                  leading-[1.15]
                  tracking-[-0.02em]
                  text-black

                  sm:text-[35px]

                  lg:text-[40px]
                "
              >
                What your pass unlocks
              </h2>

              <p
                className="
                  mt-4
                  max-w-[530px]
                  text-[15px]
                  font-normal
                  leading-[1.65]
                  text-[#242424]

                  sm:text-[16px]
                "
              >
                One ticket gives you
                access to the complete
                Last Dance Graduation
                Eve experience.
              </p>
            </div>

            <div
              className="
                space-y-9

                sm:space-y-10
              "
            >
              {PASS_BENEFITS.map(
                (
                  benefit,
                  index
                ) => (
                  <RevealBenefit
                    key={
                      benefit.title
                    }
                    benefit={
                      benefit
                    }
                    index={
                      index
                    }
                  />
                )
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}