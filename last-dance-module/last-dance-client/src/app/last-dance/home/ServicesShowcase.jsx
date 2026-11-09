'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, ArrowRight, ShieldCheck, MapPin, 
  CreditCard, Smartphone, CheckCircle2, ShoppingBag, 
  Tag, Clock, UserCheck, ChevronRight, BookmarkCheck,
  RefreshCw, ArrowUpRight
} from 'lucide-react';
import axios from 'axios';
import ServiceBookingModal from '@/components/last-dance/ServiceBookingModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80';

const HOW_IT_WORKS_STEPS = [
  {
    step: '01',
    title: 'Browse & Choose',
    description: 'Explore verified campus makeup artists, nail techs, hair stylists, and official festival merchandise.'
  },
  {
    step: '02',
    title: 'Pay a Small Deposit',
    description: 'Pay a small commitment deposit (e.g. KES 50) via instant M-Pesa STK push. No passwords or account required.'
  },
  {
    step: '03',
    title: 'Meet at Your Location',
    description: 'Our team pairs you with a verified specialist who coordinates meetup at your preferred room or campus spot.'
  },
  {
    step: '04',
    title: 'Pay Balance on Delivery',
    description: 'After your service is rendered or merch received, the remaining balance is prompted seamlessly via M-Pesa.'
  }
];

