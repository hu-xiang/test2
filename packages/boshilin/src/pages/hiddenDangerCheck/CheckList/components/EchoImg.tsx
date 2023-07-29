import React, { useEffect, useState, useRef } from 'react';
import styles from '../styles.less';
import { Stage, Layer, Image as KonvaImg } from 'react-konva';
import useImage from 'use-image';

import Rectangle from './CustomRect';
import CustomText from './CustomText';
import CustomCircle from './CustomCircle';
import CustomTriangle from './CustomTriangle';

type Iprops = {
  imgInfo?: any;
  width?: number;
  height?: number;
};

const EdtMod: React.FC<Iprops> = (props) => {
  const { height, width, imgInfo } = props;
  const [sourceImg, setSourceImg] = useState<any>();
  const stageRef = useRef<any>();
  const layerRef = useRef<any>();

  const [rectangles, setRectangles] = useState<any[]>([]); // 矩形
  const [circles, setCircles] = useState<any[]>([]); // 圆形
  const [triangles, setTriangles] = useState<any[]>([]); // 三角形
  const [textContentArr, setTextContentArr] = useState<any[]>([]); // 文本

  // 获取原始图片
  const [bgImage] = useImage(imgInfo?.imgUrl, 'Anonymous');

  const handleEchoGraphic = () => {
    // 回显图形形状和文字
    if (imgInfo && imgInfo.bbox) {
      const imgGraphicInfo = JSON.parse(imgInfo.bbox);
      if (imgGraphicInfo.rect && imgGraphicInfo.rect.length) {
        setRectangles(imgGraphicInfo.rect);
      }
      if (imgGraphicInfo.circle && imgGraphicInfo.circle.length) {
        setCircles(imgGraphicInfo.circle);
      }
      if (imgGraphicInfo.triangle && imgGraphicInfo.triangle.length) {
        setTriangles(imgGraphicInfo.triangle);
      }
      if (imgGraphicInfo.text && imgGraphicInfo.text.length) {
        setTextContentArr(imgGraphicInfo.text);
      }
    }
  };
  useEffect(() => {
    // 回显背景图
    if (bgImage) {
      setSourceImg(bgImage);
      handleEchoGraphic();
    }
  }, [bgImage]);

  return (
    <div className={styles.echoImgWrapper}>
      {/* 相关canvas图层 */}
      <div>
        <Stage ref={stageRef} width={width} height={height}>
          <Layer ref={layerRef}>
            {/* 背景图 */}
            <KonvaImg image={sourceImg} width={width} height={height} />

            {/* 矩形 */}
            {rectangles.map((rect, i) => {
              return <Rectangle key={`rect_${i}`} shapeProps={rect} />;
            })}

            {/* 圆形 */}
            {circles.map((rect, i) => {
              return <CustomCircle key={`circle_${i}`} shapeProps={rect} />;
            })}

            {/* 三角形 */}
            {triangles.map((rect, i) => {
              return <CustomTriangle key={`triangle_${i}`} shapeProps={rect} />;
            })}

            {/* 文本 */}
            {textContentArr.map((text, i) => {
              return <CustomText key={`text_${i}`} shapeProps={text} />;
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default EdtMod;
