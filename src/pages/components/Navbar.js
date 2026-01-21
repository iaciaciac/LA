import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Navbar = () => {
  const router = useRouter();
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    const fetchRunData = async () => {
      try {
        const res = await fetch('/api/running');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setDistance((data[0].distance / 1000).toFixed(2));
          }
        }
      } catch (error) {
        console.error('Failed to fetch run data:', error);
      }
    };
    fetchRunData();
  }, []);

  return (
    <header className={`${router.pathname === '/' ? 'relative' : router.pathname === '/cai_run' ? 'absolute top-0' : 'sticky top-0'} left-0 right-0 z-50 w-full mb-[10px] h-[44px] backdrop-blur-[20px] backdrop-saturate-[180%] bg-[rgba(var(--background-start-rgb),0.72)] transition-all duration-300`}>
      <nav className="flex items-center justify-between w-full h-full px-4 md:px-12" role="navigation">
        <div className="flex-shrink-0">
          <Link href="/">
            <span
              className="text-sm tracking-widest uppercase"
              style={{ color: 'rgb(var(--foreground-rgb))' }}
            >
              CAICAI
            </span>
          </Link>
        </div>

        <div className="flex gap-4 md:gap-8 text-xs font-medium overflow-x-auto no-scrollbar items-center" style={{ color: 'rgb(var(--foreground-rgb))' }}>
          <Link href="/" className="shrink-0 hidden md:block">
            <span className="relative opacity-80 hover:opacity-100 transition-opacity">Home</span>
          </Link>
          <Link href="/cai_photos" className="shrink-0">
            <span className="relative opacity-80 hover:opacity-100 transition-opacity">Photos</span>
          </Link>
          <Link href="/cai_run" className="shrink-0">
            <div className="flex items-center gap-1.5 group cursor-pointer">
              <span className="relative opacity-100 group-hover:opacity-100 transition-opacity">Run</span>
              {distance && (
                <span className="text-[9px] font-bold" style={{ color: '#AAFB00' }}>
                  {distance}km
                </span>
              )}
            </div>
          </Link>
          <Link href="/cai_damn" className="shrink-0">
            <span className="relative opacity-80 hover:opacity-100 transition-opacity">DAMN</span>
          </Link>
          <Link href="/cai_about" className="shrink-0">
            <span className="relative opacity-80 hover:opacity-100 transition-opacity">About</span>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
