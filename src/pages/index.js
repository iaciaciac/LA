import React from 'react';
import Navbar from './components/Navbar';
import DarkModeToggle from './components/DarkModeToggle';
import Mylife from './components/About_me/Mylife';
import RunStats from './components/RunStats';

import Mylifed from './components/About_me/Mylifed';
import Mylifec from './components/About_me/Mylifec';






import { client } from '../sanity/lib/client';

function Index({ headline }) {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-500">
      <Navbar />
      <Mylife headline={headline} />
      <RunStats />

      <Mylifec />
    </div>
  );
}

export async function getStaticProps() {
  const settings = await client.fetch(`*[_type == "siteSettings"][0]`);
  return {
    props: {
      headline: settings?.headline || "Work out to look good naked."
    },
    revalidate: 60
  };
}

export default Index;