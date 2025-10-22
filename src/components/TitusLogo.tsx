import React from 'react';

const TitusLogo: React.FC<{ size?: number }> = ({ size = 24 }) => {
  return <img src={process.env.PUBLIC_URL + '/TitusLogo.png'} alt="Titus Logo" style={{ width: `${size}px`, height: `${size}px` }} />;
};

export default TitusLogo;
