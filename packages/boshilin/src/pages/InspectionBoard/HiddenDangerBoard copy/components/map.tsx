import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import DraggerModal from './DraggerModal';
import styles from '../styles.less';
import { history, useModel } from 'umi';
import { railType } from '../data.d';
import { useCompare } from 'baseline/src/utils/commonMethod';

interface Iprops {
  mapData: any[];
  trailData: any;
  sceneTrailData: any;
  // isToday: boolean;
  mapType: string;
  onRef: any;
  mapInfo?: any;
  placeInfo: any;
  handleCenter: () => void;
}
let map: any;

let trafficLayerEva: any = null;
let mapSaliteLayerEva: any = null;

let renderMarkerEva: any = null;
let mapClusterEva: any = null;
let prevMarkerEva: any = null;
let iconMarkerEva = null;
let district: any = null;
// let disProvince: any;
// let disCounty: any;
// let carPreLntg: any = null;
const iconNormalMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(22, 26),
  // 图标的取图地址
  image: 'images/icon-hidden.svg',
  // 图标所用图片大小
  imageSize: new AMap.Size(22, 26),
  // 图标取图偏移量
  // imageOffset: new AMap.Pixel(-14, -28)
});

const iconBigMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(41, 48),
  // 图标的取图地址
  image: 'images/icon-hidden-bigger.svg',
  // 图标所用图片大小
  imageSize: new AMap.Size(41, 48),
});
const normalOffset = new AMap.Pixel(-11, -26);
const bigOffset = new AMap.Pixel(-20, -48);
let placeSearch: any;
let roadPolyline: any = [];
let scenePolyline: any = [];
// let allMarker: any[] = [];

