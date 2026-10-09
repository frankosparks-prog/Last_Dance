'use client';

import React from 'react';
import Link from 'next/link';
import { Disc, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-indigo-950/5 border-t border-indigo-200/80 text-slate-700 font-sans pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-indigo-200/80">
          
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 p-0.5 shadow-sm">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Disc className="w-4 h-4 text-indigo-300" />
                </div>
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900">LAST DANCE FESTIVAL</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md font-medium">
              The official Graduation Eve send-off festival & awards portal. Celebrate four years of music, culture, and unforgettable memories with live real-time voting and digital passes.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-indigo-900 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified M-Pesa STK Push Payment Gateway</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950">Navigation</h4>
            <ul className="space-y-2 text-xs font-semibold">
              <li>
                <Link href="/last-dance" className="hover:text-indigo-600 transition">
                  Leaderboard & Voting
                </Link>
              </li>
              <li>
                <Link href="/last-dance/tickets" className="hover:text-indigo-600 transition">
                  Buy Entry Tickets
                </Link>
              </li>
              <li>
                <Link href="/last-dance/register" className="hover:text-indigo-600 transition">
                  Nominate a Candidate
                </Link>
              </li>
              <li>
                <Link href="/last-dance/info" className="hover:text-indigo-600 transition">
                  Event Schedule & Guidelines
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Event Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-indigo-950">Event Info</h4>
            <ul className="space-y-2 text-xs font-medium text-slate-700">
              <li>Event Date: October 26th, 2026</li>
              <li>Gate Opens: 06:00 PM EAT</li>
              <li>Dress Code: Red Carpet & Gala Eveningwear</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium space-y-3 sm:space-y-0">
          <p>&copy; 2026 NutriPay Last Dance Engine. All Rights Reserved.</p>
          <p className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-indigo-600 fill-indigo-600 inline" />
            <span>for Graduation Eve</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
