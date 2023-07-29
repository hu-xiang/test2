import React from 'react';
import ig404 from '../assets/img/error/404.jpg';

const NoFoundPage: React.FC = () => {
  return (
    <div style={{ height: '100%', background: '#fff' }}>
      <div className="containerClass">
        <img src={ig404} alt="" className="imgsty" style={{ height: 420, marginTop: '9%' }} />
      </div>
    </div>
  );
};

export default NoFoundPage;
