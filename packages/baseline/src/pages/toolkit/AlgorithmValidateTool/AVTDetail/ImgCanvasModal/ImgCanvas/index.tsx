import React, { useState, useRef, useEffect } from 'react';
// import { calcBoundaryCoord } from '../../../../../../pages/TaskList/calcVal';
import { calcBoundaryCoord } from '../../../../../taskList/CommonDetection/calcVal';
import { drawMosaic } from '../../../../../../components/Mosaic/Mosaic';

interface Iprops {
  setImgUrl: (url: string, ind?: number) => void;
  data: any;
  radioType?: number | string;
}

type point = { X: number; Y: number };

const ImgCanvas: React.FC<Iprops> = (props) => {
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<any>(null);
  const { data } = props;

  /**
   * 画布上绘制字体
   */
  const drawText = (items: any, ctx: CanvasRenderingContext2D, type: number) => {
    if (!items.bbox) return;
    const boundaryObj = calcBoundaryCoord([{ Points: items.bbox }]);
    const item: any = { ...items, ...boundaryObj };
    let minY = item.minY - 40;
    if (item.minY <= 50) {
      minY = item.minY + 20;
    }
    ctx.beginPath();
    ctx.moveTo(item.minX, minY);
    ctx.fillStyle = type === 1 ? '#05FF00' : '#FF0000'; // 设置填充颜色

    if (naturalWidth > 2048) {
      ctx.font = '46px "微软雅黑"'; // 设置字体
    } else {
      ctx.font = '28px "微软雅黑"'; // 设置字体
    }
    ctx.textBaseline = 'top'; // 设置字体底线对齐绘制基线
    ctx.textAlign = 'left'; // 设置字体对齐的方式
    const text: any = `${item?.diseaseNameCN}`;

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

  /**
   * 画布上绘制虚线
   */
  const drawLine = (ctx: CanvasRenderingContext2D, identifyRange: any, imageHeight: any) => {
    const y = naturalHeight - (naturalHeight / imageHeight) * identifyRange;
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#FFF500';
    ctx.beginPath();
    ctx.setLineDash([20, 15]);
    ctx.moveTo(0, y);
    ctx.lineTo(naturalWidth, y);
    ctx.stroke();
  };

  // 绘制原始图
  const performPresetImg = (img: any) => {
    ctxRef.current!.clearRect(0, 0, naturalWidth, naturalHeight);
    ctxRef.current!.drawImage(img, 0, 0, naturalWidth, naturalHeight);
  };

  // 绘制病害区域框
  const highLightDefect = (dataLs: any, type: number) => {
    if (!dataLs || !dataLs.length) return;
    dataLs.forEach((item: any) => {
      const copyItem = item;
      if (item?.bbox) {
        if (typeof item?.bbox === 'string' && item?.bbox) {
          copyItem.bbox = JSON.parse(item?.bbox);
        }
        if (copyItem?.diseaseType === 5 || copyItem?.diseaseType === 6) {
          drawMosaic(copyItem, ctxRef);
        } else {
          drawContour(copyItem.bbox, ctxRef.current!, naturalWidth, naturalHeight);
          ctxRef.current.strokeStyle = type === 1 ? '#05FF00' : '#FF0000';
          ctxRef.current.lineWidth = 3;
          ctxRef.current.setLineDash([]);
          ctxRef.current.stroke();
          drawText(copyItem, ctxRef.current, type);
        }
      }
    });
  };

  useEffect(() => {
    ctxRef.current = canvasRef.current?.getContext('2d');
  }, []);

  useEffect(() => {
    // console.log('监听到data.list变化', data?.list?.length);
    if (!data?.labelBbox?.length && !data?.bbox) return;
    data?.labelBbox.map((item: any) => {
      const copyItem = item;
      if (typeof item.bbox === 'string' && item.bbox) {
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

    const detBboxItem: any = {
      bbox: data?.bbox,
    };
    if (typeof data?.bbox === 'string' && data?.bbox) {
      detBboxItem.bbox = JSON.parse(data.bbox);
    }

    if (detBboxItem.bbox) {
      const boundaryObj = calcBoundaryCoord([{ Points: detBboxItem.bbox }]);
      detBboxItem.minX = boundaryObj.minX;
      detBboxItem.maxY = boundaryObj.maxY;
      detBboxItem.minY = boundaryObj.minY;
      detBboxItem.width = boundaryObj.maxX - boundaryObj.minX;
      detBboxItem.height = boundaryObj.maxY - boundaryObj.minY;
      detBboxItem.diseaseNameCN = data?.diseaseNameCN;
    }
    data.detBbox = [{ ...detBboxItem }];
  }, [data?.labelBbox]);

  useEffect(() => {
    if (data.imgUrl) {
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
            if (data?.identifyRange && props?.radioType !== '3') {
              drawLine(ctxRef.current, data?.identifyRange, data?.imageHeight);
            }
            if (props?.radioType === '0') {
              highLightDefect(data.detBbox, 1);
              highLightDefect(data.labelBbox, 2);
            } else if (props?.radioType === '1') {
              highLightDefect(data.detBbox, 1);
            } else if (props?.radioType === '2') {
              highLightDefect(data.labelBbox, 2);
            }
            const dataURL = canvasRef.current!.toDataURL('image/jpeg', 0.3);
            if (dataURL !== 'data:,') {
              props.setImgUrl(dataURL);
            }
          }, 10);
        }
      };
      img.src = data.imgUrl;
      return () => {
        img.onload = null;
      };
    }
    return undefined;
  }, [naturalHeight, naturalWidth, data?.verifyDiseaseId, props?.radioType, data?.imgId]);

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
