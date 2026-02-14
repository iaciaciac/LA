import React from 'react';
import Navbar from '../components/Navbar';
import { client } from '../sanity/lib/client';
import { groq } from 'next-sanity';
import { PortableText } from '@portabletext/react';
import imageUrlBuilder from '@sanity/image-url';
import localFont from 'next/font/local';

// URL builder for inline images
const builder = imageUrlBuilder(client);
function urlFor(source) {
  return builder.image(source);
}

// Portable Text Components definition
const components = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) {
        return null;
      }
      return (
        <img
          alt={value.alt || ' '}
          loading="lazy"
          src={urlFor(value).width(800).fit('max').auto('format').url()}
          className="rounded-lg my-8 mx-auto"
        />
      );
    }
  }
};

// Manually configure Geist Mono from local file to avoid ESM loader errors
const geistMono = localFont({
  src: '../../public/fonts/GeistMono.woff2',
  variable: '--font-geist-mono',
});

// Blog Page Component (Refactored from Housea/Photos)
function CaiPhotos({ posts }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-mono">
        <Navbar />
        <div className="pt-32 px-6 text-center text-sm">
          No posts found. Go to Sanity Studio to write your first post!
        </div>
      </div>
    );
  }

  return (
    <div className={`${geistMono.className} min-h-screen bg-white dark:bg-black text-black dark:text-[#D7D7DB] transition-colors duration-500 text-[14px] leading-[21px]`}>
      <Navbar />

      <main className="pt-32 pb-20 px-6 md:px-16 max-w-3xl mx-auto flex flex-col gap-6">
        {posts.map((post) => {
          // Mapping 'post' schema to UI
          return (
            <article key={post._id} className="flex flex-col gap-4 border-b border-gray-100 dark:border-zinc-800 pb-12 last:border-0">
              {/* Optional Main Image (Cover) - Only show if it exists. User complained about size, so constrained max-height */}
              {post.mainImage?.asset?.url && (
                <img
                  src={post.mainImage.asset.url}
                  alt={post.title || 'Blog Post Image'}
                  className="w-full h-auto rounded-lg mb-6 object-cover max-h-[500px]"
                />
              )}

              {post.title && (
                <h2 className="text-sm font-normal tracking-widest mb-4 uppercase">{post.title}</h2>
              )}

              {post.publishedAt && (
                <div className="text-xs text-gray-400 font-light mb-2">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              )}

              {/* Render Portable Text (supports multiple images, bold, links, etc.) */}
              {post.body && (
                <div className="prose dark:prose-invert prose-sm max-w-none prose-p:leading-[21px] prose-p:mb-0 prose-headings:text-sm prose-headings:font-normal prose-a:text-blue-500 prose-img:rounded-lg font-mono">
                  <PortableText value={post.body} components={components} />
                </div>
              )}
            </article>
          )
        })}
      </main>
    </div>
  );
}

export const getStaticProps = async () => {
  const query = groq`*[_type == "post"] | order(publishedAt desc) {
    _id,
    title,
    publishedAt,
    body,
    mainImage {
      asset->{
        _id,
        url,
        metadata {
          dimensions {
            width,
            height,
            aspectRatio
          }
        }
      }
    }
  }`;

  const posts = await client.fetch(query);

  return {
    props: {
      posts: posts || []
    },
    revalidate: 1,
  };
};

export default CaiPhotos;