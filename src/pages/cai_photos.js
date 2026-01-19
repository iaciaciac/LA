import React from 'react';
import Navbar from './components/Navbar';
import Housea from './components/home_hotel_a/Housea';
import useScrollRestoration from '../hooks/useScrollRestoration';






// Photos Page Component / 照片页面组件 (Actually rendering About content now)
function CaiPhotos() {
  useScrollRestoration();
  return (
    <div>
      <Navbar />
      {/* House Component / 房屋组件 */}
      <Housea />
    </div>
  );
}

export default CaiPhotos;