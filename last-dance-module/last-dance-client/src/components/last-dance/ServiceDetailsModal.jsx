'use client';

import React from 'react';
import { 
  X, Sparkles, CheckCircle2, ShieldCheck, 
  MapPin, Clock, ArrowRight, Tag, ShoppingBag, 
  CreditCard, DollarSign, ExternalLink
} from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80';

export default function ServiceDetailsModal({ service, isOpen, onClose, onBookNow }) {
  if (!isOpen || !service) return null;

  const deposit = Number(service.depositAmountKES) || 50;
  const total = Number(service.totalPriceKES) || 0;
  const balance = Math.max(0, total - deposit);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-black/[0.08] shadow-2xl flex flex-col justify-between"
        style={{ fontFamily: 'Roboto, sans-serif' }}
      >
        <div>
          {/* Hero Image Section with Badges & Close Button */}
          <div className="relative h-[250px] sm:h-[280px] w-full overflow-hidden bg-black/5">
            <img
              src={service.imageUrl || FALLBACK_IMAGE}
              alt={service.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Category & Featured Badge */}
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span className="rounded-full bg-white/95 backdrop-blur-xs px-3.5 py-1 text-[12px] font-medium text-black shadow-xs">
                {service.category}
              </span>
              {service.featured && (
                <span className="rounded-full bg-[#ff914d] text-white px-3 py-1 text-[11px] font-medium shadow-xs">
                  Featured
                </span>
              )}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Bottom Title on Image */}
            <div className="absolute left-4 right-4 bottom-4 text-white">
              <span className="text-[11px] font-medium uppercase tracking-wider text-purple-200">
                Official Marketplace Listing
              </span>
              <h2 className="text-[22px] sm:text-[24px] font-medium tracking-tight leading-tight mt-1">
                {service.title}
              </h2>
            </div>
          </div>

          {/* Modal Body Content */}
          <div className="p-6 sm:p-7 space-y-5">
            {/* Pricing Breakdown Callout Card */}
            <div className="rounded-2xl border border-black/[0.08] bg-[#f7f7f7] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-medium text-black/50 uppercase tracking-wider">
                  Total Service / Item Price
                </p>
                <p className="text-[22px] font-bold text-black mt-0.5">
                  KES {total.toLocaleString()}
                </p>
                <p className="text-[12px] text-black/60 mt-0.5">
                  Remaining balance of KES {balance.toLocaleString()} paid on delivery
                </p>
              </div>

              <div className="bg-white rounded-xl p-3 border border-purple-200 text-left sm:text-right shrink-0">
                <span className="inline-block text-[#5e2590] text-[12.5px] font-bold">
                  KES {deposit.toLocaleString()} Upfront Deposit
                </span>
                <p className="text-[11px] text-[#762e99] mt-0.5">
                  Secures your reservation slot now
                </p>
              </div>
            </div>

            {/* Description Details */}
            <div>
              <h4 className="text-[13px] font-medium uppercase tracking-wider text-black/70 mb-1.5">
                Description &amp; Offering Details
              </h4>
              <p className="text-[14px] text-black/75 leading-[1.65] whitespace-pre-line">
                {service.description || 'Professional festival service curated for Last Dance 2026. Reserved with an upfront commitment deposit with full balance paid upon delivery.'}
              </p>
            </div>

            {/* Guarantees / Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-[12px] text-black/70">
              <div className="flex items-center gap-2 rounded-xl bg-[#f7f7f7] p-2.5 border border-black/[0.06]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified Campus Provider</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-[#f7f7f7] p-2.5 border border-black/[0.06]">
                <MapPin className="w-4 h-4 text-[#5e2590] shrink-0" />
                <span>Hostel / Room Callouts Available</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-[#f7f7f7] p-2.5 border border-black/[0.06]">
                <Clock className="w-4 h-4 text-[#ff914d] shrink-0" />
                <span>Graduation Eve Priority Scheduling</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-[#f7f7f7] p-2.5 border border-black/[0.06]">
                <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pay Balance Safely on Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-black/[0.08] bg-[#f7f7f7] rounded-b-3xl flex items-center justify-between gap-3">
          <div>
            <p className="text-[10.5px] text-black/45">Upfront Commitment</p>
            <p className="text-[16px] font-bold text-black">KES {deposit.toLocaleString()}</p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-black/15 text-[13px] font-medium text-black hover:bg-black/5 transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onBookNow) onBookNow(service);
              }}
              className="px-6 py-2.5 rounded-full bg-[#5e2590] hover:bg-[#762e99] text-white text-[13.5px] font-medium transition shadow-md active:scale-[0.98] flex items-center gap-1.5"
            >
              <span>Book Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
