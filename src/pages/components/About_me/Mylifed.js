import { GOOGLE_FONT_PROVIDER } from 'next/dist/shared/lib/constants';
import Image from 'next/image';

import React from 'react';

const Mylifed = () => {
  return (
    <div>
      <div className="block">
        <div className="lg:flex gap-8" style={{marginLeft: '24px', marginRight: '24px'}}>
          <div className="flex flex-col lg:w-2/5">
            <div className="flex flex-col flex-grow h-full bg-background-300 border-solid border border-background-200 dark:bg-gray-100 dark:bg-background-800 rounded-xl px-6 lg:px-10 py-8 pt-12">
              <Image
                alt="antcloud" 
                srcSet="/_next/image?url=%2Fimages%2Fimage_book-2.png&amp;w=128&amp;q=75 1x, /_next/image?url=%2Fimages%2Fimage_book-2.png&amp;w=256&amp;q=75 2x" 
                src="/_next/image?url=%2Fimages%2Fimage_book-2.png&amp;w=256&amp;q=75" 
                width="44" 
                height="44" 
                decoding="async" 
                data-nimg="1" 
                className="block dark:hidden" 
                loading="lazy" 
                style={{ color: 'transparent' }} 
              />
              <Image
                alt="antcloud" 
                srcSet="/_next/image?url=%2Fimages%2Fimage_book-2.png&amp;w=128&amp;q=75 1x, /_next/image?url=%2Fimages%2Fimage_book-2.png&amp;w=256&amp;q=75 2x" 
                src="/_next/image?url=%2Fimages%2Fimage_book-2.png&amp;w=256&amp;q=75" 
                width="44" 
                height="44" 
                decoding="async" 
                data-nimg="1" 
                className="hidden dark:block" 
                loading="lazy" 
                style={{ color: 'transparent' }} 
              />
              <div className="w-full lg:w-4/5 xl:w-11/12 dark:text-gray-900 text-font-500 tracking-wide text-xl lg:text-2xl leading-tight font-light pt-12">
                <span className="font-bold">He</span>y
              </div>
              <div className="pt-4 pb-2 w-full text-base dark:text-gray-500 text-font-500 font-light">
              That's right, I am Cai Cai.
              </div>
               
              <div className="flex pt-8 justify-between items-center">
                <div className="flex items-end">
                  <Image
                    alt="twitter"
                    srcSet="/images/look_photos_.png"
                    src="/images/look_photos_.png"
                    width="500"
                    height="400"
                    decoding="async"
                    data-nimg="1"
                    className="rounded-xl w-full"
                    loading="lazy"
                    style={{ color: 'transparent' }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex flex-col gap-8 lg:w-3/5 lg:flex gap-20">
  <div className="flex flex-col flex-grow h-full bg-background-300 border-solid border border-background-200 dark:bg-gray-100 rounded-xl px-6 lg:px-10 py-8 pt-12">
    <a href="https://caicaicai.me">
      <Image
        alt="look"
        srcSet="/_next/image?url=%2Fimages%2FInstagram_Glyph_Black.png&amp;w=128&amp;q=75 1x, /_next/image?url=%2Fimages%2FInstagram_Glyph_Black.png&amp;w=256&amp;q=75 2x" 
        src="/_next/image?url=%2Fimages%2FInstagram_Glyph_Black.png&amp;w=256&amp;q=75" 
        width="22"
        height="22"
        decoding="async"
        data-nimg="1"
        className="block dark:hidden"
        loading="lazy"
        style={{ color: 'transparent' }}
      />
    </a>
    <a href="https://caicaicai.me">
      <Image
        alt="look"
        srcSet="/_next/image?url=%2Fimages%2FInstagram_Glyph_Black.png&amp;w=128&amp;q=75 1x, /_next/image?url=%2Fimages%2FInstagram_Glyph_Black.png&amp;w=256&amp;q=75 2x" 
        src="/_next/image?url=%2Fimages%2FInstagram_Glyph_Black.png&amp;w=256&amp;q=75" 
        width="22"
        height="22"
        decoding="async"
        data-nimg="1"
        className="hidden dark:block"
        loading="lazy"
        style={{ color: 'transparent' }}
      />
    </a>
  
    

    


              <div className="w-full lg:w-4/5 xl:w-11/12 text-font-900 dark:text-font-200 tracking-wide text-xl lg:text-2xl leading-tight font-light pt-12">
                <span className="font-bold">Unknown project</span> This is just a new attempt!
              </div>
              <div className="pt-8 pb-4 w-full text-base dark:text-gray-500 text-font-500 font-light">
              Perhaps, this is a bridge of communication.
              </div>
              <div className="flex pt-8 justify-between items-center">
                <div className="flex items-end">
                  <Image
                    alt="toome"
                    srcSet="/images/IMG_1802_Original.jpg"
                    src="/images/IMG_1802_Original.jpg"
                    width="900"
                    height="38"
                    decoding="async"
                    data-nimg="1"
                    className="rounded-xl w-full"
                    loading="lazy"
                    style={{ color: 'transparent' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mylifed;
