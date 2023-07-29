import React, { useState, useRef, useEffect } from 'react';
import { calcBoundaryCoord } from '../../../../../pages/taskList/CommonDetection/calcVal';
import { drawMosaic } from '../../../../../components/Mosaic/Mosaic';

interface Iprops {
  setImgUrl: (url: string, ind?: number) => void;
  data: any;
  currentTab?: number | string;
}

type point = { X: number; Y: number };

const ImgCanvas: React.FC<Iprops> = (props) => {
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<any>(null);
  const { data, currentTab } = props;
  const fillColors = {
    horizontal_crack: 'rgba(219, 131, 125, .65)',
    vertical_crack: 'rgba(168, 125, 219, .65)',
    strip_patch: 'rgba(125, 203, 219, .35)',
    cracks: 'rgba(236, 222, 151, .65)',
    lumpy_patch: 'rgba(144, 182, 213, .35)',
    other: 'rgba(152, 240, 104, .35)',
  };

  /**
   * 画布上绘制字体
   */
  const drawText = (items: any, ctx: CanvasRenderingContext2D, index: number) => {
    if (!items.bbox) return;
    const boundaryObj = calcBoundaryCoord([{ Points: items.bbox }]);
    const item: any = { ...items, ...boundaryObj };
    let minY = item.minY - 40;
    if (item.minY <= 50) {
      minY = item.minY + 20;
    }
    ctx.beginPath();
    ctx.moveTo(item.minX, minY);
    ctx.fillStyle = 'yellow'; // 设置填充颜色为黄色

    if (naturalWidth > 2048) {
      ctx.font = '46px "微软雅黑"'; // 设置字体
    } else {
      ctx.font = '28px "微软雅黑"'; // 设置字体
    }
    ctx.textBaseline = 'top'; // 设置字体底线对齐绘制基线
    ctx.textAlign = 'left'; // 设置字体对齐的方式
    let text: any = `${item?.diseaseZh}`;
    // const typeLength: any = currentTab === '0' ? [1, 2, 16, 81, 20, 23, 25, 27, 28, 30] : [3, 4];
    // const typeArea: any = currentTab === '0' ? [0, 4, 7, 15, 17, 80, 21, 22, 24, 26, 29, 31] : [];
    const typeLength: any =
      currentTab === '0'
        ? [
            'vertical_crack',
            'horizontal_crack',
            'fanyou',
            'tiaozhuangxiubu',
            'liefeng',
            'cuotai',
            'bianjiaoboluo',
            'jiefengliaosunhuai',
            'jini',
            'sntiaozhuangxiubu',
          ]
        : [3, 4];
    const typeArea: any =
      currentTab === '0'
        ? [
            'kuaizhuangliefeng',
            'others',
            'cracks',
            'chenxian',
            'bolangyongbao',
            'kuaizhuangxiubu',
            'kengdong',
            'mianbanposui',
            'banjiaoduanlie',
            'gongqi',
            'lougu',
            'snkuaizhuangxiubu',
          ]
        : [];
    /* eslint-disable */
    if (
      typeLength?.includes(item.diseaseEn) ||
      (currentTab === '1' && ['标线缺损', '绿化管护不善']?.includes(item.diseaseZh))
    ) {
      if (currentTab === '1' && ['标线缺损', '绿化管护不善']?.includes(item.diseaseZh)) {
        text = `${index + 1} ${item.diseaseZh} ${
          !item.length ? '' : `${Math.round(item.length * 1)}m`
        }`;
      } else {
        text = `${index + 1} ${item.diseaseZh} ${
          !item.length ? '' : `${(item.length * 1).toFixed(4)}m`
        }`;
      }
    } else if (typeArea?.includes(item.diseaseEn)) {
      text = `${index + 1} ${item.diseaseZh} ${
        !item.area ? '' : `${(item.area * 1).toFixed(4)}m²`
      }`;
    } else {
      text = `${index + 1} ${item.diseaseZh}`;
    }
    if (ctx.measureText(text).width + item.minX >= naturalWidth - 10) {
      ctx.fillText(text, naturalWidth - ctx.measureText(text).width, minY);
    } else {
      ctx.fillText(text, item.minX, minY); // 填充文字
    }
  };

  /**
   * 绘制画布上病害区域
   * @param points 坐标值 array
   * @param ctx
   * @param naturalWidthTemp
   * @param naturalHeightTemp
   * @param originalSize 是否源尺寸进行绘制
   */
  const drawContour = (
    points: point[],
    ctx: CanvasRenderingContext2D,
    naturalWidthTemp?: number,
    naturalHeightTemp?: number,
    originalSize: boolean = true,
  ) => {
    const width = naturalWidthTemp || naturalWidth;
    const height = naturalHeightTemp || naturalHeight;
    if (!points) return;
    points.forEach((point: point, index: number) => {
      if (index === 0) {
        ctx.beginPath();
        ctx.moveTo(
          (originalSize ? 1 : 704 / width) * point.X,
          (originalSize ? 1 : 687 / height) * point.Y,
        );
      } else {
        ctx.lineTo(
          (originalSize ? 1 : 704 / width) * point.X,
          (originalSize ? 1 : 687 / height) * point.Y,
        );
      }
    });
    ctx.closePath();
  };

  // 绘制原始图
  const performPresetImg = (img: any) => {
    ctxRef.current!.clearRect(0, 0, naturalWidth, naturalHeight);
    ctxRef.current!.drawImage(img, 0, 0, naturalWidth, naturalHeight);
  };

  // 绘制病害区域框
  const highLightDefect = (dataLs: any, isManual = false) => {
    // console.log('highLightDefect', dataLs);
    if (!dataLs || !dataLs.length) return;
    dataLs.forEach((item: any, index: number) => {
      const copyItem = item;
      // console.log('copyItem',copyItem);
      if (copyItem.contours && typeof copyItem.contours !== 'string') {
        copyItem.contours.forEach((contour: any) => {
          if (copyItem.check) {
            drawContour(contour.Points, ctxRef.current!, naturalWidth, naturalHeight);
            // drawContour(contour.Points, toolCtxRef.current!, naturalWidth, naturalHeight, true);

            if (isManual) {
              ctxRef.current.fillStyle = 'rgba(255, 0, 0, 0.3)';
            } else if (copyItem.diseaseName === 'horizontal_crack') {
              ctxRef.current!.fillStyle = fillColors.horizontal_crack;
            } else if (copyItem.diseaseName === 'vertical_crack') {
              ctxRef.current!.fillStyle = fillColors.vertical_crack;
            } else if (copyItem.diseaseName === 'strip_patch') {
              ctxRef.current!.fillStyle = fillColors.strip_patch;
            } else if (copyItem.diseaseName === 'cracks') {
              ctxRef.current!.fillStyle = fillColors.cracks;
            } else if (copyItem.diseaseName === 'lumpy_patch') {
              ctxRef.current!.fillStyle = fillColors.lumpy_patch;
            } else {
              ctxRef.current.fillStyle = fillColors.other;
            }
            ctxRef.current!.fill();
            // toolCtxRef.current.fillStyle = 'rgba(255, 0, 0, 0.3)';
            // toolCtxRef.current!.fill();
          }
        });
      }
      if (item?.bbox) {
        // const copyItem = item;
        if (typeof item.bbox === 'string') {
          copyItem.bbox = JSON.parse(item.bbox);
        }
        // copyItem.bbox = JSON.parse(item.bbox);
        if (copyItem?.diseaseType === 5 || copyItem?.diseaseType === 6) {
          drawMosaic(copyItem, ctxRef);
        } else {
          drawContour(copyItem.bbox, ctxRef.current!, naturalWidth, naturalHeight);
          ctxRef.current.strokeStyle = 'rgba(255, 255, 0, 1)';
          ctxRef.current.lineWidth = 3;
          ctxRef.current.stroke();
          if (copyItem?.typeName || copyItem?.diseaseZh) drawText(copyItem, ctxRef.current, index);
        }
      }
    });
  };

  useEffect(() => {
    ctxRef.current = canvasRef.current?.getContext('2d');
  }, []);

  useEffect(() => {
    // console.log('监听到data.ls变化', data?.ls?.length);
    if (!data?.ls?.length) return;
    data?.ls.map((item: any, index: any) => {
      const copyItem = item;
      if (item.bbox && typeof item.bbox === 'string') {
        copyItem.bbox = JSON.parse(item.bbox);
      }

      if (copyItem.bbox) {
        const boundaryObj = calcBoundaryCoord([{ Points: copyItem.bbox }]);
        copyItem.minX = boundaryObj.minX;
        copyItem.maxY = boundaryObj.maxY;
        copyItem.minY = boundaryObj.minY;
        copyItem.width = boundaryObj.maxX - boundaryObj.minX;
        copyItem.height = boundaryObj.maxY - boundaryObj.minY;
      }
      return copyItem;
    });
  }, [data?.ls]);

  useEffect(() => {
    if (data.url) {
      const img = new Image();
      img.setAttribute('crossOrigin', 'Anonymous');
      img.onload = () => {
        setNaturalHeight(img.naturalHeight);
        setNaturalWidth(img.naturalWidth);
        // 为兼容丢包图片无法展示的问题
        performPresetImg(img);
        if (naturalHeight && naturalWidth) {
          setTimeout(() => {
            performPresetImg(img);
            highLightDefect(data.ls);
            const dataURL = canvasRef.current!.toDataURL('image/jpeg', 0.3);
            if (dataURL !== 'data:,') {
              props.setImgUrl(dataURL);
            }
          }, 10);
        }
      };
      img.src = data.url;
      return () => {
        img.onload = null;
      };
    }
    return undefined;
  }, [data.id, naturalHeight, naturalWidth]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={naturalWidth}
        height={naturalHeight}
        style={{ display: 'none' }}
      />
    </>
  );
};

export default ImgCanvas;