export default function ServicesShowcase() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [activeBookingService, setActiveBookingService] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    axios.get(`${API_BASE_URL}/last-dance/services`)
      .then(res => {
        if (isMounted && res.data?.success) {
          setServices(Array.isArray(res.data.services) ? res.data.services : []);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch home services showcase:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenBooking = (service) => {
    setActiveBookingService(service);
    setIsBookingModalOpen(true);
  };

  // Display top items (up to 4 or 6, prioritizing featured)
  const displayedServices = services.slice(0, 6);

  return (
    <section
      id="services-marketplace"
      className="w-full border-b border-black/[0.08] bg-white py-14 sm:py-16 lg:py-20"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-4">
        
        {/* =============================================
            SECTION HEADER
        ============================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 lg:mb-12">
          <div className="max-w-[720px]">
            <p className="text-[13px] font-medium text-[#762e99]">
              Campus Marketplace &bull; Graduation Eve Preparation
            </p>

            <h2 className="mt-2 text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-black sm:text-[34px] lg:text-[38px]">
              Look your absolute best for the Last Dance & Graduation.
            </h2>

            <p className="mt-3.5 max-w-[620px] text-[14.5px] leading-[1.65] text-black/65 sm:text-[15.5px]">
              Don&apos;t scramble on graduation eve. Book verified campus makeup artists, nail technicians, and official festival merchandise in advance with a small upfront commitment deposit.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/last-dance/services"
              className="inline-flex items-center gap-2 rounded-full bg-[#5e2590] px-6 py-3 text-[14px] font-medium text-white transition-all duration-200 hover:bg-[#762e99] active:scale-[0.98] shadow-xs"
            >
              <span>Explore All Listings</span>
              {services.length > 0 && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[11px] font-bold">
                  {services.length}
                </span>
              )}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/last-dance/services"
              className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white px-5 py-3 text-[14px] font-medium text-black transition-all duration-200 hover:border-[#ff914d] hover:text-[#ff914d]"
            >
              <BookmarkCheck className="h-4 w-4 text-[#5e2590]" />
              <span>My Bookings</span>
            </Link>
          </div>
        </div>

        {/* =============================================
            ACTUAL ADMIN POSTED SERVICES & MERCHANDISE GRID
        ============================================= */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
            {[1, 2, 3].map((item) => (
              <div 
                key={item} 
                className="h-[360px] animate-pulse bg-[#f7f7f7] border border-black/[0.08]" 
              />
            ))}
          </div>
        ) : displayedServices.length === 0 ? (
          <div className="border border-black/[0.08] bg-[#f7f7f7] p-12 text-center max-w-md mx-auto rounded-2xl mb-16">
            <ShoppingBag className="w-10 h-10 text-black/30 mx-auto mb-3" />
            <h3 className="text-[18px] font-medium text-black">No Listings Available Yet</h3>
            <p className="text-[13px] text-black/55 mt-1">
              New festival services and merchandise are being curated. Check back shortly!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-16">
            {displayedServices.map((service) => {
              const deposit = Number(service.depositAmountKES) || 50;
              const total = Number(service.totalPriceKES) || 0;
              const balance = Math.max(0, total - deposit);

              return (
                <article
                  key={service._id}
                  className="group flex flex-col justify-between overflow-hidden border border-black/[0.08] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(0,0,0,0.06)]"
                >
                  {/* Image with Category Badge & Featured Tag */}
                  <div>
                    <div className="relative h-[210px] overflow-hidden bg-black/5">
                      <img
                        src={service.imageUrl || FALLBACK_IMAGE}
                        alt={service.title}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute left-3.5 top-3.5 rounded-full bg-white/95 backdrop-blur-xs px-3 py-1 text-[11.5px] font-medium text-black shadow-xs">
                        {service.category}
                      </div>

                      {service.featured && (
                        <div className="absolute right-3.5 top-3.5 rounded-full bg-[#ff914d] text-white px-2.5 py-0.5 text-[11px] font-medium shadow-xs">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      <p className="text-[11.5px] font-medium text-[#762e99]">
                        Deposit: KES {deposit.toLocaleString()} &bull; Balance on Delivery: KES {balance.toLocaleString()}
                      </p>

                      <h3 className="mt-1.5 text-[18px] font-medium tracking-[-0.01em] text-black group-hover:text-[#5e2590] transition-colors">
                        {service.title}
                      </h3>

                      {service.description && (
                        <p className="mt-2 line-clamp-2 text-[13px] leading-[1.55] text-black/60">
                          {service.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="p-5 pt-0">
                    <div className="flex items-center justify-between gap-3 border-t border-black/[0.07] pt-4">
                      <div>
                        <p className="text-[10.5px] text-black/45">Total Price</p>
                        <p className="mt-0.5 text-[16px] font-medium text-black">
                          KES {total.toLocaleString()}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenBooking(service)}
                        className="rounded-full bg-[#5e2590] px-5 py-2 text-[13px] font-medium text-white transition-all duration-200 hover:bg-[#762e99] active:scale-[0.98]"
                      >
                        Book Service
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* =============================================
            HOW BOOKING WORKS (STEP-BY-STEP EXPLANATION)
        ============================================= */}
        <div className="rounded-3xl border border-black/[0.08] bg-[#f7f7f7] p-8 sm:p-10 lg:p-12 mb-12">
          <div className="max-w-[680px] mb-8">
            <p className="text-[12px] font-medium uppercase tracking-wider text-[#762e99]">
              Simple &amp; Frictionless
            </p>
            <h3 className="mt-1.5 text-[24px] sm:text-[28px] font-normal tracking-[-0.02em] text-black">
              How services &amp; merchandise booking works
            </h3>
            <p className="mt-2 text-[14px] text-black/60 leading-[1.6]">
              Designed specifically for campus ease. No passwords, no logins, and zero surprises on prices.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS_STEPS.map((step) => (
              <div 
                key={step.step}
                className="bg-white p-5 rounded-2xl border border-black/[0.07] flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block text-[12px] font-mono font-bold text-[#5e2590] bg-[#5e2590]/10 px-2.5 py-0.5 rounded-full mb-3">
                    Step {step.step}
                  </span>
                  <h4 className="text-[16px] font-medium text-black">
                    {step.title}
                  </h4>
                  <p className="mt-2 text-[12.5px] leading-[1.6] text-black/60">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Core Guarantees Bar */}
          <div className="mt-8 pt-8 border-t border-black/[0.08] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[13px] text-black/75">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Verified Campus Specialists</span>
            </div>

            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-[#5e2590] shrink-0" />
              <span>Hostel / Room Callouts</span>
            </div>

            <div className="flex items-center gap-2.5">
              <Smartphone className="h-4 w-4 text-[#ff914d] shrink-0" />
              <span>SMS &amp; Email Booking Updates</span>
            </div>

            <div className="flex items-center gap-2.5">
              <CreditCard className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Remaining Balance Paid on Delivery</span>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        <ServiceBookingModal
          service={activeBookingService}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
        />
      </div>
    </section>
  );
}
