// // 'use client';

// // import React from 'react';
// // import Link from 'next/link';
// // import { Disc, ShieldCheck, Heart } from 'lucide-react';

// // export default function Footer() {
// //   return (
// //     <footer className="bg-indigo-950/5 border-t border-indigo-200/80 text-slate-700 font-sans pt-12 pb-8">
// //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
// //         <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-indigo-200/80">
          
// //           {/* Col 1: Brand Info */}
// //           <div className="space-y-4 md:col-span-2">
// //             <div className="flex items-center space-x-3">
// //               <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 p-0.5 shadow-sm">
// //                 <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
// //                   <Disc className="w-4 h-4 text-indigo-300" />
// //                 </div>
// //               </div>
// //               <span className="font-black text-xl tracking-tight text-slate-900">LAST DANCE FESTIVAL</span>
// //             </div>
// //             <p className="text-xs text-slate-600 leading-relaxed max-w-md font-medium">
// //               The official Graduation Eve send-off festival & awards portal. Celebrate four years of music, culture, and unforgettable memories with live real-time voting and digital passes.
// //             </p>
// //             <div className="flex items-center space-x-2 text-[11px] text-indigo-900 font-bold">
// //               <ShieldCheck className="w-4 h-4 text-emerald-600" />
// //               <span>Verified M-Pesa STK Push Payment Gateway</span>
// //             </div>
// //           </div>

// //           {/* Col 2: Quick Links */}
// //           <div className="space-y-3">
// //             <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950">Navigation</h4>
// //             <ul className="space-y-2 text-xs font-semibold">
// //               <li>
// //                 <Link href="/last-dance" className="hover:text-indigo-600 transition">
// //                   Leaderboard & Voting
// //                 </Link>
// //               </li>
// //               <li>
// //                 <Link href="/last-dance/tickets" className="hover:text-indigo-600 transition">
// //                   Buy Entry Tickets
// //                 </Link>
// //               </li>
// //               <li>
// //                 <Link href="/last-dance/register" className="hover:text-indigo-600 transition">
// //                   Nominate a Candidate
// //                 </Link>
// //               </li>
// //               <li>
// //                 <Link href="/last-dance/info" className="hover:text-indigo-600 transition">
// //                   Event Schedule & Guidelines
// //                 </Link>
// //               </li>
// //             </ul>
// //           </div>

// //           {/* Col 3: Event Details */}
// //           <div className="space-y-3">
// //             <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950">Event Info</h4>
// //             <ul className="space-y-2 text-xs font-medium text-slate-700">
// //               <li>Event Date: October 26th, 2026</li>
// //               <li>Gate Opens: 06:00 PM EAT</li>
// //               <li>Dress Code: Red Carpet & Gala Eveningwear</li>
// //             </ul>
// //           </div>
// //         </div>

// //         {/* Bottom Bar */}
// //         <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium space-y-3 sm:space-y-0">
// //           <p>&copy; 2026 NutriPay Last Dance Engine. All Rights Reserved.</p>
// //           <p className="flex items-center space-x-1">
// //             <span>Crafted with</span>
// //             <Heart className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600 inline" />
// //             <span>for Graduation Eve</span>
// //           </p>
// //         </div>
// //       </div>
// //     </footer>
// //   );
// // }








// 'use client';

// import React from 'react';
// import Link from 'next/link';
// import { ShieldCheck, Heart } from 'lucide-react';

// const LAST_DANCE_LOGO =
//   'https://ik.imagekit.io/rhjfaafsm/LastDancefootersvg.svg';

// const NUTRIPAY_LOGO =
//   'https://ik.imagekit.io/rhjfaafsm/nutripaylastdancelogo.svg';

// export default function Footer() {
//   const year = new Date().getFullYear();

