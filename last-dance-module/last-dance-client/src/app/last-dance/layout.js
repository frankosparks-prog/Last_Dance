'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/last-dance/Navbar';
import LiveTicker from '../../components/last-dance/LiveTicker';
import Footer from '../../components/last-dance/Footer';
import TicketModal from '../../components/last-dance/TicketModal';
import io from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

export default function LastDanceLayout({ children }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [liveActivityFeed, setLiveActivityFeed] = useState([]);

  // Synthesizer / Audio Ambient ref
  const audioCtxRef = useRef(null);
  const soundTimerRef = useRef(null);

  useEffect(() => {
    // Socket.IO Real-time Connection for activity ticker across all pages
    const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

    socket.on('last_dance:activity_feed', (feedItem) => {
      setLiveActivityFeed(prev => [feedItem, ...prev.slice(0, 4)]);
    });

    return () => {
      socket.disconnect();
      if (soundTimerRef.current) clearInterval(soundTimerRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
    };
  }, []);

  // Ambient sound synthesizer logic
  const startAmbientSynth = (ctx) => {
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C4, E4, G4, C5, E5, G5
    let noteIdx = 0;

    const playNextNote = () => {
      if (!ctx || ctx.state !== 'running') return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(notes[noteIdx], ctx.currentTime);
        noteIdx = (noteIdx + 1) % notes.length;

        gain.gain.setValueAtTime(0.001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 2.6);
      } catch (e) {
        // Audio error handle
      }
    };

    playNextNote();
    soundTimerRef.current = setInterval(playNextNote, 2800);
  };

  const handleToggleAudio = () => {
    if (!isPlayingAudio) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      startAmbientSynth(ctx);
      setIsPlayingAudio(true);
    } else {
      if (soundTimerRef.current) clearInterval(soundTimerRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-rose-500 selection:text-white font-sans">
      {/* Live Socket.IO Activity Ticker Banner */}
      <LiveTicker feedItems={liveActivityFeed} />

      {/* Global Module Navigation Bar */}
      <Navbar
        isPlayingAudio={isPlayingAudio}
        onToggleAudio={handleToggleAudio}
        onOpenTicketModal={() => setShowTicketModal(true)}
      />

      {/* Dynamic Sub-route Content Page */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Entry Pass Ticket Modal */}
      {showTicketModal && (
        <TicketModal onClose={() => setShowTicketModal(false)} />
      )}
    </div>
  );
}
