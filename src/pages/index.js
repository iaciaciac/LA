import React from 'react';
import Navbar from './components/Navbar';
import DarkModeToggle from './components/DarkModeToggle'; 
import Mylife from './components/About_me/Mylife';

import Mylifed from './components/About_me/Mylifed';
import Mylifec from './components/About_me/Mylifec';






function Index() {
  return (
    <div>
      <Navbar />
      <DarkModeToggle /> 
      <Mylife />
      
      <Mylifec />
   
    </div>
  );
}

export default Index;