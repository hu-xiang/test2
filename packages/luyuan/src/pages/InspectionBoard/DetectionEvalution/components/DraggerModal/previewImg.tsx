import React, { useRef, useEffect } from 'react';

interface Iprops {
  setImgUrl: (url: string) => void;
  imgList: any[];
}

const PreviewCanvas: React.FC<Iprops> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { imgList } = props;

  // 绘制Canvas
  const mergeImgs = (list: any[], cwidth: number, cheight: number) => {
    return new Promise((resolve) => {
      const baseList: any[] = [];

      // 创建 canvas 节点并初始化
      const canvas: any = document.getElementById('img_preview');
      canvas!.width = cwidth * 2;
      canvas!.height = cheight;
      const context = canvas.getContext('2d');
      list.forEach((item: any, index: number) => {
        const img = new (Image as any)();
        img.setAttribute('crossOrigin', 'Anonymous');
        img.src = item;
        // 跨域
        img.onload = () => {
          context!.drawImage(img, cwidth * index, 0, cwidth, cheight);
          const base64 = canvas.toDataURL('image/png');
          baseList.push(base64);
          if (baseList[list.length - 1]) {
            // 返回新的图片
            resolve(baseList[list.length - 1]);
          }
        };
      });
    });
  };

  useEffect(() => {
    if (imgList?.length > 0) {
      mergeImgs(imgList, 700, 800).then((base64: any) => {
        props.setImgUrl(base64);
      });
    }
  }, [imgList]);

  return (
    <>
      <canvas ref={canvasRef} id="img_preview" style={{ display: 'none' }} />
    </>
  );
};

export default PreviewCanvas;
