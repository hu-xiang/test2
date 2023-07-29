// 马赛克随机获取颜色值
function getXY(obj: any, x: number, y: number) {
  const ow: number = obj.width;
  // const h = obj.height;
  // const d = obj.data;
  const color = [];
  color[0] = obj.data[4 * (y * ow + x)];
  color[1] = obj.data[4 * (y * ow + x) + 1];
  color[2] = obj.data[4 * (y * ow + x) + 2];
  color[3] = obj.data[4 * (y * ow + x) + 3];
  return color;
}

function setXY(obj: any, x: number, y: number, color: any[]) {
  const ow = obj.width;
  // const h = obj.height;
  // const d = obj.data;
  [
    obj.data[4 * (y * ow + x)],
    obj.data[4 * (y * ow + x) + 1],
    obj.data[4 * (y * ow + x) + 2],
    obj.data[4 * (y * ow + x) + 3],
  ] = color;
}

export function drawMosaic(
  item: any,
  ctxRef?: any,
  naturalWidth: any = false,
  naturalHeight: any = false,
) {
  let oImg = ctxRef.current!.getImageData(item.minX, item.minY, item.width, item.height);
  let scaleW: any;
  let scaleH: any;

  if (naturalWidth) {
    scaleW = naturalWidth / 704;
    scaleH = naturalHeight / 687;
    oImg = ctxRef.current!.getImageData(
      item.minX / scaleW,
      item.minY / scaleH,
      item.width / scaleW,
      item.height / scaleH,
    );
  }

  const w = oImg.width;
  const h = oImg.height;
  // 马赛克的程度，数字越大越模糊

  const num = 10;
  // if(naturalWidth){
  //   num = scaleH;
  // }
  // 等分画布
  const stepW = w / num;
  const stepH = h / num;
  // 循环画布的像素点
  for (let i = 0; i < stepH; i += 1) {
    for (let j = 0; j < stepW; j++) {
      // 获取一个小方格的随机颜色
      const color = getXY(
        oImg,
        j * num + Math.floor(Math.random() * num),
        i * num + Math.floor(Math.random() * num),
      );
      // 循环小方格的像素点，
      for (let k = 0; k < num; k++) {
        for (let l = 0; l < num; l++) {
          // 设置小方格的颜色
          setXY(oImg, j * num + l, i * num + k, color);
        }
      }
    }
  }
  if (naturalWidth || naturalHeight) {
    ctxRef.current!.putImageData(oImg, item.minX / scaleW, item.minY / scaleH);
  } else {
    ctxRef.current!.putImageData(oImg, item.minX, item.minY);
  }
}
