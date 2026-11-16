'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, CheckCircle2, AlertCircle, RefreshCw, Phone, User, 
  MapPin, Home, Bed, Sparkles, ShieldCheck, ArrowRight, 
  ArrowLeft, UploadCloud, Trash2, Camera, Check, Smartphone,
  Info, DollarSign, Lock, AlertTriangle, MessageSquare
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const PROPERTY_TYPES = [
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

const AMENITIES_OPTIONS = [
  'High-Speed Wi-Fi',
  'Hot Shower',
  'Electricity / Tokens Included',
  'Study Desk & Chair',
  'Perimeter Security / Gate Guard',
  'Kitchen / Cooking Amenities',
  'Treated Drinking Water',
  'Vehicle Parking Space'
];

export default function AccommodationEnlistModal({ isOpen, onClose, onEnlistSuccess }) {
  // Step state: 'form' | 'otp' | 'payment_prompt' | 'polling' | 'success' | 'failed'
  const [currentStep, setCurrentStep] = useState(1); // 1: Specs, 2: Photos & Rules, 3: Host & OTP, 4: Fee & Terms
  const [modalStage, setModalStage] = useState('wizard'); // 'wizard' | 'polling' | 'success' | 'failed'

  // Step 1: Specs
  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState(PROPERTY_TYPES[1]);
  const [locationZone, setLocationZone] = useState(LOCATION_ZONES[0]);
  const [specificAddress, setSpecificAddress] = useState('');
  const [pricePerNightKES, setPricePerNightKES] = useState('');
  const [maxGuests, setMaxGuests] = useState(2);
  const [bedrooms, setBedrooms] = useState(1);
  const [beds, setBeds] = useState(1);
  const [selectedAmenities, setSelectedAmenities] = useState(['Hot Shower', 'Perimeter Security / Gate Guard']);

  // Step 2: Photos (1-3) & Rules
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [ruleNoParties, setRuleNoParties] = useState(true);
  const [ruleNoSmoking, setRuleNoSmoking] = useState(true);
  const [ruleQuietHours, setRuleQuietHours] = useState('10:00 PM');
  const [ruleExtraVisitors, setRuleExtraVisitors] = useState('No unapproved overnight visitors');
  const [customRules, setCustomRules] = useState('');

  // Step 3: Host Details & OTP
  const [hostName, setHostName] = useState('');
  const [hostPhone, setHostPhone] = useState('');
  const [hostWhatsApp, setHostWhatsApp] = useState('');
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Step 4: Terms & Payment
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Payment Tracking
  const [checkoutRequestID, setCheckoutRequestID] = useState('');
  const [listingRef, setListingRef] = useState('');
  const [pollCountdown, setPollCountdown] = useState(60);
  const [isVerifyingManually, setIsVerifyingManually] = useState(false);

  const fileInputRef = useRef(null);

  // Sync WhatsApp when "same as phone" checked
  useEffect(() => {
    if (sameAsPhone) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHostWhatsApp(hostPhone);
    }
  }, [sameAsPhone, hostPhone]);

  // Reset modal state
  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentStep(1);
      setModalStage('wizard');
      setErrorMessage('');
      setOtpError('');
    }
  }, [isOpen]);

  // Toggle Amenity
  const toggleAmenity = (item) => {
    setSelectedAmenities(prev => 
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  // Cloudinary image upload handler (Max 3, Min 1)
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (images.length >= 3) {
      setErrorMessage('Maximum 3 photos permitted per accommodation listing.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image format (JPEG, PNG, WEBP).');
      return;
    }

    setUploadingImage(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('folder', 'last_dance_accommodations');

      const res = await axios.post(`${API_BASE_URL}/last-dance/upload-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success && res.data.url) {
        setImages(prev => [...prev, res.data.url]);
      } else {
        throw new Error(res.data?.message || 'Upload failed.');
      }
    } catch {
      // Fallback base64
      try {
        const reader = new FileReader();
        reader.onload = async (readEvt) => {
          try {
            const base64Data = readEvt.target.result;
            const res2 = await axios.post(`${API_BASE_URL}/last-dance/upload-image`, {
              image: base64Data,
              folder: 'last_dance_accommodations'
            });
            if (res2.data?.success && res2.data.url) {
              setImages(prev => [...prev, res2.data.url]);
            }
          } catch {
            setErrorMessage('Photo upload failed. Please try a smaller photo or check connection.');
          } finally {
            setUploadingImage(false);
          }
        };
        reader.readAsDataURL(file);
        return;
      } catch {
        setErrorMessage('Could not process photo file.');
      }
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // OTP Handling
  const handleSendOtp = async () => {
    if (!hostPhone || hostPhone.trim().length < 9) {
      setOtpError('Please enter your 10-digit phone number first (e.g. 0712345678).');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const res = await axios.post(`${API_BASE_URL}/last-dance/accommodations/send-otp`, {
        phone: hostPhone.trim()
      });

      if (res.data?.success) {
        setOtpSent(true);
      } else {
        setOtpError(res.data?.message || 'Failed to send OTP via SMS.');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'SMS service error. Please check your phone number.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length < 4) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }

    setOtpLoading(true);
    setOtpError('');

    try {
      const res = await axios.post(`${API_BASE_URL}/last-dance/accommodations/verify-otp`, {
        phone: hostPhone.trim(),
        otpCode: otpCode.trim()
      });

      if (res.data?.success) {
        setIsOtpVerified(true);
        setOtpError('');
      } else {
        setOtpError(res.data?.message || 'Invalid or expired OTP code.');
      }
    } catch (err) {
      setOtpError(err.response?.data?.message || 'Verification failed. Please re-check code.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Poll status for Enlisting Payment
  const verifyEnlistingPayment = useCallback(async () => {
    if (!checkoutRequestID) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/accommodations/enlist-status/${checkoutRequestID}`);

      if (res.data?.success && res.data.status === 'completed') {
        setListingRef(res.data.listingRef || '');
        
        // Save in localStorage for host records
        try {
          if (typeof window !== 'undefined') {
            const stored = JSON.parse(localStorage.getItem('last_dance_my_listings') || '[]');
            const newEntry = {
              listingRef: res.data.listingRef || listingRef,
              title,
              propertyType,
              locationZone,
              pricePerNightKES: Number(pricePerNightKES) || 0,
              hostName,
              hostPhone,
              enlistingReceiptNumber: res.data.receipt || '',
              status: 'active',
              createdAt: new Date().toISOString()
            };
            const filtered = stored.filter(l => l.listingRef !== newEntry.listingRef);
            localStorage.setItem('last_dance_my_listings', JSON.stringify([newEntry, ...filtered]));
          }
        } catch (err) {
          console.warn('localStorage error:', err);
        }

        setModalStage('success');
        if (onEnlistSuccess) onEnlistSuccess(res.data.listingRef || listingRef);
        return true;
      } else if (res.data?.status === 'failed') {
        setErrorMessage(res.data.message || 'Payment was cancelled or failed on your handset.');
        setModalStage('failed');
        return false;
      }
    } catch {
      // Continue polling
    }
    return false;
  }, [checkoutRequestID, listingRef, title, propertyType, locationZone, pricePerNightKES, hostName, hostPhone, onEnlistSuccess]);

  // Polling Interval
  useEffect(() => {
    let timer = null;
    let pollInterval = null;

    if (modalStage === 'polling' && checkoutRequestID) {
      pollInterval = setInterval(async () => {
        const isDone = await verifyEnlistingPayment();
        if (isDone) {
          clearInterval(pollInterval);
          clearInterval(timer);
        }
      }, 2500);

      timer = setInterval(() => {
        setPollCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            clearInterval(pollInterval);
            setErrorMessage('Payment verification timed out. If you entered your PIN, you can verify status manually below.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (timer) clearInterval(timer);
    };
  }, [modalStage, checkoutRequestID, verifyEnlistingPayment]);

  // Final Submit: Triggers KES 100 Enlisting STK Push
  const handleSubmitEnlistment = async () => {
    setErrorMessage('');

    if (!termsAccepted) {
      setErrorMessage('You must accept the Connector Terms of Service to enlist.');
      return;
    }

    if (!isOtpVerified) {
      setErrorMessage('Please verify your phone number via SMS OTP first.');
      setCurrentStep(3);
      return;
    }

    setModalStage('polling');

    try {
      const payload = {
        title: title.trim(),
        propertyType,
        locationZone,
        specificAddress: specificAddress.trim(),
        pricePerNightKES: Number(pricePerNightKES),
        maxGuests: Number(maxGuests),
        bedrooms: Number(bedrooms),
        beds: Number(beds),
        amenities: selectedAmenities,
        houseRules: {
          noParties: ruleNoParties,
          noSmoking: ruleNoSmoking,
          quietHours: ruleQuietHours,
          extraVisitors: ruleExtraVisitors,
          customRules: customRules.trim()
        },
        images,
        hostName: hostName.trim(),
        hostPhone: hostPhone.trim(),
        hostWhatsApp: hostWhatsApp.trim() || hostPhone.trim(),
        otpCode: otpCode.trim(),
        termsAccepted: true
      };

      const res = await axios.post(`${API_BASE_URL}/last-dance/accommodations/enlist`, payload);

      if (res.data?.success && res.data.checkoutRequestID) {
        setCheckoutRequestID(res.data.checkoutRequestID);
        setListingRef(res.data.listingRef);
        setPollCountdown(60);
      } else {
        throw new Error(res.data?.message || 'Failed to dispatch M-Pesa prompt.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Enlisting failed. Please check network.';
      setErrorMessage(msg);
      setModalStage('failed');
    }
  };

  const handleManualVerify = async () => {
    setIsVerifyingManually(true);
    setErrorMessage('');
    const done = await verifyEnlistingPayment();
    setIsVerifyingManually(false);
    if (!done) {
      setErrorMessage('Payment not yet detected. If you just authorized with PIN, please wait 3 seconds and retry.');
    }
  };

  // Step Validation Checkers
  const canProceedStep1 = title.trim().length >= 4 && Number(pricePerNightKES) > 0 && specificAddress.trim().length >= 4;
  const canProceedStep2 = images.length >= 1;
  const canProceedStep3 = hostName.trim().length >= 2 && isOtpVerified;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-black/[0.08] shadow-2xl flex flex-col justify-between"
        style={{ fontFamily: 'Roboto, sans-serif' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-black/[0.08] sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-[#5e2590]">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium uppercase tracking-wider text-black/50">
                Host Portal • Last Dance Stays
              </span>
              <h3 className="text-[17px] sm:text-[18px] font-medium text-black leading-tight">
                Enlist Your Room or House
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-black/40 hover:text-black hover:bg-black/5 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Stepper Tabs */}
        {modalStage === 'wizard' && (
          <div className="grid grid-cols-4 border-b border-black/[0.08] bg-[#f7f7f7] text-[11.5px] font-medium text-black/50">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className={`py-2.5 text-center transition border-b-2 ${
                currentStep === 1 ? 'border-[#5e2590] text-[#5e2590] bg-white font-bold' : 'border-transparent'
              }`}
            >
              1. Property Specs
            </button>
            <button
              type="button"
              onClick={() => canProceedStep1 && setCurrentStep(2)}
              disabled={!canProceedStep1}
              className={`py-2.5 text-center transition border-b-2 disabled:opacity-40 ${
                currentStep === 2 ? 'border-[#5e2590] text-[#5e2590] bg-white font-bold' : 'border-transparent'
              }`}
            >
              2. Photos &amp; Rules
            </button>
            <button
              type="button"
              onClick={() => canProceedStep1 && canProceedStep2 && setCurrentStep(3)}
              disabled={!canProceedStep1 || !canProceedStep2}
              className={`py-2.5 text-center transition border-b-2 disabled:opacity-40 ${
                currentStep === 3 ? 'border-[#5e2590] text-[#5e2590] bg-white font-bold' : 'border-transparent'
              }`}
            >
              3. Phone &amp; OTP
            </button>
            <button
              type="button"
              onClick={() => canProceedStep1 && canProceedStep2 && canProceedStep3 && setCurrentStep(4)}
              disabled={!canProceedStep1 || !canProceedStep2 || !canProceedStep3}
              className={`py-2.5 text-center transition border-b-2 disabled:opacity-40 ${
                currentStep === 4 ? 'border-[#5e2590] text-[#5e2590] bg-white font-bold' : 'border-transparent'
              }`}
            >
              4. Review &amp; Enlist
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 sm:p-7 space-y-5">
          {modalStage === 'wizard' && currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-[12.5px] font-medium text-black/75 mb-1">
                  Listing Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Self-Contained Bedsitter near Main Gate"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 text-[13.5px] focus:outline-hidden focus:border-[#5e2590]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-medium text-black/75 mb-1">
                    Property Type *
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-black/15 text-[13px] bg-white focus:outline-hidden focus:border-[#5e2590]"
                  >
                    {PROPERTY_TYPES.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-black/75 mb-1">
                    Location Zone (Publicly visible) *
                  </label>
                  <select
                    value={locationZone}
                    onChange={(e) => setLocationZone(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-black/15 text-[13px] bg-white focus:outline-hidden focus:border-[#5e2590]"
                  >
                    {LOCATION_ZONES.map(z => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-black/75 mb-1 flex items-center justify-between">
                  <span>Specific Door / Flat / Landmark Address *</span>
                  <span className="text-[11px] text-purple-700 font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    Hidden until guest booking confirmed
                  </span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunrise Plaza Flat 3B, 2nd Floor, directly opposite Equity ATM"
                  value={specificAddress}
                  onChange={(e) => setSpecificAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 text-[13.5px] focus:outline-hidden focus:border-[#5e2590]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[12px] font-medium text-black/75 mb-1">
                    Price Per Night (KES) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    placeholder="e.g. 1500"
                    value={pricePerNightKES}
                    onChange={(e) => setPricePerNightKES(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-black/15 text-[13.5px] font-bold focus:outline-hidden focus:border-[#5e2590]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-black/75 mb-1">
                    Max Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-[13px] focus:outline-hidden focus:border-[#5e2590]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-medium text-black/75 mb-1">
                    Beds
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-[13px] focus:outline-hidden focus:border-[#5e2590]"
                  />
                </div>
              </div>

              {/* Amenities Checkboxes */}
              <div>
                <label className="block text-[12.5px] font-medium text-black/75 mb-2">
                  Key Amenities Included
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AMENITIES_OPTIONS.map(amenity => (
                    <button
                      key={amenity}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`text-left p-2 rounded-xl border text-[12px] transition flex items-center gap-1.5 ${
                        selectedAmenities.includes(amenity)
                          ? 'border-[#5e2590] bg-purple-50 text-[#5e2590] font-medium'
                          : 'border-black/10 bg-white text-black/70 hover:border-black/20'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border ${
                        selectedAmenities.includes(amenity) ? 'border-[#5e2590] bg-[#5e2590] text-white' : 'border-black/20'
                      }`}>
                        {selectedAmenities.includes(amenity) && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span className="truncate">{amenity}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={!canProceedStep1}
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-2.5 rounded-full bg-[#5e2590] hover:bg-[#762e99] text-white text-[13.5px] font-medium transition disabled:opacity-40 flex items-center gap-1.5"
                >
                  <span>Continue to Photos &amp; Rules</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {modalStage === 'wizard' && currentStep === 2 && (
            <div className="space-y-5">
              {/* Image Upload Gallery (1-3 photos) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[12.5px] font-medium text-black/80">
                    Property Photos (Upload 1 to 3 real photos) *
                  </label>
                  <span className="text-[11.5px] text-black/50 font-medium">
                    {images.length}/3 photos added
                  </span>
                </div>

                {/* Photos Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {images.map((imgUrl, index) => (
                    <div key={index} className="relative aspect-4/3 rounded-2xl overflow-hidden border border-black/15 group">
                      <img src={imgUrl} alt="listing" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-medium">
                          Cover Photo
                        </span>
                      )}
                    </div>
                  ))}

                  {images.length < 3 && (
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-4/3 rounded-2xl border-2 border-dashed border-black/20 hover:border-[#5e2590] bg-[#f7f7f7] hover:bg-purple-50/50 transition flex flex-col items-center justify-center p-3 text-center disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <>
                          <RefreshCw className="w-5 h-5 text-[#5e2590] animate-spin mb-1" />
                          <span className="text-[11px] text-[#5e2590] font-medium">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-6 h-6 text-black/40 mb-1" />
                          <span className="text-[12px] font-medium text-black/70">Add Photo</span>
                          <span className="text-[10px] text-black/40">Cloudinary Powered</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                <p className="text-[11px] text-black/50 mt-1.5">
                  Clear, well-lit photos increase booking rates by 3x. At least 1 photo is required.
                </p>
              </div>

              {/* Strict House Rules Checklist */}
              <div className="rounded-2xl border border-black/[0.08] bg-[#f7f7f7] p-4 space-y-3">
                <h4 className="text-[12.5px] font-bold text-black uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#5e2590]" />
                  <span>Strict House Rules Checklist</span>
                </h4>
                <p className="text-[11.5px] text-black/60">
                  Set firm expectations before guests arrive to maintain respect for your space.
                </p>

                <div className="space-y-2.5 pt-1">
                  <label className="flex items-center gap-2.5 text-[13px] text-black/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ruleNoParties}
                      onChange={(e) => setRuleNoParties(e.target.checked)}
                      className="rounded-sm border-black/25 text-[#5e2590] focus:ring-[#5e2590]"
                    />
                    <span>Strictly No Parties or loud celebrations inside the house</span>
                  </label>

                  <label className="flex items-center gap-2.5 text-[13px] text-black/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ruleNoSmoking}
                      onChange={(e) => setRuleNoSmoking(e.target.checked)}
                      className="rounded-sm border-black/25 text-[#5e2590] focus:ring-[#5e2590]"
                    />
                    <span>No Smoking or Vaping indoors</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11.5px] font-medium text-black/70 mb-1">
                      Quiet Hours
                    </label>
                    <input
                      type="text"
                      value={ruleQuietHours}
                      onChange={(e) => setRuleQuietHours(e.target.value)}
                      placeholder="e.g. 10:00 PM to 7:00 AM"
                      className="w-full px-3 py-2 rounded-xl border border-black/15 text-[12.5px] bg-white focus:outline-hidden focus:border-[#5e2590]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11.5px] font-medium text-black/70 mb-1">
                      Visitor Policy
                    </label>
                    <input
                      type="text"
                      value={ruleExtraVisitors}
                      onChange={(e) => setRuleExtraVisitors(e.target.value)}
                      placeholder="e.g. Only registered occupants allowed"
                      className="w-full px-3 py-2 rounded-xl border border-black/15 text-[12.5px] bg-white focus:outline-hidden focus:border-[#5e2590]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-medium text-black/70 mb-1">
                    Additional House Rules (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Shoes off at the doorway. Please switch off the water heater when leaving."
                    value={customRules}
                    onChange={(e) => setCustomRules(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-black/15 text-[12.5px] bg-white focus:outline-hidden focus:border-[#5e2590] resize-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-full border border-black/15 text-[13px] font-medium text-black hover:bg-black/5 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={!canProceedStep2}
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-2.5 rounded-full bg-[#5e2590] hover:bg-[#762e99] text-white text-[13.5px] font-medium transition disabled:opacity-40 flex items-center gap-1.5"
                >
                  <span>Continue to Phone &amp; OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {modalStage === 'wizard' && currentStep === 3 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 space-y-1">
                <h4 className="text-[13px] font-bold text-[#5e2590] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Host Legitimacy &amp; Identity Verification</span>
                </h4>
                <p className="text-[12px] text-black/70 leading-relaxed">
                  To protect attendees from fraudulent listings, all property hosts must verify their phone number via an SMS verification code powered by TextSMS Kenya.
                </p>
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-black/75 mb-1">
                  Host Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Margaret Wambui"
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-black/15 text-[13.5px] focus:outline-hidden focus:border-[#5e2590]"
                />
              </div>

              {/* Host Phone & OTP Dispatch */}
              <div>
                <label className="block text-[12.5px] font-medium text-black/75 mb-1">
                  Host Calling Phone Number *
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    disabled={isOtpVerified}
                    placeholder="e.g. 0712345678"
                    value={hostPhone}
                    onChange={(e) => {
                      setHostPhone(e.target.value);
                      setIsOtpVerified(false);
                      setOtpSent(false);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-black/15 text-[13.5px] focus:outline-hidden focus:border-[#5e2590] disabled:bg-black/5"
                  />
                  {!isOtpVerified && (
                    <button
                      type="button"
                      disabled={otpLoading || !hostPhone || hostPhone.length < 9}
                      onClick={handleSendOtp}
                      className="px-4 py-2.5 rounded-xl bg-[#5e2590] hover:bg-[#762e99] text-white text-[12.5px] font-medium transition disabled:opacity-40 shrink-0"
                    >
                      {otpLoading ? 'Sending...' : otpSent ? 'Resend SMS' : 'Send SMS OTP'}
                    </button>
                  )}
                  {isOtpVerified && (
                    <div className="px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 text-[12.5px] font-bold flex items-center gap-1.5 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* OTP Input Row if sent and not yet verified */}
              {otpSent && !isOtpVerified && (
                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2">
                  <label className="block text-[12px] font-medium text-amber-900">
                    Enter the 6-digit code received on {hostPhone}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 482910"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-40 px-4 py-2 rounded-xl border border-amber-300 text-[15px] font-mono tracking-widest text-center bg-white focus:outline-hidden"
                    />
                    <button
                      type="button"
                      disabled={otpLoading || otpCode.length < 4}
                      onClick={handleVerifyOtp}
                      className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[13px] font-medium transition disabled:opacity-50"
                    >
                      {otpLoading ? 'Verifying...' : 'Verify Code'}
                    </button>
                  </div>
                  {otpError && (
                    <p className="text-[11.5px] text-red-600">{otpError}</p>
                  )}
                </div>
              )}

              {/* WhatsApp Handset */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[12.5px] font-medium text-black/75">
                    WhatsApp Chat Number (For direct guest messaging)
                  </label>
                  <label className="flex items-center gap-1.5 text-[11.5px] text-black/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsPhone}
                      onChange={(e) => setSameAsPhone(e.target.checked)}
                      className="rounded-xs border-black/25 text-[#5e2590]"
                    />
                    <span>Same as call number</span>
                  </label>
                </div>
                {!sameAsPhone && (
                  <input
                    type="tel"
                    placeholder="e.g. 254712345678"
                    value={hostWhatsApp}
                    onChange={(e) => setHostWhatsApp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-black/15 text-[13.5px] focus:outline-hidden focus:border-[#5e2590]"
                  />
                )}
              </div>

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-full border border-black/15 text-[13px] font-medium text-black hover:bg-black/5 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={!canProceedStep3}
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-2.5 rounded-full bg-[#5e2590] hover:bg-[#762e99] text-white text-[13.5px] font-medium transition disabled:opacity-40 flex items-center gap-1.5"
                >
                  <span>Continue to Review &amp; Enlist</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {modalStage === 'wizard' && currentStep === 4 && (
            <div className="space-y-4">
              {/* Review Summary */}
              <div className="rounded-2xl border border-black/[0.08] bg-[#f7f7f7] p-4 space-y-2 text-[12.5px]">
                <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
                  <div>
                    <p className="font-bold text-black text-[14px]">{title}</p>
                    <p className="text-black/60">{propertyType} • {locationZone}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-black/50 uppercase">Rate</p>
                    <p className="text-[15px] font-bold text-[#5e2590]">KES {Number(pricePerNightKES).toLocaleString()}/night</p>
                  </div>
                </div>
                <p><strong>Host:</strong> {hostName} ({hostPhone}) <span className="text-emerald-600 font-bold">✓ Verified</span></p>
                <p><strong>Max Capacity:</strong> {maxGuests} guest(s) • {bedrooms} bed(s)</p>
                <p><strong>Uploaded Photos:</strong> {images.length} verified image(s)</p>
              </div>

              {/* Host Legitimacy Fee & KES 50 Unbooked Refund Guarantee Box */}
              <div className="rounded-2xl border-2 border-purple-200 bg-purple-50/70 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#5e2590] uppercase tracking-wider">
                    Host Enlisting Fee &amp; Refund Guarantee
                  </span>
                  <span className="text-[16px] font-bold text-[#5e2590]">KES 100</span>
                </div>
                <p className="text-[12px] text-black/75 leading-relaxed">
                  A small commitment deposit of <strong className="text-black">KES 100</strong> is required to enlist your house. This prevents spam and guarantees genuine availability for festival attendees.
                </p>
                <div className="p-2.5 rounded-xl bg-white border border-purple-200 flex items-start gap-2 text-[11.5px] text-[#5e2590]">
                  <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Unbooked Refund Policy:</strong> If no attendee books your property during the festival period, you are eligible to receive a <strong className="underline">KES 50 refund</strong>, reviewable via our festival desk.
                  </div>
                </div>
              </div>

              {/* Connector Terms of Service Disclaimer Checkbox */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-left">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded-sm border-black/25 text-[#5e2590] focus:ring-[#5e2590]"
                  />
                  <div className="text-[12px] text-amber-900 leading-relaxed">
                    <strong className="text-black">I agree to the Platform Connector Terms:</strong> Last Dance Festival operates solely as a marketplace connector between hosts and guests, and is not the property owner or insurer. I accept full responsibility for my property, guest keys, and house cleanliness.
                  </div>
                </label>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12.5px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="pt-2 flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-full border border-black/15 text-[13px] font-medium text-black hover:bg-black/5 transition flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={!termsAccepted}
                  onClick={handleSubmitEnlistment}
                  className="px-7 py-3 rounded-full bg-[#5e2590] hover:bg-[#762e99] text-white text-[13.5px] font-medium transition disabled:opacity-40 shadow-md flex items-center gap-2"
                >
                  <span>Pay KES 100 &amp; Enlist Listing</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* POLLING STAGE */}
          {modalStage === 'polling' && (
            <div className="py-8 text-center space-y-5">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-purple-100" />
                <div className="absolute inset-0 rounded-full border-4 border-[#5e2590] border-t-transparent animate-spin" />
                <Smartphone className="w-8 h-8 text-[#5e2590]" />
              </div>

              <div>
                <h4 className="text-[18px] font-bold text-black">Authorize Host Enlisting Fee</h4>
                <p className="text-[13px] text-black/65 mt-1 max-w-sm mx-auto">
                  An M-Pesa prompt for <strong className="text-black">KES 100</strong> has been sent to <strong className="text-black">{hostPhone}</strong>. Enter your PIN to activate your listing.
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-[#5e2590] text-[12px] font-medium">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Awaiting payment ({pollCountdown}s)</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[12px] text-left">
                  {errorMessage}
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleManualVerify}
                  disabled={isVerifyingManually}
                  className="w-full py-2.5 rounded-full border border-[#5e2590] text-[#5e2590] hover:bg-purple-50 text-[13px] font-medium transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isVerifyingManually ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Checking with Safaricom...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>I have entered my PIN — Verify Payment</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalStage('wizard');
                    setCurrentStep(4);
                  }}
                  className="text-[12px] text-black/45 hover:text-black py-1 transition"
                >
                  Cancel or review details
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS STAGE */}
          {modalStage === 'success' && (
            <div className="space-y-5 py-2">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-[20px] font-bold text-black">Listing is Now Live!</h4>
                <p className="text-[13px] text-black/60 max-w-sm mx-auto">
                  Your property has been successfully enlisted on the Last Dance Marketplace.
                </p>
              </div>

              <div className="rounded-2xl border-2 border-emerald-500/20 bg-emerald-50/40 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    Active Listing Ref
                  </span>
                  <span className="text-[12px] font-mono font-bold text-emerald-950">
                    {listingRef}
                  </span>
                </div>

                <div className="text-[13px] text-black/80 space-y-1">
                  <p><strong>Property:</strong> {title}</p>
                  <p><strong>Nightly Rate:</strong> KES {Number(pricePerNightKES).toLocaleString()}</p>
                  <p><strong>Host Handset:</strong> {hostPhone}</p>
                </div>

                <div className="p-3 rounded-xl bg-white/80 border border-emerald-200 text-[11.5px] text-emerald-900 space-y-1">
                  <p className="font-bold">What happens next?</p>
                  <p>1. When an attendee books your space, you will receive an instant SMS update with their contact details.</p>
                  <p>2. The guest will connect directly with you via call or WhatsApp to finalize arrival times and keys.</p>
                  <p>3. If unbooked by festival eve, you are eligible for the KES 50 refund.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-full bg-[#5e2590] hover:bg-[#762e99] text-white text-[13.5px] font-medium transition shadow-md"
              >
                Done • View On Marketplace
              </button>
            </div>
          )}

          {/* FAILED STAGE */}
          {modalStage === 'failed' && (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-50 text-red-600 mx-auto flex items-center justify-center">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-[18px] font-bold text-black">Enlisting Payment Incomplete</h4>
                <p className="text-[13px] text-black/60 mt-1 max-w-sm mx-auto">
                  {errorMessage || 'The M-Pesa transaction was cancelled or timed out.'}
                </p>
              </div>

              <div className="flex gap-2.5 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalStage('wizard');
                    setCurrentStep(4);
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#5e2590] text-white text-[13px] font-medium hover:bg-[#762e99] transition"
                >
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full border border-black/15 text-[13px] font-medium text-black hover:bg-black/5 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