const EvaMap: React.FC<Iprops> = (props: Iprops) => {
  const { nodeType } = useModel<any>('hiddenboard');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isFirstFlag, setIsFirstFlag] = useState(false);
  // const [placeInfoData, setPlaceInfoData] = useState<any>();
  const [clickInfo, setClickInfo] = useState<any>();
  // const [imgInfo, setImgInfo] = useState<any>();
  const centerRef: any = useRef();
  const childRef: any = useRef();
  const nodeTypeRef: any = useRef();
  const [address, setAddress] = useState('');
  const [modalStyle, setModalStyle] = useState({ x: 0, y: 0 });
  const { mapData, mapInfo, placeInfo, handleCenter, trailData, sceneTrailData } = props;
  const { AMap }: any = window;
  const firstClustMakerRef: any = useRef();
  nodeTypeRef.current = nodeType;
  // useEffect(() => {
  //   nodeTypeRef.current = nodeType;
  // }, [nodeType]);
  // const [firstClustMaker, setFirstClustMaker] = useState<any>();
  // console.log('imgid', imgId);
  const getData = (data: any) => {
    // const outer = [
    //   new AMap.LngLat(-360, 90, true),
    //   new AMap.LngLat(-360, -90, true),
    //   new AMap.LngLat(360, -90, true),
    //   new AMap.LngLat(360, 90, true),
    // ];
    const pathArray: any[] = [];
    // eslint-disable-next-line
    pathArray.push.apply(pathArray, data);
    const polygon = new AMap.Polygon({
      path: pathArray,
      strokeColor: '#3758FF',
      strokeWeight: 3,
      fillColor: '#0b0e18',
      fillOpacity: 0,
    });
    map.add(polygon);
  };
  const drawPloygon = (code: any) => {
    district.setLevel('city'); // 行政区级别
    district.setExtensions('all');
    district.search(code, (status: any, result: any) => {
      if (status === 'complete') {
        const boundDatas = result.districtList[0].boundaries;
        getData(boundDatas);
      }
    });
  };
  useEffect(() => {
    // console.log('trailData变动',nodeType,trailData);
    if (!map) {
      return;
    }
    if (roadPolyline && roadPolyline?.length) {
      // console.log('清空设施轨迹',roadPolyline)
      map.remove(roadPolyline);
      roadPolyline = [];
    }
    if (Object.keys(trailData)?.length > 0) {
      Object.keys(trailData).forEach((it: any) => {
        if (trailData[it]?.length > 0) {
          const pathArr: any[] = [];
          trailData[it]?.forEach((itr: any) => {
            pathArr.push([itr?.longitude, itr?.latitude]);
          });
          const polylineItem = new AMap.Polyline({
            path: pathArr, // 设置线覆盖物路径
            strokeOpacity: 1,
            zIndex: 98,
            strokeColor: railType?.fac || '#aaa',
            strokeWeight: 4, // 线宽
          });
          roadPolyline.push(polylineItem);
          // console.log('polyline',roadPolyline)
          if (polylineItem) {
            map.add(polylineItem);
          }
        }

        // console.log('你来设施轨迹了')
      });
    }
  }, [useCompare(trailData)]);
  useEffect(() => {
    if (!map) {
      return;
    }
    // console.log('ffffffff',scenePolyline,sceneTrailData)
    if (scenePolyline && scenePolyline?.length) {
      map.remove(scenePolyline);
      scenePolyline = [];
    }
    // if (nodeTypeRef.current === 'scene' && sceneTrailData?.length > 0) {
    //   const pathData: any[] = [];
    //   if (sceneTrailData?.length) {
    //     sceneTrailData.forEach((itm: any) => {
    //       pathData.push(itm?.lnglat);
    //     });
    //     const polylineIt = new AMap.Polyline({
    //       path: pathData, // 设置线覆盖物路径
    //       strokeOpacity: 1,
    //       strokeColor: railType?.scene || '#aaa',
    //       strokeWeight: 4, // 线宽
    //     });
    //     scenePolyline.push(polylineIt);
    //     if (polylineIt) {
    //       map.add(polylineIt);
    //     }
    //   }
    // } else if (nodeTypeRef.current === 'sceneType' && sceneTrailData?.length > 0) {
    //   sceneTrailData.forEach((it: any) => {
    //     if (it?.downList?.length > 0) {
    //       const downPathArr = it?.downList.map((itn: any) => {
    //         return itn?.lnglat;
    //       });
    //       const polylineItm = new AMap.Polyline({
    //         path: downPathArr, // 设置线覆盖物路径
    //         strokeOpacity: 1,
    //         strokeColor: railType?.scene || '#aaa',
    //         strokeWeight: 4, // 线宽
    //       });
    //       scenePolyline.push(polylineItm);
    //       if (polylineItm) {
    //         map.add(polylineItm);
    //       }
    //     }
    //     if (it?.upList?.length > 0) {
    //       const upPathArr = it?.upList.map((itn: any) => {
    //         return itn?.lnglat;
    //       });
    //       const polylineUp = new AMap.Polyline({
    //         path: upPathArr, // 设置线覆盖物路径
    //         strokeOpacity: 1,
    //         strokeColor: railType?.scene || '#aaa',
    //         strokeWeight: 4, // 线宽
    //       });
    //       scenePolyline.push(polylineUp);
    //       if (polylineUp) {
    //         map.add(polylineUp);
    //       }
    //     }
    //   });
    // }
    if (sceneTrailData?.length > 0) {
      // console.log('chognxinhua',sceneTrailData);
      sceneTrailData.forEach((it: any) => {
        // console.log('chognxinhua2222',it?.downList,it?.upList);
        if (it?.downList?.length > 0) {
          const downPathArr = it?.downList.map((itn: any) => {
            return itn?.lnglat;
          });
          const polylineItm = new AMap.Polyline({
            path: downPathArr, // 设置线覆盖物路径
            strokeOpacity: 1,
            zIndex: 99,
            strokeColor: railType?.scene || '#aaa',
            strokeWeight: 4, // 线宽
          });
          scenePolyline.push(polylineItm);
          if (polylineItm) {
            map.add(polylineItm);
          }
        }
        if (it?.upList?.length > 0) {
          const upPathArr = it?.upList.map((itn: any) => {
            return itn?.lnglat;
          });
          const polylineUp = new AMap.Polyline({
            path: upPathArr, // 设置线覆盖物路径
            strokeOpacity: 1,
            zIndex: 99,
            strokeColor: railType?.scene || '#aaa',
            strokeWeight: 4, // 线宽
          });
          scenePolyline.push(polylineUp);
          if (polylineUp) {
            map.add(polylineUp);
          }
        }
      });
    }
  }, [sceneTrailData]);
  useEffect(() => {
    if (!placeInfo) {
      return;
    }
    if (placeSearch && placeInfo && Object.keys(placeInfo).length && placeInfo?.name) {
      placeSearch.setCity(placeInfo?.accode);
      placeSearch.search(placeInfo?.name); // 关键字查询查询
      return;
    }
    if (placeSearch) {
      placeSearch.clear();
      handleCenter();
    }
  }, [placeInfo]);
  useEffect(() => {
    let center: any = (mapInfo && mapInfo?.center) || [114.487854, 38.03504];
    let zoom = 10;
    if (mapData?.length) {
      center = [mapData[0]?.longitude, mapData[0]?.latitude];
      zoom = 11;
    }
    map = new AMap.Map('containerEvation', {
      zoom: mapInfo && (mapInfo?.zoom || zoom),
      center,
      mapStyle: 'amap://styles/5cfb475a7621dccba5ff381b2f3c8ab4',
      pitch: props?.mapType === '3d' ? 52.34782608695647 : 50, // 地图俯仰角度，有效范围 0 度- 83 度
      viewMode: '3D', // 地图模式
      jogEnable: true,
      animateEnable: true,
      zooms: [4.54, 23],
      skyColor: props?.mapType === '3d' ? '#1f263a' : '#343530', // 3D 模式下带有俯仰角时会显示
    });
    // console.log('mmm');
    // 高亮显示省市区域
    if (mapInfo?.districtSearch) {
      const opts = {
        // level: 'province',
        subdistrict: 1, // 返回下一级行政区
        extensions: 'all',
        showbiz: false, // 最后一级返回街道信息
      };
      AMap.plugin('AMap.DistrictSearch', () => {
        district = new AMap.DistrictSearch(opts);
        district.search(mapInfo.districtSearch, (status: any, result: any) => {
          if (status === 'complete') {
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
              path: pathArray,
              strokeColor: '#3758FF',
              strokeWeight: 3,
              fillColor: '#0b0e18',
              fillOpacity: 0.6,
            });
            map.add(polygon);
            if (result.districtList[0]?.districtList?.length > 0) {
              result.districtList[0]?.districtList.forEach((it: any) => {
                if (it?.adcode) {
                  drawPloygon(it?.adcode);
                }
              });
            }
          }
        });
      });
    }
    AMap.plugin(['AMap.PlaceSearch'], () => {
      placeSearch = new AMap.PlaceSearch({
        map,
      }); // 构造地点查询类
    });
    map.on('click', (evt: any) => {
      if (childRef && childRef.current) {
        childRef.current?.resetMaskClosableFlag(false);
      }
      setIsModalVisible(false);
      if (prevMarkerEva) {
        prevMarkerEva.marker.setIcon(iconNormalMarker);
        prevMarkerEva = undefined;
      }
      // if (preMarkRef.current && preMarkRef.current.marker) {
      //   preMarkRef.current.marker.setIcon(iconNormalMarker);
      //   preMarkRef.current = undefined;
      // }
      evt?.originEvent?.stopPropagation();
    });
    // 实时路况图层
    trafficLayerEva = new AMap.TileLayer.Traffic({
      zIndex: 10,
      zooms: [7, 22],
    });
    trafficLayerEva.setMap(map);
  }, []);

  const setCenterMap = (center: any) => {
    // console.log('setcentermap',center,nodeType);
    if (center?.length && center[0] && center[1]) {
      // console.log('setcentermap111',center);
      let newCenter = center;
      if (nodeType === 'sceneType') {
        newCenter = [center[0] + 0.000001, center[1] + 0.000001];
      }
      centerRef.current = newCenter;
      map.setZoomAndCenter(nodeType === 'fac' ? 15 : 20, newCenter);
    }

    // if(nodeType === 'scene')
    // {
    //  const marker = new AMap.Marker({
    //     map,
    //     content:`<div class="flicker-icon">
    //     </div>`,
    //     zIndex:30,
    //     position: center,
    //     anchor: 'bottom-center',
    //   });
    //   map.add(marker)
    // }
    // setTimeout(() => {
    //   if(nodeType === 'scene')
    //   {
    //     console.log('settimeout',allMarker)
    //   }

    // }, 1000);
  };
  const clearSceneTrail = () => {
    // console.log('clearSceneTrail',scenePolyline)
    if (scenePolyline && scenePolyline?.length) {
      map.remove(scenePolyline);
      scenePolyline = [];
    }
  };
  useImperativeHandle(props.onRef, () => ({
    // 暴露给父组件的方法
    setCenterMap,
    clearSceneTrail,
  }));
  useEffect(() => {
    if (map) {
      if (props?.mapType === '3d') {
        if (mapSaliteLayerEva) {
          mapSaliteLayerEva.setMap(null);
        }
        map.setPitch(52.34782608695647);
      } else {
        if (!mapSaliteLayerEva) {
          mapSaliteLayerEva = new AMap.TileLayer.Satellite({ zIndex: 10 });
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
      // console.log('renddddddddd',context);
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

        setClickInfo({
          facId: context.data[0]?.fkProFacId,
          sceneId: context.data[0]?.fkKeySceneId,
        });

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
      // console.log('allMarker4444',centerRef.current,nodeTypeRef?.current,context?.data[0])
      if (
        centerRef.current &&
        nodeTypeRef?.current === 'scene' &&
        context?.data[0]?.longitude === centerRef.current[0] &&
        context?.data[0]?.latitude === centerRef.current[1]
      ) {
        context?.marker.setContent(
          `<div class="flicker-icon">
         </div>`,
        );
      }
      // if (preMarkRef.current && preMarkRef.current.id.toString() === context.data[0]?.id) {
      //   iconMarkerEva = iconBigMarker;
      //   context.marker.setIcon(iconBigMarker);
      //   preMarkRef.current = { ...preMarkRef.current, marker: context.marker };
      // }
    };
    function addCluster() {
      const gridSize = setGridSizeNum(props.mapData?.length);
      // allMarker = [];
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
    // const da: any[]=mapProj2Data;
    // 数据中需包含经纬度信息字段 lnglat
    // console.log('ffff',mapData);
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
        firstClustMakerRef.current?._position || [mapData[0]?.longitude, mapData[0]?.latitude],
      );
    } else {
      /* eslint-disable */
      if (mapClusterEva) {
        mapClusterEva.setMap(null);
      }
      if (mapInfo && mapInfo?.center) {
        map.setCenter((mapInfo && mapInfo?.center) || [114.487854, 38.03504]);
      }
    }
  }, [mapData]);

  const hideModal = () => {
    // if (preMarkRef.current && preMarkRef.current.marker) {
    //   preMarkRef.current.marker.setIcon(iconNormalMarker);
    //   preMarkRef.current = undefined;
    // }
    setIsModalVisible(false);
    if (prevMarkerEva) {
      prevMarkerEva.marker.setIcon(iconNormalMarker);
      prevMarkerEva = undefined;
    }
  };

  // 监听路由的切换
  useEffect(() => {
    const unlisten = history.listen((location: any) => {
      if (location?.pathname !== '/hiddenDangerBoard') {
        trafficLayerEva = null;
        mapSaliteLayerEva = null;
        mapClusterEva = null;
        if (roadPolyline && roadPolyline?.length) {
          map.remove(roadPolyline);
          roadPolyline = [];
        }
        if (scenePolyline && scenePolyline?.length) {
          map.remove(scenePolyline);
          scenePolyline = [];
        }
        district = null;
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
          clickInfo={clickInfo}
          onRef={childRef}
          address={address}
          style={modalStyle}
        />
      ) : null}
    </div>
  );
};
export default EvaMap;
