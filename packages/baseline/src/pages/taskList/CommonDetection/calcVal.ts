/**
 * 计算长度或面积
 * @param points 坐标点
 */
import type { point } from './data.d';

export function calcBoundaryCoord(contours: Record<'Points', point[]>[] = []) {
  let minX = 0;
  let minY = 0;
  let maxX = 0;
  let maxY = 0;
  if (contours.length === 1) {
    contours.forEach((points, contoursIndex: number) => {
      if (!points.Points) return;
      points.Points.forEach((item: any, index: number) => {
        if (contoursIndex === 0 && index === 0) {
          minX = item.X;
          maxX = item.X;
          maxY = item.Y;
          minY = item.Y;
        } else {
          if (item.X < minX) {
            minX = item.X;
          } else if (item.X > maxX) {
            maxX = item.X;
          }
          if (item.Y > maxY) {
            maxY = item.Y;
          } else if (item.Y < minY) {
            minY = item.Y;
          }
        }
      });
    });
  } else {
    contours.forEach((item: any, index: number) => {
      if (index === 0) {
        minX = item.X;
        maxX = item.X;
        maxY = item.Y;
        minY = item.Y;
      } else {
        if (item.X < minX) {
          minX = item.X;
        } else if (item.X > maxX) {
          maxX = item.X;
        }
        if (item.Y > maxY) {
          maxY = item.Y;
        } else if (item.Y < minY) {
          minY = item.Y;
        }
      }
    });
  }
  return {
    minX: Math.floor(minX),
    minY: Math.floor(minY),
    maxX: Math.floor(maxX),
    maxY: Math.floor(maxY),
  };
}

export function calcLength(contours: Record<string, point[]>[] = []) {
  const obj = calcBoundaryCoord(contours);
  // if (obj.maxX - obj.minX > obj.maxY - obj.minY) {
  //   return (obj.maxX - obj.minX) * (2 / 2048);
  // }
  const width = (obj.maxX - obj.minX) * (2 / 2048);
  const height = (obj.maxX - obj.minX) * (2 / 2048);
  return Math.sqrt(width * width + height * height);
}

export function calcArea(contours: Record<string, point[]>[] = []) {
  const obj = calcBoundaryCoord(contours);
  return (obj.maxY - obj.minY) * (2 / 2000) * (obj.maxX - obj.minX) * (2 / 2048);
}
