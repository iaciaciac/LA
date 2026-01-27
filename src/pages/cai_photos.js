import React from 'react';
import Navbar from './components/Navbar';
import ScrollAnimation from './components/ScrollAnimation';

import { client } from '../sanity/lib/client';
import { groq } from 'next-sanity';

import HeroText from './components/HeroText';

// About Page Component (Dynamic CMS)
function CaiAbout({ pageData }) {


  // If no content, show fallback or nothing
  if (!pageData || !pageData.contentBlocks) {
    return (
      <div>
        <Navbar />
        <div className="pt-32 px-6 text-center text-gray-500 font-light">
          Content not found. Please create "About Page" in Sanity Studio.
        </div>
      </div>
    );
  }

  // Reverse the blocks so the newest (last in array) show first
  const reversedBlocks = [...(pageData.contentBlocks || [])].reverse();

  return (
    <div className="relative min-h-screen bg-white dark:bg-black transition-colors duration-500">
      <div className="absolute top-0 left-0 w-full h-[650px] bg-[radial-gradient(rgba(0,0,0,0.08)_5%,transparent_5%)] dark:bg-[radial-gradient(rgba(255,255,255,.18)_5%,transparent_5%)] bg-[position:0%_0%] bg-[length:25px_25px] pointer-events-none z-0"></div>
      <HeroText />
      <Navbar />
      <div className="block pt-[600px]">
        <div className="flex flex-col lg:flex-row lg:flex-wrap gap-8 items-start" style={{ marginLeft: '24px', marginRight: '24px' }}>

          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-8">
            {reversedBlocks.filter((_, i) => i % 2 === 0).map((block, index) => {
              if (block._type === 'introBlock') {
                return (
                  <div key={block._key} className="flex flex-col">
                    <ScrollAnimation>
                      <div className="flex flex-col bg-background-300 border-solid border border-background-200 dark:bg-gray-100 dark:bg-background-800 rounded-xl px-6 lg:px-10 py-8 pt-12">
                        {block.icon?.asset?.url && (
                          <img alt="icon" src={block.icon.asset.url} width="44" height="44" className="block" />
                        )}
                        <div className="dark:text-gray-900 text-font-500 tracking-wide text-xl lg:text-2xl leading-tight font-light pt-12">
                          <span className="font-bold">{block.heading}</span>
                        </div>
                        <div className="pt-4 pb-2 text-base dark:text-gray-500 text-font-500 font-light">
                          {block.subheading}
                        </div>
                        {block.image?.asset?.url && (
                          <img alt="intro" src={block.image.asset.url} className="rounded-xl w-auto h-auto max-w-full mx-auto mt-8" />
                        )}
                      </div>
                    </ScrollAnimation>
                  </div>
                );
              }
              if (block._type === 'projectBlock') {
                return (
                  <div key={block._key} className="flex flex-col">
                    <ScrollAnimation index={index}>
                      <div className="flex flex-col bg-background-300 border-solid border border-background-200 dark:bg-gray-100 rounded-xl px-6 lg:px-10 py-8 pt-12">
                        {block.linkUrl && (
                          <a href={block.linkUrl} target="_blank" rel="noopener noreferrer">
                            <img alt="link" src="/images/Instagram_Glyph_Black.png" width="22" height="22" className="block opacity-80 hover:opacity-100 transition-opacity" />
                          </a>
                        )}
                        <div className="text-font-900 dark:text-font-200 tracking-wide text-xl lg:text-2xl leading-tight font-light pt-12">
                          <span className="font-bold">{block.title}</span> {block.description}
                        </div>
                        <div className="pt-8 pb-4 text-base dark:text-gray-500 text-font-500 font-light">
                          {block.subtext}
                        </div>
                        {block.image?.asset?.url && (
                          <img alt="project" src={block.image.asset.url} className="rounded-xl w-auto h-auto max-w-full mx-auto mt-8" />
                        )}
                      </div>
                    </ScrollAnimation>
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* Right Column */}
          <div className="flex-1 flex flex-col gap-8">
            {reversedBlocks.filter((_, i) => i % 2 !== 0).map((block, index) => {
              if (block._type === 'introBlock') {
                return (
                  <div key={block._key} className="flex flex-col">
                    <ScrollAnimation>
                      <div className="flex flex-col bg-background-300 border-solid border border-background-200 dark:bg-gray-100 dark:bg-background-800 rounded-xl px-6 lg:px-10 py-8 pt-12">
                        {block.icon?.asset?.url && (
                          <img alt="icon" src={block.icon.asset.url} width="44" height="44" className="block" />
                        )}
                        <div className="dark:text-gray-900 text-font-500 tracking-wide text-xl lg:text-2xl leading-tight font-light pt-12">
                          <span className="font-bold">{block.heading}</span>
                        </div>
                        <div className="pt-4 pb-2 text-base dark:text-gray-500 text-font-500 font-light">
                          {block.subheading}
                        </div>
                        {block.image?.asset?.url && (
                          <img alt="intro" src={block.image.asset.url} className="rounded-xl w-auto h-auto max-w-full mx-auto mt-8" />
                        )}
                      </div>
                    </ScrollAnimation>
                  </div>
                );
              }
              if (block._type === 'projectBlock') {
                return (
                  <div key={block._key} className="flex flex-col">
                    <ScrollAnimation index={index}>
                      <div className="flex flex-col bg-background-300 border-solid border border-background-200 dark:bg-gray-100 rounded-xl px-6 lg:px-10 py-8 pt-12">
                        {block.linkUrl && (
                          <a href={block.linkUrl} target="_blank" rel="noopener noreferrer">
                            <img alt="link" src="/images/Instagram_Glyph_Black.png" width="22" height="22" className="block opacity-80 hover:opacity-100 transition-opacity" />
                          </a>
                        )}
                        <div className="text-font-900 dark:text-font-200 tracking-wide text-xl lg:text-2xl leading-tight font-light pt-12">
                          <span className="font-bold">{block.title}</span> {block.description}
                        </div>
                        <div className="pt-8 pb-4 text-base dark:text-gray-500 text-font-500 font-light">
                          {block.subtext}
                        </div>
                        {block.image?.asset?.url && (
                          <img alt="project" src={block.image.asset.url} className="rounded-xl w-auto h-auto max-w-full mx-auto mt-8" />
                        )}
                      </div>
                    </ScrollAnimation>
                  </div>
                );
              }
              return null;
            })}
          </div>

        </div>
      </div>
    </div>
  );
}

// Fetch Singleton Page Data
export const getStaticProps = async () => {
  const query = groq`*[_type == "aboutPage"][0] {
    title,
    contentBlocks[] {
      ...,
      _type,
      _key,
      icon {
        asset->{ url }
      },
      image {
        asset->{
          url,
          metadata {
            dimensions {
              aspectRatio
            }
          }
        }
      }
    }
  }`;

  const pageData = await client.fetch(query);

  return {
    props: {
      pageData: pageData || null
    },
    revalidate: 1,
  };
};

export default CaiAbout;