import React from 'react';
import Navbar from '../components/Navbar';

import DarkModeToggle from '../components/DarkModeToggle';
import Mylife from '../components/About_me/Mylife';
// import RunStats from '../components/RunStats';

import Mylifed from '../components/About_me/Mylifed';
import Mylifec from '../components/About_me/Mylifec';
import AIVibeHub from '../components/AIVibeHub';






import { client } from '../sanity/lib/client';


function Index({ headline }) {

  return (
    <div className="min-h-screen bg-white dark:bg-black bg-[radial-gradient(rgba(0,0,0,0.08)_5%,transparent_5%)] dark:bg-[radial-gradient(rgba(255,255,255,.18)_5%,transparent_5%)] bg-[position:0%_0%] bg-[length:25px_25px] transition-colors duration-500">
      <Navbar />

      <Mylife headline={headline} />
      <AIVibeHub />
      {/* <RunStats /> */}

      <Mylifec />
    </div>
  );
}

export async function getStaticProps() {
  const settings = await client.fetch(`*[_type == "siteSettings"][0]`);
  // const settings = { headline: "Debug Headline" };
  return {
    props: {
      headline: settings?.headline || "Work out to look good naked."
    },
    revalidate: 60
  };
}

export default Index;