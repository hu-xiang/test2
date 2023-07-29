import beginIcon from '../../assets/img/facility/begin.svg';
import endIcon from '../../assets/img/facility/end.svg';
import markerIcon from '../../assets/img/facility/marker.svg';

const { AMap }: any = window;
let polyline: any = null;
const markers: any = [];

const mapDraw = (locationList: any, container: string) => {
  const list = locationList.filter((item: any) => {
    return item[0] && item[1];
  });
  if (list.length) {
    let map: any = null;
    map = new AMap.Map(container, {
      zoom: 10,
      center: [114.058141, 22.543544],
    });
    map.remove(markers);
    polyline = new AMap.Polyline({
      path: list,
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
    for (let i = 0; i < list.length; i++) {
      let marker: any = null;
      let icon = markerIcon;
      if (i === 0 && list.length > 1) {
        icon = beginIcon;
      } else if (list.length > 1 && i === list.length - 1) {
        icon = endIcon;
      }
      marker = new AMap.Marker({
        map,
        icon,
        position: list[i],
        anchor: 'bottom-center',
      });
      AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new AMap.Geocoder();
        let address = '';
        geocoder.getAddress(list[i], (status: string, result: any) => {
          if (status === 'complete' && result.info === 'OK') {
            // result为对应的地理位置详细信息
            address = result.regeocode.formattedAddress;
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
  } else {
    let map: any = null;
    map = new AMap.Map(container, {
      zoom: 10,
      center: [114.058141, 22.543544],
    });
    map.remove(markers);
  }
};

export default mapDraw;
