import React from 'react';

interface Iprops {
  width?: number;
  height?: number;
  fillColor?: string;
}
const RectIcon: React.FC<Iprops> = (props) => (
  <svg
    width={props.width || 11}
    height={props.height || 11}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fill="#3758FF"
      stroke="#fff"
      strokeOpacity={0.6}
      d="m1 5.5 4.243-4.243L9.485 5.5 5.243 9.743z"
    />
  </svg>
);

export default RectIcon;
