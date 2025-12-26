import React from 'react';
import Navbar from './components/Navbar';
import PhotoGallery from './components/PhotoGallery';
import { client } from '../sanity/lib/client';
import groq from 'groq';

function Photos({ photos }) {
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-500">
      <Navbar />
      <div className="pt-20 pb-10 px-6 md:px-16 lg:px-40 2xl:px-48">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Photos</h1>
        <p className="text-gray-500 dark:text-gray-400 font-light text-lg">
          Captured moments and visual stories.
        </p>
      </div>
      <PhotoGallery photos={photos} />
    </div>
  );
}

export async function getStaticProps() {
  const photos = await client.fetch(groq`
    *[_type == "photo"] | order(_createdAt desc)
  `);

  return {
    props: {
      photos
    },
    revalidate: 60
  };
}

export default Photos;
