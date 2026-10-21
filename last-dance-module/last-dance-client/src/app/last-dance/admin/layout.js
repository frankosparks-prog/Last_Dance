'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Trophy, UserPlus, Ticket, Settings, LogOut, 
  ExternalLink, Menu, X, ShieldAlert, Sparkles, Power,
  QrCode, Tag
} from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/last-dance/admin/login';

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [systemOnline, setSystemOnline] = useState(true);
  const [adminUser, setAdminUser] = useState(null);

  useEffect(() => {
    if (isLoginPage) return;

    // Check token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/last-dance/admin/login');
        return;
      }
      try {
        const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
        setAdminUser(user);
      } catch (e) {
        setAdminUser({ email: 'admin@nutripay.co.ke' });
      }
    }

    // Check system status
    axios.get(`${API_BASE_URL}/last-dance/settings`)
      .then(res => {
        if (res.data?.success && res.data.settings) {
          setSystemOnline(res.data.settings.enabled !== false);
        }
      })
      .catch(() => {});
  }, [pathname, isLoginPage, router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('admin_user');
    }
    router.push('/last-dance/admin/login');
  };

  // If on login page, render children directly without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  const navItems = [
    { name: 'Overview', href: '/last-dance/admin', icon: Trophy, exact: true },
    { name: 'Gate Scanner', href: '/last-dance/admin/scanner', icon: QrCode, exact: false },
    { name: 'Nominees', href: '/last-dance/admin/nominees', icon: UserPlus, exact: false },
    { name: 'Categories', href: '/last-dance/admin/categories', icon: Tag, exact: false },
    { name: 'Tickets & Sales', href: '/last-dance/admin/tickets', icon: Ticket, exact: false },
    { name: 'System Settings', href: '/last-dance/admin/settings', icon: Settings, exact: false },
  ];

  const isLinkActive = (item) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <div 
      className="min-h-screen bg-[#f7f7f7] text-[#1d1d1d] flex flex-col md:flex-row"
      style={{ fontFamily: 'Roboto, sans-serif' }}
    >
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-black/[0.08] sticky top-0 z-40">
        <Link href="/last-dance/admin" className="flex items-center space-x-2">
          <span className="font-bold text-[16px] text-black tracking-tight">LAST DANCE</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-[#762e99] bg-[#762e99]/10 px-2 py-0.5 rounded-full">
            Admin
          </span>
        </Link>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-black/70 hover:text-black rounded-lg transition"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop / Mobile Drawer Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-black/[0.08] flex flex-col justify-between transition-transform duration-200 ease-in-out
        md:translate-x-0 md:static md:h-screen md:sticky md:top-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link href="/last-dance/admin" className="space-y-0.5 block">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[18px] text-black tracking-[-0.02em]">LAST DANCE</span>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#ff914d] bg-[#ff914d]/10 px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-black/45">Graduation Eve Send-Off</p>
            </Link>

            <button 
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-black/40 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* System Online / Offline Badge */}
          <div className="p-3 bg-[#f7f7f7] rounded-2xl border border-black/[0.05] flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${systemOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
              <span className="text-[11px] font-medium text-black/70">
                {systemOnline ? 'System Online' : 'System Offline'}
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold text-black/40">2026</span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-black/40 px-3 pb-1">
              Management
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-full text-[13px] font-medium transition-all ${
                    active
                      ? 'bg-gradient-to-r from-[#5e2590] to-[#762e99] text-white shadow-sm'
                      : 'text-black/70 hover:text-black hover:bg-black/[0.04]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-black/50'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Public Links */}
          <div className="pt-2 border-t border-black/[0.06] space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-black/40 px-3 pb-1">
              Live Event
            </p>
            <Link
              href="/last-dance"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2 rounded-full text-[13px] text-black/60 hover:text-black hover:bg-black/[0.04] transition"
            >
              <span className="font-normal">View Event Page</span>
              <ExternalLink className="w-3.5 h-3.5 text-black/40" />
            </Link>
            <Link
              href="/last-dance/tickets"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2 rounded-full text-[13px] text-black/60 hover:text-black hover:bg-black/[0.04] transition"
            >
              <span className="font-normal">Ticket Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-black/40" />
            </Link>
          </div>
        </div>

        {/* Bottom Profile & Logout Section */}
        <div className="p-4 border-t border-black/[0.08] space-y-3 bg-[#fafafa]">
          <div className="px-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-black/40">Logged in as</p>
            <p className="text-[12px] font-medium text-black truncate">{adminUser?.email || 'admin@nutripay.co.ke'}</p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-full border border-black/15 bg-white text-black hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-[12px] font-medium transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>
    </div>
  );
}
