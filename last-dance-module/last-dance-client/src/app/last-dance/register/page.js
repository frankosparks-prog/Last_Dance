// 'use client';

// import React, { useState } from 'react';
// import { 
//   UserPlus, CheckCircle2, ShieldAlert, Sparkles, Image as ImageIcon, 
//   Award, Heart, Vote, ArrowRight, Check, RefreshCw, Zap, Disc, Music, Radio, Headphones
// } from 'lucide-react';
// import axios from 'axios';
// import Link from 'next/link';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// const CATEGORIES = [
//   'Mr & Miss Last Dance',
//   'Most Likely to Succeed',
//   'Best Dressed / Most Stylish',
//   'Life of the Party',
//   'Power Couple',
//   'Campus Icon',
//   'Comeback King/Queen',
//   'Squad of the Year',
//   'Most Missed'
// ];

// const PRESET_AVATARS = [
//   { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80', label: 'Glamour' },
//   { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80', label: 'Gentleman' },
//   { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80', label: 'Chic' },
//   { url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80', label: 'Style' },
//   { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80', label: 'Vibe' }
// ];

// export default function CandidateRegisterPage() {
//   const [form, setForm] = useState({
//     name: '',
//     photoUrl: PRESET_AVATARS[0].url,
//     oneLiner: '',
//     pitch: '',
//     category: 'Mr & Miss Last Dance'
//   });
//   const [status, setStatus] = useState({ loading: false, success: false, error: '' });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setStatus({ loading: true, success: false, error: '' });

//     try {
//       const res = await axios.post(`${API_BASE_URL}/last-dance/register`, form);
//       if (res.data.success) {
//         setStatus({ loading: false, success: true, error: '' });
//       } else {
//         setStatus({ loading: false, success: false, error: res.data.message || 'Registration failed.' });
//       }
//     } catch (err) {
//       setStatus({
//         loading: false,
//         success: false,
//         error: err.response?.data?.message || 'Failed to submit candidate nomination.'
//       });
//     }
//   };

//   return (
//     <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans space-y-10">
      
//       {/* Page Title & Musical Hero */}
//       <div className="text-center max-w-3xl mx-auto space-y-4">
//         <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-900 border border-indigo-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
//           <Music className="w-4 h-4 text-indigo-600 animate-bounce" />
//           <span>Nominate a Star &bull; Festival Awards 2026</span>
//         </div>
        
//         <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight flex items-center justify-center space-x-3">
//           <span>NOMINATE A</span>
//           <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 flex items-center space-x-2">
//             <span>CAMPUS ICON</span>
//             <Disc className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 inline-block animate-vinyl-spin" />
//           </span>
//         </h1>
        
//         <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-semibold max-w-2xl mx-auto">
//           Submit yourself, a friend, or a campus duo for the Last Dance Awards 2026. 100% Free! Profiles appear on the public festival leaderboard after admin verification.
//         </p>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
//         {/* Left Column: Form (7 Cols) */}
//         <div className="lg:col-span-7 bg-white border border-indigo-200 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">
//           <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
//             <h3 className="text-xl font-black text-slate-950 flex items-center space-x-2">
//               <Sparkles className="w-5 h-5 text-indigo-600" />
//               <span>Nomination Details</span>
//             </h3>
            
//             {/* Live Bouncing Equalizer Bars */}
//             <div className="flex items-center space-x-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
//               <span className="text-[10px] font-black uppercase text-indigo-900">Sound Check</span>
//               <div className="flex items-end space-x-1 h-3 pl-1">
//                 <span className="w-1 bg-indigo-600 rounded-full animate-soundwave-1"></span>
//                 <span className="w-1 bg-indigo-400 rounded-full animate-soundwave-2"></span>
//                 <span className="w-1 bg-violet-600 rounded-full animate-soundwave-3"></span>
//               </div>
//             </div>
//           </div>

