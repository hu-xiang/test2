import styles from './styles.less';
import DisMapDataNull from '../../../../../../assets/icon/disMapDataNull.svg';
import { Modal, Empty } from 'antd';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import normal from '../../../../../../assets/img/mapPng/normal.png';
import upStart from '../../../../../../assets/img/mapPng/upStart.png';
import up from '../../../../../../assets/img/mapPng/up.png';
import upEnd from '../../../../../../assets/img/mapPng/upEnd.png';
import downStart from '../../../../../../assets/img/mapPng/downStart.png';
import down from '../../../../../../assets/img/mapPng/down.png';
import downEnd from '../../../../../../assets/img/mapPng/downEnd.png';
import { useCompare } from '../../../../../../utils/commonMethod';

type Iprops = {
  height?: number;
  isNotSetNull?: boolean;
};
const { AMap }: any = window;
let map: any = null;
let markers: any = [];
let layer: any = null;
let timer: any = null;

const iconEnum = {
  0: normal,
  1: upStart,
  2: up,
  3: upEnd,
  4: downStart,
  5: down,
  6: downEnd,
};

const MarkMapShow: React.FC<Iprops> = (props) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { lnglatArr, setLnglatArr } = useModel<any>('facility');

  useEffect(() => {
    return () => {
      if (layer) map.remove(layer);
      // 销毁地图，并清空地图容器
      if (markers.length) {
        map.remove(markers);
        markers = [];
      }
      // 销毁地图，并清空地图容器
      if (map) map.destroy();
      map = null;
      if (!props.isNotSetNull) {
        setLnglatArr([]);
      }
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);

  const markerEvent = (item: any, icon: any, type: number, stakeNo: any) => {
    const curData = {
      position: item,
      icon,
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
    let text = '';
    if ([1, 2, 3]?.includes(type)) {
      text = '上行';
    }
    if ([4, 5, 6]?.includes(type)) {
      text = '下行';
    }
    // 给marker绑定事件
    labelMarker.on('mouseover', () => {
      if (address) {
        // marker.setContent(
        //   `<div class="amap-info-window">${address}
        //   <div class="amap-info-sharp"></div></div>`,
        // );
        if (stakeNo) {
          marker.setContent(
            `<div class="amap-info-window">桩号:${stakeNo}${text}<br/>地址:${address}
            <div class="amap-info-sharp"></div></div>`,
          );
        } else {
          marker.setContent(
            `<div class="amap-info-window">地址:${address}
            <div class="amap-info-sharp"></div></div>`,
          );
        }
        marker.setPosition(item);
        map.add(marker);
      }
    });

    labelMarker.on('mouseout', () => {
      map.remove(marker);
    });

    marker.on('mouseover', () => {
      if (address) {
        // marker.setContent(
        //   `<div class="amap-info-window">${address}
        //   <div class="amap-info-sharp"></div></div>`,
        // );
        if (stakeNo) {
          marker.setContent(
            `<div class="amap-info-window">桩号:${stakeNo}${text}<br/>地址:${address}
            <div class="amap-info-sharp"></div></div>`,
          );
        } else {
          marker.setContent(
            `<div class="amap-info-window">地址:${address}
            <div class="amap-info-sharp"></div></div>`,
          );
        }
        marker.setPosition(item);
        map.add(marker);
      }
    });

    marker.on('mouseout', () => {
      map.remove(marker);
    });
  };

  const mapDraw = (list: any) => {
    const locationList = list.filter((item: any) => {
      return item?.longitude && item?.latitude;
    });
    if (locationList.length) {
      // map = new AMap.Map(container, {
      //   zoom: 15,
      //   center: locationList.length
      //     ? [locationList[0].longitude, locationList[0].latitude]
      //     : [114.058141, 22.543544],
      // });
      // map.on('complete', function () {
      // if (layer) map.remove(layer);
      // if (map) map.remove(markers);
      // markers = [];

      if (locationList.length) {
        for (let i = 0; i < locationList.length; i++) {
          const icon = {
            type: 'image',
            image: locationList[i]?.type ? iconEnum[locationList[i]?.type] : normal,
            size: [1, 3, 4, 6].includes(locationList[i]?.type) ? [26, 36] : [20, 26],
            anchor: 'bottom-center',
          };
          markerEvent(
            [locationList[i].longitude, locationList[i].latitude],
            icon,
            locationList[i]?.type,
            locationList[i]?.stakeNo,
          );
        }
      }

      // 一次性将海量点添加到图层
      layer.add(markers);
      // });
    } else {
      // map = new AMap.Map(container, {
      //   zoom: 15,
      //   center: [114.058141, 22.543544],
      // });
      // if (layer) map?.remove(layer);
      // map?.remove(markers);
    }
  };

  useEffect(() => {
    if (lnglatArr.length > 1) {
      map = new AMap.Map('container', {
        zoom: 15,
        center: [lnglatArr[1].longitude, lnglatArr[1].latitude],
        showLabel: false,
        showIndoorMap: false,
      });
      if (markers.length) {
        map?.remove(markers);
        markers = [];
      }

      layer = new AMap.LabelsLayer({
        zooms: [3, 20],
        zIndex: 1000,
        collision: false,
      });
      // 将图层添加到地图
      map.add(layer);

      let index = 0;
      timer = setInterval(() => {
        console.log(
          lnglatArr.slice(
            index * 1000,
            (index + 1) * 1000 > lnglatArr?.length ? lnglatArr?.length : (index + 1) * 1000,
          ),
        );
        mapDraw(
          lnglatArr.slice(
            index * 1000,
            (index + 1) * 1000 > lnglatArr?.length ? lnglatArr?.length : (index + 1) * 1000,
          ),
        );
        console.log(index);

        index += 1;
        console.log(Math.ceil(lnglatArr?.length / 1000));
        if (index === Math.ceil(lnglatArr?.length / 1000)) {
          clearInterval(timer);
        }
      }, 10);
    } else {
      /* eslint-disable */
      if (lnglatArr.length) {
        map = new AMap.Map('container', {
          zoom: 15,
          center: [114.058141, 22.543544],
        });
        if (markers.length) {
          map?.remove(markers);
          markers = [];
        }
        if (layer) map?.remove(layer);
      }
      /* eslint-enable */
    }
  }, [useCompare(lnglatArr)]);

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
            style={props.height ? { height: `${props.height}px` } : { height: '300px' }}
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
export default MarkMapShow;
