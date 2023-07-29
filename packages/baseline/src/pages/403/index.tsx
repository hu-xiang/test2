import React from 'react';
import ig403 from '../../assets/img/error/403.png';

const NoPermissionPage: React.FC = () => {
  return (
    <div style={{ height: '100%', background: '#fff' }}>
      <div className="containerClass">
        <img src={ig403} alt="" className="imgsty" style={{ height: 420, marginTop: '9%' }} />
      </div>
    </div>
  );
};

export default NoPermissionPage;
