import React from 'react';

interface Iprops {
  width?: number;
  height?: number;
  fillColor?: string;
  className?: string;
}
const VSIcon: React.FC<Iprops> = (props) => (
  <svg
    width={props.width || 323}
    height={props.height || 12}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M23.926 0h2.815l-7.037 11.26h-2.815L23.926 0Z" fill="url(#a)" />
    <path d="M32.371 0h2.815l-7.037 11.26h-2.815L32.371 0Z" fill="url(#b)" />
    <path d="M15.482 0h2.815L11.26 11.26H8.445L15.482 0Z" fill="url(#c)" />
    <path d="M7.037 0h2.815L2.815 11.26H0L7.037 0Z" fill="url(#d)" />
    <path d="M33 0h290v3H33V0Z" fill="url(#e)" />
    <defs>
      <linearGradient
        id="a"
        x1={26.741}
        y1={3.519}
        x2={26.741}
        y2={11.259}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3757FF" />
        <stop offset={1} stopColor="#3757FF" stopOpacity={0} />
      </linearGradient>
      <linearGradient
        id="b"
        x1={35.186}
        y1={3.519}
        x2={35.186}
        y2={11.259}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3757FF" />
        <stop offset={1} stopColor="#3757FF" stopOpacity={0} />
      </linearGradient>
      <linearGradient
        id="c"
        x1={18.297}
        y1={3.519}
        x2={18.297}
        y2={11.259}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3757FF" />
        <stop offset={1} stopColor="#3757FF" stopOpacity={0} />
      </linearGradient>
      <linearGradient
        id="d"
        x1={9.852}
        y1={3.519}
        x2={9.852}
        y2={11.259}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3757FF" />
        <stop offset={1} stopColor="#3757FF" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="e" x1={36.968} y1={3} x2={266} y2={3} gradientUnits="userSpaceOnUse">
        <stop stopColor="#3757FF" />
        <stop offset={1} stopColor="#3757FF" stopOpacity={0} />
      </linearGradient>
    </defs>
  </svg>
);

export default VSIcon;
