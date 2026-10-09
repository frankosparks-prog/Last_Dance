'use client';

import React from 'react';
import { Flame, Radio, Disc } from 'lucide-react';

export default function LiveTicker({ feedItems = [] }) {
  if (!feedItems || feedItems.length === 0) {
    return (
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 text-white py-2 px-4 text-xs font-bold flex items-center justify-center space-x-2 shadow-xs">
        <Radio className="w-3.5 h-3.5 text-indigo-200 animate-pulse" />
        <span>LIVE VOTING FEED ONLINE &bull; Cast votes in real-time with instant M-Pesa STK Push</span>
      </div>
    );
  }

  const latest = feedItems[0];

  return (
    <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-indigo-800 py-2 px-4 text-xs font-bold text-white shadow-xs overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2 animate-fade-in">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-200"></span>
          </span>
          <Disc className="w-3.5 h-3.5 text-indigo-200 animate-spin" />
          <span className="font-extrabold">{latest.message || latest.text}</span>
        </div>
        <div className="hidden sm:flex items-center space-x-4 text-[11px] text-indigo-100 font-semibold">
          <span>Real-time Socket.IO Sync</span>
          <span className="w-1 h-1 bg-white/60 rounded-full"></span>
          <span>{feedItems.length} Recent Activity Updates</span>
        </div>
      </div>
    </div>
  );
}
