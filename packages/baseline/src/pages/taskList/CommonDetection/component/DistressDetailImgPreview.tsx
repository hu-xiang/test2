import { Image } from 'antd';
import React from 'react';

type Iprops = {
  url: string;
  visible: boolean;
  setVisible: any;
};
const PreviewImg: React.FC<Iprops> = (props) => {
  return (
    <Image
      src={props.url}
      width={900}
      placeholder={true}
      preview={{
        visible: props.visible,
        onVisibleChange: (value) => {
          props.setVisible(value);
        },
      }}
      onError={(err) => {
        if (!props.url) return;
        props.setVisible(false);
        console.log(err);
      }}
    />
  );
};

export default PreviewImg;
