


import React from 'react';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="px-4 flex justify-center items-center h-16 bg-white text-black relative shadow-sm font-mono border-0" role="navigation">
      <div className="inline-flex gap-16">
       
        <Link href="/">
          <span className="font-normal text-sm relative after:absolute after:bg-black after:bottom-0 after:left-0 after:h-[2px] after:w-full after:translate-y-1 after:opacity-0 hover:after:translate-y-0 hover:after:opacity-100 after:transition after:ease-in-out after:duration-200 after:opacity-100 hover:after:bg-black">Home</span>
        </Link>
        <Link href="/photos">
          <span className="font-normal text-sm relative after:absolute after:bg-black after:bottom-0 after:left-0 after:h-[2px] after:w-full after:translate-y-1 after:opacity-0 hover:after:translate-y-0 hover:after:opacity-100 after:transition after:ease-in-out after:duration-200">Photo</span>
        </Link>
        <Link href="/Belike">
          <span className="font-normal text-sm relative after:absolute after:bg-black after:bottom-0 after:left-0 after:h-[2px] after:w-full after:translate-y-1 after:opacity-0 hover:after:translate-y-0 hover:after:opacity-100 after:transition after:ease-in-out after:duration-200">DAMN</span>
        </Link>
        <Link href="/Citywalk">
          <span className="font-normal text-sm relative after:absolute after:bg-black after:bottom-0 after:left-0 after:h-[2px] after:w-full after:translate-y-1 after:opacity-0 hover:after:translate-y-0 hover:after:opacity-100 after:transition after:ease-in-out after:duration-200">About</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;