//           {status.success ? (
//             <div className="text-center py-10 space-y-5 animate-fade-in">
//               <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-emerald-300">
//                 <CheckCircle2 className="w-10 h-10 animate-bounce" />
//               </div>
              
//               <h4 className="text-2xl font-black text-slate-950">Nomination Received!</h4>
              
//               <p className="text-sm text-slate-800 max-w-md mx-auto leading-relaxed font-semibold">
//                 Thank you! <strong>{form.name}</strong> has been submitted under category <strong className="text-indigo-700">{form.category}</strong>. Your profile will be reviewed by admins shortly.
//               </p>
              
//               <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
//                 <Link
//                   href="/last-dance"
//                   className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white font-black text-xs uppercase tracking-wider shadow-md neu-button flex items-center justify-center space-x-2"
//                 >
//                   <Disc className="w-4 h-4" />
//                   <span>View Leaderboard</span>
//                 </Link>
//                 <button
//                   onClick={() => {
//                     setForm({ name: '', photoUrl: PRESET_AVATARS[0].url, oneLiner: '', pitch: '', category: 'Mr & Miss Last Dance' });
//                     setStatus({ loading: false, success: false, error: '' });
//                   }}
//                   className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-100/90 hover:bg-indigo-200 text-indigo-950 font-black text-xs uppercase tracking-wider neu-button border border-indigo-300"
//                 >
//                   Submit Another Candidate
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <form onSubmit={handleSubmit} className="space-y-5 text-xs">
//               {status.error && (
//                 <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-800 font-bold text-xs shadow-xs">
//                   {status.error}
//                 </div>
//               )}

//               {/* Candidate Full Name */}
//               <div>
//                 <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1.5">
//                   Candidate / Duo Full Name <span className="text-rose-600">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   required
//                   placeholder="e.g. Alexandre Vance or Marcus & Sophia"
//                   value={form.name}
//                   onChange={(e) => setForm({ ...form, name: e.target.value })}
//                   className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-2xl text-slate-950 font-bold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition shadow-xs"
//                 />
//               </div>

//               {/* Category Dropdown */}
//               <div>
//                 <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1.5">
//                   Select Award Category <span className="text-rose-600">*</span>
//                 </label>
//                 <select
//                   value={form.category}
//                   onChange={(e) => setForm({ ...form, category: e.target.value })}
//                   className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-2xl text-slate-950 font-bold focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition shadow-xs cursor-pointer"
//                 >
//                   {CATEGORIES.map(cat => (
//                     <option key={cat} value={cat} className="font-bold py-1 text-slate-900">{cat}</option>
//                   ))}
//                 </select>
//               </div>

//               {/* Photo Choice Gallery */}
//               <div>
//                 <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1.5">
//                   Avatar / Portrait Photo <span className="text-rose-600">*</span>
//                 </label>
                
//                 {/* Presets */}
//                 <div className="grid grid-cols-5 gap-2.5 mb-3">
//                   {PRESET_AVATARS.map((item, idx) => (
//                     <button
//                       key={idx}
//                       type="button"
//                       onClick={() => setForm({ ...form, photoUrl: item.url })}
//                       className={`relative flex flex-col items-center justify-center p-1 rounded-2xl border-2 transition ${
//                         form.photoUrl === item.url 
//                           ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/30' 
//                           : 'border-indigo-100 bg-white hover:border-indigo-300'
//                       }`}
//                     >
//                       <img src={item.url} alt={item.label} className="w-10 h-10 rounded-xl object-cover" />
//                       <span className="text-[9px] font-black text-slate-900 mt-1">{item.label}</span>
//                       {form.photoUrl === item.url && (
//                         <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5 shadow-xs">
//                           <Check className="w-3 h-3 stroke-[3]" />
//                         </div>
//                       )}
//                     </button>
//                   ))}
//                 </div>

