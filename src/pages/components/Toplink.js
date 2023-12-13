
import React from "react";
import Image from "next/image";

const Toplink = () => {
  return (
    <footer className="flex justify-between items-center py-4 bg-white dark:bg-black h-40">
      
      <div className="flex items-center">
      <div className="pr-10">
         
        </div>
    
      <div className="text-xs font-light tracking-wide leading-relaxed antialiased text-font-700 dark:text-font-900">
      © 2024 
            </div>
      </div>
      <div className="flex items-center">
      <div className="pr-2">
            <Image
        alt="logo"
        src="/images/home_logo_icon.png"
        width={24}
        height={24}
        decoding="async"
        data-nimg="1"
        className="block dark:hidden"
        loading="lazy"
        style={{ color: 'transparent' }}
      />
            </div>
        <div className="pr-2">
          <Image
        alt="logo"
        src="/images/home_logo_icon.png"
        width={24}
        height={24}
        decoding="async"
        data-nimg="1"
        className="hidden dark:block"
        loading="lazy"
        style={{ color: 'transparent' }}
      />
        </div>
        <div className="text-xs font-light tracking-wide leading-relaxed antialiased text-font-700 dark:text-font-900 mr-10">
        Customer Service
            </div>
        
         
            <div className="flex items-center">
      <div className="pr-2">
            <Image
        alt="logo"
        src="/images/home_logo_icon.png"
        width={24}
        height={24}
        decoding="async"
        data-nimg="1"
        className="block dark:hidden"
        loading="lazy"
        style={{ color: 'transparent' }}
      />
            </div>
        <div className="pr-2">
          <Image
        alt="logo"
        src="/images/home_logo_icon.png"
        width={24}
        height={24}
        decoding="async"
        data-nimg="1"
        className="hidden dark:block"
        loading="lazy"
        style={{ color: 'transparent' }}
      />
        </div>
        </div>

<div className="text-xs font-light tracking-wide leading-relaxed antialiased text-font-700 dark:text-font-900 mr-10">
             +1 8122879931
            </div>
        

      </div>
    </footer>
  );
};

export default Toplink;