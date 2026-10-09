'use client';

import React, { useState } from 'react';
import { 
  UserPlus, CheckCircle2, ShieldAlert, Sparkles, Image as ImageIcon, 
  Award, Heart, Vote, ArrowRight, Check, RefreshCw, Zap, Disc, Music, Radio, Headphones
} from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const CATEGORIES = [
  'Mr & Miss Last Dance',
  'Most Likely to Succeed',
  'Best Dressed / Most Stylish',
  'Life of the Party',
  'Power Couple',
  'Campus Icon',
  'Comeback King/Queen',
  'Squad of the Year',
  'Most Missed'
];

const PRESET_AVATARS = [
  { url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80', label: 'Glamour' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80', label: 'Gentleman' },
  { url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80', label: 'Chic' },
  { url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80', label: 'Style' },
  { url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80', label: 'Vibe' }
];

export default function CandidateRegisterPage() {
  const [form, setForm] = useState({
    name: '',
    photoUrl: PRESET_AVATARS[0].url,
    oneLiner: '',
    pitch: '',
    category: 'Mr & Miss Last Dance'
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: '' });

    try {
      const res = await axios.post(`${API_BASE_URL}/last-dance/register`, form);
      if (res.data.success) {
        setStatus({ loading: false, success: true, error: '' });
      } else {
        setStatus({ loading: false, success: false, error: res.data.message || 'Registration failed.' });
      }
    } catch (err) {
      setStatus({
        loading: false,
        success: false,
        error: err.response?.data?.message || 'Failed to submit candidate nomination.'
      });
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans space-y-10">
      
      {/* Page Title & Musical Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-900 border border-indigo-300 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm">
          <Music className="w-4 h-4 text-indigo-600 animate-bounce" />
          <span>Nominate a Star &bull; Festival Awards 2026</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight flex items-center justify-center space-x-3">
          <span>NOMINATE A</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 flex items-center space-x-2">
            <span>CAMPUS ICON</span>
            <Disc className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 inline-block animate-vinyl-spin" />
          </span>
        </h1>
        
        <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-semibold max-w-2xl mx-auto">
          Submit yourself, a friend, or a campus duo for the Last Dance Awards 2026. 100% Free! Profiles appear on the public festival leaderboard after admin verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-indigo-200 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-indigo-100 pb-4">
            <h3 className="text-xl font-black text-slate-950 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Nomination Details</span>
            </h3>
            
            {/* Live Bouncing Equalizer Bars */}
            <div className="flex items-center space-x-1.5 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
              <span className="text-[10px] font-black uppercase text-indigo-900">Sound Check</span>
              <div className="flex items-end space-x-1 h-3 pl-1">
                <span className="w-1 bg-indigo-600 rounded-full animate-soundwave-1"></span>
                <span className="w-1 bg-indigo-400 rounded-full animate-soundwave-2"></span>
                <span className="w-1 bg-violet-600 rounded-full animate-soundwave-3"></span>
              </div>
            </div>
          </div>

          {status.success ? (
            <div className="text-center py-10 space-y-5 animate-fade-in">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-emerald-300">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              
              <h4 className="text-2xl font-black text-slate-950">Nomination Received!</h4>
              
              <p className="text-sm text-slate-800 max-w-md mx-auto leading-relaxed font-semibold">
                Thank you! <strong>{form.name}</strong> has been submitted under category <strong className="text-indigo-700">{form.category}</strong>. Your profile will be reviewed by admins shortly.
              </p>
              
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/last-dance"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white font-black text-xs uppercase tracking-wider shadow-md neu-button flex items-center justify-center space-x-2"
                >
                  <Disc className="w-4 h-4" />
                  <span>View Leaderboard</span>
                </Link>
                <button
                  onClick={() => {
                    setForm({ name: '', photoUrl: PRESET_AVATARS[0].url, oneLiner: '', pitch: '', category: 'Mr & Miss Last Dance' });
                    setStatus({ loading: false, success: false, error: '' });
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-100/90 hover:bg-indigo-200 text-indigo-950 font-black text-xs uppercase tracking-wider neu-button border border-indigo-300"
                >
                  Submit Another Candidate
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {status.error && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl text-rose-800 font-bold text-xs shadow-xs">
                  {status.error}
                </div>
              )}

              {/* Candidate Full Name */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1.5">
                  Candidate / Duo Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexandre Vance or Marcus & Sophia"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-2xl text-slate-950 font-bold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition shadow-xs"
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1.5">
                  Select Award Category <span className="text-rose-600">*</span>
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-2xl text-slate-950 font-bold focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition shadow-xs cursor-pointer"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat} className="font-bold py-1 text-slate-900">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Photo Choice Gallery */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-900 mb-1.5">
                  Avatar / Portrait Photo <span className="text-rose-600">*</span>
                </label>
                
                {/* Presets */}
                <div className="grid grid-cols-5 gap-2.5 mb-3">
                  {PRESET_AVATARS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setForm({ ...form, photoUrl: item.url })}
                      className={`relative flex flex-col items-center justify-center p-1 rounded-2xl border-2 transition ${
                        form.photoUrl === item.url 
                          ? 'border-indigo-600 bg-indigo-50/80 ring-2 ring-indigo-500/30' 
                          : 'border-indigo-100 bg-white hover:border-indigo-300'
                      }`}
                    >
                      <img src={item.url} alt={item.label} className="w-10 h-10 rounded-xl object-cover" />
                      <span className="text-[9px] font-black text-slate-900 mt-1">{item.label}</span>
                      {form.photoUrl === item.url && (
                        <div className="absolute top-1 right-1 bg-indigo-600 text-white rounded-full p-0.5 shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="url"
                    required
                    placeholder="Or paste custom image URL (Unsplash, Imgur, etc.)"
                    value={form.photoUrl}
                    onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-2xl text-slate-950 font-bold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition shadow-xs"
                  />
                </div>
              </div>

              {/* One-Liner Catchphrase */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                    Catchphrase / Slogan <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] font-extrabold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                    {form.oneLiner.length}/120
                  </span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={120}
                  placeholder="e.g. Bringing peak energy, timeless runway looks, and campus vibes."
                  value={form.oneLiner}
                  onChange={(e) => setForm({ ...form, oneLiner: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-2xl text-slate-950 font-bold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition shadow-xs"
                />
              </div>

              {/* Detailed Pitch */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-900">
                    Campaign Story & Pitch <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] font-extrabold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                    {form.pitch.length}/1000
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  placeholder="Tell your story, campus achievements, or why campus should vote for you..."
                  value={form.pitch}
                  onChange={(e) => setForm({ ...form, pitch: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-indigo-200 rounded-2xl text-slate-950 font-bold placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition shadow-xs"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={status.loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-xs uppercase tracking-wider shadow-lg transition disabled:opacity-50 flex items-center justify-center space-x-2 neu-button"
              >
                <UserPlus className="w-4 h-4 text-indigo-200" />
                <span>{status.loading ? 'Submitting Nomination...' : 'Submit Candidate Nomination (Free)'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Live Card Preview with Vinyl Disc Badge (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-6">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-black text-slate-950">Real-time Leaderboard Card Preview</h3>
          </div>

          <div className="bg-gradient-to-b from-white via-indigo-50/40 to-indigo-100/30 border-2 border-indigo-300 rounded-3xl p-6 shadow-xl space-y-4 relative overflow-hidden">
            {/* Spinning Vinyl Disc Accent */}
            <div className="absolute -top-4 -right-4 text-indigo-300/40 pointer-events-none">
              <Disc className="w-24 h-24 animate-vinyl-spin" />
            </div>

            <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
              <span className="text-[10px] font-black uppercase text-indigo-800 bg-indigo-100 border border-indigo-200 px-3 py-0.5 rounded-full">
                Track #1 Preview
              </span>
              <div className="flex items-end space-x-1 h-3">
                <span className="w-1 bg-indigo-600 rounded-full animate-soundwave-1"></span>
                <span className="w-1 bg-indigo-400 rounded-full animate-soundwave-2"></span>
                <span className="w-1 bg-violet-600 rounded-full animate-soundwave-3"></span>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 pt-1">
              <img
                src={form.photoUrl || PRESET_AVATARS[0].url}
                alt="Preview Avatar"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-400 shadow-md"
              />
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-indigo-900 bg-indigo-100 border border-indigo-300 px-2.5 py-0.5 rounded-full inline-block">
                  {form.category}
                </span>
                <h4 className="text-lg font-black text-slate-950 mt-1">{form.name || 'Candidate Name'}</h4>
                <span className="text-[11px] text-indigo-700 font-black">Rank #1 (Live Preview)</span>
              </div>
            </div>

            <p className="text-xs text-slate-900 font-extrabold italic bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
              "{form.oneLiner || 'Your catchphrase slogan will be displayed here...'}"
            </p>
            
            <p className="text-xs text-slate-700 leading-relaxed font-semibold">
              {form.pitch || 'Your campaign story and pitch will appear here for voters on the public leaderboard...'}
            </p>

            <div className="pt-4 border-t border-indigo-200 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 font-black uppercase">Initial Score</div>
                <div className="text-base font-black text-indigo-700">0 Votes</div>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-indigo-950 text-white font-black text-xs opacity-90 cursor-not-allowed flex items-center space-x-1.5 shadow-sm">
                <Vote className="w-3.5 h-3.5 text-indigo-200" />
                <span>Vote</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