//                 <div className="relative">
//                   <input
//                     type="url"
//                     required
//                     placeholder="Or paste custom image URL (Unsplash, Imgur, etc.)"
//                     value={form.photoUrl}
//                     onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
//                     className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-2xl text-slate-950 font-bold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition shadow-xs"
//                   />
//                 </div>
//               </div>

//               {/* One-Liner Catchphrase */}
//               <div>
//                 <div className="flex items-center justify-between mb-1.5">
//                   <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
//                     Catchphrase / Slogan <span className="text-rose-600">*</span>
//                   </label>
//                   <span className="text-[10px] font-extrabold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
//                     {form.oneLiner.length}/120
//                   </span>
//                 </div>
//                 <input
//                   type="text"
//                   required
//                   maxLength={120}
//                   placeholder="e.g. Bringing peak energy, timeless runway looks, and campus vibes."
//                   value={form.oneLiner}
//                   onChange={(e) => setForm({ ...form, oneLiner: e.target.value })}
//                   className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-2xl text-slate-950 font-bold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition shadow-xs"
//                 />
//               </div>

//               {/* Detailed Pitch */}
//               <div>
//                 <div className="flex items-center justify-between mb-1.5">
//                   <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
//                     Campaign Story & Pitch <span className="text-rose-600">*</span>
//                   </label>
//                   <span className="text-[10px] font-extrabold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
//                     {form.pitch.length}/1000
//                   </span>
//                 </div>
//                 <textarea
//                   required
//                   rows={4}
//                   maxLength={1000}
//                   placeholder="Tell your story, campus achievements, or why campus should vote for you..."
//                   value={form.pitch}
//                   onChange={(e) => setForm({ ...form, pitch: e.target.value })}
//                   className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-2xl text-slate-950 font-bold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition shadow-xs"
//                 ></textarea>
//               </div>

//               <button
//                 type="submit"
//                 disabled={status.loading}
//                 className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-xs uppercase tracking-wider shadow-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 neu-button"
//               >
//                 <UserPlus className="w-4 h-4 text-indigo-200" />
//                 <span>{status.loading ? 'Submitting Nomination...' : 'Submit Candidate Nomination (Free)'}</span>
//               </button>
//             </form>
//           )}
//         </div>

//         {/* Right Column: Live Card Preview with Vinyl Disc Badge (5 Cols) */}
//         <div className="lg:col-span-5 space-y-4 sticky top-6">
//           <div className="flex items-center space-x-2">
//             <Zap className="w-4 h-4 text-indigo-600" />
//             <h3 className="text-base font-black text-slate-950">Real-time Leaderboard Card Preview</h3>
//           </div>

//           <div className="bg-gradient-to-b from-white via-indigo-50/40 to-indigo-100/30 border-2 border-indigo-300 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
//             {/* Spinning Vinyl Disc Accent */}
//             <div className="absolute -top-4 -right-4 text-indigo-300/40 pointer-events-none">
//               <Disc className="w-24 h-24 animate-vinyl-spin" />
//             </div>

//             <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
//               <span className="text-[10px] font-black uppercase text-indigo-800 bg-indigo-100 border border-indigo-200 px-3 py-0.5 rounded-full">
//                 Track #1 Preview
//               </span>
//               <div className="flex items-end space-x-1 h-3">
//                 <span className="w-1 bg-indigo-600 rounded-full animate-soundwave-1"></span>
//                 <span className="w-1 bg-indigo-400 rounded-full animate-soundwave-2"></span>
//                 <span className="w-1 bg-violet-600 rounded-full animate-soundwave-3"></span>
//               </div>
//             </div>

//             <div className="flex items-center space-x-3.5 pt-1">
//               <img
//                 src={form.photoUrl || PRESET_AVATARS[0].url}
//                 alt="Preview Avatar"
//                 className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400 shadow-md"
//               />
//               <div>
//                 <span className="text-[9px] font-black uppercase tracking-wider text-indigo-900 bg-indigo-100 border border-indigo-300 px-2.5 py-0.5 rounded-full inline-block">
//                   {form.category}
//                 </span>
//                 <h4 className="text-lg font-black text-slate-950 mt-1">{form.name || 'Candidate Name'}</h4>
//                 <span className="text-[11px] text-indigo-700 font-black">Rank #1 (Live Preview)</span>
//               </div>
//             </div>

