'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Clock, MapPin, Sparkles, HelpCircle, ShieldCheck, 
  ChevronDown, ChevronUp, Music, GlassWater, Trophy, Flame, PartyPopper, CheckCircle2
} from 'lucide-react';

export default function EventInfoPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const eventDate = new Date('2026-10-26T19:00:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = eventDate - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const faqs = [
    {
      q: 'How does voting work?',
      a: 'Voting is instant via M-Pesa STK Push. You can vote for any candidate in any category. Each vote is KES 10, or you can pick discounted power vote packs.'
    },
    {
      q: 'How do I receive my event entry pass?',
      a: 'Upon successful M-Pesa payment, a unique digital QR ticket code is generated and emailed to your provided email address instantly.'
    },
    {
      q: 'Can I nominate someone else?',
      a: 'Yes! Anyone can nominate themselves, a friend, or a campus duo for free on the Nominate page.'
    },
    {
      q: 'What is the dress code?',
      a: 'The dress code is Red Carpet Gala & Elegant Eveningwear. Soft Lilac and Electric Indigo accents are warmly encouraged! Dress to impress for the 360° photobooth.'
    }
  ];

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 bg-indigo-100/60 border border-indigo-200 px-4 py-1.5 rounded-full text-indigo-700 text-xs font-black uppercase tracking-wider neu-flat">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>October 26th, 2026 &bull; Graduation Eve Festival</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          THE LAST DANCE <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 bg-clip-text text-transparent">EXPERIENCE</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          One unforgettable send-off night. Everything you need to know about the premier graduation eve festival and gala.
        </p>
      </div>

      {/* Countdown Timer Widget - Neumorphic & Glassmorphic */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 border border-indigo-300/30 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-2xl text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl -z-0 pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1 rounded-full text-indigo-200 text-xs font-extrabold uppercase tracking-widest border border-white/20">
            <Clock className="w-3.5 h-3.5 text-indigo-300" />
            <span>Countdown to Gate Opening</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto relative z-10">
          <div className="bg-white/15 backdrop-blur-md border border-white/25 p-5 rounded-2xl shadow-inner text-center">
            <div className="text-3xl sm:text-5xl font-black text-white drop-shadow-sm">{timeLeft.days}</div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-200 mt-1">Days</div>
          </div>
          <div className="bg-white/15 backdrop-blur-md border border-white/25 p-5 rounded-2xl shadow-inner text-center">
            <div className="text-3xl sm:text-5xl font-black text-white drop-shadow-sm">{timeLeft.hours}</div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-200 mt-1">Hours</div>
          </div>
          <div className="bg-white/15 backdrop-blur-md border border-white/25 p-5 rounded-2xl shadow-inner text-center">
            <div className="text-3xl sm:text-5xl font-black text-white drop-shadow-sm">{timeLeft.minutes}</div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-200 mt-1">Minutes</div>
          </div>
          <div className="bg-white/15 backdrop-blur-md border border-white/25 p-5 rounded-2xl shadow-inner text-center">
            <div className="text-3xl sm:text-5xl font-black text-indigo-200 drop-shadow-sm">{timeLeft.seconds}</div>
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-200 mt-1">Seconds</div>
          </div>
        </div>
      </div>

      {/* Timeline Schedule - Glassmorphism & Neumorphism Cards */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Event Program</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Schedule & Timeline</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel neu-flat p-6 rounded-3xl space-y-3 transition-transform hover:-translate-y-1">
            <div className="text-xs font-black uppercase text-indigo-600 bg-indigo-100/80 px-2.5 py-1 rounded-full inline-block">06:00 PM</div>
            <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Red Carpet Arrival</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">Gate opening, instant QR ticket scanning, 360° photobooth glam session.</p>
          </div>

          <div className="glass-panel neu-flat p-6 rounded-3xl space-y-3 transition-transform hover:-translate-y-1">
            <div className="text-xs font-black uppercase text-indigo-600 bg-indigo-100/80 px-2.5 py-1 rounded-full inline-block">07:30 PM</div>
            <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <GlassWater className="w-4 h-4 text-indigo-600" />
              <span>Welcome Toast</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">Complimentary welcome drinks & opening celebration for the class of 2026.</p>
          </div>

          <div className="glass-panel neu-flat p-6 rounded-3xl space-y-3 transition-transform hover:-translate-y-1">
            <div className="text-xs font-black uppercase text-indigo-600 bg-indigo-100/80 px-2.5 py-1 rounded-full inline-block">09:00 PM</div>
            <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-indigo-600" />
              <span>Awards Gala</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">Live crowning of Mr & Miss Last Dance and 9 category winners!</p>
          </div>

          <div className="glass-panel neu-flat p-6 rounded-3xl space-y-3 transition-transform hover:-translate-y-1">
            <div className="text-xs font-black uppercase text-indigo-600 bg-indigo-100/80 px-2.5 py-1 rounded-full inline-block">10:30 PM &bull; TILL LATE</div>
            <h4 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <Music className="w-4 h-4 text-indigo-600" />
              <span>Afterparty & Dance</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">Non-stop DJ sets, dance floor battles, and celebration until dawn.</p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion - Electric Indigo & Glass styling */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-black uppercase tracking-widest text-indigo-600">Got Questions?</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="glass-panel rounded-2xl overflow-hidden transition-all duration-200">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm text-slate-900 flex items-center justify-between hover:bg-indigo-50/50 transition"
                >
                  <span className="flex items-center space-x-2">
                    <HelpCircle className="w-4 h-4 text-indigo-500" />
                    <span>{faq.q}</span>
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-indigo-100/50 bg-indigo-50/20">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

