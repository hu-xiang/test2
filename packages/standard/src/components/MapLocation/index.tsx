import styles from './styles.less';
import DisMapDataNull from 'baseline/src/assets/icon/disMapDataNull.svg';
import { Modal, Empty } from 'antd';
import { useEffect, useState } from 'react';

import mapDraw from './mapDraw';

import { request } from 'umi';

type Iprops = {
  id: string | number;
  locationUrl: string;
};
const MapLocation: React.FC<Iprops> = (props) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [locationList, setLocationList] = useState<any>([]);

  const locationUrl = (id: any) => {
    return request(`${props.locationUrl}`, {
      method: 'get',
      params: {
        id,
      },
    });
  };

  const getLocation = async () => {
    const res = await locationUrl(props.id);
    // setLocationList([
    //   [114.5726418917, 22.7439590356],
    //   [114.6727418917, 22.8439590556],
    //   [114.4728418917, 22.6439590756],
    // ]);
    const list: any = [];
    if (res.data instanceof Array) {
      if (res?.data?.length) {
        res.data.forEach((item: any) => {
          list.push([item.longitude, item.latitude]);
        });
        setLocationList(list);
      }
    } else if (res.data instanceof Object) {
      list.push([res.data.longitude, res.data.latitude]);
      setLocationList(list);
    }
    mapDraw(list);
    return res;
  };

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    mapDraw(locationList);
  }, [locationList.length]);

  // // 双击弹窗地图渲染
  // useEffect(() => {
  //   if (!props?.id) return;
  //   if (!locationInfo?.longitude || !locationInfo?.latitude) return;
  //   const map = new AMap.Map('containers', {
  //     zoom: 10,
  //     center: [locationInfo?.longitude, locationInfo?.latitude],
  //     mapStyle: 'amap://styles/macaron',
  //   });
  //   const startIcon = new AMap.Icon({
  //     // 图标尺寸
  //     size: new AMap.Size(25, 34),
  //     // 图标的取图地址
  //     image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png',
  //     // 图标所用图片大小
  //     imageSize: new AMap.Size(25, 34),
  //     // 图标取图偏移量
  //     // imageOffset: new AMap.Pixel(-9, -3)
  //   });
  //   // 打点图标公共配置
  //   const marker = new AMap.Marker({
  //     icon: startIcon,
  //     position: [locationInfo?.longitude, locationInfo?.latitude],
  //     offset: new AMap.Pixel(-13, -30),
  //   });

  //   marker.setMap(map);
  //   if (address) {
  //     marker.setLabel({
  //       direction: 'right',
  //       offset: new AMap.Pixel(10, 0), // 设置文本标注偏移量
  //       content: `<div class='info'>${address}</div>`, // 设置文本标注内容
  //     });
  //   }
  // }, [isModalVisible]);

  return (
    <div className={styles.mapLocation}>
      {locationList?.length ? (
        <div className={styles.mapBox}>
          {/* <div className={styles.txtBox}>
            图片位置 : {locationInfo?.longitude || ''}
            {locationInfo?.longitude ? ',' : ''}
            {locationInfo?.latitude || ''}
          </div> */}
          <div
            className={styles.mapBigs}
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
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
      >
        <div className={styles.mapBig2} id={'containers'} />
      </Modal>
    </div>
  );
};
export default MapLocation;