//             <p className="text-xs text-slate-900 font-extrabold italic bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
//               "{form.oneLiner || 'Your catchphrase slogan will be displayed here...'}"
//             </p>
            
//             <p className="text-xs text-slate-700 leading-relaxed font-semibold">
//               {form.pitch || 'Your campaign story and pitch will appear here for voters on the public leaderboard...'}
//             </p>

//             <div className="pt-4 border-t border-indigo-200 flex items-center justify-between">
//               <div>
//                 <div className="text-[10px] text-slate-500 font-black uppercase">Initial Score</div>
//                 <div className="text-base font-black text-indigo-700">0 Votes</div>
//               </div>
//               <div className="px-4 py-2.5 rounded-2xl bg-indigo-950 text-white font-black text-xs opacity-90 cursor-not-allowed flex items-center space-x-1.5 shadow-sm">
//                 <Vote className="w-3.5 h-3.5 text-indigo-200" />
//                 <span>Vote</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }








'use client';

import React, {
  useState,
} from 'react';

import axios from 'axios';
import Link from 'next/link';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:5000/api';

/* =========================================================
   AWARD CATEGORIES
========================================================= */

const CATEGORIES = [
  'Mr & Miss Last Dance',
  'Most Likely to Succeed',
  'Best Dressed / Most Stylish',
  'Life of the Party',
  'Power Couple',
  'Campus Icon',
  'Comeback King/Queen',
  'Squad of the Year',
  'Most Missed',
];

/* =========================================================
   PRESET CANDIDATE PHOTOS

   Recommended source size:
   600 × 600px minimum.

   Final candidate photos should preferably be square.
========================================================= */

const PRESET_AVATARS = [
  {
    url:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=85',
    label: 'Glamour',
  },

  {
    url:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=85',
    label: 'Classic',
  },

  {
    url:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=85',
    label: 'Chic',
  },

  {
    url:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=85',
    label: 'Style',
  },

  {
    url:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&auto=format&fit=crop&q=85',
    label: 'Vibe',
  },
];

/* =========================================================
   INITIAL FORM
========================================================= */

const INITIAL_FORM = {
  name: '',
  photoUrl:
    PRESET_AVATARS[0].url,
  oneLiner: '',
  pitch: '',
  category:
    'Mr & Miss Last Dance',
};

/* =========================================================
   PAGE
========================================================= */

