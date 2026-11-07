'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Search, ShoppingBag, ArrowRight, ShieldCheck, 
  MapPin, Clock, CheckCircle2, Phone, ExternalLink, RefreshCw, 
  Tag, Filter, X, BookmarkCheck, ArrowUpRight
} from 'lucide-react';
import axios from 'axios';
import ServiceBookingModal from '@/components/last-dance/ServiceBookingModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const SERVICE_CATEGORIES = [
  'All',
  'Makeup Artist',
  'Nail Tech',
  'Merchandise',
  'Hair & Styling',
  'Photography',
  'Other'
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80';

export default function ServicesMarketplacePage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Service for Booking Modal
  const [activeBookingService, setActiveBookingService] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Frictionless "My Bookings" Drawer & Phone Lookup Modals
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isPhoneLookupOpen, setIsPhoneLookupOpen] = useState(false);
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [myBookings, setMyBookings] = useState([]);

  // Load local bookings from localStorage
  const loadLocalBookings = () => {
    try {
      if (typeof window !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('last_dance_my_bookings') || '[]');
        setMyBookings(stored);
      }
    } catch (e) {
      console.warn('Failed to load localStorage bookings', e);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/services`, {
        params: {
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          search: searchQuery.trim() || undefined
        }
      });
      if (res.data?.success) {
        setServices(res.data.services || []);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadLocalBookings();
    fetchServices();
  }, [selectedCategory]);

  const handleSearchChange = (val) => {
    setSearchQuery(val);
  };

  const handleOpenBooking = (service) => {
    setActiveBookingService(service);
    setIsBookingModalOpen(true);
  };

  const handleBookingSuccess = () => {
    loadLocalBookings();
  };

  // Guest Phone Lookup ("Find My Bookings")
  const handlePhoneLookup = async (e) => {
    e.preventDefault();
    if (!lookupPhone.trim()) return;

    setLookupLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/services/my-bookings`, {
        params: { phone: lookupPhone.trim() }
      });

      if (res.data?.success && res.data.bookings && res.data.bookings.length > 0) {
        const fetched = res.data.bookings.map(b => ({
          bookingRef: b.bookingRef,
          serviceTitle: b.serviceTitle,
          serviceCategory: b.serviceCategory,
          depositAmountKES: b.depositAmountKES,
          totalPriceKES: b.totalPriceKES,
          remainingBalanceKES: b.remainingBalanceKES,
          preferredLocation: b.preferredLocation,
          depositReceiptNumber: b.depositReceiptNumber,
          status: b.status,
          createdAt: b.createdAt
        }));

        setMyBookings(fetched);
        if (typeof window !== 'undefined') {
          localStorage.setItem('last_dance_my_bookings', JSON.stringify(fetched));
        }

        setIsPhoneLookupOpen(false);
        setIsMyBookingsOpen(true);
      } else {
        alert('No bookings found matching this phone number.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not find bookings.');
    } finally {
      setLookupLoading(false);
    }
  };

  // Filter services locally if user is typing
  const filteredServices = services.filter(service => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (service.title || '').toLowerCase().includes(q) ||
      (service.description || '').toLowerCase().includes(q) ||
      (service.category || '').toLowerCase().includes(q)
    );
  });

  return (
    <div 
      className="w-full bg-[#f7f7f7] min-h-screen py-10 sm:py-14 lg:py-16"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-4">
        
        {/* =============================================
            SECTION INTRO
        ============================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-10">
          <div className="max-w-[720px]">
            <p className="text-[13px] font-medium text-[#762e99]">
              Festival Marketplace
            </p>

            <h1 className="mt-2 text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-black sm:text-[32px] lg:text-[36px]">
              Services &amp; Merchandise
            </h1>

            <p className="mt-3 max-w-[620px] text-[14px] leading-[1.6] text-black/60 sm:text-[15px]">
              Book vetted campus makeup artists, nail technicians, and official festival merchandise. Pay a small upfront deposit to secure your booking, with the remaining balance due upon delivery.
            </p>
          </div>

          {/* Quick Access Pill Buttons (Frictionless Guest Storage) */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsMyBookingsOpen(true)}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[13px] font-medium text-black/75 hover:border-[#ff914d] hover:text-[#ff914d] transition shadow-xs"
            >
              <BookmarkCheck className="h-4 w-4 text-[#5e2590]" />
              <span>My Bookings</span>
              {myBookings.length > 0 && (
                <span className="rounded-full bg-[#5e2590] text-white text-[10px] px-2 py-0.5 font-bold">
                  {myBookings.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsPhoneLookupOpen(true)}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[13px] font-medium text-black/75 hover:border-[#ff914d] hover:text-[#ff914d] transition shadow-xs"
            >
              <Phone className="h-3.5 w-3.5 text-black/60" />
              <span>Find by Phone</span>
            </button>
          </div>
        </div>

        {/* =============================================
            SEARCH + CATEGORY TOOLBAR (SYNCED WITH LEADERBOARD)
        ============================================= */}
        <div className="mb-10">
          <div className="flex flex-col gap-4 border-y border-black/[0.08] py-5 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-[430px]">
              <Search 
                className="absolute left-0 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-black/40" 
                strokeWidth={1.7} 
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search makeup, nails, merchandise..."
                className="w-full border-0 border-b border-black/20 bg-transparent py-3 pl-7 pr-3 text-[14px] text-black outline-none transition-colors placeholder:text-black/40 focus:border-[#762e99]"
              />
            </div>

            {/* Counts & Refresh */}
            <div className="flex items-center gap-5">
              <div className="text-[13px] text-black/55">
                <span className="font-medium text-black">{filteredServices.length}</span> listings
              </div>

              <div className="h-4 w-px bg-black/15" />

              <button
                type="button"
                onClick={fetchServices}
                aria-label="Refresh listings"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 transition-all hover:border-[#ff914d] hover:text-[#ff914d]"
              >
                <RefreshCw 
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} 
                  strokeWidth={1.8} 
                />
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {SERVICE_CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  type="button"
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'border-[#5e2590] bg-[#5e2590] text-white'
                      : 'border-black/10 bg-white text-black/70 hover:border-[#ff914d] hover:text-[#ff914d]'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* =============================================
            GRID OF SERVICES & MERCHANDISE
        ============================================= */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div 
                key={item} 
                className="h-[360px] animate-pulse bg-white border border-black/[0.08]" 
              />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="border border-black/[0.08] bg-white p-12 text-center max-w-md mx-auto">
            <ShoppingBag className="w-10 h-10 text-black/30 mx-auto mb-3" />
            <h3 className="text-[18px] font-medium text-black">No Listings Found</h3>
            <p className="text-[13px] text-black/55 mt-1">
              {searchQuery ? `No services or items matched "${searchQuery}".` : 'Check back shortly for new service listings!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => {
              const deposit = Number(service.depositAmountKES) || 50;
              const total = Number(service.totalPriceKES) || 0;
              const balance = Math.max(0, total - deposit);

              return (
                <article
                  key={service._id}
                  className="group overflow-hidden border border-black/[0.08] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(0,0,0,0.06)] flex flex-col justify-between"
                >
                  {/* Image with Category Badge */}
                  <div>
                    <div className="relative h-[220px] overflow-hidden bg-black/5">
                      <img
                        src={service.imageUrl || FALLBACK_IMAGE}
                        alt={service.title}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-[12px] font-medium text-black shadow-xs">
                        {service.category}
                      </div>

                      {service.featured && (
                        <div className="absolute right-4 top-4 rounded-full bg-[#ff914d] text-white px-2.5 py-0.5 text-[11px] font-medium shadow-xs">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      <p className="text-[11.5px] font-medium text-[#762e99]">
                        Deposit: KES {deposit.toLocaleString()} &bull; Balance: KES {balance.toLocaleString()}
                      </p>

                      <h3 className="mt-1.5 text-[18px] font-medium tracking-[-0.01em] text-black">
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
            "MY BOOKINGS" DRAWER MODAL
        ============================================= */}
        {isMyBookingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 md:p-8 border border-black/[0.08] shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-black/[0.08]">
                <div className="flex items-center space-x-2">
                  <BookmarkCheck className="w-5 h-5 text-[#5e2590]" />
                  <h2 className="text-[18px] font-medium text-black">My Saved Bookings</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMyBookingsOpen(false)}
                  className="p-1.5 text-black/40 hover:text-black rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {myBookings.length === 0 ? (
                <div className="py-12 text-center text-black/60 space-y-3">
                  <ShoppingBag className="w-10 h-10 text-black/30 mx-auto" />
                  <p className="text-[13px]">No bookings saved on this browser yet.</p>
                  <p className="text-[12px] text-black/45">
                    If you booked on another device, use &quot;Find by Phone&quot; to restore your bookings.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {myBookings.map((b) => (
                    <div 
                      key={b.bookingRef}
                      className="p-4 rounded-xl border border-black/[0.08] bg-[#f7f7f7] hover:bg-white transition flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10.5px] font-medium text-[#762e99] uppercase tracking-wide">
                          {b.serviceCategory} &bull; Ref: {b.bookingRef}
                        </span>
                        <h4 className="font-medium text-black text-[14px] mt-0.5">{b.serviceTitle}</h4>
                        <p className="text-[11.5px] text-black/55 mt-0.5">
                          Deposit: KES {Number(b.depositAmountKES).toLocaleString()} &bull; Bal: KES {Number(b.remainingBalanceKES).toLocaleString()}
                        </p>
                      </div>

                      <Link
                        href={`/last-dance/services/booking/${b.bookingRef}`}
                        className="px-3.5 py-1.5 rounded-full bg-[#5e2590] text-white text-[12px] font-medium hover:bg-[#762e99] transition shrink-0 flex items-center space-x-1"
                      >
                        <span>Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-black/[0.08] flex justify-between items-center text-[12px]">
                <button
                  type="button"
                  onClick={() => {
                    setIsMyBookingsOpen(false);
                    setIsPhoneLookupOpen(true);
                  }}
                  className="text-[#5e2590] hover:underline font-medium"
                >
                  Lookup by Phone Number
                </button>
                <button
                  type="button"
                  onClick={() => setIsMyBookingsOpen(false)}
                  className="px-4 py-2 rounded-full border border-black/15 text-black hover:bg-black/5"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =============================================
            "FIND BOOKINGS BY PHONE" MODAL
        ============================================= */}
        {isPhoneLookupOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 border border-black/[0.08] shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.08]">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-[#5e2590]" />
                  <h2 className="text-[17px] font-medium text-black">Find My Bookings</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPhoneLookupOpen(false)}
                  className="p-1.5 text-black/40 hover:text-black rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePhoneLookup} className="mt-4 space-y-4">
                <p className="text-[13px] text-black/65 leading-relaxed">
                  Enter the phone number you used when booking to view all your order details and receipts:
                </p>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0712345678"
                    value={lookupPhone}
                    onChange={(e) => setLookupPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-full border border-black/20 text-[13.5px] outline-none focus:border-[#762e99]"
                  />
                </div>

                <div className="flex gap-2.5 pt-1">
                  <button
                    type="submit"
                    disabled={lookupLoading}
                    className="flex-1 py-2.5 rounded-full bg-[#5e2590] hover:bg-[#762e99] text-white text-[13px] font-medium transition disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {lookupLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Searching...</span>
                      </>
                    ) : (
                      <span>Search Bookings</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsPhoneLookupOpen(false)}
                    className="px-4 py-2.5 rounded-full border border-black/15 text-black text-[13px] hover:bg-black/5"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Booking Modal */}
        <ServiceBookingModal
          service={activeBookingService}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onBookingSuccess={handleBookingSuccess}
        />
      </div>
    </div>
  );
}
