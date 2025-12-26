import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <header className="relative top-0 left-0 right-0 z-50 w-full mb-[10px]">
      <nav className="flex items-center justify-between w-full px-6 py-6 md:px-12" role="navigation">
        <div className="flex-shrink-0">
          <Link href="/">
            <span
              className="font-bold text-lg tracking-widest uppercase"
              style={{ color: 'rgb(var(--foreground-rgb))' }}
            >
              CAICAI
            </span>
          </Link>
        </div>

        <div className="flex gap-8 text-sm font-medium" style={{ color: 'rgb(var(--foreground-rgb))' }}>
          <Link href="/">
            <span className="relative opacity-70 hover:opacity-100 transition-opacity">Home</span>
          </Link>
          <Link href="/Citywalk">
            <span className="relative opacity-70 hover:opacity-100 transition-opacity">Photos</span>
          </Link>
          <Link href="/photos">
            <span className="relative opacity-70 hover:opacity-100 transition-opacity">DAMN</span>
          </Link>
          <Link href="/Belike">
            <span className="relative opacity-70 hover:opacity-100 transition-opacity">About</span>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