export default function CandidateRegisterPage() {
  const [form, setForm] =
    useState(INITIAL_FORM);

  const [status, setStatus] =
    useState({
      loading: false,
      success: false,
      error: '',
    });

  /* =======================================================
     FORM UPDATE HELPER
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
     SUBMIT NOMINATION
  ======================================================= */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setStatus({
        loading: true,
        success: false,
        error: '',
      });

      try {
        const response =
          await axios.post(
            `${API_BASE_URL}/last-dance/register`,
            form
          );

        if (
          response.data
            ?.success
        ) {
          setStatus({
            loading: false,
            success: true,
            error: '',
          });

          return;
        }

        setStatus({
          loading: false,
          success: false,

          error:
            response.data
              ?.message ||
            'Registration failed.',
        });
      } catch (error) {
        setStatus({
          loading: false,
          success: false,

          error:
            error.response
              ?.data
              ?.message ||
            'Failed to submit candidate nomination.',
        });
      }
    };

  /* =======================================================
     RESET
  ======================================================= */

  const resetNomination =
    () => {
      setForm(
        INITIAL_FORM
      );

      setStatus({
        loading: false,
        success: false,
        error: '',
      });
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
          COMPACT HEADER
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
              max-w-[850px]
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
              Nominate a Last Dance
              candidate.
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
              October 26th, 2026

              <span
                className="
                  mx-2
                  text-[#ff914d]
                "
              >
                •
              </span>

              Graduation Eve Awards
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
            gap-10
            px-4

            sm:px-6

            lg:grid-cols-[minmax(0,7fr)_minmax(380px,5fr)]
            lg:items-start
            lg:gap-10
            lg:px-4
          "
        >
          {/* =================================================
              LIVE PREVIEW

              Mobile:
              appears first.

              Desktop:
              sticky on the right.
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
                lg:sticky
                lg:top-[112px]
              "
            >
              {/* Preview heading */}

              <div
                className="
                  mb-4
                "
              >
                <p
                  className="
                    text-[12px]
                    font-medium
                    text-[#ff914d]
                  "
                >
                  Live preview
                </p>

                <h2
                  className="
                    mt-1
                    text-[24px]
                    font-medium
                    leading-[1.2]
                    tracking-[-0.02em]
                    text-black

                    sm:text-[26px]
                  "
                >
                  Leaderboard profile
                </h2>

                <p
                  className="
                    mt-2
                    text-[13px]
                    leading-[1.55]
                    text-black/50
                  "
                >
                  See how the candidate
                  profile will look to
                  voters.
                </p>
              </div>

              {/* =============================================
                  PREVIEW CARD
              ============================================= */}

              <div
                className="
                  overflow-hidden
                  bg-white
                  shadow-[0_14px_40px_rgba(0,0,0,0.055)]
                "
              >
                {/* Candidate photo */}

                <div
                  className="
                    relative
                    aspect-square
                    w-full
                    bg-[#eeeeee]
                  "
                >
                  <img
                    src={
                      form.photoUrl ||
                      PRESET_AVATARS[0]
                        .url
                    }
                    alt={
                      form.name
                        ? `${form.name} candidate preview`
                        : 'Candidate preview'
                    }
                    className="
                      absolute
                      inset-0
                      h-full
                      w-full
                      object-cover
                      object-center
                    "
                  />
                </div>

                {/* Preview information */}

                <div
                  className="
                    p-6

                    sm:p-7
                  "
                >
                  <p
                    className="
                      text-[12px]
                      font-medium
                      text-[#ff914d]
                    "
                  >
                    {form.category}
                  </p>

                  <h3
                    className="
                      mt-2
                      text-[27px]
                      font-medium
                      leading-[1.15]
                      tracking-[-0.02em]
                      text-black

                      sm:text-[30px]
                    "
                  >
                    {form.name ||
                      'Candidate Name'}
                  </h3>

                  {/* Catchphrase */}

                  <div
                    className="
                      mt-5
                      border-l-2
                      border-[#762e99]
                      pl-4
                    "
                  >
                    <p
                      className="
                        text-[15px]
                        font-normal
                        leading-[1.55]
                        text-[#242424]
                      "
                    >
                      “
                      {form.oneLiner ||
                        'Your candidate catchphrase will appear here.'}
                      ”
                    </p>
                  </div>

                  {/* Pitch */}

                  <p
                    className="
                      mt-5
                      line-clamp-5
                      text-[14px]
                      font-normal
                      leading-[1.65]
                      text-black/60
                    "
                  >
                    {form.pitch ||
                      'The candidate campaign story will appear here. Tell voters why this person, duo or squad deserves their vote.'}
                  </p>

                  {/* Votes */}

                  <div
                    className="
                      mt-6
                      flex
                      items-end
                      justify-between
                      border-t
                      border-black/[0.08]
                      pt-5
                    "
                  >
                    <div>
                      <p
                        className="
                          text-[11px]
                          text-black/40
                        "
                      >
                        Starting score
                      </p>

                      <p
                        className="
                          mt-1
                          text-[21px]
                          font-medium
                          tracking-[-0.02em]
                          text-black
                        "
                      >
                        0 votes
                      </p>
                    </div>

                    <div
                      className="
                        rounded-full
                        bg-gradient-to-r
                        from-[#5e2590]
                        to-[#762e99]
                        px-5
                        py-2.5
                        text-[12px]
                        font-medium
                        text-white
                        opacity-60
                      "
                    >
                      Vote
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* =================================================
              FORM SIDE
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
                bg-white
                p-6
                shadow-[0_14px_40px_rgba(0,0,0,0.045)]

                sm:p-8

                lg:p-9
              "
            >
              {/* =============================================
                  FORM HEADING
              ============================================= */}

              <div
                className="
                  border-b
                  border-black/[0.08]
                  pb-6
                "
              >
                <p
                  className="
                    text-[12px]
                    font-medium
                    text-[#ff914d]
                  "
                >
                  Free nomination
                </p>

                <h2
                  className="
                    mt-2
                    text-[28px]
                    font-medium
                    leading-[1.2]
                    tracking-[-0.02em]
                    text-black

                    sm:text-[32px]
                  "
                >
                  Nomination details
                </h2>

                <p
                  className="
                    mt-3
                    max-w-[570px]
                    text-[14px]
                    font-normal
                    leading-[1.65]
                    text-black/55
                  "
                >
                  Submit yourself, a
                  friend, duo or squad for
                  the Last Dance Awards.
                  Approved nominations
                  appear on the public
                  leaderboard.
                </p>
              </div>

              {/* =============================================
                  SUCCESS
              ============================================= */}

              {status.success ? (
                <div
                  className="
                    py-10
                  "
                >
                  <div
                    className="
                      flex
                      h-12
                      w-12
                      items-center
                      justify-center
                      rounded-full
                      bg-[#5e2590]
                      text-[22px]
                      text-white
                    "
                  >
                    ✓
                  </div>

                  <h3
                    className="
                      mt-6
                      text-[28px]
                      font-medium
                      leading-[1.2]
                      tracking-[-0.02em]
                      text-black
                    "
                  >
                    Nomination received.
                  </h3>

                  <p
                    className="
                      mt-4
                      max-w-[520px]
                      text-[15px]
                      font-normal
                      leading-[1.65]
                      text-[#242424]
                    "
                  >
                    <strong>
                      {form.name}
                    </strong>{' '}
                    has been submitted
                    under{' '}

                    <strong>
                      {form.category}
                    </strong>
                    . The nomination will
                    appear after review.
                  </p>

                  <div
                    className="
                      mt-7
                      flex
                      flex-col
                      gap-3

                      sm:flex-row
                    "
                  >
                    <Link
                      href="/last-dance"
                      className="
                        inline-flex
                        items-center
                        justify-center
                        rounded-full
                        bg-gradient-to-r
                        from-[#5e2590]
                        to-[#762e99]
                        px-6
                        py-3.5
                        text-[14px]
                        font-medium
                        text-white
                        transition-opacity

                        hover:opacity-90
                      "
                    >
                      View leaderboard
                    </Link>

                    <button
                      type="button"
                      onClick={
                        resetNomination
                      }
                      className="
                        inline-flex
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-black/15
                        bg-white
                        px-6
                        py-3.5
                        text-[14px]
                        font-medium
                        text-black
                        transition-colors

                        hover:border-[#762e99]
                        hover:text-[#762e99]
                      "
                    >
                      Submit another
                    </button>
                  </div>
                </div>
              ) : (
                /* =========================================
                    NOMINATION FORM
                ========================================== */

                <form
                  onSubmit={
                    handleSubmit
                  }
                  className="
                    pt-7
                  "
                >
                  {/* =====================================
                      ERROR
                  ====================================== */}

                  {status.error && (
                    <div
                      className="
                        mb-6
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
                      {status.error}
                    </div>
                  )}

                  {/* =====================================
                      CANDIDATE NAME
                  ====================================== */}

                  <div>
                    <label
                      htmlFor="candidate-name"
                      className="
                        block
                        text-[13px]
                        font-medium
                        text-black
                      "
                    >
                      Candidate / duo
                      name
                    </label>

                    <p
                      className="
                        mt-1
                        text-[11px]
                        text-black/45
                      "
                    >
                      Enter the name as it
                      should appear on the
                      leaderboard.
                    </p>

                    <input
                      id="candidate-name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="e.g. Alexandre Vance or Marcus & Sophia"
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
                        font-normal
                        text-black
                        outline-none
                        transition-colors

                        placeholder:text-black/30

                        focus:border-[#762e99]
                      "
                    />
                  </div>

                  {/* =====================================
                      CATEGORY
                  ====================================== */}

                  <div
                    className="
                      mt-6
                    "
                  >
                    <label
                      htmlFor="candidate-category"
                      className="
                        block
                        text-[13px]
                        font-medium
                        text-black
                      "
                    >
                      Award category
                    </label>

                    <p
                      className="
                        mt-1
                        text-[11px]
                        text-black/45
                      "
                    >
                      Choose the award
                      category for this
                      nomination.
                    </p>

                    <select
                      id="candidate-category"
                      required
                      value={
                        form.category
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          'category',
                          event.target
                            .value
                        )
                      }
                      className="
                        mt-2
                        w-full
                        cursor-pointer
                        border
                        border-black/15
                        bg-white
                        px-4
                        py-3.5
                        text-[14px]
                        font-normal
                        text-black
                        outline-none
                        transition-colors

                        focus:border-[#762e99]
                      "
                    >
                      {CATEGORIES.map(
                        (category) => (
                          <option
                            key={
                              category
                            }
                            value={
                              category
                            }
                          >
                            {category}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* =====================================
                      PORTRAIT
                  ====================================== */}

                  <div
                    className="
                      mt-7
                    "
                  >
                    <div>
                      <p
                        className="
                          text-[13px]
                          font-medium
                          text-black
                        "
                      >
                        Candidate portrait
                      </p>

                      <p
                        className="
                          mt-1
                          text-[11px]
                          leading-[1.5]
                          text-black/45
                        "
                      >
                        Choose a temporary
                        portrait or paste
                        your own image URL.
                      </p>
                    </div>

                    {/* Presets */}

                    <div
                      className="
                        mt-4
                        grid
                        grid-cols-3
                        gap-3

                        sm:grid-cols-5
                      "
                    >
                      {PRESET_AVATARS.map(
                        (
                          item,
                          index
                        ) => {
                          const selected =
                            form.photoUrl ===
                            item.url;

                          return (
                            <button
                              key={
                                item.url
                              }
                              type="button"
                              onClick={() =>
                                updateForm(
                                  'photoUrl',
                                  item.url
                                )
                              }
                              aria-label={`Use ${item.label} portrait`}
                              className="
                                group
                                text-left
                              "
                            >
                              <div
                                className={`
                                  relative
                                  aspect-square
                                  w-full
                                  overflow-hidden
                                  transition-all
                                  duration-200

                                  ${
                                    selected
                                      ? 'ring-2 ring-[#762e99] ring-offset-2'
                                      : ''
                                  }
                                `}
                              >
                                <img
                                  src={
                                    item.url
                                  }
                                  alt={
                                    item.label
                                  }
                                  className="
                                    h-full
                                    w-full
                                    object-cover
                                    object-center
                                  "
                                />

                                {selected && (
                                  <div
                                    className="
                                      absolute
                                      right-2
                                      top-2
                                      flex
                                      h-6
                                      w-6
                                      items-center
                                      justify-center
                                      rounded-full
                                      bg-[#5e2590]
                                      text-[12px]
                                      font-medium
                                      text-white
                                    "
                                  >
                                    ✓
                                  </div>
                                )}
                              </div>

                              <p
                                className={`
                                  mt-2
                                  text-[11px]
                                  font-medium
                                  transition-colors

                                  ${
                                    selected
                                      ? 'text-[#762e99]'
                                      : 'text-black/55'
                                  }
                                `}
                              >
                                {
                                  item.label
                                }
                              </p>
                            </button>
                          );
                        }
                      )}
                    </div>

                    {/* URL */}

                    <div
                      className="
                        mt-5
                      "
                    >
                      <label
                        htmlFor="candidate-photo-url"
                        className="
                          block
                          text-[12px]
                          font-medium
                          text-black/70
                        "
                      >
                        Or paste image URL
                      </label>

                      <input
                        id="candidate-photo-url"
                        type="url"
                        required
                        placeholder="https://your-image-url.com/photo.jpg"
                        value={
                          form.photoUrl
                        }
                        onChange={(
                          event
                        ) =>
                          updateForm(
                            'photoUrl',
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
                          font-normal
                          text-black
                          outline-none
                          transition-colors

                          placeholder:text-black/30

                          focus:border-[#762e99]
                        "
                      />
                    </div>
                  </div>

                  {/* =====================================
                      CATCHPHRASE
                  ====================================== */}

                  <div
                    className="
                      mt-7
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
                          htmlFor="candidate-catchphrase"
                          className="
                            block
                            text-[13px]
                            font-medium
                            text-black
                          "
                        >
                          Catchphrase
                        </label>

                        <p
                          className="
                            mt-1
                            text-[11px]
                            text-black/45
                          "
                        >
                          Keep it short,
                          memorable and
                          authentic.
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
                        {
                          form
                            .oneLiner
                            .length
                        }
                        /120
                      </span>
                    </div>

                    <input
                      id="candidate-catchphrase"
                      type="text"
                      required
                      maxLength={120}
                      placeholder="e.g. Bringing peak energy and unforgettable campus vibes."
                      value={
                        form.oneLiner
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          'oneLiner',
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
                        font-normal
                        text-black
                        outline-none
                        transition-colors

                        placeholder:text-black/30

                        focus:border-[#762e99]
                      "
                    />
                  </div>

                  {/* =====================================
                      CAMPAIGN STORY
                  ====================================== */}

                  <div
                    className="
                      mt-7
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
                          htmlFor="candidate-pitch"
                          className="
                            block
                            text-[13px]
                            font-medium
                            text-black
                          "
                        >
                          Campaign story
                        </label>

                        <p
                          className="
                            mt-1
                            text-[11px]
                            text-black/45
                          "
                        >
                          Tell voters why
                          this candidate
                          deserves the
                          award.
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
                        {
                          form.pitch
                            .length
                        }
                        /1000
                      </span>
                    </div>

                    <textarea
                      id="candidate-pitch"
                      required
                      rows={6}
                      maxLength={
                        1000
                      }
                      placeholder="Share their story, achievements, campus impact, memories or what makes them stand out..."
                      value={
                        form.pitch
                      }
                      onChange={(
                        event
                      ) =>
                        updateForm(
                          'pitch',
                          event.target
                            .value
                        )
                      }
                      className="
                        mt-2
                        w-full
                        resize-y
                        border
                        border-black/15
                        bg-white
                        px-4
                        py-3.5
                        text-[14px]
                        font-normal
                        leading-[1.6]
                        text-black
                        outline-none
                        transition-colors

                        placeholder:text-black/30

                        focus:border-[#762e99]
                      "
                    />
                  </div>

                  {/* =====================================
                      SUBMIT
                  ====================================== */}

                  <div
                    className="
                      mt-8
                      border-t
                      border-black/[0.08]
                      pt-7
                    "
                  >
                    <button
                      type="submit"
                      disabled={
                        status.loading
                      }
                      className="
                        w-full
                        rounded-full
                        bg-gradient-to-r
                        from-[#5e2590]
                        to-[#762e99]
                        px-6
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
                      {status.loading
                        ? 'Submitting nomination...'
                        : 'Submit nomination'}
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

                      Nomination is free
                      and subject to
                      review
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}