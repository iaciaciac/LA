import React from 'react';
import Image from 'next/image';


const Housed = () => {
  return (
    <div className="flex flex-col flex-grow h-full bg-background-300 border-solid border-0 border-background-200 dark:border-background-600 dark:bg-background-800 rounded-xl px-6 lg:px-10 py-8 pt-12" style={{ opacity: 1 }}>
      <div className="w-full lg:w-4/5 xl:w-11/12 text-font-900 dark:text-font-100 tracking-wide text-xl lg:text-2xl leading-tight font-light pt-12">
        <span className="font-bold">Cooperative</span> Hotel Brand
      </div>
      <div className="pt-0 pb-4 w-full text-base dark:text-font-500 text-font-500 font-light">
        In no particular order
      </div>
      <div className="flex items-center justify-between flex-wrap my-10">
        <a href="https://example.com">
         <Image
            alt="Hotels"
            src="/images/hotels_b_.png"
            width="118"
            height="38"
            decoding="async"
            data-nimg="1"
            className="block dark:hidden"
            loading="lazy"
            style={{ outline: 'none', color: 'transparent' }}
          />
          <Image
            alt="Hotels"
            src="/images/hotels_b_dark.png"
            width="118"
            height="38"
            decoding="async"
            data-nimg="1"
            className="hidden dark:block"
            loading="lazy"
            style={{ outline: 'none', color: 'transparent' }}
          />
        </a>
        <a href="https://example.com">
          <Image
            alt="Hotels"
            src="/images/home_logo_w.png"
            width="118"
            height="38"
            decoding="async"
            data-nimg="1"
            className="block dark:hidden"
            loading="lazy"
            style={{ outline: 'none', color: 'transparent' }}
          />
          <Image
            alt="Hotels"
            src="/images/home_logo_w_dark.png"
            width="118"
            height="38"
            decoding="async"
            data-nimg="1"
            className="hidden dark:block"
            loading="lazy"
            style={{ outline: 'none', color: 'transparent' }}
          />
        </a>
        <a href="https://example.com">
          <Image
            alt="Hotels"
            src="/images/home_logo_ha_6.png"
            width="118"
            height="38"
            decoding="async"
            data-nimg="1"
            className="block dark:hidden"
            loading="lazy"
            style={{ outline: 'none', color: 'transparent' }}
          />
          <Image
            alt="Hotels"
            src="/images/home_logo_he_dark.png"
            width="118"
            height="38"
            decoding="async"
            data-nimg="1"
            className="hidden dark:block"
            loading="lazy"
            style={{ outline: 'none', color: 'transparent' }}
          />
        </a>
       
      </div>
     
   

 
      </div>
    
  );
};

export default Housed;
