import React from 'react';
import Navbar from './components/Navbar';
import Housea from './components/home_hotel_a/Housea';







// Photos Page Component / 照片页面组件 (Actually rendering About content now)
function CaiPhotos() {

  return (
    <div>
      <Navbar />
      {/* House Component / 房屋组件 */}
      <Housea />
    </div>
  );
}

export default CaiPhotos;