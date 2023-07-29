import React, { useState, useEffect, useImperativeHandle, useRef } from 'react';
import DraggerModal from './DraggerModal';
import styles from '../styles.less';
import { getProjDiseaInfo } from '../service';
import { history } from 'umi';

interface Iprops {
  mapProjData: any[];
  mapType: string;
  onRef: any;
  mapInfo: any;
  isClickProject: boolean;
  setProject: (id: any) => void;
}
let map: any;
let polyline: any = [];
let trafficLayerEva: any = null;
let mapSaliteLayerEva: any = null;
let projectMarkers: any = [];
let renderMarkerEva: any = null;
let mapClusterEva: any = null;
let prevMarkerEva: any = null;
let iconMarkerEva = null;
enum enumType {
  '上行' = 0,
  '下行' = 1,
}
// let carPreLntg: any = null;
const iconNormalMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(28, 28),
  // 图标的取图地址
  image: 'images/map-point.svg',
  // 图标所用图片大小
  imageSize: new AMap.Size(28, 28),
  // 图标取图偏移量
});
const iconProjectMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(18, 21),
  // 图标的取图地址
  image: 'images/projectPoint.svg',
  // 图标所用图片大小
  imageSize: new AMap.Size(18, 21),
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
  const { mapProjData, mapInfo } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imgInfo, setImgInfo] = useState<any>();
  const [projectId, setProjectId] = useState<any>('');
  const preMarkRef: any = useRef();
  const childRef: any = useRef();
  const curRef: any = useRef();
  const [address, setAddress] = useState('');
  const [modalStyle, setModalStyle] = useState({ x: 0, y: 0 });

  const { AMap }: any = window;
  const maintenanceLevel = {
    1: 'rgba(55, 255, 235, 1)',
    2: 'rgba(59, 134, 246, 1)',
    3: 'rgba(240, 175, 62, 1)',
    4: 'rgba(255, 86, 86, 1)',
  };
  const [projectDatas, setProjectDatas] = useState<any>([]);

  useEffect(() => {
    const center: any = mapInfo?.center || [114.058141, 22.543544];
    const zoom = mapInfo?.zoom || 10;

    map = new AMap.Map('containerEvation', {
      zoom,
      center,
      mapStyle: 'amap://styles/5cfb475a7621dccba5ff381b2f3c8ab4',
      pitch: props?.mapType === '3d' ? 52.34782608695647 : 50, // 地图俯仰角度，有效范围 0 度- 83 度
      viewMode: '3D', // 地图模式
      jogEnable: true,
      animateEnable: true,
      zooms: [4.54, 23],
      defaultCursor: 'grab',
      skyColor: props?.mapType === '3d' ? '#1f263a' : '#343530', // 3D 模式下带有俯仰角时会显示
    });
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
    map.on('dragstart', () => {
      map.setDefaultCursor('grabbing');
    });
    map.on('dragend', () => {
      map.setDefaultCursor('grab');
    });
    // 实时路况图层
    trafficLayerEva = new AMap.TileLayer.Traffic({
      zIndex: 10,
      zooms: [7, 22],
    });
    trafficLayerEva.setMap(map);
  }, []);

  const compareDate = (d1: string, d2: string) => {
    const date1 = new Date(Date.parse(d1));
    const date2 = new Date(Date.parse(d2));
    return date1 > date2;
  };

  useEffect(() => {
    if (mapProjData?.length > 0) {
      const newData: any[] = [];
      mapProjData.forEach((it: any) => {
        const itema = newData.findIndex((itr: any) => itr.facilitiesId === it.facilitiesId);
        let isBreak = false;
        if (itema > -1) {
          const isBigger = compareDate(newData[itema]?.detectTime, it?.detectTime);
          if (isBigger) {
            isBreak = true;
          } else {
            newData.splice(itema, 1);
          }
        }
        if (!isBreak) {
          const pointList: any[] = [];
          // 排序
          if (it?.locationList?.length > 0) {
            // const newlist = it?.locationList.sort((a: any, b: any) => {
            //   return a.sortNum - b.sortNum;
            // });
            it?.locationList.forEach((ita: any) => {
              pointList.push([ita?.longitude, ita?.latitude]);
            });
          }
          const item = {
            projectId: it?.projectId,
            facilitiesName: it?.facilitiesName,
            facilitiesId: it?.facilitiesId,
            projectName: it?.projectName,
            detectTime: it?.detectTime,
            curingLv: it?.curingLv,
            pointList,
          };
          newData.push(item);
        }
      });
      setProjectDatas(newData);
    } else {
      setProjectDatas([]);
    }
  }, [mapProjData]);

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
  const resetProjectId = () => {
    setProjectId('');
  };
  const hideOverlay = (arrLine: any, arrMarker: any, projId: string) => {
    arrLine.forEach((ita: any) => {
      const extInfo = ita.getExtData();
      if (extInfo?.projectID !== projId) {
        ita.hide();
      }
    });
    arrMarker.forEach((itb: any) => {
      const extInfo = itb.getExtData();
      if (extInfo?.projectID !== projId) {
        itb.hide();
      }
    });
  };
  const openOverlay = () => {
    polyline.forEach((ita: any) => {
      ita.show();
    });
    projectMarkers.forEach((itb: any) => {
      itb.show();
    });
  };
  const clearOverlay = () => {
    projectMarkers?.forEach((it: any, index: any) => {
      if (projectMarkers[index]) {
        map.remove(projectMarkers[index]);
      }
    });
    polyline?.forEach((it: any, index: any) => {
      if (polyline[index]) {
        map.remove(polyline[index]);
      }
    });
    if (mapClusterEva) {
      mapClusterEva.setMap(null);
    }
  };
  useImperativeHandle(props.onRef, () => ({
    // 暴露给父组件的方法
    resetProjectId,
  }));

  useEffect(() => {
    clearOverlay();
    if (!projectDatas || !projectDatas?.length) {
      return;
    }
    projectDatas.forEach((it: any, index: number) => {
      const middeLength = Math.floor(it.pointList?.length / 2);
      if (
        it.pointList[middeLength]?.length > 1 &&
        it.pointList[middeLength][0] &&
        it.pointList[middeLength][1]
      ) {
        const middlePosition = [it.pointList[middeLength][0], it.pointList[middeLength][1]];
        projectMarkers[index] = new AMap.Marker({
          position: middlePosition,
          title: it?.projectName,
          icon: iconProjectMarker,
          offset: new AMap.Pixel(-9, -21),
          zIndex: 15,
          extData: {
            className: 'projectClass',
            projectID: it?.projectId,
            lnglat: middlePosition,
            projectName: it?.projectName,
            facilitiesName: it?.facilitiesName,
          },
        });
        projectMarkers[index].setLabel({
          direction: 'top',
          zIndex: 100,
          offset: new AMap.Pixel(5, 0),
          content: `<span class='project-name-class'>${it?.projectName}</span>`, // 设置文本标注内容
        });
        if (projectMarkers[0] && index === 0) {
          map.setZoomAndCenter(16, middlePosition);
        }
        polyline[index] = new AMap.Polyline({
          path: it?.pointList, // 设置线覆盖物路径
          showDir: false,
          dirColor: 'pink',
          strokeOpacity: 1,
          strokeColor: maintenanceLevel[it?.curingLv] || '#aaa',
          strokeWeight: 4, // 线宽
          extData: {
            projectID: it?.projectId,
            projectName: it?.projectName,
            facilitiesName: it?.facilitiesName,
          },
        });
        projectMarkers[index].on('click', () => {
          const extraInfo = projectMarkers[index].getExtData();
          const positionArray = extraInfo.lnglat;
          map.setZoomAndCenter(18, positionArray);
          props?.setProject(extraInfo?.projectID);
          setProjectId(extraInfo?.projectID);
          curRef.current = {
            facilitiesName: extraInfo?.facilitiesName,
            projectName: extraInfo?.projectName,
          };
          hideOverlay(polyline, projectMarkers, extraInfo?.projectID);
        });
        polyline[index].on('click', (event: any) => {
          const positionArray = [event?.lnglat?.lng, event?.lnglat?.lat];
          map.setZoomAndCenter(18, positionArray);
          const extraInfo = polyline[index].getExtData();
          props?.setProject(extraInfo?.projectID);
          setProjectId(extraInfo?.projectID);
          curRef.current = {
            facilitiesName: extraInfo?.facilitiesName,
            projectName: extraInfo?.projectName,
          };
          hideOverlay(polyline, projectMarkers, extraInfo?.projectID);
        });
        map.add(projectMarkers[index]);
        map.add(polyline[index]);
      }
    });
  }, [projectDatas]);

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

  const handleDiseaseInfo = (mapData: any, id: string) => {
    // 根据不同条件聚合数据
    const renderClusterMarker = (context: any) => {
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
        setImgInfo({
          imgName: context.data[0].imgName,
          collectTime: context.data[0].collectTime,
          diseaseName: context.data[0].diseaseName,
          area: context.data[0].area,
          length: context.data[0].length,
          deepth: context.data[0].deepth,
          facilityName: curRef.current?.facilitiesName,
          projectName: curRef.current?.projectName,
          id: context.data[0]?.id,
          stationNo: context.data[0].stationNo,
          imgList: context.data[0].imgList,
          direction: enumType[context.data[0].direction],
          laneName: context.data[0].laneName,
        });
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
      const gridSize = setGridSizeNum(mapData?.length);
      AMap.plugin('AMap.MarkerCluster', () => {
        // 异步加载插件
        // eslint-disable-next-line no-new
        mapClusterEva = new AMap.MarkerCluster(map, mapData, {
          gridSize, // 设置网格像素大小
          renderClusterMarker, // 自定义聚合点样式
          renderMarker: renderMarkerEva, // 自定义非聚合点样式
          maxZoom: 20,
          minClusterSize: 2, // 聚合的最小数量。默认值为2，即小于2个点则不能成为一个聚合
        });
      });
    }
    // 数据中需包含经纬度信息字段 lnglat,格式为数组
    if (!id) {
      map.setZoom(16);
      return;
    }
    if (mapClusterEva) {
      mapClusterEva.setMap(null);
    }
    if (mapData && mapData.length > 0) {
      // if (mapClusterEva) {
      //   mapClusterEva.setMap(null);
      // }
      addCluster();
    } else {
      /* eslint-disable */
      if (projectMarkers?.length) {
        const itr = projectMarkers.find((it: any) => {
          const item = it?.getExtData();
          if (item?.projectID === projectId) {
            return true;
          }
          return false;
        });
        if (itr) {
          const itemExt = itr?.getExtData();
          map.setCenter(itemExt?.lnglat || mapInfo?.center || [114.487854, 38.03504]);
          return;
        }
      }
      if (mapInfo && mapInfo?.center) {
        map.setCenter(mapInfo?.center || [114.487854, 38.03504]);
      }
    }
  };
  // 获取某个项目的病害点
  const getDetailProjInfo = async (id: string) => {
    const rec = await getProjDiseaInfo({ id });
    if (rec?.status === 0) {
      handleDiseaseInfo(rec?.data[0]?.diseaseList.slice(), id);
    }
  };

  useEffect(() => {
    if (projectId) {
      getDetailProjInfo(projectId);
    } else {
      if (mapClusterEva) {
        mapClusterEva.setMap(null);
      }
      openOverlay();
    }
  }, [projectId]);

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
      if (location?.pathname !== '/detectionEvalution') {
        trafficLayerEva = null;
        mapSaliteLayerEva = null;
        mapClusterEva = null;
        if (projectMarkers?.length) {
          projectMarkers?.forEach((it: any, index: any) => {
            if (projectMarkers[index]) {
              map.remove(projectMarkers[index]);
            }
          });
        }
        if (polyline?.length) {
          polyline?.forEach((it: any, index: any) => {
            if (polyline[index]) {
              map.remove(polyline[index]);
            }
          });
        }
        polyline = [];
        projectMarkers = [];
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
          imgInfo={imgInfo}
          onRef={childRef}
          address={address}
          style={modalStyle}
        />
      ) : null}
    </div>
  );
};
export default EvaMap;