//   const navigationLinks = [
//     {
//       name: 'Leaderboard & Voting',
//       href: '/last-dance',
//     },
//     {
//       name: 'Buy Entry Tickets',
//       href: '/last-dance/tickets',
//     },
//     {
//       name: 'Nominate a Candidate',
//       href: '/last-dance/register',
//     },
//     {
//       name: 'Event Information',
//       href: '/last-dance/info',
//     },
//   ];

//   return (
//     <footer
//       className="
//         relative
//         w-full
//         overflow-hidden
//         bg-gradient-to-r
//         from-[#5e2590]
//         to-[#762e99]
//         text-white
//       "
//       style={{
//         fontFamily: 'Roboto, sans-serif',
//       }}
//     >
//       {/* =====================================================
//           DECORATIVE SVG RING PATTERN
//       ====================================================== */}

//       <div
//         className="
//           pointer-events-none
//           absolute
//           -right-[180px]
//           top-1/2
//           z-0
//           h-[620px]
//           w-[620px]
//           -translate-y-1/2
//           opacity-[0.10]

//           sm:-right-[120px]
//           sm:h-[700px]
//           sm:w-[700px]

//           lg:-right-[80px]
//           lg:h-[800px]
//           lg:w-[800px]
//         "
//       >
//         <svg
//           viewBox="0 0 800 800"
//           fill="none"
//           xmlns="http://www.w3.org/2000/svg"
//           className="h-full w-full text-white"
//         >
//           {[
//             70,
//             115,
//             160,
//             205,
//             250,
//             295,
//             340,
//             385,
//             430,
//             475,
//             520,
//             565,
//           ].map((radius, index) => (
//             <circle
//               key={index}
//               cx="520"
//               cy="400"
//               r={radius}
//               stroke="currentColor"
//               strokeWidth="1.2"
//             />
//           ))}
//         </svg>
//       </div>

//       {/* =====================================================
//           SECOND SUBTLE PATTERN
//       ====================================================== */}

//       <div
//         className="
//           pointer-events-none
//           absolute
//           -left-[220px]
//           -top-[240px]
//           z-0
//           h-[520px]
//           w-[520px]
//           opacity-[0.06]
//         "
//       >
//         <svg
//           viewBox="0 0 600 600"
//           fill="none"
//           xmlns="http://www.w3.org/2000/svg"
//           className="h-full w-full text-white"
//         >
//           {[80, 130, 180, 230, 280, 330, 380, 430].map(
//             (radius, index) => (
//               <circle
//                 key={index}
//                 cx="300"
//                 cy="300"
//                 r={radius}
//                 stroke="currentColor"
//                 strokeWidth="1.4"
//               />
//             )
//           )}
//         </svg>
//       </div>

//       {/* =====================================================
//           MAIN FOOTER CONTENT
//       ====================================================== */}

//       <div
//         className="
//           relative
//           z-10
//           mx-auto
//           w-full
//           max-w-[1180px]
//           px-4
//           pb-8
//           pt-14

//           sm:px-6
//           sm:pt-16

//           lg:px-4
//           lg:pb-10
//           lg:pt-20
//         "
//       >
//         <div
//           className="
//             grid
//             grid-cols-1
//             gap-10
//             border-b
//             border-white/15
//             pb-12

//             md:grid-cols-2

//             lg:grid-cols-12
//             lg:gap-10
//             lg:pb-14
//           "
//         >
//           {/* =================================================
//               BRAND COLUMN
//           ================================================== */}

//           <div
//             className="
//               lg:col-span-5
//             "
//           >
//             <Link
//               href="/last-dance"
//               aria-label="Last Dance home"
//               className="
//                 inline-flex
//                 items-center
//               "
//             >
//               <img
//                 src={LAST_DANCE_LOGO}
//                 alt="Last Dance"
//                 width={489}
//                 height={184}
//                 className="
//                   h-auto
//                   w-[190px]
//                   object-contain

//                   sm:w-[220px]

//                   lg:w-[250px]
//                 "
//               />
//             </Link>

//             <p
//               className="
//                 mt-6
//                 max-w-[470px]
//                 text-[14px]
//                 font-normal
//                 leading-[1.7]
//                 text-white/75

