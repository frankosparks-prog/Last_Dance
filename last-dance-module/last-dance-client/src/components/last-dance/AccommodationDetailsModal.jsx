'use client';

import React, { useState } from 'react';
import { 
  X, MapPin, Users, Bed, Home, ShieldCheck, 
  Check, ArrowRight, Sparkles, CheckCircle2,
  AlertTriangle, Info, MessageSquare
} from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80';

export default function AccommodationDetailsModal({ listing, isOpen, onClose, onBookNow }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!isOpen || !listing) return null;

  const images = Array.isArray(listing.images) && listing.images.length > 0 
    ? listing.images 
    : [FALLBACK_IMAGE];

  const currentImage = images[activeImageIndex] || images[0];
  const rules = listing.houseRules || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-black/[0.08] shadow-2xl flex flex-col justify-between"
        style={{ fontFamily: 'Roboto, sans-serif' }}
      >
        <div>
          {/* Main Gallery Display */}
          <div className="relative h-[260px] sm:h-[300px] w-full overflow-hidden bg-black/5">
            <img
              src={currentImage}
              alt={listing.title}
              className="w-full h-full object-cover object-center transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/25" />

            {/* Badges */}
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <span className="rounded-full bg-white/95 backdrop-blur-xs px-3.5 py-1 text-[12px] font-medium text-black shadow-xs">
                {listing.propertyType}
              </span>
              <span className="rounded-full bg-[#5e2590] text-white px-3 py-1 text-[11px] font-medium shadow-xs">
                {listing.locationZone}
              </span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Bottom Title on Image */}
            <div className="absolute left-4 right-4 bottom-4 text-white">
              <div className="flex items-center gap-1.5 text-purple-200 text-[11.5px] font-medium">
                <MapPin className="w-3.5 h-3.5" />
                <span>Zone: {listing.locationZone} (Exact address unlocked upon booking)</span>
              </div>
              <h2 className="text-[22px] sm:text-[25px] font-medium tracking-tight leading-tight mt-0.5">
                {listing.title}
              </h2>
            </div>
          </div>

          {/* Thumbnail Strip (if multiple photos) */}
          {images.length > 1 && (
            <div className="flex gap-2 p-3 bg-[#f7f7f7] border-b border-black/[0.08] overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative h-14 w-20 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                    activeImageIndex === idx ? 'border-[#5e2590] shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Modal Body Content */}
          <div className="p-6 sm:p-7 space-y-6">
            {/* Quick Specs Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="rounded-2xl border border-black/[0.08] bg-[#f7f7f7] p-3">
                <p className="text-[10.5px] font-medium text-black/45 uppercase tracking-wider">Nightly Stay</p>
                <p className="text-[17px] font-bold text-black mt-0.5">
                  KES {Number(listing.pricePerNightKES).toLocaleString()}
                </p>
              </div>

              <div className="rounded-2xl border border-black/[0.08] bg-[#f7f7f7] p-3">
                <p className="text-[10.5px] font-medium text-black/45 uppercase tracking-wider">Max Guests</p>
                <p className="text-[17px] font-bold text-black mt-0.5">
                  {listing.maxGuests} Person{listing.maxGuests > 1 ? 's' : ''}
                </p>
              </div>

              <div className="rounded-2xl border border-black/[0.08] bg-[#f7f7f7] p-3">
                <p className="text-[10.5px] font-medium text-black/45 uppercase tracking-wider">Bedrooms</p>
                <p className="text-[17px] font-bold text-black mt-0.5">
                  {listing.bedrooms || 1} Room
                </p>
              </div>

              <div className="rounded-2xl border border-black/[0.08] bg-[#f7f7f7] p-3">
                <p className="text-[10.5px] font-medium text-black/45 uppercase tracking-wider">Down Payment</p>
                <p className="text-[17px] font-bold text-[#5e2590] mt-0.5">
                  KES 100
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-[13px] font-medium uppercase tracking-wider text-black/70 mb-1.5">
                About this space
              </h4>
              <p className="text-[14px] text-black/75 leading-[1.65]">
                {listing.description || 'Verified private accommodation near the festival venue, prepared for graduation eve guests and attendees.'}
              </p>
            </div>

            {/* Amenities Section */}
            {Array.isArray(listing.amenities) && listing.amenities.length > 0 && (
              <div>
                <h4 className="text-[13px] font-medium uppercase tracking-wider text-black/70 mb-2">
                  Included Amenities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((item, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f7f7f7] border border-black/[0.08] text-[12px] text-black/75 font-medium"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* STRICT HOUSE RULES CHECKLIST */}
            <div className="rounded-2xl border border-black/[0.08] bg-[#f7f7f7] p-5 space-y-3">
              <div className="flex items-center gap-2 text-black font-medium text-[13.5px]">
                <ShieldCheck className="w-4 h-4 text-[#5e2590]" />
                <span>Host Strict House Rules</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[12.5px] text-black/70">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${rules.noParties ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  <span>{rules.noParties ? 'No parties or loud events allowed' : 'Events with prior permission'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${rules.noSmoking ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  <span>{rules.noSmoking ? 'No smoking indoors' : 'Smoking allowed in designated areas'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${rules.noExtraVisitors ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  <span>{rules.noExtraVisitors ? 'No unregistered extra overnight visitors' : 'Visitors permitted'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Quiet Hours: <strong>{rules.quietHours || '10:00 PM - 6:00 AM'}</strong></span>
                </div>
              </div>

              {(rules.checkInTime || rules.checkOutTime) && (
                <div className="pt-2 border-t border-black/[0.06] text-[12px] text-black/60 flex gap-4">
                  {rules.checkInTime && <span>Check-in: <strong>{rules.checkInTime}</strong></span>}
                  {rules.checkOutTime && <span>Check-out: <strong>{rules.checkOutTime}</strong></span>}
                </div>
              )}

              {rules.customRules && (
                <p className="text-[12px] text-black/65 italic pt-1">
                  Additional note from host: &quot;{rules.customRules}&quot;
                </p>
              )}
            </div>

            {/* Platform Connector Legal Disclaimer Notice */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-[11.5px] text-amber-900 leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Platform Connector Terms:</strong> Last Dance Festival acts strictly as a neutral marketplace connector and does not own, inspect, or insure this property. Stays and payments are arranged directly between host and guest.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 sm:p-6 border-t border-black/[0.08] bg-[#f7f7f7] rounded-b-3xl flex items-center justify-between gap-3">
          <div>
            <p className="text-[10.5px] text-black/45">Connection / Down Payment</p>
            <p className="text-[16px] font-bold text-[#5e2590]">KES 100</p>
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
                if (onBookNow) onBookNow(listing);
              }}
              className="px-6 py-2.5 rounded-full bg-[#5e2590] hover:bg-[#762e99] text-white text-[13.5px] font-medium transition shadow-md active:scale-[0.98] flex items-center gap-1.5"
            >
              <span>Book Space (KES 100)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
