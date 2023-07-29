import { Tooltip } from 'antd';
import { useState } from 'react';
import React from 'react';

type Iprops = {
  children: any;
  title: string;
  customEclipseClass?: string;
};
const EllipsisTooltip: React.FC<Iprops> = (props) => {
  //   const ref = useRef<any>();
  const [visible, setVisible] = useState<boolean>(false);
  const [container, setContainer] = useState<any>();
  const handleVisibleChange = (e: any) => {
    if (container.clientWidth < container.scrollWidth) {
      setVisible(e);
    }
  };

  return (
    <Tooltip open={visible} onOpenChange={handleVisibleChange} title={props.title}>
      <div
        ref={(node) => {
          setContainer(node);
        }}
        style={{
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
        className={props.customEclipseClass}
      >
        {props.children}
      </div>
    </Tooltip>
  );
};

export default EllipsisTooltip;