//                 sm:text-[15px]
//               "
//             >
//               The official Graduation Eve celebration, awards and live voting
//               experience. Celebrate the personalities, friendships and moments
//               that made campus life unforgettable.
//             </p>

//             {/* Verification */}


//           </div>

//           {/* =================================================
//               NAVIGATION
//           ================================================== */}

//           <div
//             className="
//               lg:col-span-2
//               lg:pt-2
//             "
//           >
//             <h3
//               className="
//                 text-[12px]
//                 font-medium
//                 tracking-[0.08em]
//                 text-white
//               "
//             >
//               Navigation
//             </h3>

//             <ul
//               className="
//                 mt-5
//                 space-y-3.5
//               "
//             >
//               {navigationLinks.map((link) => (
//                 <li key={link.href}>
//                   <Link
//                     href={link.href}
//                     className="
//                       text-[13px]
//                       font-normal
//                       leading-relaxed
//                       text-white/70
//                       transition-colors
//                       duration-200

//                       hover:text-[#ff914d]
//                     "
//                   >
//                     {link.name}
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* =================================================
//               EVENT INFORMATION
//           ================================================== */}

//           <div
//             className="
//               lg:col-span-2
//               lg:pt-2
//             "
//           >
//             <h3
//               className="
//                 text-[12px]
//                 font-medium
//                 tracking-[0.08em]
//                 text-white
//               "
//             >
//               Event info
//             </h3>

//             <div
//               className="
//                 mt-5
//                 space-y-4
//               "
//             >
//               <div>
//                 <p
//                   className="
//                     text-[11px]
//                     font-medium
//                     text-white/45
//                   "
//                 >
//                   Event date
//                 </p>

//                 <p
//                   className="
//                     mt-1
//                     text-[13px]
//                     font-normal
//                     text-white/80
//                   "
//                 >
//                   October 26th, 2026
//                 </p>
//               </div>

//               <div>
//                 <p
//                   className="
//                     text-[11px]
//                     font-medium
//                     text-white/45
//                   "
//                 >
//                   Gates open
//                 </p>

//                 <p
//                   className="
//                     mt-1
//                     text-[13px]
//                     font-normal
//                     text-white/80
//                   "
//                 >
//                   06:00 PM EAT
//                 </p>
//               </div>

//               <div>
//                 <p
//                   className="
//                     text-[11px]
//                     font-medium
//                     text-white/45
//                   "
//                 >
//                   Dress code
//                 </p>

//                 <p
//                   className="
//                     mt-1
//                     text-[13px]
//                     font-normal
//                     leading-[1.5]
//                     text-white/80
//                   "
//                 >
//                   Red carpet & gala eveningwear
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* =================================================
//               POWERED BY NUTRIPAY
//           ================================================== */}

//           <div
//             className="
//               lg:col-span-3
//               lg:pt-2
//             "
//           >
//             <h3
//               className="
//                 text-[12px]
//                 font-medium
//                 tracking-[0.08em]
//                 text-white
//               "
//             >
//               Powered by
//             </h3>

//             <div
//               className="
//                 mt-5
//                 max-w-[270px]
//                 rounded-[18px]
//                 border
//                 border-white/15
//                 bg-white
//                 px-5
//                 py-4
//                 shadow-[0_10px_30px_rgba(0,0,0,0.08)]
//               "
//             >
//               <img
//                 src={NUTRIPAY_LOGO}
//                 alt="NutriPay"
//                 width={489}
//                 height={184}
//                 className="
//                   h-auto
//                   w-[150px]
//                   object-contain

//                   sm:w-[165px]
//                 "
//               />
//             </div>

//             <p
//               className="
//                 mt-4
//                 max-w-[260px]
//                 text-[12px]
//                 font-normal
//                 leading-[1.6]
//                 text-white/60
//               "
//             >
//               Event ticketing, payments and digital voting infrastructure
//               powered by NutriPay.
//             </p>
//           </div>
//         </div>

