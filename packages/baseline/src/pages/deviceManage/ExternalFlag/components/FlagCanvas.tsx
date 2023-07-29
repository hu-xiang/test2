import React, { useState, useRef, useEffect, useImperativeHandle } from 'react';

interface Iprops {
  setImgUrl?: (url: string, ind?: number) => void;
  data: any;
  canvasWidth?: string;
  canvasHeight?: string;
  onRef?: any;
}

const FlagCanvas: React.FC<Iprops> = (props) => {
  const [naturalWidth, setNaturalWidth] = useState(0);
  const [naturalHeight, setNaturalHeight] = useState(0);
  const [wheelWidth, setWheelWidth] = useState(0);
  const [wheelHeight, setWheelHeight] = useState(0);
  const [addIconList, setAddIconList] = useState<any>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<any>(null);
  const { data } = props;

  // 绘制原始图
  const performPresetImg = (img: any) => {
    ctxRef.current!.clearRect(
      0,
      0,
      wheelWidth > naturalWidth ? wheelWidth : naturalWidth,
      wheelHeight > naturalHeight ? wheelHeight : naturalHeight,
    );
    ctxRef.current!.drawImage(
      img,
      0,
      0,
      wheelWidth > naturalWidth ? wheelWidth : naturalWidth,
      wheelHeight > naturalHeight ? wheelHeight : naturalHeight,
    );
  };

  const drawAdd = (offsetX: number, offsetY: number, width: number = 0, height: number = 0) => {
    const ctx = ctxRef.current;
    const x = (wheelWidth / (width || ctx.canvas.clientWidth)) * offsetX;
    const y = (wheelHeight / (height || ctx.canvas.clientHeight)) * offsetY;
    const addIcon = [
      { x, y: y - 7 },
      { x, y: y + 7 },
      { x: x - 7, y },
      { x: x + 7, y },
    ];
    addIcon.forEach((item: any) => {
      ctxRef.current.beginPath();
      ctxRef.current.moveTo(x, y);

      ctxRef.current.lineTo(item.x, item.y);

      ctxRef.current.lineWidth = 1;

      ctxRef.current.strokeStyle = 'red';

      ctxRef.current.stroke();
      ctxRef.current.closePath();
    });
  };

  const imgClick = (e: any) => {
    const ctx = ctxRef.current;

    // todo 记录点击时的画布大小 后期换算坐标
    drawAdd(
      e?.nativeEvent?.offsetX,
      e?.nativeEvent?.offsetY,
      e?.target?.clientWidth,
      e?.target?.clientHeight,
    );
    const list = addIconList;
    list.push({
      x: e?.nativeEvent?.offsetX,
      y: e?.nativeEvent?.offsetY,
      curCanvasW: ctx.canvas.clientWidth,
      curCanvasH: ctx.canvas.clientHeight,
    });
    setAddIconList(list);
  };

  useEffect(() => {
    ctxRef.current = canvasRef.current?.getContext('2d');
  }, []);

  const handleRenderImg = (img: any, todo?: String) => {
    img.setAttribute('crossOrigin', 'Anonymous');
    img.onload = () => {
      setNaturalHeight(img.naturalHeight);
      setNaturalWidth(img.naturalWidth);
      if (!wheelWidth || !wheelHeight) {
        setWheelHeight(img.naturalHeight);
        setWheelWidth(img.naturalWidth);
      }
      // 为兼容丢包图片无法展示的问题
      performPresetImg(img);
      if (naturalHeight && naturalWidth) {
        setTimeout(() => {
          performPresetImg(img);
          if (todo !== 'clear' && addIconList?.length) {
            addIconList?.forEach((item: any) => {
              drawAdd(item?.x, item?.y);
            });
          }
          const dataURL = canvasRef.current!.toDataURL('image/jpeg', 0.3);
          if (dataURL !== 'data:,') {
            // props.setImgUrl(dataURL);
          }
        }, 10);
      }
    };
    img.src = data.imgUrl;
  };
  const clearCanvas = () => {
    const img: any = new Image();
    setAddIconList([]);
    handleRenderImg(img, 'clear');
  };

  const handleTest = (area: any, markWidth: any, markHeight: any) => {
    const areaVal = area.toFixed(2);
    const markArea: any = ((markWidth / 1000) * (markHeight / 1000)).toFixed(2);
    // 误差
    const divide = Math.abs(areaVal - markArea) / markArea;
    const errRatio = `${+(divide * 100).toFixed(0)}%`;

    // 计算缩放比例
    const ctx = ctxRef.current;
    const ratio = {
      w: wheelWidth / ctx.canvas.clientWidth,
      h: wheelHeight / ctx.canvas.clientHeight,
    };

    // 转化下点击处坐标
    const retPosList: any = [];
    addIconList.forEach((item: any) => {
      if (item.curCanvasW !== ctx.canvas.clientWidth) {
        item.x = (item.x * (ctx.canvas.clientWidth / item.curCanvasW)).toFixed(0);
      }
      if (item.curCanvasH !== ctx.canvas.clientHeight) {
        item.y = (item.y * (ctx.canvas.clientHeight / item.curCanvasH)).toFixed(0);
      }
      retPosList.push({ x: +item.x, y: +item.y });
    });
    // 画白色背景和文字
    retPosList.forEach((item: any) => {
      ctx.font = `${14 * ratio.w}px "PingFang SC"`; // 设置字体
      const text = ctx.measureText(`(${item.x}, ${item.y})`);
      // 判断是否在边界
      let posX = item.x + 5; // 偏移
      let posY = item.y;
      const rectW = text.width;
      const recth = 30;
      if (item.x + text.width / ratio.w > ctx.canvas.clientWidth) {
        posX = ctx.canvas.clientWidth - text.width / ratio.w - 20;
      }
      if (item.y + ratio.h * 14 > ctx.canvas.clientHeight) {
        posY = ctx.canvas.clientHeight - ratio.h * 14;
      }

      ctx.beginPath();
      ctx.fillStyle = '#fff';
      ctx.fillRect(posX * ratio.w, posY * ratio.h, rectW + 20, recth);
      ctx.closePath();

      ctx.beginPath();
      ctx.fillStyle = '#000';
      ctx.fillText(`(${item.x}, ${item.y})`, posX * ratio.w + 10, posY * ratio.h + 20);
      ctx.closePath();
    });

    // 计算面积 误差
    let areaX = (retPosList[0].x + retPosList[1].x) / 2;
    let areaY = (retPosList[0].y + retPosList[1].y) / 2;
    ctx.font = `${14 * ratio.w}px "PingFang SC"`; // 设置字体
    ctx.fillStyle = '#fff';
    const areaText = ctx.measureText(`面积：${areaVal}㎡, 误差：${errRatio}`);
    if (areaX + areaText.width / ratio.w > ctx.canvas.clientWidth) {
      areaX = ctx.canvas.clientWidth - areaText.width / ratio.w - 20;
    }
    if (areaY + ratio.h * 14 > ctx.canvas.clientHeight) {
      areaY = ctx.canvas.clientHeight - ratio.h * 14;
    }
    ctx.beginPath();

    ctx.fillRect(
      areaX * ratio.w,
      areaY * ratio.h,
      areaText.width + ratio.w * 35,
      naturalWidth > 2048 ? 30 : 20,
    );
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = '#000';
    ctx.fillText(
      `面积：${areaVal}㎡, 误差：${errRatio}`,
      areaX * ratio.w + 20,
      areaY * ratio.h + 20,
    );
    ctx.closePath();
  };

  useImperativeHandle(props.onRef, () => {
    return {
      clearCanvas,
      pointPosList: addIconList,
      handleTest,
    };
  });
  useEffect(() => {
    if (data.imgUrl) {
      const img: any = new Image();
      handleRenderImg(img);

      return () => {
        img.onload = null;
      };
    }
    return undefined;
  }, [wheelWidth, wheelHeight, data?.imgId, data.imgUrl]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={naturalWidth}
        height={naturalHeight}
        onClick={imgClick}
        // onWheel={wheelEvent}
      />
    </>
  );
};

export default FlagCanvas;
