'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { MenuItem } from '@/types/mosque';
import { ChevronDown, Menu, X, Tv, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  mosqueName: string;
  institution: string;
  menus: MenuItem[];
}

export default function Navbar({ mosqueName, institution, menus }: NavbarProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      // Gradually transition between scrollY 10px and 220px
      const progress = Math.min(1, Math.max(0, (y - 10) / 210));
      setScrollProgress(progress);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenDropdownId(null);
        setMobileMenuOpen(false);
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const sortedMenus = [...menus].sort((a, b) => a.order - b.order);
  const isSolid = scrollProgress > 0.45;

  return (
    <header
      ref={navRef}
      style={{
        backgroundColor: `rgba(255, 253, 249, ${scrollProgress * 0.97})`,
        borderBottomColor: `rgba(223, 213, 197, ${scrollProgress})`,
        boxShadow:
          scrollProgress > 0.6
            ? '0 4px 20px -4px rgba(30, 27, 24, 0.08)'
            : 'none',
      }}
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-colors duration-200 ${
        isSolid ? 'text-[#1E1B18]' : 'text-[#FAF7F2] dark-surface'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Identity */}
          <Link
            href="/"
            className="flex items-center gap-3 py-2 min-h-[44px] group rounded-md"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-serif-heading font-bold text-lg border transition-colors ${
                isSolid
                  ? 'bg-[#1E1B18] text-[#E8CFA0] border-[#1E1B18]'
                  : 'bg-[#1E1B18]/80 text-[#E8CFA0] border-[#E8CFA0]/50'
              }`}
              aria-hidden="true"
            >
              AJ
            </div>
            <div className="flex flex-col">
              <span
                className={`font-serif-heading font-bold text-base sm:text-lg leading-tight transition-colors ${
                  isSolid ? 'text-[#1E1B18]' : 'text-[#FAF7F2]'
                }`}
              >
                {mosqueName}
              </span>
              <span
                className={`text-xs font-medium transition-colors ${
                  isSolid ? 'text-[#524740]' : 'text-[#E8CFA0]'
                }`}
              >
                {institution}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            aria-label="Navigasi Utama"
            className="hidden lg:flex items-center gap-1 xl:gap-2"
          >
            {sortedMenus.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openDropdownId === item.id;

              if (!hasChildren) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`px-3.5 py-2.5 min-h-[44px] inline-flex items-center text-sm font-semibold rounded-md transition-colors ${
                      isSolid
                        ? 'text-[#1E1B18] hover:bg-[#F2ECE1] hover:text-[#A84A2E]'
                        : 'text-[#FAF7F2] hover:bg-white/15'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <div key={item.id} className="relative">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() =>
                      setOpenDropdownId(isOpen ? null : item.id)
                    }
                    className={`px-3.5 py-2.5 min-h-[44px] inline-flex items-center gap-1.5 text-sm font-semibold rounded-md transition-colors cursor-pointer ${
                      isSolid
                        ? 'text-[#1E1B18] hover:bg-[#F2ECE1] hover:text-[#A84A2E]'
                        : 'text-[#FAF7F2] hover:bg-white/15'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div
                      role="menu"
                      className="absolute left-0 mt-2 w-60 rounded-lg bg-[#FAF7F2] text-[#1E1B18] shadow-xl border border-[#DFD5C5] py-2 z-50"
                    >
                      {item.children.map((sub) => (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          role="menuitem"
                          onClick={() => setOpenDropdownId(null)}
                          className="block px-4 py-2.5 min-h-[44px] text-sm font-medium text-[#1E1B18] hover:bg-[#F2ECE1] hover:text-[#A84A2E] transition-colors"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Action Buttons (TV Mode & Admin) */}
          <div className="hidden lg:flex items-center gap-2.5">
            <Link
              href="/tv"
              className={`px-3.5 py-2.5 min-h-[44px] inline-flex items-center gap-2 text-xs font-semibold rounded-md border transition-colors ${
                isSolid
                  ? 'border-[#1E1B18] text-[#1E1B18] hover:bg-[#1E1B18] hover:text-[#FAF7F2]'
                  : 'border-[#E8CFA0] text-[#E8CFA0] bg-[#1E1B18]/60 hover:bg-[#1E1B18]'
              }`}
              title="Buka tampilan layar penuh untuk Smart TV Masjid"
            >
              <Tv className="w-4 h-4" />
              <span>Layar TV</span>
            </Link>
            <Link
              href="/admin"
              className="px-4 py-2.5 min-h-[44px] inline-flex items-center gap-2 text-xs font-semibold rounded-md bg-[#A84A2E] text-white hover:bg-[#8E3B22] transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Panel Admin</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button with explicit label (R-03) */}
          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
              className={`px-3.5 py-2 min-h-[44px] min-w-[44px] inline-flex items-center gap-2 rounded-md text-sm font-semibold border transition-colors ${
                isSolid
                  ? 'border-[#1E1B18]/30 text-[#1E1B18] bg-[#F2ECE1]'
                  : 'border-[#FAF7F2]/40 text-[#FAF7F2] bg-[#1E1B18]/75'
              }`}
            >
              {mobileMenuOpen ? (
                <>
                  <X className="w-5 h-5" />
                  <span>Tutup</span>
                </>
              ) : (
                <>
                  <Menu className="w-5 h-5" />
                  <span>Menu</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF7F2] text-[#1E1B18] border-b border-[#DFD5C5] px-4 pt-3 pb-6 shadow-xl max-h-[82vh] overflow-y-auto">
          <nav aria-label="Navigasi Mobile" className="flex flex-col gap-1">
            {sortedMenus.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openDropdownId === item.id;

              if (!hasChildren) {
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-3 min-h-[44px] flex items-center text-base font-semibold text-[#1E1B18] hover:bg-[#F2ECE1] rounded-md"
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <div key={item.id} className="border-b border-[#DFD5C5]/60 pb-1">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenDropdownId(isOpen ? null : item.id)}
                    className="w-full px-3 py-3 min-h-[44px] flex items-center justify-between text-base font-semibold text-[#1E1B18] hover:bg-[#F2ECE1] rounded-md"
                  >
                    <span>{item.label}</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="pl-4 pr-2 pb-2 flex flex-col gap-1 bg-[#F2ECE1]/60 rounded-md mt-1">
                      {item.children.map((sub) => (
                        <Link
                          key={sub.id}
                          href={sub.href}
                          onClick={() => {
                            setOpenDropdownId(null);
                            setMobileMenuOpen(false);
                          }}
                          className="px-3 py-2.5 min-h-[44px] flex items-center text-sm font-medium text-[#1E1B18] hover:text-[#A84A2E] rounded-md"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-4 mt-2 border-t border-[#DFD5C5] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/tv"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 min-h-[44px] flex items-center justify-center gap-2 text-sm font-semibold rounded-md border border-[#1E1B18] text-[#1E1B18] hover:bg-[#1E1B18] hover:text-[#FAF7F2]"
              >
                <Tv className="w-4 h-4" />
                <span>Buka Mode TV Masjid</span>
              </Link>
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 min-h-[44px] flex items-center justify-center gap-2 text-sm font-semibold rounded-md bg-[#A84A2E] text-white hover:bg-[#8E3B22]"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Buka Panel Admin</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
