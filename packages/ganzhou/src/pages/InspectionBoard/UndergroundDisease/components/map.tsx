import React, { useState, useEffect, useRef } from 'react';
import DraggerModal from './DraggerModal';
import styles from '../styles.less';
import { history } from 'umi';

interface Iprops {
  mapData: any[];
  isToday: boolean;
  mapType: string;
  onRef: any;
  mapInfo: any;
  // roadStatus: string;
}
let map: any;

let trafficLayerEva: any = null;
let mapSaliteLayerEva: any = null;

let renderMarkerEva: any = null;
let mapClusterEva: any = null;
let prevMarkerEva: any = null;
let iconMarkerEva = null;
// let carPreLntg: any = null;
const iconNormalMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(28, 28),
  // 图标的取图地址
  image: 'images/map-point.svg',
  // 图标所用图片大小
  imageSize: new AMap.Size(28, 28),
  // 图标取图偏移量
  // imageOffset: new AMap.Pixel(-14, -28)
});

const iconBigMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(41, 48),
  // 图标的取图地址
  image: 'images/bigMaker.svg',
  // 图标所用图片大小
  imageSize: new AMap.Size(41, 48),
});
const normalOffset = new AMap.Pixel(-14, -28);
const bigOffset = new AMap.Pixel(-20, -48);
const EvaMap: React.FC<Iprops> = (props: Iprops) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFirstFlag, setIsFirstFlag] = useState(false);
  const [imgId, setImgId] = useState<any>('');
  const preMarkRef: any = useRef();
  const childRef: any = useRef();
  const [address, setAddress] = useState('');
  const [modalStyle, setModalStyle] = useState({ x: 0, y: 0 });
  const { mapData, mapInfo } = props;
  const { AMap }: any = window;
  const firstClustMakerRef: any = useRef();
  // const [firstClustMaker, setFirstClustMaker] = useState<any>();
  useEffect(() => {
    let center: any = mapInfo?.center || [114.058141, 22.543544];
    let zoom = 10;
    if (mapData?.length) {
      center = [mapData[0].longitude, mapData[0].latitude];
      zoom = 11;
    }
    map = new AMap.Map('containerEvation', {
      zoom: mapInfo?.zoom || zoom,
      center,
      mapStyle: 'amap://styles/5cfb475a7621dccba5ff381b2f3c8ab4',
      pitch: props?.mapType === '3d' ? 52.34782608695647 : 50, // 地图俯仰角度，有效范围 0 度- 83 度
      viewMode: '3D', // 地图模式
      jogEnable: true,
      animateEnable: true,
      zooms: [4.54, 23],
      skyColor: props?.mapType === '3d' ? '#1f263a' : '#343530', // 3D 模式下带有俯仰角时会显示
    });

    // 高亮显示省市区域
    if (mapInfo?.districtSearch) {
      AMap.plugin('AMap.DistrictSearch', () => {
        new AMap.DistrictSearch({
          extensions: 'all',
          subdistrict: 0,
        }).search(mapInfo.districtSearch, (status: any, result: any) => {
          // 外多边形坐标数组和内多边形坐标数组
          const outer = [
            new AMap.LngLat(-360, 90, true),
            new AMap.LngLat(-360, -90, true),
            new AMap.LngLat(360, -90, true),
            new AMap.LngLat(360, 90, true),
          ];
          const holes = result.districtList[0].boundaries;

          const pathArray = [outer];
          // eslint-disable-next-line
          pathArray.push.apply(pathArray, holes);
          const polygon = new AMap.Polygon({
            pathL: pathArray,
            strokeColor: '#3758FF',
            strokeWeight: 3,
            fillColor: '#050811',
            fillOpacity: 0.8,
          });
          polygon.setPath(pathArray);
          map.add(polygon);
        });
      });
    }
    map.on('click', () => {
      if (childRef && childRef.current) {
        childRef.current?.resetMaskClosableFlag(false);
      }
      setIsModalVisible(false);
      if (prevMarkerEva) {
        prevMarkerEva.marker.setIcon(iconNormalMarker);
        prevMarkerEva = undefined;
      }
      if (preMarkRef.current && preMarkRef.current.marker) {
        preMarkRef.current.marker.setIcon(iconNormalMarker);
        preMarkRef.current = undefined;
      }
    });

    // 实时路况图层
    trafficLayerEva = new AMap.TileLayer.Traffic({
      zIndex: 10,
      zooms: [7, 22],
    });
    trafficLayerEva.setMap(map);
  }, []);

  useEffect(() => {
    if (map) {
      if (props?.mapType === '3d') {
        if (mapSaliteLayerEva) {
          mapSaliteLayerEva.setMap(null);
        }
        map.setPitch(52.34782608695647);
      } else {
        if (!mapSaliteLayerEva) {
          mapSaliteLayerEva = new AMap.TileLayer.Satellite({});
        }
        mapSaliteLayerEva.setMap(map);
        map.setPitch(50);
        map.setZooms([4.54, 21]);
      }
    }
  }, [props?.mapType]);

  const setGridSizeNum = (count: number) => {
    if (count && count > 0) {
      /* eslint-disable */
      if (count < 10000) {
        return 30;
      } else if (count > 10000 && count < 20000) {
        return 20;
      } else if (count > 30000) {
        return 10;
      } else {
        return 40;
      }
    }
    return 60;
  };

  useEffect(() => {
    // 根据不同条件聚合数据
    const renderClusterMarker = (context: any) => {
      // console.log('juhetuceng');
      const containerDiv = document.createElement('div');
      const topDiv = document.createElement('div');
      const containerFireDiv = document.createElement('div');
      const containerDotDiv = document.createElement('div');
      const dotDiv = document.createElement('div');
      const dotSibDiv1 = document.createElement('div');
      const dotSibDiv2 = document.createElement('div');
      const flameDiv = document.createElement('div');
      const bottomDiv = document.createElement('div');
      containerDiv.appendChild(topDiv);
      containerDiv.appendChild(containerDotDiv);
      containerDiv.appendChild(containerFireDiv);
      containerDotDiv.appendChild(dotDiv);
      containerDotDiv.appendChild(dotSibDiv1);
      containerDotDiv.appendChild(dotSibDiv2);
      containerFireDiv.appendChild(bottomDiv);
      containerFireDiv.appendChild(flameDiv);
      let bgColor = `rgba(250, 225, 77, 1)`;
      let size = 40;
      flameDiv.style.background = `linear-gradient(180.31deg, #F0AF3E 45.15%, rgba(250, 225, 77, 0) 99.73%)`;
      if (context.count > 200) {
        bgColor = 'rgba(255, 86, 86, 1)';
        size = 100;
        flameDiv.style.background =
          'linear-gradient(180.18deg, #FF5656 47.99%, #EC8031 62.7%, rgba(240, 175, 62, 0.5) 79.44%, rgba(250, 225, 77, 0) 99.84%)';
      } else if (context.count > 50 && context.count <= 199) {
        bgColor = 'rgba(238, 107, 12, 1)';
        size = 80;
        flameDiv.style.background =
          'linear-gradient(180.18deg, #EE6B0C 19.89%, rgba(240, 175, 62, 0.5) 84.43%, rgba(250, 225, 77, 0) 99.84%)';
      } else if (context.count > 10 && context.count <= 49) {
        bgColor = 'rgba(240, 175, 62, 1)';
        size = 60;
        flameDiv.style.background =
          'linear-gradient(180.31deg, #F0AF3E 45.15%, rgba(250, 225, 77, 0) 99.73%);';
      }
      size = Math.round(30 + (context.count / mapData?.length) ** (1 / 5) * 25);
      containerDiv.className = 'clustContainer';
      flameDiv.className = 'clustFire clustFlame';
      containerFireDiv.className = 'containerBoxFire';
      containerDotDiv.className = 'containerDot';
      dotDiv.className = 'dotClass';
      dotSibDiv1.className = 'dotSibClass sibClass1';
      dotSibDiv2.className = 'dotSibClass sibClass2';
      bottomDiv.className = 'bottomFire';
      containerFireDiv.className = 'containerBoxFire';
      topDiv.className = 'topFire';
      topDiv.style.color = bgColor;
      topDiv.innerHTML = context.count;
      // eslint-disable-next-line no-multi-assign
      containerDiv.style.width = `${1.2 * size}px`;
      containerDiv.style.height = `${1.2 * size}px`;
      containerFireDiv.style.width = `${1.2 * size}px`;
      containerFireDiv.style.height = `${1 * size}px`;
      bottomDiv.style.width = `${1.2 * size}px`;
      bottomDiv.style.height = `${size / 2}px`;
      flameDiv.style.width = `${size}px`;
      flameDiv.style.height = `${size * 0.85}px`;
      dotDiv.style.width = `${size}px`;
      dotSibDiv1.style.width = `${size}px`;
      dotSibDiv2.style.width = `${size}px`;
      context.marker.setOffset(new AMap.Pixel(-0.6 * size, -1.2 * size));
      context.marker.setContent(containerDiv);
      if (!firstClustMakerRef.current) {
        firstClustMakerRef.current = context.marker;
      }
      context.marker.on('click', (event: any) => {
        map.setStatus({ jogEnable: true, animateEnable: true });
        const curZoom = map.getZoom();
        let positionArray = [event?.lnglat?.lng, event?.lnglat?.lat];
        if (context?.clusterData && context?.clusterData?.length > 0) {
          positionArray = [context?.clusterData[0].longitude, context?.clusterData[0].latitude];
          map.setZoomAndCenter(curZoom + 2, positionArray);
        } else {
          map.setZoomAndCenter(curZoom + 3, positionArray);
        }
      });
    };

    renderMarkerEva = (context: any) => {
      let offset = normalOffset;
      iconMarkerEva = iconNormalMarker;
      if (prevMarkerEva) {
        if (
          prevMarkerEva?.id &&
          context.data?.length &&
          prevMarkerEva?.id === context.data[0]?.id
        ) {
          iconMarkerEva = iconBigMarker;
          offset = bigOffset;
          prevMarkerEva = { marker: context.marker, id: context.data[0]?.id };
        }
      }

      context.marker.topWhenClick = true;
      context.marker.bubble = true;
      context.marker.setzIndex(20);
      context.marker.setIcon(iconMarkerEva);
      context.marker.setOffset(offset);
      context.marker.on('click', (event: any) => {
        if (
          prevMarkerEva &&
          prevMarkerEva?.id &&
          context.data?.length &&
          prevMarkerEva?.id !== context.data[0]?.id
        ) {
          prevMarkerEva.marker.setIcon(iconNormalMarker);
        }
        setModalStyle(event.pixel);
        setImgId(context.data[0].id);
        if (preMarkRef.current && preMarkRef.current.marker) {
          preMarkRef.current.marker.setIcon(iconNormalMarker);
        }
        preMarkRef.current = undefined;
        setIsModalVisible(true);
        if (childRef && childRef.current) {
          childRef.current?.resetMaskClosableFlag(true);
        }
        prevMarkerEva = { marker: event.target, id: context.data[0]?.id };
        event.target.setIcon(iconBigMarker);
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
      if (preMarkRef.current && preMarkRef.current.id.toString() === context.data[0]?.id) {
        iconMarkerEva = iconBigMarker;
        context.marker.setIcon(iconBigMarker);
        preMarkRef.current = { ...preMarkRef.current, marker: context.marker };
      }
    };
    function addCluster() {
      const gridSize = setGridSizeNum(props.mapData?.length);
      AMap.plugin('AMap.MarkerCluster', () => {
        // 异步加载插件
        // eslint-disable-next-line no-new
        mapClusterEva = new AMap.MarkerCluster(map, props.mapData, {
          gridSize, // 设置网格像素大小
          renderClusterMarker, // 自定义聚合点样式
          renderMarker: renderMarkerEva, // 自定义非聚合点样式
          maxZoom: 20,
          minClusterSize: 2, // 聚合的最小数量。默认值为2，即小于2个点则不能成为一个聚合
        });
      });
    }
    firstClustMakerRef.current = undefined;
    // 数据中需包含经纬度信息字段 lnglat
    if (mapData && mapData.length > 0) {
      // const center = [mapData[0].longitude, mapData[0].latitude];
      // const zoom = 13;
      // map.setZoomAndCenter(zoom, center);
      if (!isFirstFlag) {
        addCluster();
        setIsFirstFlag(true);
      } else {
        if (mapClusterEva) {
          // console.log("%cmapdata清空","color: red; font-style: italic; background-color: white;padding: 2px")
          mapClusterEva.setMap(null);
        }
        addCluster();
      }
      map.setCenter(
        firstClustMakerRef.current?._position || [mapData[0].longitude, mapData[0].latitude],
      );
    } else {
      /* eslint-disable */
      if (mapClusterEva) {
        mapClusterEva.setMap(null);
      }
    }
  }, [mapData]);

  const hideModal = () => {
    if (preMarkRef.current && preMarkRef.current.marker) {
      preMarkRef.current.marker.setIcon(iconNormalMarker);
      preMarkRef.current = undefined;
    }
    setIsModalVisible(false);
    if (prevMarkerEva) {
      prevMarkerEva.marker.setIcon(iconNormalMarker);
      prevMarkerEva = undefined;
    }
  };

  // 监听路由的切换
  useEffect(() => {
    const unlisten = history.listen((location: any) => {
      if (location?.pathname !== '/undergroundDisease') {
        trafficLayerEva = null;
        mapSaliteLayerEva = null;
        mapClusterEva = null;
        map && map.destroy();
      }
    });
    return () => {
      unlisten();
    };
  }, []);

  return (
    <div className={styles.evationContainerClass}>
      <div id="containerEvation" className="evationContainer" />
      <div id="modalDiv" className="modalSpeDiv" />
      {isModalVisible ? (
        <DraggerModal
          isModalVisible={isModalVisible}
          hideModal={hideModal}
          imgId={imgId}
          onRef={childRef}
          address={address}
          style={modalStyle}
        />
      ) : null}
    </div>
  );
};
export default EvaMap;
