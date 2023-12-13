import React from 'react';
import Navbar from './components/Navbar';
import DarkModeToggle from './components/DarkModeToggle'; 
import Citywalkc from './components/City_walk/Citywalkc';
import Citywalkaa from './components/City_walk/Citywalkaa';





function Citywalk() {
  return (
    <div>
      <Navbar />
      <DarkModeToggle /> 
      <Citywalkaa/>
      <Citywalkc/>
      

   
    </div>
  );
}

export default Citywalk;