//         {/* =====================================================
//             BOTTOM BAR
//         ====================================================== */}

//         <div
//           className="
//             flex
//             flex-col
//             gap-5
//             pt-7

//             sm:flex-row
//             sm:items-center
//             sm:justify-between
//           "
//         >
//           <p
//             className="
//               text-[12px]
//               font-normal
//               text-white/50
//             "
//           >
//             © {year} Last Dance Festival. All rights reserved.
//           </p>

//           <div
//             className="
//               flex
//               flex-wrap
//               items-center
//               gap-x-5
//               gap-y-2
//             "
//           >
//             <Link
//               href="/last-dance/info"
//               className="
//                 text-[12px]
//                 font-normal
//                 text-white/55
//                 transition-colors

//                 hover:text-[#ff914d]
//               "
//             >
//               Event guidelines
//             </Link>

//             <span
//               className="
//                 hidden
//                 h-1
//                 w-1
//                 rounded-full
//                 bg-white/30

//                 sm:block
//               "
//             />

//             <Link
//               href="/privacy"
//               className="
//                 text-[12px]
//                 font-normal
//                 text-white/55
//                 transition-colors

//                 hover:text-[#ff914d]
//               "
//             >
//               Privacy policy
//             </Link>

//             <span
//               className="
//                 hidden
//                 h-1
//                 w-1
//                 rounded-full
//                 bg-white/30

//                 sm:block
//               "
//             />


//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }







'use client';

import React from 'react';
import Link from 'next/link';

const LAST_DANCE_LOGO =
  'https://ik.imagekit.io/rhjfaafsm/LastDancefootersvg.svg';

const NUTRIPAY_LOGO =
  'https://ik.imagekit.io/rhjfaafsm/nutrilastdance.svg';

