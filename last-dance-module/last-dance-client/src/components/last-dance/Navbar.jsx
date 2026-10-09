'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Trophy, Ticket, UserPlus, Info, 
  Volume2, VolumeX, Menu, X, Disc, Music, Sparkles
} from 'lucide-react';

export default function Navbar({ isPlayingAudio, onToggleAudio, onOpenTicketModal }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Leaderboard', href: '/last-dance', icon: Trophy },
    { name: 'Buy Tickets', href: '/last-dance/tickets', icon: Ticket },
    { name: 'Nominate', href: '/last-dance/register', icon: UserPlus },
    { name: 'Event Info', href: '/last-dance/info', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel font-sans transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo with Electric Indigo & Soft Lilac Vinyl */}
          <Link href="/last-dance" className="flex items-center space-x-3 group">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 p-0.5 shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Disc className={`w-5 h-5 text-indigo-300 ${isPlayingAudio ? 'animate-vinyl-spin' : ''}`} />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-black text-xl tracking-tight text-slate-900">LAST DANCE</span>
                <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-100 text-indigo-700 border border-indigo-200/80 px-2.5 py-0.5 rounded-full shadow-xs">
                  FESTIVAL '26
                </span>
              </div>
              <p className="text-[11px] text-indigo-900/70 font-semibold tracking-wide">Graduation Eve Send-Off</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href === '/last-dance' && pathname === '/last-dance');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'text-slate-700 hover:text-indigo-900 hover:bg-indigo-100/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-200' : 'text-indigo-500'}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Ambient Sound Toggle Button */}
            <button
              onClick={onToggleAudio}
              title={isPlayingAudio ? 'Mute Celebration Ambient' : 'Play Celebration Ambient'}
              className={`px-4 py-2.5 rounded-2xl border transition-all duration-200 flex items-center space-x-2 text-xs font-bold ${
                isPlayingAudio
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-950 shadow-xs'
                  : 'bg-white/80 border-indigo-100 text-slate-700 hover:bg-indigo-50/80'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <div className="flex items-end space-x-0.5 h-3.5">
                    <span className="w-0.5 bg-indigo-600 rounded-full animate-soundwave-1"></span>
                    <span className="w-0.5 bg-indigo-600 rounded-full animate-soundwave-2"></span>
                    <span className="w-0.5 bg-indigo-600 rounded-full animate-soundwave-3"></span>
                  </div>
                  <span className="text-[11px] font-extrabold text-indigo-950">Music ON</span>
                </>
              ) : (
                <>
                  <Music className="w-4 h-4 text-indigo-500" />
                  <span className="text-[11px] font-bold text-slate-700">Ambient</span>
                </>
              )}
            </button>

            {/* Buy Ticket CTA Button with Neumorphism & Glass */}
            <button
              onClick={onOpenTicketModal}
              className="relative group px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-700 hover:to-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 overflow-hidden"
            >
              <Ticket className="w-4 h-4 text-indigo-200" />
              <span>Get Entry Pass</span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={onToggleAudio}
              className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200"
            >
              {isPlayingAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-indigo-50 text-slate-800 hover:text-indigo-900 border border-indigo-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-indigo-200 px-4 py-5 space-y-3 font-sans shadow-lg animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-1 gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-bold transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-800 hover:bg-indigo-100/60'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-indigo-200/80">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenTicketModal();
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-black text-sm flex items-center justify-center space-x-2 shadow-md"
            >
              <Ticket className="w-5 h-5 text-indigo-200" />
              <span>Buy Entry Pass (KES 500)</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
