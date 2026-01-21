import React from 'react';
import ScrollAnimation from '../ScrollAnimation';

const Citywalk = ({ introImage, projectImage }) => {
  const introSrc = introImage || "/images/look_photos_.jpg";
  const projectSrc = projectImage || "/images/IMG_1802_Original.JPG";

  return (
    <div>
      <div className="block">
        <div className="lg:flex gap-8" style={{ marginLeft: '24px', marginRight: '24px' }}>
          <div className="flex flex-col lg:w-2/5">
            <ScrollAnimation>
              <div className="flex flex-col flex-grow h-full bg-background-300 border-solid border border-background-200 dark:bg-gray-100 dark:bg-background-800 rounded-xl px-6 lg:px-10 py-8 pt-12">
                <img
                  alt="antcloud"
                  src="/images/image_book-2.png"
                  width="44"
                  height="44"
                  className="block dark:hidden"
                />
                <img
                  alt="antcloud"
                  src="/images/image_book-2.png"
                  width="44"
                  height="44"
                  className="hidden dark:block"
                />
                <div className="w-full lg:w-4/5 xl:w-11/12 dark:text-gray-900 text-font-500 tracking-wide text-xl lg:text-2xl leading-tight font-light pt-12">
                  <span className="font-bold">He</span>y
                </div>
                <div className="pt-4 pb-2 w-full text-base dark:text-gray-500 text-font-500 font-light">
                  That's right, I am Cai Cai.
                </div>

                <div className="flex pt-8 justify-center items-center w-full">
                  <div className="w-full h-auto">
                    <img
                      alt="twitter"
                      src={introSrc}
                      width="500"
                      height="400"
                      className="rounded-xl w-full h-auto object-cover mx-auto"
                    />
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
          <div className="hidden lg:flex flex-col gap-8 lg:w-3/5 lg:flex gap-20">
            <ScrollAnimation index={1}>
              <div className="flex flex-col flex-grow h-full bg-background-300 border-solid border border-background-200 dark:bg-gray-100 rounded-xl px-6 lg:px-10 py-8 pt-12">
                <a href="https://caicaicai.me">
                  <img
                    alt="look"
                    src="/images/Instagram_Glyph_Black.png"
                    width="22"
                    height="22"
                    className="block dark:hidden"
                  />
                </a>
                <a href="https://caiaicai.me">
                  <img
                    alt="look"
                    src="/images/Instagram_Glyph_Black.png"
                    width="22"
                    height="22"
                    className="hidden dark:block"
                  />
                </a>






                <div className="w-full lg:w-4/5 xl:w-11/12 text-font-900 dark:text-font-200 tracking-wide text-xl lg:text-2xl leading-tight font-light pt-12">
                  <span className="font-bold">Unknown project</span> This is just a new attempt!
                </div>
                <div className="pt-8 pb-4 w-full text-base dark:text-gray-500 text-font-500 font-light">
                  Perhaps, this is a bridge of communication.
                </div>
                <div className="flex pt-8 justify-center items-center w-full">
                  <div className="w-full h-auto">
                    <img
                      alt="toome"
                      src={projectSrc}
                      width="900"
                      height="600"
                      className="rounded-xl w-full h-auto object-cover mx-auto"
                    />
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Citywalk;