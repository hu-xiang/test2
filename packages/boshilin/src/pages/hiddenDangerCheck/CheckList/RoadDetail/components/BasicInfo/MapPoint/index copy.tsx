import styles from './styles.less';
import DisMapDataNull from 'baseline/src/assets/icon/disMapDataNull.svg';
import { Empty } from 'antd';
import React, { useEffect } from 'react';
import { useModel } from 'umi';
import markerIcon from 'baseline/src/assets/img/mapPng/marker.png';

type Iprops = {
  height?: number | string;
  isNotSetNull?: boolean;
};
let map: any = null;
const { AMap }: any = window;
let markers: any = [];
let layer: any = null;

const MapLocation: React.FC<Iprops> = (props) => {
  const { lnglatArr, setLnglatArr } = useModel<any>('facility');

  const markerEvent = (item: any) => {
    const curData = {
      position: item,
      icon: {
        type: 'image',
        image: markerIcon,
        size: [20, 26],
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
        }
      });
    });
    // 给marker绑定事件
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
  };

  const mapDraw = (locationList: any, container: string) => {
    const list = locationList.filter((item: any) => {
      return item[0] && item[1];
    });
    if (list.length) {
      map = new AMap.Map(container, {
        zoom: 15,
        center: list[list?.length - 1] || [114.514859, 38.042306],
      });
      if (layer) map.remove(layer);
      if (map) map.remove(markers);
      markers = [];
      layer = new AMap.LabelsLayer({
        zooms: [3, 20],
        zIndex: 1000,
        collision: false,
      });

      // 将图层添加到地图
      map.add(layer);

      for (let i = 0; i < list.length; i++) {
        markerEvent(list[i]);
      }
      // 一次性将海量点添加到图层
      layer.add(markers);
    } else {
      map = new AMap.Map(container, {
        zoom: 15,
        // center: [114.058141, 22.543544],
      });
      if (layer) map.remove(layer);
      map.remove(markers);
    }
  };

  useEffect(() => {
    return () => {
      // 销毁地图，并清空地图容器
      if (map) map.destroy();
      map = null;
      if (!props.isNotSetNull) {
        setLnglatArr([[]]);
      }
    };
  }, []);

  useEffect(() => {
    if (lnglatArr.length) mapDraw(lnglatArr, 'container');
  }, [lnglatArr.length]);

  return (
    <div className={styles.mapLocation}>
      {lnglatArr?.length ? (
        <div className={styles.mapBox}>
          <div
            className={styles.mapBigs}
            style={
              props.height
                ? { height: typeof props.height === 'number' ? `${props.height}px` : props.height }
                : { height: '300px' }
            }
            id={'container'}
          />
        </div>
      ) : (
        <div className={`${styles.mapBigs2} mapBigs2`}>
          <Empty image={DisMapDataNull} />
        </div>
      )}
    </div>
  );
};
export default MapLocation;
