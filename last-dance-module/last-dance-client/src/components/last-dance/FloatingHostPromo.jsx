'use client';

import React from 'react';

const WHATSAPP_PHONE = '254708270176';
const DISPLAY_PHONE = '0708270176';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}`;

export default function FloatingHostPromo() {
  return (
    <div
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-50 print:hidden select-none"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Chat with us on WhatsApp: ${DISPLAY_PHONE}`}
        className="group flex items-center gap-2.5 rounded-full bg-[#25D366] text-white pl-3.5 pr-4 py-2.5 shadow-2xl hover:bg-[#20ba59] hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/20"
      >
        {/* WhatsApp Icon */}
        <div className="relative flex items-center justify-center">
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
        </div>

        {/* Text */}
        {/* <span className="text-xs sm:text-[13px] font-bold tracking-wide">
          {DISPLAY_PHONE}
        </span> */}
      </a>
    </div>
  );
}
