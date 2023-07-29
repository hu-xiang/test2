import { Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import { commonRequest } from 'baseline/src/utils/commonMethod';
import smallPoint from 'baseline/src/assets/img/mapPng/smallPoint.png';
import bigPoint from 'baseline/src/assets/img/mapPng/bigPoint.png';
import styles from './styles.less';

const requestList = [{ url: '/traffic/facility/location/queryStake', method: 'get' }];

let map: any = null;
const { AMap }: any = window;
let markers: any = [];
let prevMarker: any = null;

type Iprops = {
  isSelectPoint: boolean;
  onCancel: Function;
  onOk: Function;
  id: string;
};
const LocationModal: React.FC<Iprops> = (props) => {
  const [direct, setDirect] = useState<number>(0);
  const [stakeNo, setStakeNo] = useState<string>('');
  const markerClick = (e: any) => {
    const targetMarker = e?.target;
    const icon = new AMap.Icon({
      size: new AMap.Size(26, 32), // 图标尺寸
      image: bigPoint, // Icon的图像
      // imageOffset: new AMap.Pixel(0, -60),  // 图像相对展示区域的偏移量，适于雪碧图等
      imageSize: new AMap.Size(26, 32), // 根据所设置的大小拉伸或压缩图片
    });
    if (
      prevMarker &&
      prevMarker?.getExtData()?.id &&
      prevMarker?.getExtData()?.id !== targetMarker?.getExtData()?.id
    ) {
      // 上一个marker还原
      prevMarker.setTop(false);
      const small = new AMap.Icon({
        size: new AMap.Size(20, 26), // 图标尺寸
        image: smallPoint, // Icon的图像
        // imageOffset: new AMap.Pixel(0, -60),  // 图像相对展示区域的偏移量，适于雪碧图等
        imageSize: new AMap.Size(20, 26), // 根据所设置的大小拉伸或压缩图片
      });
      prevMarker.setIcon(small);
    }
    prevMarker = targetMarker;
    targetMarker.setTop(true);
    targetMarker.setIcon(icon);
    setDirect(targetMarker?.getExtData()?.markerDirect);
    setStakeNo(targetMarker?.getExtData()?.stakeNum);
  };

  const renderMarker = (item: any, icon: any, markerDirect: number) => {
    const marker: any = new AMap.Marker({
      map,
      icon,
      position: [item?.longitude, item?.latitude],
      anchor: 'bottom-center',
      // zIndex: 20,
      extData: {
        stakeNum: item?.stakeNo,
        id: item?.id,
        markerDirect,
      },
    });
    marker.setTop(false);

    marker.on('mouseover', () => {
      marker.setLabel({
        direction: 'top',
        offset: new AMap.Pixel(10, 0), // 设置文本标注偏移量
        content: `<div class='info'>${markerDirect === 0 ? '上行' : '下行'}桩号：${
          item?.stakeNo
        }</div>`, // 设置文本标注内容
      });
      marker.setPosition([item?.longitude, item?.latitude]);
      map.add(marker);
    });

    marker.on('mouseout', () => {
      marker.setLabel({
        direction: 'top',
        offset: new AMap.Pixel(10, 0), // 设置文本标注偏移量
        content: ``, // 设置文本标注内容
      });
      marker.setPosition([item?.longitude, item?.latitude]);
      map.add(marker);
    });

    marker.on('click', markerClick);

    markers.push(marker);
  };

  const getLocation = async () => {
    const res = await commonRequest({ ...requestList[0], params: { facilityId: props.id } });
    const list = res?.data[0].concat(res?.data[1]);
    map = new AMap.Map('container', {
      zoom: 15,
      center: list?.length ? [list[0]?.longitude, list[0]?.latitude] : [114.514859, 38.042306],
    });
    if (list?.length) {
      const icon = new AMap.Icon({
        size: new AMap.Size(20, 26), // 图标尺寸
        image: smallPoint, // Icon的图像
        // imageOffset: new AMap.Pixel(0, -60),  // 图像相对展示区域的偏移量，适于雪碧图等
        imageSize: new AMap.Size(20, 26), // 根据所设置的大小拉伸或压缩图片
      });
      if (map) map.remove(markers);
      markers = [];
      for (let i = 0; i < list?.length; i++) {
        const markerDirect = i < res?.data[0].length ? 0 : 1;
        renderMarker(list[i], icon, markerDirect);
      }
    }
  };

  useEffect(() => {
    getLocation();
    return () => {
      // 销毁地图，并清空地图容器
      if (map) {
        map.remove(markers);
        map.destroy();
        markers = [];
        map = null;
      }
    };
  }, []);

  const handleSubmit = () => {
    props.onOk(stakeNo, direct);
  };
  return (
    <Modal
      title="选取定位"
      width={'70vw'}
      maskClosable={false}
      bodyStyle={{ height: 'calc(90vh - 136px)' }}
      open={props.isSelectPoint}
      onCancel={() => props.onCancel()}
      onOk={() => handleSubmit()}
      style={{ top: '5%' }}
      okText="提交"
    >
      <div
        style={{ height: 'calc(90vh - 176px)' }}
        id={'container'}
        className={styles.stakeMap}
      ></div>
    </Modal>
  );
};

export default LocationModal;
