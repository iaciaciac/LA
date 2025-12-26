import React from 'react';
import Navbar from './components/Navbar';
import DarkModeToggle from './components/DarkModeToggle';
import Mylife from './components/About_me/Mylife';
import RunStats from './components/RunStats';

import Mylifed from './components/About_me/Mylifed';
import Mylifec from './components/About_me/Mylifec';






function Index() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-500">
      <Navbar />
      <Mylife />
      <RunStats />

      <Mylifec />
    </div>
  );
}

export default Index;