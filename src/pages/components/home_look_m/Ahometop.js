import React from 'react';
import Image from 'next/image';

const Ahometop = () => {
  return (
    <div className="relative flex flex-col flex-grow h-full bg-background-900 border-solid border-background-200 rounded-xl px-6 lg:px-6 py-8 pt-12" style={{ opacity: 1 }}>
      <div className="relative">
        <Image
          alt="twitter"
          src="/images/home_cai_top.jpg"
          width={1000}
          height={500}
          className="w-full h-full rounded-xl object-cover"
          loading="lazy"
        />
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
          <div className="text-font-900 tracking-wide text-2xl lg:text-3xl leading-tight font-light" style={{ padding: '0 15px' }}>
            <span className="font-bold">This is the city where I live</span>  - Xiamen
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ahometop;