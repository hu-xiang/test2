import React, { useState, useEffect, useRef } from 'react';
// import { openInfo } from './mapInfoWindow';
// import DistressCanvas from '@/pages/TaskList/component/DistressCanvas';
import CustomMappop from './CustomMappop';
import styles from '../styles.less';
import pointSvg from '../../../../../public/images/map-ppoint-normal.svg';
import pointBigSvg from '../../../../../public/images/map-ppoint-bigger.svg';
import tcSvg from '../../../../../public/images/tc-normal.svg';
import tcBigSvg from '../../../../../public/images/tc-bigger.svg';

// import ReactDOM from 'react-dom';
interface Iprops {
  mapData: any[];
  fkFacilitiesId: any;
  // taskType: any;
}

let map: any = null;
let mapCluster: any = null;
const iconNormalMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(24, 24),
  // 图标的取图地址
  image: pointSvg,
  // 图标所用图片大小
  imageSize: new AMap.Size(24, 24),
  // 图标取图偏移量
  // imageOffset: new AMap.Pixel(-14, -28)
});
const iconBigMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(40, 40),
  // 图标的取图地址
  image: pointBigSvg,
  // 图标所用图片大小
  imageSize: new AMap.Size(40, 40),
});
const iconTcMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(24, 24),
  // 图标的取图地址
  image: tcSvg,
  // 图标所用图片大小
  imageSize: new AMap.Size(24, 24),
  // 图标取图偏移量
  // imageOffset: new AMap.Pixel(-14, -28)
});
const iconTcBigMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(40, 40),
  // 图标的取图地址
  image: tcBigSvg,
  // 图标所用图片大小
  imageSize: new AMap.Size(40, 40),
});
let prevMarker: any = null;
const normalOffset = new AMap.Pixel(-12, -24);
const bigOffset = new AMap.Pixel(-20, -40);