export default function Footer() {
  const year = new Date().getFullYear();

  const navigationLinks = [
    {
      name: 'Leaderboard & Voting',
      href: '/last-dance',
    },
    {
      name: 'Services & Merchandise',
      href: '/last-dance/services',
    },
    {
      name: 'Campus Accommodations',
      href: '/last-dance/accommodations',
    },
    {
      name: 'Buy Entry Tickets',
      href: '/last-dance/tickets',
    },
    {
      name: 'Nominate a Candidate',
      href: '/last-dance/register',
    },
    {
      name: 'Event Information',
      href: '/last-dance/info',
    },
  ];

  return (
    <footer
      suppressHydrationWarning
      className="
        relative
        w-full
        overflow-hidden
        bg-gradient-to-r
        from-[#5e2590]
        to-[#762e99]
        text-white
      "
      style={{
        fontFamily: 'Roboto, sans-serif',
      }}
    >
      {/* =====================================================
          DECORATIVE SVG RING PATTERN
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -right-[180px]
          top-1/2
          z-0
          h-[620px]
          w-[620px]
          -translate-y-1/2
          opacity-[0.10]

          sm:-right-[120px]
          sm:h-[700px]
          sm:w-[700px]

          lg:-right-[80px]
          lg:h-[800px]
          lg:w-[800px]
        "
      >
        <svg
          viewBox="0 0 800 800"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full text-white"
        >
          {[
            70,
            115,
            160,
            205,
            250,
            295,
            340,
            385,
            430,
            475,
            520,
            565,
          ].map((radius, index) => (
            <circle
              key={index}
              cx="520"
              cy="400"
              r={radius}
              stroke="currentColor"
              strokeWidth="1.2"
            />
          ))}
        </svg>
      </div>

      {/* =====================================================
          SECOND SUBTLE PATTERN
      ====================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-[220px]
          -top-[240px]
          z-0
          h-[520px]
          w-[520px]
          opacity-[0.06]
        "
      >
        <svg
          viewBox="0 0 600 600"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full text-white"
        >
          {[80, 130, 180, 230, 280, 330, 380, 430].map(
            (radius, index) => (
              <circle
                key={index}
                cx="300"
                cy="300"
                r={radius}
                stroke="currentColor"
                strokeWidth="1.4"
              />
            )
          )}
        </svg>
      </div>

      {/* =====================================================
          MAIN FOOTER CONTENT
      ====================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1180px]
          px-4
          pb-8
          pt-14

          sm:px-6
          sm:pt-16

          lg:px-4
          lg:pb-10
          lg:pt-20
        "
      >
        {/* =====================================================
            HOST ENLISTING CALLOUT BANNER
        ====================================================== */}
        <div
          className="
            mb-10
            overflow-hidden
            rounded-2xl
            border
            border-white/20
            bg-white/10
            p-5
            backdrop-blur-md
            transition-all
            hover:border-emerald-400/50
            sm:mb-12
            sm:p-6
          "
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-lg">
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff914d]">
                    Campus Accommodations
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    Free Enlisting
                  </span>
                </div>
                <h4 className="mt-0.5 text-base sm:text-lg font-bold text-white">
                  enlisting for the first 20 hosts- dm 0708270176
                </h4>
                <p className="mt-1 text-xs sm:text-sm text-white/75 max-w-xl">
                  Have a bedsitter, apartment, or room near campus? Enlist free for Graduation Eve guests. DM or call 0708270176 to verify and activate your listing.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <a
                href="https://wa.me/254708270176?text=Hi%20Last%20Dance%2C%20I%20would%20like%20to%20enlist%20my%20property%20for%20festival%20accommodation%20(Free%20enlisting%20for%20first%2020%20hosts)."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg hover:bg-[#20ba59] transition-all hover:scale-[1.02] active:scale-95"
              >
                <span>DM on WhatsApp</span>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z" clipRule="evenodd" />
                </svg>
              </a>

              <a
                href="tel:0708270176"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs sm:text-sm font-medium text-white hover:bg-white/20 transition-all"
              >
                <span>Call 0708270176</span>
              </a>
            </div>
          </div>
        </div>

        <div
          className="
            grid
            grid-cols-1
            gap-10
            border-b
            border-white/15
            pb-12

            md:grid-cols-2

            lg:grid-cols-12
            lg:gap-10
            lg:pb-14
          "
        >
          {/* =================================================
              BRAND COLUMN
          ================================================== */}

          <div
            className="
              lg:col-span-5
            "
          >
            <Link
              href="/last-dance"
              aria-label="Last Dance home"
              className="
                inline-flex
                items-center
              "
            >
              <img
                src={LAST_DANCE_LOGO}
                alt="Last Dance"
                width={489}
                height={184}
                className="
                  h-auto
                  w-[190px]
                  object-contain

                  sm:w-[220px]

                  lg:w-[250px]
                "
              />
            </Link>

            <p
              className="
                mt-6
                max-w-[470px]
                text-[14px]
                font-normal
                leading-[1.7]
                text-white/75

                sm:text-[15px]
              "
            >
              The official Graduation Eve celebration, awards and live voting
              experience. Celebrate the personalities, friendships and moments
              that made campus life unforgettable.
            </p>
          </div>

          {/* =================================================
              NAVIGATION
          ================================================== */}

          <div
            className="
              lg:col-span-2
              lg:pt-2
            "
          >
            <h3
              className="
                text-[12px]
                font-medium
                tracking-[0.08em]
                text-white
              "
            >
              Navigation
            </h3>

            <ul
              className="
                mt-5
                space-y-3.5
              "
            >
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="
                      text-[13px]
                      font-normal
                      leading-relaxed
                      text-white/70
                      transition-colors
                      duration-200

                      hover:text-[#ff914d]
                    "
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* =================================================
              EVENT INFORMATION
          ================================================== */}

          <div
            className="
              lg:col-span-2
              lg:pt-2
            "
          >
            <h3
              className="
                text-[12px]
                font-medium
                tracking-[0.08em]
                text-white
              "
            >
              Event info
            </h3>

            <div
              className="
                mt-5
                space-y-4
              "
            >
              <div>
                <p
                  className="
                    text-[11px]
                    font-medium
                    text-white/45
                  "
                >
                  Event date
                </p>

                <p
                  className="
                    mt-1
                    text-[13px]
                    font-normal
                    text-white/80
                  "
                >
                  November 25th, 2026
                </p>
              </div>

              <div>
                <p
                  className="
                    text-[11px]
                    font-medium
                    text-white/45
                  "
                >
                  Gates open
                </p>

                <p
                  className="
                    mt-1
                    text-[13px]
                    font-normal
                    text-white/80
                  "
                >
                  06:00 PM EAT
                </p>
              </div>

              <div>
                <p
                  className="
                    text-[11px]
                    font-medium
                    text-white/45
                  "
                >
                  Dress code
                </p>

                <p
                  className="
                    mt-1
                    text-[13px]
                    font-normal
                    leading-[1.5]
                    text-white/80
                  "
                >
                  Red carpet & gala eveningwear
                </p>
              </div>

              <div>
                <p
                  className="
                    text-[11px]
                    font-medium
                    text-white/45
                  "
                >
                  Host Enlisting & Contact
                </p>

                <a
                  href="https://wa.me/254708270176?text=Hi%20Last%20Dance%2C%20I%20would%20like%20to%20enlist%20my%20property%20for%20festival%20accommodation%20(Free%20enlisting%20for%20first%2020%20hosts)."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    mt-1
                    flex
                    items-center
                    gap-1.5
                    text-[13px]
                    font-semibold
                    text-emerald-300
                    transition-colors
                    hover:text-emerald-200
                  "
                >
                  <span>0708270176 (WhatsApp & Call)</span>
                </a>
              </div>
            </div>
          </div>

          {/* =================================================
              POWERED BY NUTRIPAY
          ================================================== */}

          <div
            className="
              lg:col-span-3
              lg:pt-2
            "
          >
            <h3
              className="
                text-[12px]
                font-medium
                tracking-[0.08em]
                text-white
              "
            >
              Powered by
            </h3>

            {/* NutriPay SVG — no frame, border, background or shadow */}
            <div
              className="
                mt-5
                flex
                items-center
              "
            >
              <img
                src={NUTRIPAY_LOGO}
                alt="NutriPay"
                width={489}
                height={184}
                className="
                  block
                  h-auto
                  w-[150px]
                  object-contain

                  sm:w-[165px]

                  lg:w-[175px]
                "
              />
            </div>

            <p
              className="
                mt-4
                max-w-[260px]
                text-[12px]
                font-normal
                leading-[1.6]
                text-white/60
              "
            >
              Event ticketing, payments and digital voting infrastructure
              powered by NutriPay.
            </p>
          </div>
        </div>

        {/* =====================================================
            BOTTOM BAR
        ====================================================== */}

        <div
          className="
            flex
            flex-col
            gap-5
            pt-7

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <p
            className="
              text-[12px]
              font-normal
              text-white/50
            "
          >
            © {year} Last Dance Festival. All rights reserved.
          </p>

          <div
            className="
              flex
              flex-wrap
              items-center
              gap-x-5
              gap-y-2
            "
          >
            <Link
              href="/last-dance/info"
              className="
                text-[12px]
                font-normal
                text-white/55
                transition-colors

                hover:text-[#ff914d]
              "
            >
              Event guidelines
            </Link>

            <span
              className="
                hidden
                h-1
                w-1
                rounded-full
                bg-white/30

                sm:block
              "
            />

            <Link
              href="/privacy"
              className="
                text-[12px]
                font-normal
                text-white/55
                transition-colors

                hover:text-[#ff914d]
              "
            >
              Privacy policy
            </Link>

            <span
              className="
                hidden
                h-1
                w-1
                rounded-full
                bg-white/30

                sm:block
              "
            />
          </div>
        </div>
      </div>
    </footer>
  );
}