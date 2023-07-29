import styles from './styles.less';
import DisMapDataNull from '../../assets/icon/disMapDataNull.svg';
import { Modal, Empty } from 'antd';
import { useEffect, useState } from 'react';
import { useModel } from 'umi';
import beginIcon from '../../assets/img/mapPng/start.png';
import endIcon from '../../assets/img/mapPng/end.png';
import markerIcon from '../../assets/img/mapPng/marker.png';

type Iprops = {
  height?: number | string;
  isNotSetNull?: boolean;
  isOne?: boolean;
};
let map: any = null;
const { AMap }: any = window;
let polyline: any = null;
let markers: any = [];
let layer: any = null;

const MapLocation: React.FC<Iprops> = (props) => {
  const { isOne = false } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { lnglatArr, setLnglatArr } = useModel<any>('facility');

  const markerEvent = (item: any, icon: any, isStartOrEnd: boolean) => {
    const curData = {
      position: item,
      icon: {
        type: 'image',
        image: icon,
        size: isStartOrEnd ? [26, 36] : [20, 26],
        anchor: 'bottom-center',
      },
    };

    const labelMarker = new AMap.LabelMarker(curData);
    const marker: any = new AMap.Marker({
      offset: [0, -15],
      anchor: 'bottom-center',
    });
    markers.push(labelMarker);
    let address = '';
    AMap.plugin('AMap.Geocoder', () => {
      const geocoder = new AMap.Geocoder();
      geocoder.getAddress(item, (status: string, result: any) => {
        if (status === 'complete' && result.info === 'OK') {
          // result为对应的地理位置详细信息
          address = result.regeocode.formattedAddress;
          if (isOne) {
            marker.setContent(
              `<div class="amap-info-window">${address}
              <div class="amap-info-sharp"></div></div>`,
            );
            marker.setPosition(item);
            map.add(marker);
          }
        }
      });
    });
    // 给marker绑定事件
    if (!isOne) {
      labelMarker.on('mouseover', () => {
        marker.setContent(
          `<div class="amap-info-window">${address}
          <div class="amap-info-sharp"></div></div>`,
        );
        marker.setPosition(item);
        map.add(marker);
      });

      labelMarker.on('mouseout', () => {
        map.remove(marker);
      });

      marker.on('mouseover', () => {
        marker.setContent(
          `<div class="amap-info-window">${address}
          <div class="amap-info-sharp"></div></div>`,
        );
        marker.setPosition(item);
        map.add(marker);
      });

      marker.on('mouseout', () => {
        map.remove(marker);
      });
    }
  };

  const mapDraw = (locationList: any) => {
    const list = locationList.filter((item: any) => {
      return item[0] && item[1];
    });
    if (list.length) {
      layer = new AMap.LabelsLayer({
        zooms: [3, 20],
        zIndex: 1000,
        collision: false,
      });

      // 将图层添加到地图
      map.add(layer);

      for (let i = 0; i < list.length; i++) {
        let icon = markerIcon;
        let isStartOrEnd = false;
        if (i === 0 && list.length > 1) {
          icon = beginIcon;
          isStartOrEnd = true;
        } else if (list.length > 1 && i === list.length - 1) {
          isStartOrEnd = true;
          icon = endIcon;
          isStartOrEnd = true;
        }
        markerEvent(list[i], icon, isStartOrEnd);
      }
      // 一次性将海量点添加到图层
      layer.add(markers);

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
      map.add(polyline);
    }
  };

  useEffect(() => {
    return () => {
      // 销毁地图，并清空地图容器
      if (map) map.destroy();
      map = null;
      polyline = null;
      if (!props.isNotSetNull) {
        setLnglatArr([[]]);
      }
    };
  }, []);

  useEffect(() => {
    if (lnglatArr.length) {
      map = new AMap.Map('container', {
        zoom: 15,
        center: lnglatArr.length > 1 ? lnglatArr[1] : [114.058141, 22.543544],
      });
      if (layer) map?.remove(layer);
      if (map) map?.remove(markers);
      markers = [];
      mapDraw(lnglatArr);
    }
  }, [lnglatArr.length]);

  return (
    <div className={styles.mapLocation}>
      {lnglatArr?.length ? (
        <div className={styles.mapBox}>
          {/* <div className={styles.txtBox}>
            图片位置 : {locationInfo?.longitude || ''}
            {locationInfo?.longitude ? ',' : ''}
            {locationInfo?.latitude || ''}
          </div> */}
          <div
            className={styles.mapBigs}
            style={
              props.height
                ? { height: typeof props.height === 'number' ? `${props.height}px` : props.height }
                : { height: '300px' }
            }
            id={'container'}
            onDoubleClick={() => setIsModalVisible(false)}
          />
        </div>
      ) : (
        <div className={`${styles.mapBigs2} mapBigs2`}>
          <Empty image={DisMapDataNull} />
        </div>
      )}
      <Modal
        className={styles.mapMod}
        title=""
        footer={false}
        mask={false}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
      >
        <div className={styles.mapBig2} id={'containers'} />
      </Modal>
    </div>
  );
};
export default MapLocation;
