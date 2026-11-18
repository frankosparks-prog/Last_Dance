'use client';

import React from 'react';
import Link from 'next/link';

const WHATSAPP_PHONE = '254708270176';
const DISPLAY_PHONE = '0708270176';
const DEFAULT_MESSAGE = "Hi Last Dance, I would like to enlist my property for festival accommodation (Free enlisting for first 20 hosts).";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

export default function EventContactEnlisting() {
  return (
    <section
      className="bg-white py-16 sm:py-20 lg:py-24 border-t border-slate-100"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-4">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-3.5 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Host Enlisting & Concierge Support</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Campus Accommodations & Inquiries
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Own or manage a bedsitter, apartment, or room near campus? Enlist for Graduation Eve festival guests or connect with our support desk.
          </p>
        </div>

        {/* Promo Hero Box */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5e2590] via-[#481c70] to-[#1e0b30] p-6 sm:p-10 lg:p-12 text-white shadow-2xl">
          {/* Subtle decorative circles */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
          <div className="pointer-events-none absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-[#ff914d]/10 blur-2xl" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Promo text */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white border border-white/20">
                <span className="text-[#ff914d]">★ Limited Promotion</span>
                <span>•</span>
                <span>First 20 Hosts Enlist Free</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                enlisting for the first 20 hosts- dm <span className="text-emerald-400 underline decoration-[#25D366]">{DISPLAY_PHONE}</span>
              </h3>

              <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-xl">
                List your room, hostel unit, or apartment for Last Dance Festival attendees. Earn verified guest payouts directly. The host enlisting fee is completely waived for the first 20 verified property hosts!
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-[#20ba59] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {/* WhatsApp SVG */}
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                  </svg>
                  <span>Chat on WhatsApp ({DISPLAY_PHONE})</span>
                </a>

                <a
                  href={`tel:${DISPLAY_PHONE}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-3 text-sm font-semibold text-white transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Direct Call</span>
                </a>

                <Link
                  href="/last-dance/accommodations"
                  className="inline-flex items-center gap-1.5 text-xs text-white/80 hover:text-white underline underline-offset-4 transition-colors"
                >
                  <span>View All Accommodations</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Quick Contact & Verification Info Card */}
            <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 space-y-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-[#ff914d]">
                Official Festival Support Line
              </h4>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/60 text-[11px]">Enlisting & Direct Helpline</p>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-bold hover:text-emerald-300 transition-colors"
                    >
                      {DISPLAY_PHONE} (WhatsApp & Calling)
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/60 text-[11px]">Primary Campus Coverage</p>
                    <p className="text-white font-medium">Booster • Milestone • Phase 2 • Hurberge</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white/60 text-[11px]">Host Identity Verification</p>
                    <p className="text-white font-medium">100% Phone & M-Pesa Audited Hosts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
