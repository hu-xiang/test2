import * as React from 'react';

const SvgComponent = (props: any) => (
  <svg width={14} height={14} fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M3.5 4.375v7.875h7V4.375h.875v7.875c0 .525-.35.875-.875.875h-7c-.525 0-.875-.35-.875-.875V4.375H3.5Zm2.625.875v5.25H5.25V5.25h.875Zm2.625 0v5.25h-.875V5.25h.875Zm0-4.375c.525 0 .875.35.875.875v.875h2.625V3.5H1.75v-.875h2.625V1.75c0-.525.35-.875.875-.875h3.5Zm.088.875H5.25v.875h3.588V1.75Z"
      fill="#F45A5A"
    />
  </svg>
);

export default SvgComponent;
