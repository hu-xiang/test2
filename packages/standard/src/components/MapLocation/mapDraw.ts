import beginIcon from 'baseline/src/assets/img/facility/begin.svg';
import endIcon from 'baseline/src/assets/img/facility/end.svg';
import markerIcon from 'baseline/src/assets/img/facility/marker.svg';

const { AMap }: any = window;
let polyline: any = null;
const markers: any = [];

const mapDraw = (locationList: any) => {
  let map: any = null;
  if (locationList.length) {
    map = new AMap.Map('container', {
      zoom: 10,
      center: [114.058141, 22.543544] || locationList[0],
    });
    map.remove(markers);
    polyline = new AMap.Polyline({
      path: locationList,
      isOutline: true,
      outlineColor: '#ffeeff',
      borderWeight: 1,
      strokeColor: '#3366FF',
      strokeOpacity: 1,
      strokeWeight: 3,
      strokeStyle: 'solid',
      strokeDasharray: [10, 5],
      lineJoin: 'round',
      lineCap: 'round',
      zIndex: 50,
    });
    // map.add([polyline]);
    for (let i = 0, marker: any; i < locationList.length; i++) {
      let icon = markerIcon;
      if (i === 0 && locationList.length > 1) {
        icon = beginIcon;
      } else if (locationList.length > 1 && i === locationList.length - 1) {
        icon = endIcon;
      }
      AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new AMap.Geocoder();
        let address = '';
        geocoder.getAddress(locationList[i], (status: string, result: any) => {
          if (status === 'complete' && result.info === 'OK') {
            // result为对应的地理位置详细信息
            address = result.regeocode.formattedAddress;
            marker = new AMap.Marker({
              map,
              icon,
              position: locationList[i],
              anchor: 'bottom-center',
            });
            marker.setLabel({
              direction: 'right',
              offset: new AMap.Pixel(10, 0), // 设置文本标注偏移量
              content: `<div class='info'>${address}</div>`, // 设置文本标注内容
            });
            markers.push(marker);
          }
        });
      });
    }
    map.add([polyline, markers]);
  }
};

export default mapDraw;
