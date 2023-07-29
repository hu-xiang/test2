import useImage from 'use-image';
import { Image } from 'react-konva';
import { useEffect, useState } from 'react';

interface Iprops {
  imageOrUrl: string;
  crossOrigin?: 'anonymous' | 'use-credentials';
}
const URLImage: React.FC<Iprops> = (props) => {
  const { imageOrUrl, crossOrigin = 'anonymous' } = props;
  const [bgImage, setBgImage] = useState<any>();
  const [img] = useImage(`${imageOrUrl}`, crossOrigin);
  useEffect(() => {
    // 获取原始图片
    if (img) {
      setBgImage(img);
    }
  }, [img]);
  return <Image image={bgImage} />;
};
export default URLImage;