const Map: React.FC<Iprops> = (props: Iprops) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imgId, setImgId] = useState('');
  const [address, setAddress] = useState('');
  const [modalStyle, setModalStyle] = useState({ x: 0, y: 0 });
  const { mapData, fkFacilitiesId } = props;
  const childRef: any = useRef();
  // const intl = useIntl();
  const { AMap }: any = window;

  useEffect(() => {
    let center: any = [114.058141, 22.543544];
    let zoom = 10;
    if (mapData?.length && fkFacilitiesId) {
      center = [mapData[0].longitude, mapData[0].latitude];
      zoom = 13;
    }
    map = new AMap.Map('panoramaContainer', {
      zoom,
      center,
      mapStyle: 'amap://styles/macaron',
    });
    map.on('click', () => {
      if (childRef && childRef.current) {
        childRef.current?.resetClosableFlag(false);
      }
      setIsModalVisible(false);
      if (prevMarker) {
        // const preicon = prevMarker?.type === 14 ? iconTcMarker : iconNormalMarker;
        // prevMarker.marker.setIcon(preicon);
        // prevMarker.marker.setTop(false)
        prevMarker = undefined;
      }
    });
  }, []);

  useEffect(() => {
    const gridSize = 60;
    // 数据中需包含经纬度信息字段 lnglat
    if (!mapData || !mapData.length) {
      if (mapCluster) {
        mapCluster.setMap(null);
      }
      return;
    }

    const count = mapData.length;

    // 根据不同条件聚合数据
    const renderClusterMarker = (context: any) => {
      // const factor = (context.count / count) ** (1 / 18);
      const div = document.createElement('div');
      // const Hue = 180 - factor * 180;

      let bgColor = `rgba(137, 203, 155, 0.85)`;
      let size = 40;
      if (context.count > 200) {
        bgColor = 'rgba(235, 125, 87, 0.85)';
        size = 100;
      } else if (context.count > 50 && context.count <= 200) {
        bgColor = 'rgba(242, 201, 53, 0.85)';
        size = 80;
      } else if (context.count > 10 && context.count <= 50) {
        bgColor = 'rgba(70, 132, 247, 0.85)';
        size = 60;
      }

      const fontColor = `#fff`;
      div.style.backgroundColor = bgColor;
      size = Math.round(30 + (context.count / count) ** (1 / 5) * 25);
      // eslint-disable-next-line no-multi-assign
      div.style.width = div.style.height = `${size}px`;
      div.style.borderRadius = `${size / 2}px`;
      div.innerHTML = context.count;
      div.style.lineHeight = `${size}px`;
      div.style.color = fontColor;
      div.style.fontSize = '14px';
      div.style.textAlign = 'center';
      context.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2));
      context.marker.setContent(div);
      context.marker.on('click', (event: any) => {
        const curZoom = map.getZoom();
        map.setZoomAndCenter(curZoom + 3, event.lnglat);
      });
    };

    // const domRender = async (reactElement: any) => {
    //   const div = document.createElement('div');
    //   await new Promise((resolve) => {
    //     ReactDOM.render(reactElement, div);
    //     resolve(true);
    //   });
    //   return div.firstChild;
    // };
    const renderMarker = (context: any) => {
      let offset = normalOffset;
      let iconMarker = context.data[0]?.diseaseType === 14 ? iconTcMarker : iconNormalMarker;
      if (prevMarker) {
        if (prevMarker?.id && context.data?.length && prevMarker?.id === context.data[0]?.id) {
          const iconPre = prevMarker?.type === 14 ? iconTcBigMarker : iconBigMarker;
          iconMarker = iconPre;
          offset = bigOffset;
          const newmarker = context.marker;
          newmarker.setTop(true);
          prevMarker = {
            marker: newmarker,
            id: context.data[0]?.id,
            type: context.data[0]?.diseaseType,
          };
        }
      }
      // console.log('first',context)
      // context.marker.topWhenClick = true;
      context.marker.bubble = true;
      context.marker.setTop(false);
      // context.marker.setzIndex(20);
      context.marker.setIcon(iconMarker);
      context.marker.setOffset(offset);
      // const content = `<div style="background: url('images/map-point.svg') no-repeat; background-size: 28px; height: 28px; width: 28px;"></div>`;
      // const offset = new AMap.Pixel(-15, -9);
      // context.marker.setContent(content);
      // context.marker.setOffset(offset);
      context.marker.on('click', (event: any) => {
        if (
          prevMarker &&
          prevMarker?.id &&
          context.data?.length &&
          prevMarker?.id !== context.data[0]?.id
        ) {
          const preicon = context.data[0]?.diseaseType === 14 ? iconTcMarker : iconNormalMarker;
          prevMarker.marker.setIcon(preicon);
          prevMarker.marker.setTop(false);
        }
        setModalStyle(event.pixel);
        setImgId(context.data[0].imgId);
        setIsModalVisible(true);
        prevMarker = {
          marker: event.target,
          id: context.data[0]?.id,
          type: context.data[0]?.diseaseType,
        };
        event.target.setTop(true);
        const icon = context.data[0]?.diseaseType === 14 ? iconTcBigMarker : iconBigMarker;
        event.target.setIcon(icon);
        event.target.setOffset(bigOffset);
        AMap.plugin('AMap.Geocoder', () => {
          const geocoder = new AMap.Geocoder();
          geocoder.getAddress(context.data[0].lnglat, (status: string, result: any) => {
            if (status === 'complete' && result.info === 'OK') {
              // result为对应的地理位置详细信息
              setAddress(result.regeocode.formattedAddress);
            } else {
              setAddress('');
              console.log('根据经纬度查询地址失败');
            }
          });
        });
      });
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    // async () => {
    //   const element = domRender(<CustomMappop />);
    //   console.log(element, 'element')
    // };
    if (mapCluster) {
      // console.log("%cmapdata清空","color: red; font-style: italic; background-color: white;padding: 2px")
      mapCluster.setMap(null);
    }
    addCluster();
    function addCluster() {
      AMap.plugin('AMap.MarkerCluster', () => {
        // 异步加载插件
        // eslint-disable-next-line no-new
        mapCluster = new AMap.MarkerCluster(map, mapData, {
          gridSize, // 设置网格像素大小
          renderClusterMarker, // 自定义聚合点样式
          renderMarker, // 自定义非聚合点样式
        });
      });
    }
  }, [mapData]);

  const hideModal = () => {
    setIsModalVisible(false);
    if (prevMarker) {
      const preicon = prevMarker?.type === 14 ? iconTcMarker : iconNormalMarker;
      prevMarker.marker.setIcon(preicon);
      prevMarker.marker.setTop(false);
      prevMarker.marker.setOffset(normalOffset);
      prevMarker = undefined;
    }
  };

  return (
    <>
      <div id="panoramaContainer" className={styles.container} />
      <CustomMappop
        isModalVisible={isModalVisible}
        hideModal={hideModal}
        onRef={childRef}
        imgId={imgId}
        address={address}
        style={modalStyle}
        // taskType={taskType}
      />
    </>
  );
};
export default Map;
