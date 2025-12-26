


import Image from 'next/image';
import React from 'react';


const Ahometopb = () => {
  return (
    <div>
      <div className="block">
        <div className="lg:flex gap-8" style={{ marginLeft: '24px', marginRight: '24px' }}>
          <div className="flex flex-col lg:w-2/5">
            <div className="flex flex-col flex-grow h-full bg-background-300 border-solid border border-background-200 dark:border-background-600 dark:bg-background-800 rounded-xl px-6 lg:px-10 py-8 pt-12">

              <div className="w-full lg:w-4/5 xl:w-11/12 text-font-900 dark:text-font-100 tracking-wide text-xl lg:text-2xl leading-tight font-light pt-12">
                <span className="font-bold"> Outfit of</span> the day
              </div>
              <div className="pt-8 pb-4 w-full text-base dark:text-font-500 text-font-500 font-light">
                The most beautiful without showing the face.
              </div>

              <div className="flex pt-8 justify-center items-center w-full">
                <div className="w-full h-auto">
                  <Image
                    alt="twitter"
                    srcSet="/images/caicai_look.png"
                    src="/images/caicai_look.png"
                    width="500"
                    height="400"
                    className="rounded-xl w-full h-auto object-cover mx-auto"
                    loading="lazy"
                    style={{ color: 'transparent' }}
                  />
                </div>
              </div>


            </div>
            <div className="flex h-full">
              <div className="flex flex-col flex-grow bg-background-300 border-background-200 border-solid border dark:bg-background-800 dark:border-background-600 rounded-xl px-6 lg:px-10 py-8 pt-12 mt-8">

                <div className="w-full lg:w-4/5 xl:w-11/12 text-font-900 dark:text-font-100 tracking-wide text-xl lg:text-2xl leading-tight font-light pt-12">
                  Coffee is bitter in life
                </div>
                <div className="pt-8 pb-4 w-full text-base dark:text-font-500 text-font-500 font-light">
                  For a cup of coffee, you have to bring a mug when you go out.
                </div>
                <div className="flex pt-8 justify-center items-center w-full">
                  <div className="w-full h-auto">
                    <Image
                      alt="mobile pay"
                      srcSet="/images/6247E37C-5C04-415C-9FEA-4877B61C37BF.jpg"
                      src="/images/6247E37C-5C04-415C-9FEA-4877B61C37BF.jpg"
                      width="500"
                      height="400"
                      className="rounded-xl w-full h-auto object-cover mx-auto"
                      loading="lazy"
                      style={{ color: 'transparent' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex flex-col gap-8 lg:w-3/5">
            <div className="flex flex-col flex-grow h-full bg-background-300 border-solid border border-background-200 dark:border-background-600 dark:bg-background-800 rounded-xl px-6 lg:px-10 py-8 pt-12">

              <div className="w-full lg:w-4/5 xl:w-11/12 text-font-900 dark:text-font-100 tracking-wide text-xl lg:text-2xl leading-tight font-light pt-12">
                <span className="font-bold">Shantou,</span>  beef noodle soup.
              </div>
              <div className="pt-8 pb-4 w-full text-base dark:text-font-500 text-font-500 font-light">
                You must go out and explore more, or else you will miss out on many delicious foods.
              </div>
              <div className="flex pt-8 justify-center items-center w-full">
                <div className="w-full h-auto">
                  <Image
                    alt="taobao"
                    srcSet="/images/cai_chichi.JPG"
                    src="/images/cai_chichi.JPG"
                    width="900"
                    height="600"
                    className="rounded-xl w-full h-auto object-cover mx-auto"
                    loading="lazy"
                    style={{ color: 'transparent' }}
                  />
                </div>
              </div>
            </div>
            <div className="flex h-full">
              <div className="flex flex-col flex-grow bg-background-300 border-background-200 border-solid border dark:bg-background-800 dark:border-background-600 rounded-xl px-6 lg:px-10 py-8 pt-12">

                <div className="w-full lg:w-4/5 xl:w-11/12 text-font-900 dark:text-font-100 tracking-wide text-xl lg:text-2xl leading-tight font-light pt-12">
                  <span className="font-bold">Essential for </span>middle-aged people
                </div>
                <div className="pt-8 pb-4 w-full text-base dark:text-font-500 text-font-500 font-light">
                  No hiking, no camping. Can you guess why I bought it?
                </div>
                <div className="flex pt-8 justify-center items-center w-full">
                  <div className="w-full h-auto">
                    <Image
                      alt="wechat"
                      srcSet="/images/top_cai_arc.jpg"
                      src="/images/top_cai_arc.jpg"
                      width="1000"
                      height="700"
                      className="rounded-xl w-full h-auto object-cover mx-auto"
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
    </div>
  );
};

export default Ahometopb;

