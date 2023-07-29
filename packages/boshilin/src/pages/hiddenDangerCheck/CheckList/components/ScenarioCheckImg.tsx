import React, { useEffect, useState, useRef } from 'react';
import { Image } from 'antd';
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

  const fallback = 'images/placeholder.svg';

  // 获取原始图片
  const [bgImage] = useImage(imgInfo?.imgUrl, 'anonymous');

  const [resImg, setResImg] = useState<any>();

  const handleReturnImgUrl = () => {
    // const url = stageRef.current?.toDataURL();

    const ret = imgInfo.imgBaseUrl || imgInfo.imgUrl;
    setResImg(ret);
  };

  const handleResetSizeInfo = (bboxInfo: any, sourceWidth: number, sourceHeight: number) => {
    // 替换新的scaleRatio
    const scaleRatio = {
      w: sourceWidth / (width || 420),
      h: sourceHeight / (height || 240),
    };
    bboxInfo.scaleRatio = scaleRatio;
    if (bboxInfo.rect.length) {
      bboxInfo.rect.forEach((val: any) => {
        val.x = Math.floor(val.x / bboxInfo.scaleRatio.w);
        val.y = Math.floor(val.y / bboxInfo.scaleRatio.h);
        val.width = Math.floor(val.width / bboxInfo.scaleRatio.w);
        val.height = Math.floor(val.height / bboxInfo.scaleRatio.h);
      });
    }
    if (bboxInfo.circle.length) {
      bboxInfo.circle.forEach((val: any) => {
        val.x = Math.floor(val.x / bboxInfo.scaleRatio.w);
        val.y = Math.floor(val.y / bboxInfo.scaleRatio.h);
        const biggerRatio = Math.max(bboxInfo.scaleRatio.h, bboxInfo.scaleRatio.w);
        val.radius = Math.floor(val.radius / biggerRatio);
      });
    }
    if (bboxInfo.triangle.length) {
      bboxInfo.triangle.forEach((val: any) => {
        val.x = Math.floor(val.x / bboxInfo.scaleRatio.w);
        val.y = Math.floor(val.y / bboxInfo.scaleRatio.h);
        val.width = Math.floor(val.width / bboxInfo.scaleRatio.w);
        val.radius = Math.floor(val.radius / bboxInfo.scaleRatio.w);
        val.height = Math.floor(val.height / bboxInfo.scaleRatio.h);
      });
    }
    if (bboxInfo.text.length) {
      bboxInfo.text.forEach((val: any) => {
        val.x = Math.floor(val.x / bboxInfo.scaleRatio.w);
        val.y = Math.floor(val.y / bboxInfo.scaleRatio.h);
        val.width = Math.floor(val.width / bboxInfo.scaleRatio.w);
        val.height = Math.floor(val.height / bboxInfo.scaleRatio.h);
        val.fontSize = Math.floor(val.fontSize / bboxInfo.scaleRatio.w);
      });
    }
    return bboxInfo;
  };

  const handleEchoGraphic = (sourceWidth: number, sourceHeight: number) => {
    // 回显图形形状和文字
    if (imgInfo && imgInfo.bbox) {
      const bboxInfo = JSON.parse(imgInfo.bbox);

      let imgGraphicInfo = bboxInfo;
      if (imgInfo.bbox.indexOf('scaleRatio') > -1) {
        imgGraphicInfo = handleResetSizeInfo(bboxInfo, sourceWidth, sourceHeight);
      }

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
    } else {
      setRectangles([]);
      setCircles([]);
      setTriangles([]);
      setTextContentArr([]);
    }
  };
  useEffect(() => {
    // 回显背景图
    if (bgImage) {
      setSourceImg(bgImage);
      handleEchoGraphic(bgImage?.naturalWidth, bgImage?.naturalHeight);

      setTimeout(() => {
        handleReturnImgUrl();
      }, 0);
    }
  }, [bgImage]);

  return (
    <div className={styles.echoImgWrapper}>
      {/* 相关canvas图层 */}
      <div className={styles.hiddenCanvas} style={{ display: 'none' }}>
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
      <div style={{ width: '100%' }}>
        <Image
          height={height || '100%'}
          width={'100%'}
          src={resImg}
          preview={false}
          placeholder={true}
          fallback={fallback}
        ></Image>
      </div>
    </div>
  );
};

export default EdtMod;
