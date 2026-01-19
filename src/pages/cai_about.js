import React from 'react';
import Navbar from './components/Navbar';
import Citywalkc from './components/City_walk/Citywalkc';
import Housea from './components/home_hotel_a/Housea';

import useScrollRestoration from '../hooks/useScrollRestoration';





// About Page Component / 关于页面组件 (Actually rendering Photos content now)
function CaiAbout() {
  useScrollRestoration();
  return (
    <div>
      <Navbar />
      {/* House Component / 房屋组件 */}
      <Housea />
      {/* Additional Content Component / 附加内容组件 */}
      <Citywalkc />
    </div>
  );
}

export default CaiAbout;