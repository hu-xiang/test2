import pointSvg from '../../../../../public/images/map-point.svg';

const previewBigImg = () => {
  const imgBg = document.createElement('div');
  imgBg.setAttribute('class', 'map-big-img-bg');

  const img = document.createElement('img');
  img.src = pointSvg;
  img.setAttribute('class', 'map-big-img');

  imgBg.appendChild(img);
  document.body.appendChild(imgBg);
};
// 在指定位置打开信息窗体
export function openInfo(windowInfo: any) {
  // 构建信息窗体中显示的内容
  const content = `
    <h3 class="map-pop-title">病害信息</h3>
    <img src='/images/map-point.png' class="map-pop-img" onclick="previewBigImg()" />
    <div class="map-pop-content">
      <div>采集时间：2022/1/10 12:15:45</div>
      <div>病害编号：BH202111190001</div>
      <div>病害类型：裂缝</div>
      <div>严重程度：紧急</div>
      <div>病害面积：0.001m2</div>
      <div>病害长度：0.901m2</div>
      <div>病害位置：<div class="address" title="广东省深圳市南山区高新南九道45号西北工业大学三航科技大厦22楼">广东省深圳市南山区高新南九道45号西北工业大学三航科技大厦22楼</div></div>
    </div>
  `;
  const infoWindow = new AMap.InfoWindow({
    content, // 使用默认信息窗体框样式，显示信息内容
  });

  infoWindow.open(windowInfo.map, windowInfo.position);
  document.body.querySelector('.map-pop-img')?.addEventListener('click', previewBigImg);
}
