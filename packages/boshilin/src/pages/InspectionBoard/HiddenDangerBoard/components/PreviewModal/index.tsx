import React from 'react';
import { Stage, Layer } from 'react-konva';
import { useEffect, useState, useRef } from 'react';
import URLImage from './urlImage';
import { Rect, Circle, Text, RegularPolygon } from 'react-konva';

interface Iprops {
  btnActIndex: number;
  setImgUrl: (url: any) => void;
  imgList: any[];
}

const DrawCanvas: React.FC<Iprops> = (props) => {
  const { btnActIndex, imgList, setImgUrl } = props;
  // const widthRef = useRef<any>(900);
  // const heightRef = useRef<any>(800);
  // 分别是前中后  三个位置的图片信息
  // const imgPosInfo: any = [
  //   {
  //     rect: [],
  //     circle: [],
  //     triangle: [],
  //     text: [],
  //   },
  //   {
  //     rect: [],
  //     circle: [],
  //     triangle: [],
  //     text: [],
  //   },
  //   {
  //     rect: [],
  //     circle: [],
  //     triangle: [],
  //     text: [],
  //   },
  // ];
  const [rectangles, setRectangles] = useState<any[]>([]); // 矩形
  const [circles, setCircles] = useState<any[]>([]); // 圆形
  const [triangles, setTriangles] = useState<any[]>([]); // 三角形
  const [textContentArr, setTextContentArr] = useState<any[]>([]); // 文本
  // const [imgPosArr, setImgPosArr] = useState<any[]>(imgPosInfo);
  const [imgDataUrl, setImgDataUrl] = useState<string>();
  // 显示各位置图片图形信息

  const stageRef = useRef<any>();

  useEffect(() => {
    if (btnActIndex > 0) {
      const arr: any[] = [];
      if (imgList?.length > 0) {
        // console.log('imgList',imgList);
        imgList.forEach((it: any) => {
          arr.push(
            it?.bbox ? JSON.parse(it?.bbox) : { rect: [], circle: [], triangle: [], text: [] },
          );
        });
        // console.log('newarr',arr);
        // setImgPosArr(arr);
        // console.log('imgPosArr', imgPosArr);
      }
      // console.log('ddff',btnActIndex)
      setImgDataUrl(`${imgList[btnActIndex - 1]?.imgUrl}?t=${Math.random()}`);
      const imgPosArrCopy = arr.slice();
      // 获取原始图片
      const { rect, circle, triangle, text } = imgPosArrCopy[btnActIndex - 1];
      setRectangles(rect);
      setCircles(circle);
      setTriangles(triangle);
      setTextContentArr(text);
    }
  }, [btnActIndex, imgList]);

  useEffect(() => {
    if (imgDataUrl) {
      const img = new Image();
      img.setAttribute('crossOrigin', 'Anonymous');
      img.src = imgDataUrl;
      img.onload = () => {
        // 为兼容丢包图片无法展示的问题
        setTimeout(() => {
          if (stageRef!.current) {
            const dataURL = stageRef!.current!.toDataURL({
              mimeType: 'image/jpeg',
              quality: 0.3,
              x: 0,
              y: 0,
              width: img.naturalWidth,
              height: img.naturalHeight,
            });
            setImgUrl(dataURL);
          }
        }, 10);
      };
    }
  }, [imgDataUrl]);

  return (
    <>
      <Stage
        ref={stageRef}
        style={{ display: 'none' }}
        // width={widthRef.current}
        // height={heightRef.current}
      >
        <Layer>
          {/* 背景图 */}
          <URLImage imageOrUrl={`${imgList[btnActIndex - 1]?.imgUrl}?t=${Math.random()}`} />
          {/* 矩形 */}
          {rectangles.map((rect) => {
            return (
              <React.Fragment key={rect?.id}>
                <Rect {...rect} />
              </React.Fragment>
            );
          })}

          {/* 圆形 */}
          {circles.map((rect) => {
            return (
              <React.Fragment key={rect?.id}>
                <Circle {...rect} />
              </React.Fragment>
            );
          })}

          {/* 三角形 */}
          {triangles.map((rect) => {
            return (
              <React.Fragment key={rect?.id}>
                <RegularPolygon {...rect} />
              </React.Fragment>
            );
          })}

          {/* 文本 */}
          {textContentArr.map((text) => {
            return (
              <React.Fragment key={text?.id}>
                <Text {...text} />
              </React.Fragment>
            );
          })}
        </Layer>
      </Stage>
    </>
  );
};

export default DrawCanvas;
