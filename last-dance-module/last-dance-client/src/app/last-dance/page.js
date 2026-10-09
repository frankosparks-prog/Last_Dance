'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, Crown, Flame, Award, Vote, Search, Filter, 
  RefreshCw, UserPlus, Ticket, Sparkles, Disc, Music, Radio,
  Share2, Check, Zap, TrendingUp, Star, ShieldCheck, Headphones, Volume2, Mic
} from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';
import VoteModal from '../../components/last-dance/VoteModal';
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export default function LeaderboardPage() {
  const [candidates, setCandidates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [votingCandidate, setVotingCandidate] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/last-dance/candidates`, {
        params: { category: selectedCategory }
      });
      if (res.data.success) {
        setCandidates(res.data.candidates || []);
        if (res.data.categories) setCategories(res.data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();

    // Socket.IO Real-time Vote Listener
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    socket.on('last_dance:vote_updated', (data) => {
      setCandidates(prev => {
        const updated = prev.map(c => {
          if (c._id === data.candidateId) {
            return { ...c, voteCount: data.newVoteCount };
          }
          return c;
        });
        return updated.sort((a, b) => b.voteCount - a.voteCount);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedCategory]);

  const handleShareCandidate = (candidate) => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/last-dance?category=${encodeURIComponent(candidate.category)}`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedId(candidate._id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.oneLiner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top3 = filteredCandidates.slice(0, 3);
  const remainingCandidates = filteredCandidates.slice(3);
  const totalVotesInView = filteredCandidates.reduce((acc, curr) => acc + (curr.voteCount || 0), 0);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto font-sans space-y-10">
      
      {/* Musical Stage Hero Banner with Dancing Couple Animation & Live Equalizer */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-950 p-8 sm:p-10 lg:p-12 text-white shadow-2xl border border-indigo-400/40">
        
        {/* Decorative Floating Musical Notes & Ambient Glow Background */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-10 opacity-15 pointer-events-none hidden md:block">
          <Disc className="w-96 h-96 text-white animate-vinyl-spin" />
        </div>
        
        <div className="absolute top-6 right-1/2 text-indigo-300/30 text-4xl font-serif select-none pointer-events-none animate-float-note">
          ♪ ♫
        </div>
        <div className="absolute bottom-6 left-1/3 text-indigo-300/30 text-5xl font-serif select-none pointer-events-none animate-float-note" style={{ animationDelay: '1.5s' }}>
          ♬ ♩
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Side: Hero Information & Call To Actions (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center space-x-3 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-xs font-black uppercase tracking-wider border border-white/20">
              <Radio className="w-3.5 h-3.5 text-indigo-200 animate-pulse" />
              <span>Graduation Eve Music Festival & Gala</span>
              
              {/* Live Bouncing Equalizer Bars */}
              <div className="flex items-end space-x-1 h-3.5 pl-2 border-l border-white/30">
                <span className="w-1 bg-indigo-300 rounded-full animate-soundwave-1"></span>
                <span className="w-1 bg-indigo-200 rounded-full animate-soundwave-2"></span>
                <span className="w-1 bg-violet-300 rounded-full animate-soundwave-3"></span>
                <span className="w-1 bg-indigo-100 rounded-full animate-soundwave-4"></span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight flex flex-wrap items-center gap-3">
              <span>VOTE FOR YOUR</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-100 via-white to-purple-200 flex items-center space-x-2">
                <span>CAMPUS ICONS</span>
                <Music className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-300 inline-block animate-bounce" />
              </span>
            </h1>

            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed font-semibold">
              Four years of music, energy, and memories! Cast your instant M-Pesa votes to crown the official Last Dance award winners live on stage.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <Link
                href="/last-dance/register"
                className="px-5 py-3.5 rounded-2xl bg-white hover:bg-indigo-50 text-indigo-950 font-black text-xs uppercase tracking-wider shadow-lg transition flex items-center space-x-2 neu-button"
              >
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>Nominate Candidate (Free)</span>
              </Link>
              <Link
                href="/last-dance/tickets"
                className="px-5 py-3.5 rounded-2xl bg-indigo-950/60 hover:bg-indigo-950/80 backdrop-blur-md border border-white/30 text-white font-black text-xs uppercase tracking-wider transition flex items-center space-x-2"
              >
                <Ticket className="w-4 h-4 text-indigo-200" />
                <span>Get Festival Pass</span>
              </Link>
            </div>
          </div>

          {/* Right Side: Dancing Couple Animated Visual Showcase (5 Cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border-2 border-white/30 shadow-2xl group">
              <img
                src="/images/dancing_couple_hero.jpg"
                alt="Couple Dancing at Graduation Eve Gala"
                className="w-full h-64 sm:h-80 object-cover transform transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/90 via-indigo-950/20 to-transparent"></div>
              
              {/* Overlay Badges */}
              <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-black uppercase tracking-wider border border-white/30 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Live Dance Floor</span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-300">The Last Dance 2026</span>
                  <div className="flex items-end space-x-1 h-3">
                    <span className="w-1 bg-amber-300 rounded-full animate-soundwave-1"></span>
                    <span className="w-1 bg-amber-200 rounded-full animate-soundwave-2"></span>
                    <span className="w-1 bg-white rounded-full animate-soundwave-3"></span>
                  </div>
                </div>
                <p className="text-xs text-indigo-100 font-bold">Graduation Eve Celebration & Gala Ballroom</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Category Filter & Live Search Bar with Musical Accents */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-indigo-200/90 p-4 sm:p-5 rounded-3xl shadow-md">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-indigo-600 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search candidate name, slogan, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-indigo-200 rounded-2xl text-slate-950 text-xs font-bold placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 transition shadow-xs"
            />
          </div>

          {/* Quick Stats & Refresh Action */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
            <div className="text-xs font-black text-slate-800 px-3.5 py-2 bg-indigo-50/80 rounded-xl border border-indigo-200 flex items-center space-x-2">
              <Headphones className="w-4 h-4 text-indigo-600" />
              <span><strong className="text-indigo-700">{filteredCandidates.length}</strong> Nominees &bull; <strong className="text-violet-700">{totalVotesInView.toLocaleString()}</strong> Total Votes</span>
            </div>

            <button
              onClick={fetchCandidates}
              className="px-4 py-2.5 neu-button text-indigo-950 bg-indigo-100 hover:bg-indigo-200 rounded-2xl text-xs font-black flex items-center space-x-2 transition border border-indigo-300"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {['All', ...(categories.length > 0 ? categories : [
            'Mr & Miss Last Dance',
            'Most Likely to Succeed',
            'Best Dressed / Most Stylish',
            'Life of the Party',
            'Power Couple',
            'Campus Icon',
            'Comeback King/Queen',
            'Squad of the Year',
            'Most Missed'
          ])].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4.5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all duration-150 flex items-center space-x-1.5 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white shadow-md neu-button'
                  : 'bg-white text-slate-900 border border-indigo-200 hover:text-indigo-900 hover:bg-indigo-50/80 shadow-xs'
              }`}
            >
              {cat === 'All' ? <Disc className="w-3.5 h-3.5" /> : <Music className="w-3.5 h-3.5 opacity-70" />}
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium Spotlight Section with Musical Crown & Equalizers */}
      {!loading && top3.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="w-5 h-5 text-indigo-600 animate-pulse" />
              <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center space-x-2">
                <span>Top Leaders Stage Podium</span>
                <span className="text-xs bg-indigo-100 text-indigo-800 font-extrabold px-2.5 py-0.5 rounded-full border border-indigo-200">LIVE</span>
              </h2>
            </div>
            <span className="text-xs font-black text-indigo-900 bg-indigo-100 border border-indigo-300 px-3.5 py-1 rounded-full flex items-center space-x-1">
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>{selectedCategory}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {top3.map((candidate, idx) => {
              const rank = candidate.rank || (idx + 1);
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;

              return (
                <div
                  key={candidate._id}
                  className={`relative bg-white rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between shadow-lg border ${
                    isFirst
                      ? 'border-indigo-400 ring-2 ring-indigo-400/40 md:-translate-y-4 bg-gradient-to-b from-white via-indigo-50/50 to-indigo-100/40'
                      : 'border-indigo-200'
                  }`}
                >
                  {/* Spinning Disc Motif in Card Header */}
                  <div className="absolute top-4 right-4 text-indigo-200/50">
                    <Disc className="w-10 h-10 animate-vinyl-spin" />
                  </div>

                  {/* Rank Badge */}
                  <div className="absolute -top-3.5 left-6">
                    <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-md ${
                      isFirst
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 ring-2 ring-amber-300'
                        : isSecond
                        ? 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-950 border border-slate-400'
                        : 'bg-gradient-to-r from-amber-100 to-amber-200 text-amber-950 border border-amber-400'
                    }`}>
                      {isFirst ? <Crown className="w-4 h-4 fill-slate-950 inline text-slate-950" /> : <Trophy className="w-3.5 h-3.5 inline text-indigo-700" />}
                      <span>Track #{rank}</span>
                    </span>
                  </div>

                  <div className="space-y-4 pt-3">
                    <div className="relative w-28 h-28 mx-auto">
                      <img
                        src={candidate.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
                        alt={candidate.name}
                        className={`w-full h-full rounded-2xl object-cover border-4 shadow-md mx-auto ${
                          isFirst ? 'border-amber-400 ring-4 ring-indigo-400/30' : 'border-indigo-200'
                        }`}
                      />
                      {isFirst && (
                        <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg">
                          <Crown className="w-4 h-4 text-amber-300 fill-amber-300" />
                        </div>
                      )}
                    </div>

                    <div className="text-center space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-900 bg-indigo-100 border border-indigo-300 px-3 py-0.5 rounded-full inline-block">
                        {candidate.category}
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight">{candidate.name}</h3>
                      <p className="text-xs text-slate-800 line-clamp-2 italic font-bold">"{candidate.oneLiner}"</p>
                    </div>

                    {/* Equalizer Overtake Banner */}
                    {candidate.votesToOvertake > 0 && (
                      <div className="bg-indigo-100/90 border border-indigo-300 rounded-2xl p-2.5 text-center shadow-inner flex items-center justify-between">
                        <span className="text-[11px] font-black text-indigo-950 flex items-center space-x-1">
                          <Zap className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Needs {candidate.votesToOvertake} votes for #1!</span>
                        </span>
                        
                        <div className="flex items-end space-x-1 h-3">
                          <span className="w-1 bg-indigo-500 rounded-full animate-soundwave-1"></span>
                          <span className="w-1 bg-indigo-400 rounded-full animate-soundwave-2"></span>
                          <span className="w-1 bg-violet-600 rounded-full animate-soundwave-3"></span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-4 border-t border-indigo-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 font-black uppercase">Score</div>
                      <div className="text-base font-black text-slate-950">{candidate.voteCount.toLocaleString()} votes</div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleShareCandidate(candidate)}
                        className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300 transition"
                        title="Share link"
                      >
                        {copiedId === candidate._id ? <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <Share2 className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => setVotingCandidate(candidate)}
                        className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-black text-xs uppercase tracking-wider shadow-md transition flex items-center space-x-1.5 neu-button"
                      >
                        <Vote className="w-3.5 h-3.5 text-indigo-200" />
                        <span>Vote</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Candidates Grid with Track Numbers & Equalizer Accents */}
      <div className="space-y-4">
        <h2 className="text-xl font-black text-slate-950 tracking-tight flex items-center space-x-2">
          <Disc className="w-5 h-5 text-indigo-600" />
          <span>{selectedCategory === 'All' ? 'All Festival Contenders' : `${selectedCategory} Contenders`}</span>
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div key={n} className="h-64 bg-white border border-indigo-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="text-center py-16 bg-white border border-indigo-200 rounded-3xl space-y-4 shadow-sm">
            <Music className="w-12 h-12 text-indigo-400 mx-auto animate-bounce" />
            <h3 className="text-base font-black text-slate-950">No nominees found in this track list</h3>
            <p className="text-xs text-slate-700 max-w-sm mx-auto font-semibold">Be the first to nominate a candidate for this category!</p>
            <Link
              href="/last-dance/register"
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-black shadow-md neu-button"
            >
              <UserPlus className="w-4 h-4" />
              <span>Nominate Candidate (Free)</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(top3.length > 0 ? remainingCandidates : filteredCandidates).map((candidate, idx) => {
              const rank = candidate.rank || (top3.length > 0 ? idx + 4 : idx + 1);
              return (
                <div
                  key={candidate._id}
                  className="bg-white border border-indigo-200 rounded-3xl p-5 hover:shadow-xl transition-all duration-200 flex flex-col justify-between group hover:-translate-y-1 relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={candidate.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'}
                          alt={candidate.name}
                          className="w-14 h-14 rounded-2xl object-cover border border-indigo-300 shadow-xs"
                        />
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-indigo-900 bg-indigo-100 border border-indigo-300 px-2.5 py-0.5 rounded-full">
                            {candidate.category}
                          </span>
                          <h4 className="text-base font-black text-slate-950 mt-0.5 group-hover:text-indigo-600 transition">{candidate.name}</h4>
                          <span className="text-[11px] text-indigo-700 font-black">Rank #{rank}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-900 font-extrabold line-clamp-2 italic">"{candidate.oneLiner}"</p>
                    <p className="text-xs text-slate-700 font-semibold line-clamp-2 leading-relaxed">{candidate.pitch}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-indigo-100 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 font-black uppercase">Score</div>
                      <div className="text-sm font-black text-indigo-700">{candidate.voteCount.toLocaleString()} votes</div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleShareCandidate(candidate)}
                        className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition"
                        title="Share link"
                      >
                        {copiedId === candidate._id ? <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" /> : <Share2 className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => setVotingCandidate(candidate)}
                        className="px-4 py-2.5 rounded-2xl bg-indigo-950 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-wider transition flex items-center space-x-1.5 shadow-xs neu-button"
                      >
                        <Vote className="w-3.5 h-3.5 text-indigo-200" />
                        <span>Vote</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Vote Modal */}
      {votingCandidate && (
        <VoteModal
          candidate={votingCandidate}
          onClose={() => setVotingCandidate(null)}
          onSuccess={fetchCandidates}
        />
      )}
    </div>
  );
}
