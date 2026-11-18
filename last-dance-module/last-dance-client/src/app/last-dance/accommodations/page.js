'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  Home, Search, ArrowRight, ShieldCheck, MapPin, 
  Users, Bed, CheckCircle2, Phone, ExternalLink, RefreshCw, 
  Tag, Filter, X, BookmarkCheck, Plus, Sparkles, AlertCircle,
  MessageSquare, Info, Lock
} from 'lucide-react';
import axios from 'axios';

import AccommodationDetailsModal from '@/components/last-dance/AccommodationDetailsModal';
import AccommodationBookingModal from '@/components/last-dance/AccommodationBookingModal';
import AccommodationEnlistModal from '@/components/last-dance/AccommodationEnlistModal';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const PROPERTY_TYPES = [
  'All',
  'Single Room',
  'Bedsitter',
  '1 Bedroom Apartment',
  '2 Bedroom Apartment',
  'Shared Room / Hostel Bed',
  'Furnished Guest Wing'
];

const LOCATION_ZONES = [
  'All Zones',
  'Egerton Main Gate',
  'Njokerio',
  'Wright',
  'Booster',
  '420',
  'Sumkam',
  'Ahero',
  'Ng\'ondu',
  'Njoro'
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80';

export default function AccommodationsPage() {
  const [mounted, setMounted] = useState(false);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState('All');
  const [selectedZone, setSelectedZone] = useState('All Zones');
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Modals state
  const [selectedListingForDetails, setSelectedListingForDetails] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [selectedListingForBooking, setSelectedListingForBooking] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const [isEnlistModalOpen, setIsEnlistModalOpen] = useState(false);

  // My Stays & Phone Lookup
  const [isMyStaysOpen, setIsMyStaysOpen] = useState(false);
  const [myAccommodations, setMyAccommodations] = useState([]);
  const [myListings, setMyListings] = useState([]);

  const [isPhoneLookupOpen, setIsPhoneLookupOpen] = useState(false);
  const [lookupPhone, setLookupPhone] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);

  // Load localStorage data
  const loadLocalData = () => {
    try {
      if (typeof window !== 'undefined') {
        const bookings = JSON.parse(localStorage.getItem('last_dance_my_accommodations') || '[]');
        const hostListings = JSON.parse(localStorage.getItem('last_dance_my_listings') || '[]');
        setMyAccommodations(bookings);
        setMyListings(hostListings);
      }
    } catch (err) {
      console.warn('localStorage error:', err);
    }
  };

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedType !== 'All') params.propertyType = selectedType;
      if (selectedZone !== 'All Zones') params.zone = selectedZone;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (maxPrice && Number(maxPrice) > 0) params.maxPrice = Number(maxPrice);

      const res = await axios.get(`${API_BASE_URL}/last-dance/accommodations`, { params });
      if (res.data?.success) {
        setListings(res.data.listings || []);
      }
    } catch (err) {
      console.error('Failed to fetch accommodations:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedZone, searchQuery, maxPrice]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    loadLocalData();
    fetchListings();
  }, [fetchListings]);

  // Open Details Modal
  const handleOpenDetails = (listing) => {
    setSelectedListingForDetails(listing);
    setIsDetailsModalOpen(true);
  };

  // Open Booking Modal (e.g. from Details Modal CTA or direct card button)
  const handleOpenBooking = (listing) => {
    setIsDetailsModalOpen(false);
    setSelectedListingForBooking(listing);
    setIsBookingModalOpen(true);
  };

  // Handle phone lookup for bookings & listings
  const handlePhoneLookup = async (e) => {
    e.preventDefault();
    if (!lookupPhone.trim()) return;

    setLookupLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/accommodations/my-bookings`, {
        params: { phone: lookupPhone.trim() }
      });

      if (res.data?.success) {
        const fetchedBookings = res.data.bookings || [];
        const fetchedListings = res.data.listings || [];

        if (fetchedBookings.length === 0 && fetchedListings.length === 0) {
          alert('No stays or property listings found matching this phone number.');
        } else {
          setMyAccommodations(fetchedBookings);
          setMyListings(fetchedListings);

          if (typeof window !== 'undefined') {
            localStorage.setItem('last_dance_my_accommodations', JSON.stringify(fetchedBookings));
            localStorage.setItem('last_dance_my_listings', JSON.stringify(fetchedListings));
          }

          setIsPhoneLookupOpen(false);
          setIsMyStaysOpen(true);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not find records for this handset.');
    } finally {
      setLookupLoading(false);
    }
  };

  return (
    <div 
      suppressHydrationWarning
      className="w-full bg-[#f7f7f7] min-h-screen py-10 sm:py-14 lg:py-16"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <div className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-4">
        
        {/* =============================================
            HERO HEADER
        ============================================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-10">
          <div className="max-w-[720px]">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-[#5e2590] text-[12px] font-medium mb-2.5">
              <Home className="w-3.5 h-3.5" />
              <span>Campus Accommodations Marketplace</span>
            </div>

            <h1 className="text-[28px] font-normal leading-[1.15] tracking-[-0.02em] text-black sm:text-[32px] lg:text-[36px]">
              Festival Stays &amp; Rooms
            </h1>

            <p className="mt-3 max-w-[620px] text-[14px] leading-[1.6] text-black/60 sm:text-[15px]">
              Find verified student houses, furnished bedsitters, and private rooms near Egerton University. Pay a KES 100 connection fee to unlock host calling contacts and instant WhatsApp chat.
            </p>
          </div>

          {/* Action Buttons: Enlist House + My Stays Drawer */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsEnlistModalOpen(true)}
              className="flex items-center gap-2 rounded-full bg-[#5e2590] hover:bg-[#762e99] text-white px-5 py-2.5 text-[13.5px] font-medium transition shadow-md active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>Enlist Your House (KES 100)</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMyStaysOpen(true)}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[13px] font-medium text-black/75 hover:border-[#ff914d] hover:text-[#ff914d] transition shadow-xs"
            >
              <BookmarkCheck className="h-4 w-4 text-[#5e2590]" />
              <span>My Stays</span>
              {mounted && (myAccommodations.length > 0 || myListings.length > 0) && (
                <span className="rounded-full bg-[#5e2590] text-white text-[10px] px-2 py-0.5 font-bold">
                  {myAccommodations.length + myListings.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsPhoneLookupOpen(true)}
              className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[13px] font-medium text-black/75 hover:border-[#ff914d] hover:text-[#ff914d] transition shadow-xs"
            >
              <Phone className="h-3.5 w-3.5 text-black/60" />
              <span>Lookup Handset</span>
            </button>
          </div>
        </div>

        {/* =============================================
            CONNECTOR DISCLAIMER & HOST GUARANTEE BANNER
        ============================================= */}
        <div className="mb-8 rounded-2xl border border-purple-200 bg-white p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#5e2590] flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-[12.5px] text-black/70 leading-relaxed max-w-2xl">
              <div className="inline-flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-block rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5">
                  Host Promo: Free Enlisting for First 20 Hosts
                </span>
                <a
                  href="https://wa.me/254708270176?text=Hi%20Last%20Dance%2C%20I%20would%20like%20to%20enlist%20my%20property%20for%20festival%20accommodation%20(Free%20enlisting%20for%20first%2020%20hosts)."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11.5px] font-bold text-emerald-600 hover:text-emerald-700 underline"
                >
                  enlisting for the first 20 hosts- dm 0708270176
                </a>
              </div>
              <p>
                <strong className="text-black">Neutral Marketplace Connector:</strong> Last Dance Festival connects festival attendees with local Egerton property hosts and does not own or insure properties. Hosts verify their phone via SMS OTP. If a host’s property remains unbooked, KES 50 of their KES 100 enlisting fee is refunded upon review.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
            <a
              href="https://wa.me/254708270176?text=Hi%20Last%20Dance%2C%20I%20would%20like%20to%20enlist%20my%20property%20for%20festival%20accommodation%20(Free%20enlisting%20for%20first%2020%20hosts)."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] text-white px-3.5 py-1.5 text-xs font-bold shadow-xs hover:bg-[#20ba59] transition"
            >
              <span>DM 0708270176</span>
            </a>
            <button
              type="button"
              onClick={() => setIsEnlistModalOpen(true)}
              className="text-[12.5px] font-bold text-[#5e2590] hover:text-[#762e99] underline shrink-0 whitespace-nowrap text-center sm:text-left"
            >
              Enlist Room &rarr;
            </button>
          </div>
        </div>

        {/* =============================================
            SEARCH + FILTER TOOLBAR
        ============================================= */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col gap-4 border-y border-black/[0.08] py-4 md:flex-row md:items-center md:justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-[380px]">
              <Search 
                className="absolute left-0 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-black/40" 
                strokeWidth={1.7} 
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, zone, amenities..."
                className="w-full border-0 border-b border-black/20 bg-transparent py-2.5 pl-7 pr-3 text-[14px] text-black outline-none transition-colors placeholder:text-black/40 focus:border-[#762e99]"
              />
            </div>

            {/* Zone & Price Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="rounded-full border border-black/15 bg-white px-3.5 py-1.5 text-[12.5px] text-black/75 focus:outline-hidden focus:border-[#5e2590]"
              >
                {LOCATION_ZONES.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>

              <select
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="rounded-full border border-black/15 bg-white px-3.5 py-1.5 text-[12.5px] text-black/75 focus:outline-hidden focus:border-[#5e2590]"
              >
                <option value="">Any Nightly Rate</option>
                <option value="1000">Under KES 1,000</option>
                <option value="1500">Under KES 1,500</option>
                <option value="2500">Under KES 2,500</option>
                <option value="4000">Under KES 4,000</option>
              </select>

              <div className="h-4 w-px bg-black/15" />

              <div className="text-[12.5px] text-black/55">
                <span className="font-bold text-black">{listings.length}</span> stays available
              </div>

              <button
                type="button"
                onClick={fetchListings}
                aria-label="Refresh listings"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 transition-all hover:border-[#ff914d] hover:text-[#ff914d]"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Property Type Pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {PROPERTY_TYPES.map((type) => {
              const isActive = selectedType === type;
              return (
                <button
                  type="button"
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-[12.5px] font-medium transition-all duration-200 ${
                    isActive
                      ? 'border-[#5e2590] bg-[#5e2590] text-white'
                      : 'border-black/10 bg-white text-black/70 hover:border-[#ff914d] hover:text-[#ff914d]'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        {/* =============================================
            ACCOMMODATIONS GRID
        ============================================= */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div 
                key={item} 
                className="h-[380px] animate-pulse bg-white rounded-3xl border border-black/[0.08]" 
              />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="rounded-3xl border border-black/[0.08] bg-white p-12 text-center max-w-md mx-auto space-y-3">
            <Home className="w-12 h-12 text-black/25 mx-auto" />
            <h3 className="text-[18px] font-medium text-black">No Stays Found</h3>
            <p className="text-[13px] text-black/55">
              {searchQuery ? `No properties matching "${searchQuery}".` : 'No available rooms currently match your filters.'}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedType('All');
                setSelectedZone('All Zones');
                setSearchQuery('');
                setMaxPrice('');
              }}
              className="text-[13px] font-medium text-[#5e2590] underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => {
              const coverImg = listing.images?.[0] || FALLBACK_IMAGE;

              return (
                <article
                  key={listing._id}
                  onClick={() => handleOpenDetails(listing)}
                  className="group cursor-pointer overflow-hidden rounded-3xl border border-black/[0.08] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(0,0,0,0.06)] flex flex-col justify-between"
                >
                  <div>
                    {/* Cover Photo */}
                    <div className="relative h-[220px] overflow-hidden bg-black/5">
                      <img
                        src={coverImg}
                        alt={listing.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />

                      {/* Top Badges */}
                      <div className="absolute left-3 top-3 flex items-center gap-1.5">
                        <span className="rounded-full bg-white/95 backdrop-blur-xs px-3 py-0.5 text-[11px] font-semibold text-black shadow-xs">
                          {listing.propertyType}
                        </span>
                        <span className="rounded-full bg-[#5e2590] text-white px-2.5 py-0.5 text-[10.5px] font-medium shadow-xs">
                          {listing.locationZone}
                        </span>
                      </div>

                      {/* Photo Count Badge */}
                      {listing.images?.length > 1 && (
                        <div className="absolute right-3 top-3 px-2 py-0.5 rounded-full bg-black/60 text-white text-[10.5px] font-medium">
                          {listing.images.length} photos
                        </div>
                      )}

                      {/* Bottom Price on Image */}
                      <div className="absolute left-3 right-3 bottom-2.5 text-white flex items-end justify-between">
                        <div>
                          <p className="text-[10px] text-purple-200 uppercase font-medium">Nightly Rate</p>
                          <p className="text-[19px] font-bold tracking-tight">
                            KES {Number(listing.pricePerNightKES).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block text-[10px] uppercase font-bold text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded-full">
                            KES 100 Connection
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5 space-y-3">
                      <div>
                        <div className="flex items-center gap-1 text-[11.5px] font-medium text-black/50 mb-1">
                          <MapPin className="w-3 h-3 text-[#5e2590]" />
                          <span>Zone: {listing.locationZone}</span>
                        </div>
                        <h3 className="text-[16px] font-bold text-black leading-snug line-clamp-2 group-hover:text-[#5e2590] transition">
                          {listing.title}
                        </h3>
                      </div>

                      {/* Specs Row */}
                      <div className="flex items-center gap-4 text-[12px] text-black/65 pt-1 border-t border-black/[0.06]">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-black/40" />
                          <span>Up to {listing.maxGuests} guest{listing.maxGuests > 1 ? 's' : ''}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-black/40" />
                          <span>{listing.beds || 1} bed{listing.beds > 1 ? 's' : ''}</span>
                        </span>
                      </div>

                      {/* Amenities Pills (Top 2) */}
                      {Array.isArray(listing.amenities) && listing.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {listing.amenities.slice(0, 3).map((am, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-0.5 rounded-md bg-[#f7f7f7] border border-black/[0.06] text-[10.5px] text-black/70"
                            >
                              {am}
                            </span>
                          ))}
                          {listing.amenities.length > 3 && (
                            <span className="text-[10px] text-black/45 self-center">
                              +{listing.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* House Rules Preview */}
                      <div className="text-[11px] text-amber-900 bg-amber-50/70 rounded-xl px-2.5 py-1.5 border border-amber-200/60 flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="truncate">Strict Rules: No parties • No indoor smoking</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer CTAs */}
                  <div className="p-4 pt-0 flex items-center justify-between gap-2 border-t border-black/[0.06]">
                    <span className="text-[11.5px] text-black/45">
                      Direct WhatsApp link unlocked
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenBooking(listing);
                      }}
                      className="px-4 py-2 rounded-full bg-[#5e2590] hover:bg-[#762e99] text-white text-[12.5px] font-medium transition flex items-center gap-1 shadow-xs"
                    >
                      <span>Book (KES 100)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>

      {/* =============================================
          MODALS INTEGRATION
      ============================================= */}
      
      {/* 1. Full Details Modal (Opened on Card Click) */}
      <AccommodationDetailsModal
        listing={selectedListingForDetails}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onBookNow={handleOpenBooking}
      />

      {/* 2. Guest Booking Modal (KES 100 STK Push & Host Reveal) */}
      <AccommodationBookingModal
        listing={selectedListingForBooking}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onBookingSuccess={() => loadLocalData()}
      />

      {/* 3. Host Enlisting Modal (Specs, 1-3 Photos, OTP, Terms, KES 100 STK Push) */}
      <AccommodationEnlistModal
        isOpen={isEnlistModalOpen}
        onClose={() => {
          setIsEnlistModalOpen(false);
          fetchListings();
          loadLocalData();
        }}
        onEnlistSuccess={() => {
          fetchListings();
          loadLocalData();
        }}
      />

      {/* =============================================
          MY STAYS & ENLISTED LISTINGS DRAWER
      ============================================= */}
      {isMyStaysOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto border border-black/[0.08] shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.08]">
              <div className="flex items-center gap-2.5">
                <BookmarkCheck className="w-5 h-5 text-[#5e2590]" />
                <h3 className="text-[18px] font-bold text-black">My Accommodations &amp; Listings</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMyStaysOpen(false)}
                className="p-1.5 rounded-full text-black/40 hover:text-black hover:bg-black/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* My Bookings Section */}
            <div className="space-y-3">
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-black/50">
                Booked Spaces ({myAccommodations.length})
              </h4>
              {myAccommodations.length === 0 ? (
                <p className="text-[12.5px] text-black/50 italic py-2">
                  No stay reservations saved yet.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {myAccommodations.map((b, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-2xl border border-black/[0.08] bg-[#f7f7f7] flex items-center justify-between gap-3 text-[12.5px]"
                    >
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#5e2590] uppercase bg-purple-50 px-2 py-0.5 rounded-full">
                          {b.bookingRef}
                        </span>
                        <p className="font-bold text-black mt-1">{b.propertyTitle || 'Festival Stay'}</p>
                        <p className="text-black/60">Zone: {b.locationZone} • KES {Number(b.pricePerNightKES).toLocaleString()}/night</p>
                        {b.hostSnapshot?.whatsApp && (
                          <a
                            href={`https://wa.me/${b.hostSnapshot.whatsApp.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 font-bold mt-1 text-[11.5px]"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Chat with Host on WhatsApp</span>
                          </a>
                        )}
                      </div>
                      <Link
                        href={`/last-dance/accommodations/booking/${b.bookingRef}`}
                        className="px-3.5 py-1.5 rounded-full bg-[#5e2590] text-white text-[11.5px] font-medium shrink-0 hover:bg-[#762e99] transition"
                      >
                        Pass
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Enlisted Properties Section */}
            <div className="space-y-3 pt-3 border-t border-black/[0.08]">
              <h4 className="text-[12px] font-bold uppercase tracking-wider text-black/50">
                My Enlisted Listings ({myListings.length})
              </h4>
              {myListings.length === 0 ? (
                <p className="text-[12.5px] text-black/50 italic py-2">
                  You haven&apos;t enlisted any properties yet.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {myListings.map((l, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 rounded-2xl border border-black/[0.08] bg-[#f7f7f7] flex items-center justify-between gap-3 text-[12.5px]"
                    >
                      <div>
                        <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase bg-emerald-100 px-2 py-0.5 rounded-full">
                          {l.listingRef}
                        </span>
                        <p className="font-bold text-black mt-1">{l.title}</p>
                        <p className="text-black/60">Rate: KES {Number(l.pricePerNightKES).toLocaleString()}/night • Status: {l.status}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =============================================
          PHONE LOOKUP MODAL
      ============================================= */}
      {isPhoneLookupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full border border-black/[0.08] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[17px] font-bold text-black flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#5e2590]" />
                <span>Find Stays by Phone</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPhoneLookupOpen(false)}
                className="p-1 rounded-full text-black/40 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[12.5px] text-black/60">
              Enter your M-Pesa phone number used during guest booking or host enlisting to restore your passes.
            </p>

            <form onSubmit={handlePhoneLookup} className="space-y-3">
              <input
                type="tel"
                required
                placeholder="e.g. 0712345678"
                value={lookupPhone}
                onChange={(e) => setLookupPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-black/15 text-[13.5px] focus:outline-hidden focus:border-[#5e2590]"
              />

              <button
                type="submit"
                disabled={lookupLoading || !lookupPhone.trim()}
                className="w-full py-2.5 rounded-full bg-[#5e2590] hover:bg-[#762e99] text-white text-[13px] font-medium transition disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {lookupLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Searching database...</span>
                  </>
                ) : (
                  <span>Retrieve Records</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
