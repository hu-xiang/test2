import React, { useState, useEffect, useImperativeHandle, useRef } from 'react';
import CarCurrentStatus from './DraggerModalStatus';
import styles from '../../styles.less';
import { getCarInfos, queryGeoDisease, getCurrentCarLine } from '../../service';
// import { message } from 'antd';
import { isEqual, debounce } from 'lodash';
// import moment from 'moment';
import { history } from 'umi';
import Request from 'umi-request';
import DraggerModal from './newDraggerModal';
// import { useCompare } from '../../../../utils/commonMethod';
import pointSvg from '../../../../../public/images/map-point.svg';
import pointBigSvg from '../../../../../public/images/bigMaker.svg';
// import Geohash from 'https://cdn.jsdelivr.net/npm/latlon-geohash@2.0.0';

interface Iprops {
  // mapData: any[];
  isToday: boolean;
  fkFacilitiesId: any;
  parTime: any;
  mapType: string;
  carData: any;
  onRef: any;
  clearTimeInterval: any;
  mapInfo: any;
  roadStatus: string;
  comfortData: any;
  clearMapTimeInterval: (flag: boolean) => void;
  extraData?: any;
}
let map: any;
let layer: any = null;
// const markerDatas: any = [];
const polyline: any = [];
const comfortPolylineArr: any = [];
const polylineStartPoints: any = [];
let trafficLayer: any = null;
let mapSaliteLayer: any = null;
let defaultLayer: any = null;
const vehicleMarker: any = [];
// const renderMarker: any = null;
// let mapCluster: any = null;
let prevMarker: any = null;
// let iconMarker = null;
let idistrict: any = null;
const precisionVal: number = 3;
let pathArr: any[] = [];
// const polygonGrid: any = null;
let clusterMarkers: any[] = [];
// let carPreLntg: any = null;
const iconNormalMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(28, 28),
  // 图标的取图地址
  image: pointSvg,
  // 图标所用图片大小
  imageSize: new AMap.Size(28, 28),
  // 图标取图偏移量
  // imageOffset: new AMap.Pixel(-14, -28)
});
const iconBigMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(41, 48),
  // 图标的取图地址
  image: pointBigSvg,
  // 图标所用图片大小
  imageSize: new AMap.Size(41, 48),
});
const normalOffset = new AMap.Pixel(-14, -28);
const bigOffset = new AMap.Pixel(-20, -48);
const { CancelToken } = Request;
let isFirstComeIn = false;
let isUnmount: boolean = false;
let isCallBackFlag: boolean = false;
const Map: React.FC<Iprops> = React.memo((props: Iprops) => {
  /* eslint-disable */
  const [batchId, setBatchId] = useState<any>();
  const [collectTime, setCollectTime] = useState<any>();
  const [carId, setCarId] = useState<any>();
  const [centerType, setCenterType] = useState<number>(2);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [isFirstFlag, setIsFirstFlag] = useState(false);
  const [immediateFlag, setImmediateFlag] = useState(false);
  // 存地图可视区域四个角位置数据
  const [pathBound, setPathBound] = useState<any>([]);
  // const [isCallBackFlag, setIsCallBackFlag] = useState<boolean>(false);
  const [imgId, setImgId] = useState<any>('');
  // const [mapData, setMapData] = useState<any[]>([]);
  const preMarkRef: any = useRef();
  const queRef = useRef<any>();
  const apiRef = useRef<any>(false);
  const childRef: any = useRef();
  const carRef: any = useRef();
  const paramRef: any = useRef();
  const preFailRef: any = useRef(false);
  const compareMapRef = useRef<any>(null);
  const mapDataRef = useRef<any>([]);
  // const firstClustMakerRef: any = useRef();
  const [address, setAddress] = useState('');
  const [modalStyle, setModalStyle] = useState({ x: 0, y: 0 });
  const { AMap }: any = window;
  // const [firstClustMaker, setFirstClustMaker] = useState<any>();
  const [dataDeviceId, setDataDeviceId] = useState();
  const [dataDeviceName, setDataDeviceName] = useState<string>('');
  const [carInfo, setCarInfo] = useState();
  // const [showFlag, setShowFlag] = useState([]);
  const { fkFacilitiesId, mapInfo } = props;

  // const comfortData = useCompare(props.comfortData);

  // const newMapData = useMemo(() => {
  //   console.log('useMemo',mapData);
  //   if (mapData && mapData?.length) {
  //     return mapData && JSON.stringify(mapData);
  //   }
  //   return [];
  // }, [mapData]);
  const newPathData = (val: any) => {
    if (!isEqual(compareMapRef.current, val)) {
      compareMapRef.current = val;
    }
    return compareMapRef.current;
  };

  const resetCarLine = () => {
    // if (props.carData && props.carData?.length > 0) {
    //   props.carData.forEach((item: any, ind: any) => {
    //     if (dataDeviceId === item.deviceId && polyline[ind]) {
    //       map.remove(polyline[ind]);
    //       if (polylineStartPoints[ind]) {
    //         map.remove(polylineStartPoints[ind]);
    //       }
    //     }
    //   });
    // } else {
    //   /* eslint-disable */
    //   if (polylineStartPoints?.length > 0) {
    //     polylineStartPoints.forEach((it: any, index: any) => {
    //       if (polylineStartPoints[index]) {
    //         map.remove(polylineStartPoints[index]);
    //       }
    //     });
    //   }
    //   if (polyline?.length > 0) {
    //     polyline.forEach((ii: any, index: any) => {
    //       if (polyline[index]) {
    //         map.remove(polyline[index]);
    //       }
    //     });
    //   }
    // }
    if (polylineStartPoints?.length > 0) {
      polylineStartPoints.forEach((it: any, index: any) => {
        if (polylineStartPoints[index]) {
          map?.remove(polylineStartPoints[index]);
        }
      });
    }
    if (polyline?.length > 0) {
      polyline.forEach((ii: any, index: any) => {
        if (polyline[index]) {
          map?.remove(polyline[index]);
        }
      });
    }
  };

  const closeModal = () => {
    if (childRef && childRef.current) {
      childRef.current?.resetMaskClosableFlag(false);
    }
    hideModal();
  };

  const closeCarModal = () => {
    // if (vehicleModalVisible) {
    setVehicleModalVisible(false);
    // }
  };
  // useEffect(() => {
  //   // 关信息弹窗
  //  closeModal();
  // }, [fkFacilitiesId]);

  // 车子轨迹路径
  const toggleLocus = async (locusVisible: boolean = false) => {
    resetCarLine();

    if (!props.carData || !props.carData?.length) return;

    if (locusVisible) {
      const res = await getCurrentCarLine({
        // batchId,
        collectTime,
        deviceId: dataDeviceId,
      });
      if (res?.status === 0 && res?.data && res?.data?.length) {
        // 显示轨迹和点
        let path: any = [];
        let pathIndex: number = 0;
        let disconnectPoint: any = [];
        res?.data.forEach((item: any, i: number) => {
          if (item?.flag === 1) {
            if (path.length > 1) {
              console.log(path);
              polyline[pathIndex] = new AMap.Polyline({
                path, // 设置线覆盖物路径
                showDir: false,
                dirColor: 'pink',
                strokeColor: 'rgba(255, 255, 255, 0.8)', // 线颜色
                strokeWeight: 4, // 线宽
              });
              map.add(polyline[pathIndex]);
            }
            if (path.length === 1 && i === 1) {
              disconnectPoint.push(...path);
            }
            disconnectPoint.push([item.longitude, item.latitude]);
            pathIndex += 1;
            path = [];
            if (i < res.data.length - 1) {
              path.push([item.longitude, item.latitude]);
            }
          } else {
            path?.push([item.longitude, item.latitude]);
            if (i === res.data.length - 1 && path.length > 1) {
              console.log(path);
              polyline[pathIndex] = new AMap.Polyline({
                path, // 设置线覆盖物路径
                showDir: false,
                dirColor: 'pink',
                strokeColor: 'rgba(255, 255, 255, 0.8)', // 线颜色
                strokeWeight: 4, // 线宽
              });
              map.add(polyline[pathIndex]);
            }
          }
        });

        const pointDiv = `<div class='carRadiusContainer'>
          <div class='pointClass'></div><div class="pointSquare sibClass3"></div><div class="pointSquare sibClass4"></div>
          </div>`;
        disconnectPoint?.forEach((item: any, index: number) => {
          polylineStartPoints[index] = new AMap.Marker({
            position: item,
            content: pointDiv,
            offset: new AMap.Pixel(0, 0),
            zIndex: 100,
          });
          map.add(polylineStartPoints[index]);
        });
        // map.add([...polyline]);
      }
    }
  };

  // 车子轨迹路径
  // const toggleLocus = (locusVisible: any) => {
  //   if (locusVisible !== showFlag) {
  //     setShowFlag(locusVisible);
  //   }
  //   const devList: any = [];
  //   if (props.carData?.length > 0) {
  //     props.carData.forEach((i: any) => {
  //       devList.push(i.deviceId);
  //     });
  //   }
  //   const unique = (arr: any) => {
  //     return arr.filter((item: any, index: any) => {
  //       return arr.indexOf(item, 0) === index;
  //     });
  //   };
  //   const list = unique(devList);
  //   const firstIndex = list.findIndex((i: any) => i === dataDeviceId);
  //   if (!polyline?.length) {
  //     polyline = Array.from({ length: props.carData?.length }, () => null);
  //   }
  //   if (!locusVisible[firstIndex]) {
  //     // 不显示轨迹和点就清除然后return
  //     if (props.carData?.length > 0) {
  //       props.carData.forEach((item: any, ind: any) => {
  //         if (dataDeviceId === item.deviceId && polyline[ind]) {
  //           map.remove(polyline[ind]);
  //           if (polylineStartPoints[ind]) {
  //             map.remove(polylineStartPoints[ind]);
  //           }
  //         }
  //       });
  //     }
  //     return;
  //   }

  //   if (!props.carData || !props.carData?.length) return;

  //   // 显示轨迹和点
  //   props.carData.forEach((item: any, ind: any) => {
  //     const path: any = [];
  //     if (dataDeviceId === item.deviceId) {
  //       if (polyline[ind]) {
  //         map.remove(polyline[ind]);
  //       }
  //       if (polylineStartPoints[ind]) {
  //         map.remove(polylineStartPoints[ind]);
  //       }
  //       item.carList.forEach((i: any) => {
  //         path.push([i.longitude, i.latitude]);
  //       });
  //       polyline[ind] = new AMap.Polyline({
  //         path, // 设置线覆盖物路径
  //         showDir: false,
  //         dirColor: 'pink',
  //         strokeColor: 'rgba(255, 255, 255, 0.8)', // 线颜色
  //         strokeWeight: 4, // 线宽
  //       });
  //       const pointDiv = `<div class='carRadiusContainer'>
  //       <div class='pointClass'></div><div class="pointSquare sibClass3"></div><div class="pointSquare sibClass4"></div>
  //       </div>`;
  //       polylineStartPoints[ind] = new AMap.Marker({
  //         position: [item?.carList[0]?.longitude, item?.carList[0]?.latitude],
  //         content: pointDiv,
  //         offset: new AMap.Pixel(0, 0),
  //         zIndex: 100,
  //       });
  //       map.add(polylineStartPoints[ind]);
  //       map.add(polyline[ind]);
  //     }
  //   });
  // };

  const getData = (data: any) => {
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
    idistrict.setLevel('city'); // 行政区级别
    idistrict.setExtensions('all');
    idistrict.search(code, (status: any, result: any) => {
      if (status === 'complete') {
        const boundDatas = result.districtList[0].boundaries;
        getData(boundDatas);
      }
    });
  };

  // 画边界
  // const drawGrid = (gridPath: any) => {
  //   polygonGrid = new AMap.Polygon({
  //     path: gridPath, // 设置多边形边界路径
  //     strokeColor: '#FF33FF', // 线颜色
  //     strokeOpacity: 0.2, // 线透明度
  //     strokeWeight: 0.75, // 线宽
  //     // fillColor: '#99CC66', // 填充色
  //     fillOpacity: 0.75, // 填充透明度
  //     zIndex: 100,
  //   });
  //   polygonGrid.setMap(map);
  // };
  const getPrecisionValue = (zVal: any) => {
    const zoomVal: number = Number(zVal);
    // console.log('zoomVal',zoomVal)
    let preVal: number = 3;
    switch (true) {
      case zoomVal <= 7:
        preVal = 3;
        break;
      case zoomVal > 7 && zoomVal <= 12:
        preVal = 4;
        break;
      case zoomVal > 12 && zoomVal <= 14:
        preVal = 5;
        break;
      case zoomVal > 14 && zoomVal <= 16:
        preVal = 6;
        break;
      case zoomVal > 16 && zoomVal <= 18:
        preVal = 7;
        break;
      case zoomVal > 18 && zoomVal <= 20:
        preVal = 8;
        break;
      case zoomVal > 20 && zoomVal <= 22:
        preVal = 9;
        break;
      case zoomVal > 22 && zoomVal <= 24:
        preVal = 10;
        break;
      case zoomVal > 24 && zoomVal <= 26:
        preVal = 11;
        break;
      default:
        preVal = 4;
        break;
    }
    return preVal;
  };
  const handleAbort = () => {
    if (queRef && queRef?.current) {
      queRef?.current();
      queRef.current = null;
    }
  };
  // 请求地图聚合数据
  const queryMapClusterData = async (
    sTime: any,
    eTime: any,
    facId: any,
    diseaseType: any,
    isBackFlag: boolean = false,
  ) => {
    paramRef.current = {
      startTime: sTime,
      endTime: eTime,
      facilityId: facId,
      diseaseType,
    };
    // if(!isBackFlag)
    // {
    //   isBackFlag=false;
    // }
    if (isFirstComeIn && !apiRef.current) {
      preFailRef.current = true;
      props?.clearMapTimeInterval(true);
      // console.log('接口请求没返回');
      return;
    }
    if (apiRef.current || !isFirstComeIn) {
      apiRef.current = false;
    }
    // console.log('jixuqingqiu');
    // apiRef.current=false;
    // handleAbort();

    // let isUnmounted = false;
    const newZoom = map?.getZoom();
    const preValue = getPrecisionValue(newZoom || 10);
    let params: any = {
      startTime: sTime,
      endTime: eTime,
      facilityIds: facId,
      precision: preValue || precisionVal,
      diseaseType,
    };
    if (pathArr?.length > 0) {
      params = {
        ...params,
        latitude1: pathArr[0][1],
        latitude2: pathArr[1][1],
        latitude3: pathArr[2][1],
        latitude4: pathArr[3][1],
        longitude1: pathArr[0][0],
        longitude2: pathArr[1][0],
        longitude3: pathArr[2][0],
        longitude4: pathArr[3][0],
      };
    } else {
      return;
    }
    try {
      const res = await queryGeoDisease(params, {
        cancelToken: new CancelToken(function executor(c) {
          queRef.current = c;
        }),
      });
      apiRef.current = true;
      isFirstComeIn = true;

      if (res?.status === 0 && !isUnmount) {
        // console.log('接口请求返回',res.data);
        // console.timeEnd('Time this');
        if (!props.isToday && isCallBackFlag && preFailRef.current) {
          // console.log('jinlail');
          // setIsCallBackFlag(true);
          queryMapClusterData(
            paramRef?.current?.startTime,
            paramRef?.current?.endTime,
            paramRef?.current?.facilityId,
            paramRef?.current?.diseaseType,
          );
          isCallBackFlag = false;
        }
        if (props.isToday) {
          // 如果前一次出现了长时间接口没返回,后面返回了要开启定时器
          props?.clearMapTimeInterval(false);
        }
        preFailRef.current = false;
        if (!isEqual(mapDataRef?.current, res.data)) {
          clearLayer();
          // 拿到地图数据后调用渲染地图方法
          renderMapLayer(res.data);
        }
        mapDataRef.current = res?.data;
        // setMapData(res?.data);
      } else if (res?.status !== 0 && !isUnmount) {
        // console.log('接口status返回不为0')
        if (props.isToday) {
          // 如果前一次出现了长时间接口没返回,后面返回了要开启定时器
          props?.clearMapTimeInterval(false);
        }
        preFailRef.current = false;
      }
    } catch (error) {
      handleAbort();
      isFirstComeIn = false;
      preFailRef.current = false;
      if (props.isToday) {
        props?.clearMapTimeInterval(false);
      }
    }
  };
  // 是否在可视区域
  const isInview = () => {
    // if (polygonGrid) {
    //   map.remove(polygonGrid);
    // }

    // console.log('进来isview')
    const bounds = map.getBounds();
    const NorthEast = bounds.getNorthEast();
    const SouthWest = bounds.getSouthWest();
    const SouthEast = [NorthEast.lng, SouthWest.lat];
    const NorthWest = [SouthWest.lng, NorthEast.lat];
    const path = [
      [NorthEast.lng, NorthEast.lat],
      SouthEast,
      [SouthWest.lng, SouthWest.lat],
      NorthWest,
    ]; // 将地图可视区域四个角位置按照顺序放入path，用于判断point是否在可视区域
    pathArr = path;
    setPathBound(path);
    console.log('pathArr', path);
    // drawGrid(path);
    // const isInView = AMap.GeometryUtil.isPointInRing(
    //     lonLat,
    //     path
    // );
    // return isInView;
  };
  const stopInterval = () => {
    if (props.isToday) {
      props.clearTimeInterval(true);
      props.clearMapTimeInterval(true);
    }
  };
  const debounceMapEvent = debounce(
    () => {
      isInview();
      if (props.isToday) {
        props.clearTimeInterval(false);
      }
    },
    300,
    {
      leading: false,
      trailing: true,
    },
  );
  const handleEvent = (e: any) => {
    // console.log('e',e )
    debounceMapEvent();
  };
  const handleDragEvent = (e: any) => {
    // console.log('edrag',e )
    debounceMapEvent();
    map.setDefaultCursor('grab');
  };

  // 地图初始化，获取四个角数据
  useEffect(() => {
    // let center: any = mapInfo?.center || [114.058141, 22.543544];
    const mapCenter: any = localStorage?.getItem('map-center');
    let center: any = JSON.parse(mapCenter);
    let zoom = 10;
    if (mapDataRef?.current && mapDataRef?.current?.length) {
      center = [mapDataRef?.current?.[0].longitude, mapDataRef?.current?.[0].latitude];
      if (fkFacilitiesId) {
        zoom = 13;
      }
    }

    mapSaliteLayer = new AMap.TileLayer.Satellite({}); // 卫星图层
    defaultLayer = AMap.createDefaultLayer(); // 默认标准图层

    map = new AMap.Map('container', {
      // zoom: mapInfo?.zoom || zoom,
      zoom,
      center,
      mapStyle: 'amap://styles/5cfb475a7621dccba5ff381b2f3c8ab4',
      pitch: props?.mapType === '3d' ? 52.34782608695647 : 50, // 地图俯仰角度，有效范围 0 度- 83 度
      viewMode: '3D', // 地图模式
      jogEnable: true,
      animateEnable: true,
      defaultCursor: 'grab',
      zooms: [4.54, 23],
      skyColor: props?.mapType === '3d' ? '#1f263a' : '#343530', // 3D 模式下带有俯仰角时会显示
    });
    isInview();

    // 高亮显示省市区域
    // const province = localStorage?.getItem('use-province');
    // const city = localStorage?.getItem('use-city');
    if (mapInfo?.districtSearch) {
      if (Platform_Flag === 'boshilin') {
        // 博士林区也要高亮画线
        const opts = {
          // level: 'province',
          subdistrict: 1, // 返回下一级行政区
          extensions: 'all',
          showbiz: false, // 最后一级返回街道信息
        };
        AMap.plugin('AMap.DistrictSearch', () => {
          idistrict = new AMap.DistrictSearch(opts);
          idistrict.search(mapInfo.districtSearch, (status: any, result: any) => {
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
      } else {
        if (mapInfo?.districtSearch) {
          AMap.plugin('AMap.DistrictSearch', () => {
            new AMap.DistrictSearch({
              level: 'province',
              extensions: 'all',
              subdistrict: 1,
            }).search(mapInfo.districtSearch, (status: any, result: any) => {
              // 外多边形坐标数组和内多边形坐标数组
              const outer = [
                new AMap.LngLat(-360, 90, true),
                new AMap.LngLat(-360, -90, true),
                new AMap.LngLat(360, -90, true),
                new AMap.LngLat(360, 90, true),
              ];
              // console.log('result', result.districtList);
              const holes = result.districtList[0].boundaries;

              const pathArray = [outer];
              pathArray.push.apply(pathArray, holes);
              const polygon = new AMap.Polygon({
                path: pathArray,
                strokeColor: '#3758FF',
                strokeWeight: 3,
                fillColor: '#050811',
                fillOpacity: 0.8,
              });
              map.add(polygon);
            });
          });
        }
      }
    } else {
      // const disCountry = new AMap.DistrictLayer.Country({
      //   zIndex: 100,
      //   SOC: 'CHN',
      //   // depth: 2,
      //   styles: {
      //     'nation-stroke': '#ff0000',
      //     // 'province-stroke': '#3758FF',
      //     // 'coastline-stroke': '#0088ff',
      //     'stroke-width': 4,
      //     fill: '',
      //   },
      // });
      // const disCountry1 = new AMap.DistrictLayer.Country({
      //   zIndex: 10,
      //   SOC: 'CHN',
      //   // depth: 2,
      //   styles: {
      //     'nation-stroke': '',
      //     'province-stroke': '#3758FF',
      //     'stroke-width': 2,
      //     fill: '',
      //   },
      // });
      // map.add(disCountry);
      // map.add(disCountry1);
    }
    // map.on('complete', function (e: any) {
    //   // 地图图块加载完成后触发
    // });

    map.on('click', (event: any) => {
      // console.log('clickmap', event);
      if (event?.target?.className === 'AMap.Map') {
        closeModal();
      }
    });
    map.on('zoomstart', () => {
      stopInterval();
    });
    map.on('zoomend', handleEvent);

    map.on('movestart', () => {
      stopInterval();
    });
    // map.on('zoomchange', () => {
    //    console.log('ddgg',map.getZooms(),map.getZoom())
    //   });
    map.on('moveend', handleEvent);
    map.on('dragstart', () => {
      map.setDefaultCursor('grabbing');
      stopInterval();
    });
    map.on('dragend', handleDragEvent);

    // 实时路况图层
    trafficLayer = new AMap.TileLayer.Traffic({
      zIndex: 10,
      zooms: [7, 22],
    });
    trafficLayer.setMap(map);

    if (props.mapType === '3d') {
      defaultLayer.setMap(map);
    } else {
      mapSaliteLayer.setMap(map);
    }
    // const gridLayer = new AMap.TileLayer.Flexible({
    //   cacheSize: 300,
    //   zIndex: 200,
    //   createTile: function (x: any, y: any, z: any, success: any, fail: any) {
    //     const c = document.createElement('canvas');
    //     c.width = c.height = 256;

    //     const cxt = c.getContext('2d')!;
    //     cxt.font = '15px Verdana';
    //     cxt.fillStyle = '#ff0000';
    //     cxt.strokeStyle = '#FF0000';
    //     cxt.strokeRect(0, 0, 256, 256);
    //     cxt.fillText('(' + [x, y, z].join(',') + ')', 10, 30);
    //     // 通知API切片创建完成
    //     success(c);
    //   },
    // });
    // gridLayer.setMap(map);
    isUnmount = false;
    return () => {
      isUnmount = true;
    };
  }, []);

  // 地图可视区域四个角位置变化后请求聚合数据
  useEffect(() => {
    if (pathArr && pathArr?.length) {
      // console.log('pathAr变化',pathArr);
      if (paramRef?.current) {
        queryMapClusterData(
          paramRef?.current?.startTime,
          paramRef?.current?.endTime,
          paramRef?.current?.facilityId,
          paramRef?.current?.diseaseType,
        );
      }
    }
    if (!props.isToday) {
      isCallBackFlag = true;
    }
  }, [newPathData(pathBound)]);

  useEffect(() => {
    if (!props.isToday) {
      // console.log('查询条件任一变化');
      // setIsCallBackFlag(true);
      isCallBackFlag = true;
    }
  }, [paramRef?.current?.startTime, paramRef?.current?.endTime, paramRef?.current?.facilityId]);
  // useEffect(()=>{
  //   if(isCallBackFlag)
  //   {
  //     console.log('isCallBackFlag变化');
  //     if (paramRef?.current) {
  //       queryMapClusterData(
  //         paramRef?.current?.startTime,
  //         paramRef?.current?.endTime,
  //         paramRef?.current?.facilityId,
  //       );
  //     }
  //   }
  //   setIsCallBackFlag(false);
  // },[isCallBackFlag])
  // const drawComfort = () => {
  // let strokeColor = (item: any) => {
  //   switch (true) {
  //     case item.rqi < 60:
  //       return '#95040B';
  //     case item.rqi >= 60 && item.rqi < 70:
  //       return '#FC312E';
  //     case item.rqi >= 70 && item.rqi < 80:
  //       return '#FDA228';
  //     case item.rqi >= 80 && item.rqi < 90:
  //       return '#6E60F6';
  //     default:
  //       return '#396452';
  //   }
  // };

  // comfortData.forEach((item: any) => {
  //   const polyline = new AMap.Polyline({
  //     path: item.lnglat,
  //     borderWeight: 3,
  //     strokeColor: strokeColor(item),
  //     strokeOpacity: 1,
  //     strokeWeight: 3,
  //     strokeStyle: 'solid',
  //     lineJoin: 'round',
  //     lineCap: 'round',
  //     zIndex: 50,
  //   });
  //   comfortPolylineArr.push(polyline);
  // });

  // map.add(comfortPolylineArr);
  // };

  // 根据路况变化去掉地图舒适度线条，是否显示实时路况
  // 现在默认为roadCondition类型
  useEffect(() => {
    map.remove(comfortPolylineArr);
    comfortPolylineArr.length = 0;
    if (props.roadStatus === 'roadCondition') {
      trafficLayer?.show();
    } else {
      trafficLayer?.hide();
      // if (comfortData.length) {
      //   drawComfort();
      // }
    }
  }, [props.roadStatus]);

  // 地图类型变化给不同的layer图层
  useEffect(() => {
    if (map) {
      if (props?.mapType === '3d') {
        if (mapSaliteLayer) {
          mapSaliteLayer.setMap(null);
        }
        map.setPitch(52.34782608695647);
        defaultLayer.setMap(map);
      } else {
        // 卫星地图
        if (defaultLayer) {
          defaultLayer.setMap(null);
        }
        mapSaliteLayer.setMap(map);
        map.setPitch(50);
        map.setZooms([4.54, 21]);
      }
    }
  }, [props?.mapType]);

  const resetFirstButton = () => {
    setImmediateFlag(true);
    setIsFirstFlag(false);
    closeCarModal();
    closeModal();
  };

  // 点击右侧表格行的车辆信息
  const handleCarSel = (rowInfo: any) => {
    if (rowInfo?.deviceId) {
      const index = props.carData.findIndex((it: any) => {
        return it?.carList[it?.carList?.length - 1]?.id === rowInfo?.id;
      });
      if (index > -1) {
        const lgnt = [
          props.carData[index]?.carList[props.carData[index]?.carList?.length - 1]?.longitude,
          props.carData[index]?.carList[props.carData[index]?.carList?.length - 1]?.latitude,
        ];
        map.setZoomAndCenter(15, lgnt);
        setVehicleModalVisible(true);
        setDataDeviceId(rowInfo?.deviceId);
        setCarId(rowInfo?.id);
        setDataDeviceName(rowInfo?.deviceId || rowInfo?.deviceName);
      }
    }
  };
  // 点击右侧病害卡片
  const handleDiseaseSel = (rowInfo: any) => {
    if (rowInfo) {
      map.setStatus({ jogEnable: true, animateEnable: true });
      const positionArray = [rowInfo?.longitude, rowInfo?.latitude];
      map.setZoomAndCenter(21, positionArray);
      console.log('preMarkRef.current', rowInfo);
      preMarkRef.current = rowInfo;
      setImgId(rowInfo?.fkImgId);
      setAddress(rowInfo?.address);
      setIsModalVisible(true);
    }
  };

  useImperativeHandle(props.onRef, () => ({
    // 暴露给父组件的方法
    resetFirstButton,
    handleCarSel,
    handleDiseaseSel,
    closeModal,
    closeCarModal,
    queryMapClusterData,
  }));

  useEffect(() => {
    if (immediateFlag && mapDataRef?.current?.length) {
      map.setStatus({ jogEnable: false, animateEnable: false });
      setCenterType(2);
      let zoom = 10;
      const mapCenter: any = localStorage.getItem('map-center');
      const center =
        [mapDataRef?.current?.[0].longitude, mapDataRef?.current?.[0].latitude] ||
        JSON?.parse(mapCenter);
      if (fkFacilitiesId) {
        zoom = 13;
      }
      map.setZoomAndCenter(zoom, center);
      // map.setZoomAndCenter(zoom,firstClustMakerRef.current?._position || [114.058141, 22.543544]);
      setImmediateFlag(false);
    } else if (immediateFlag && mapDataRef?.current?.length === 0) {
      setImmediateFlag(false);
    }
  }, [immediateFlag]);

  // const setGridSizeNum = (count: number) => {
  //   if (count && count > 0) {
  //     /* eslint-disable */
  //     if (count < 10000) {
  //       return 30;
  //     } else if (count > 10000 && count < 20000) {
  //       return 20;
  //     } else if (count > 30000) {
  //       return 10;
  //     } else {
  //       return 40;
  //     }
  //   }
  //   return 60;
  // };

  // 最底层只有一个时渲染
  const renderMarker = (context: any) => {
    let offset = normalOffset;
    let iconMarker = iconNormalMarker;
    const itemEveyMarker = new AMap.Marker({
      position: context?.lnglat,
      // title: '车辆信息',
      icon: iconMarker,
      offset,
      bubble: false,
      zIndex: 15,
      extData: {
        // className: 'carInfoClass',
      },
    });

    // map.add(itemEveyMarker);
    itemEveyMarker.setTop(false);
    // console.log('prevMarker',prevMarker)
    if (prevMarker) {
      if (prevMarker?.id && context && prevMarker?.id === context?.id) {
        // console.log('ceshi11113333',prevMarker?.marker?._position,context?.lnglat )
        iconMarker = iconBigMarker;
        offset = bigOffset;
        const newmarker = itemEveyMarker;
        newmarker.setIcon(iconNormalMarker);
        newmarker.setOffset(normalOffset);
        newmarker.setTop(true);
        prevMarker = { marker: newmarker, id: context?.id };
      }
    }
    // console.log('kkkkkkkkkkkkkkkkkkkkkk', preMarkRef.current, context?.id);
    if (preMarkRef.current && preMarkRef.current.id.toString() === context?.id) {
      iconMarker = iconBigMarker;
      offset = bigOffset;
      const newPremarker = itemEveyMarker;
      newPremarker.setIcon(iconNormalMarker);
      newPremarker.setOffset(normalOffset);
      newPremarker.setTop(true);
      preMarkRef.current = { ...preMarkRef.current, marker: newPremarker };
    }

    itemEveyMarker.setIcon(iconMarker);
    // itemEveyMarker.setOffset(offset);
    clusterMarkers.push(itemEveyMarker);
    // context.marker.bubble = true;
    // context.marker.setzIndex(20);
    // console.log('context',context);
    itemEveyMarker.on('click', (event: any) => {
      // event?.originEvent?.preventDefault();
      // console.log('clickitemEveyMarker',context,event);
      if (prevMarker && prevMarker?.id && context && prevMarker?.id !== context?.id) {
        prevMarker.marker.setIcon(iconNormalMarker);
        // prevMarker.marker.setOffset(normalOffset);
        prevMarker.marker.setTop(false);
        // console.log('quxiaoshangyige',prevMarker,context?.lnglat)
      }
      setModalStyle(event.pixel);
      // console.log('imgidtttt',context,context?.imgId);
      setImgId(`${context?.imgId}-${context?.id}`);
      // setImgId({imgId:context?.imgId,diseaseId:context?.id});
      // setImgId(null);
      if (preMarkRef.current && preMarkRef.current.marker) {
        preMarkRef.current.marker.setTop(false);
        preMarkRef.current.marker.setIcon(iconNormalMarker);
      }
      preMarkRef.current = undefined;
      setIsModalVisible(true);
      if (childRef && childRef.current) {
        childRef.current?.resetMaskClosableFlag(true);
      }
      // event.target.setzIndex(22);
      prevMarker = { marker: event.target, id: context?.id };
      console.log('prevMarkerkkkk', event);
      event.target.setTop(true);
      event.target.setIcon(iconBigMarker);
      // event.target.setOffset(normalOffset);

      // event?.originEvent?.stopPropagation();
      // itemEveyMarker.setTop(true);
      // itemEveyMarker.setIcon(iconBigMarker);
      AMap.plugin('AMap.Geocoder', () => {
        const geocoder = new AMap.Geocoder();
        geocoder.getAddress(context?.lnglat, (status: string, result: any) => {
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

  // 聚合地图渲染
  const renderClusterMarker = (context: any, allCount: number) => {
    if (!context.quantity) {
      return;
    }
    if (Number(context.quantity) > 1) {
      // 聚合地图渲染
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
      if (context.quantity > 200) {
        bgColor = 'rgba(255, 86, 86, 1)';
        size = 100;
        flameDiv.style.background =
          'linear-gradient(180.18deg, #FF5656 47.99%, #EC8031 62.7%, rgba(240, 175, 62, 0.5) 79.44%, rgba(250, 225, 77, 0) 99.84%)';
      } else if (context.quantity > 50 && context.quantity <= 199) {
        bgColor = 'rgba(238, 107, 12, 1)';
        size = 80;
        flameDiv.style.background =
          'linear-gradient(180.18deg, #EE6B0C 19.89%, rgba(240, 175, 62, 0.5) 84.43%, rgba(250, 225, 77, 0) 99.84%)';
      } else if (context.quantity > 10 && context.quantity <= 49) {
        bgColor = 'rgba(240, 175, 62, 1)';
        size = 60;
        flameDiv.style.background =
          'linear-gradient(180.31deg, #F0AF3E 45.15%, rgba(250, 225, 77, 0) 99.73%);';
      }
      // console.log('firsttttttt',context.quantity,allCount)
      size = Math.round(30 + 1 ** (1 / 5) * 25);
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
      topDiv.innerHTML = context.quantity;
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
      // console.log('clusterender', context?.lnglat);
      const itemMarker = new AMap.Marker({
        position: context?.lnglat,
        // title: '车辆信息',
        bubble: false,
        content: containerDiv,
        offset: new AMap.Pixel(-0.6 * size, -1.2 * size),
        zIndex: 15,
        extData: {
          // className: 'carInfoClass',
        },
      });
      // let offset = normalOffset;
      // let iconMarker = iconNormalMarker;

      // map.add(itemMarker);
      // clusterMarkers.push(itemTestMarker);
      clusterMarkers.push(itemMarker);
      // context.marker.setOffset(new AMap.Pixel(-0.6 * size, -1.2 * size));
      // context.marker.setContent(containerDiv);
      itemMarker.on('click', (event: any) => {
        map.setStatus({ jogEnable: true, animateEnable: true });
        const curZoom = map?.getZoom();
        let positionArray = [event?.lnglat?.lng, event?.lnglat?.lat];

        // console.log('点击聚合点',context?.lnglat,curZoom )
        if (context?.lnglat && context?.lnglat?.length > 0) {
          // console.log('点击聚合点1111',context?.lnglat,curZoom )
          positionArray = context?.lnglat;
          map.setZoomAndCenter(curZoom + 2, positionArray);
        } else {
          map.setZoomAndCenter(curZoom + 3, positionArray);
        }
      });
    } else if (context.quantity === '1') {
      // 最底层只有一个时渲染
      renderMarker(context);
    }
  };

  const clearLayer = () => {
    if (layer) {
      map.remove(layer);
    }
    if (clusterMarkers?.length) {
      clusterMarkers = [];
    }
  };

  const addCluster = (datas: any) => {
    // 地图聚合渲染，或者最底层一个标记时渲染
    datas.forEach((it: any) => {
      renderClusterMarker(it, datas?.length);
    });
    layer = new AMap.OverlayGroup(clusterMarkers);
    // 将图层添加到地图
    map.add(layer);
  };

  // 拿到地图数据后调用渲染地图方法
  const renderMapLayer = (datas: any[]) => {
    if (datas && datas.length > 0) {
      // if (mapCluster) {
      //   mapCluster.setMap(null);
      // }
      if (!isFirstFlag) {
        // addCluster();
        setIsFirstFlag(true);
        if (centerType !== 0) {
          setCenterType(1);
          map.setCenter([datas[0].longitude, datas[0].latitude]);
        }
      }
      // 增加地图聚合渲染
      addCluster(datas);
    } else {
      /* eslint-disable */
      // if (mapInfo && mapInfo?.center) {
      //   map.setCenter((mapInfo && mapInfo?.center) || [114.487854, 38.03504]);
      // }
    }
  };
  // useEffect(() => {
  //   // 根据不同条件聚合数据

  //   clearLayer();
  //   // 数据中需包含经纬度信息字段 lnglat
  //   if (mapData && mapData.length > 0) {
  //     // if (mapCluster) {
  //     //   mapCluster.setMap(null);
  //     // }
  //     if (!isFirstFlag) {
  //       // addCluster();
  //       setIsFirstFlag(true);
  //       map.setCenter([mapData[0].longitude, mapData[0].latitude]);
  //     }
  //     addCluster(mapData);
  //   } else {
  //     /* eslint-disable */
  //     // if (mapCluster) {
  //     //   mapCluster.setMap(null);
  //     // }
  //     // console.log('清除聚合图层2');
  //     // clearLayer();
  //     if (mapInfo && mapInfo?.center) {
  //       map.setCenter((mapInfo && mapInfo?.center) || [114.487854, 38.03504]);
  //     }
  //   }
  // }, [useCompare(mapData)]);

  useEffect(() => {
    if (!carId) return;
    let index: number = -1;
    if (props.carData?.length > 0) {
      index = props.carData.findIndex((it: any) => {
        return it?.carList[it?.carList?.length - 1]?.id === carId;
      });
    }
    async function fetchCarData() {
      try {
        const res = await getCarInfos({
          id: props.carData[index]?.carList[props.carData[index]?.carList?.length - 1]?.id,
        });
        if (res?.status === 0 && !isUnmount) {
          setCarInfo(res.data);
          setCollectTime(
            res?.data?.collectTime?.length > 9
              ? res?.data?.collectTime?.slice(0, 10)
              : res?.data?.collectTime,
          );
          setBatchId(res?.data?.batchId);
        }
        // else {
        //   message.error({
        //     content: res.message,
        //     key: res.message,
        //   });
        // }
        return true;
      } catch (error) {
        // message.error({
        //   content: '操作失败',
        //   key: '操作失败',
        // });
        return false;
      }
    }
    if (
      vehicleModalVisible &&
      index >= 0 &&
      props.carData[index]?.carList[props.carData[index]?.carList?.length - 1]?.id
    ) {
      fetchCarData();
    }
  }, [vehicleModalVisible, carId, props.carData]); // 车辆信息弹窗打开

  useEffect(() => {
    // if (vehicleModalVisible) {
    //   if (carRef && carRef.current) {
    //     carRef.current.initLocus(showFlag);
    //   }
    // }
    if (!vehicleModalVisible) {
      resetCarLine();
    }
  }, [vehicleModalVisible]);

  const hideModal = () => {
    if (preMarkRef.current && preMarkRef.current.marker) {
      preMarkRef.current.marker.setIcon(iconNormalMarker);
      preMarkRef.current.marker.setTop(false);
      preMarkRef.current.marker.setOffset(normalOffset);
      preMarkRef.current = undefined;
    }
    setIsModalVisible(false);
    if (prevMarker && prevMarker.marker) {
      prevMarker.marker.setIcon(iconNormalMarker);
      prevMarker.marker.setTop(false);
      prevMarker.marker.setOffset(normalOffset);
      prevMarker = undefined;
    }
  };

  const hideVehicleModal = () => {
    setVehicleModalVisible(false);
  };

  const getTypeCar = (flag: any, status: any) => {
    let rec: any = null;
    rec = flag ? 'carRevese' : null;
    if (status === '0') {
      // 在线
      rec = rec ? `${rec} carOnlineClass` : `carOnlineClass`;
    } else {
      rec = 'carOffLineClass';
    }
    return rec;
  };
  const isCarOnline = (status: any) => {
    if (status === '0') {
      // 在线
      return true;
    }
    return false;
  };
  const getColorType = (type: any, onlineFlag: any) => {
    if (onlineFlag) {
      if (type !== '0') {
        return type ? 'rgba(220, 66, 57, 1)' : 'rgba(255, 255, 255, 0.3)';
      }
      return '#24AE4A';
    } else {
      return 'rgba(255, 255, 255, 0.3)';
    }
  };

  useEffect(() => {
    if (carRef?.current?.defalutCheck && batchId && vehicleModalVisible && collectTime) {
      toggleLocus(true);
    }
  }, [batchId]);

  useEffect(() => {
    if (vehicleMarker?.length > 0) {
      vehicleMarker.forEach((it: any, index: any) => {
        if (vehicleMarker[index]) {
          map.remove(vehicleMarker[index]);
        }
      });
    }
    if (!props.isToday) {
      trafficLayer?.hide();
      // 数据可能存在空白，所以需要遍历
      // props.carData.forEach((i: any, index: any) => {
      //   if (vehicleMarker[index]) {
      //     map.remove(vehicleMarker[index]);
      //   }
      // });
    } else {
      // if (!props.carData || !props.carData?.length) {
      //   if (vehicleMarker?.length > 0) {
      //     vehicleMarker.forEach((it: any, index: any) => {
      //       if (vehicleMarker[index]) {
      //         map.remove(vehicleMarker[index]);
      //       }
      //     });
      //   }
      // }

      if (props.roadStatus === 'roadCondition') {
        trafficLayer?.show();
      }
    }

    if (!props.carData || !props.carData?.length) {
      resetCarLine();
      return;
    }
    // const devList: any = [];
    // props.carData.forEach((i: any) => {
    //   devList.push(i.deviceId);
    // });
    // const unique = (arr: any) => {
    //   return arr.filter((item: any, index: any) => {
    //     return arr.indexOf(item, 0) === index;
    //   });
    // };
    // const list = unique(devList);
    props?.carData.forEach((it: any, index: number) => {
      // const firstIndex = props.carData.findIndex((i: any) => i.deviceId === it);
      // const i = props.carData[firstIndex];
      // 车辆位置信息
      // if (vehicleMarker && vehicleMarker?.length > 0 && vehicleMarker[index]) {
      //   map.remove(vehicleMarker[index]);
      // }
      const isOnline = isCarOnline(it?.status); // 0在线，1离线
      const colorType = getColorType(it?.deviceStatus, isOnline);
      const contentCar = `<div class='carTrailContainer  ${
        isOnline ? 'onlineBar' : 'offLineBar'
      }'><div class='cartop'><span class='carLeftIcon' style="background:${colorType}"></span><span class='carTrailTxt'>${
        it?.deviceName || it?.deviceId || '巡检车辆'
      }</span></div><div class='carProcessBar'><div class='progressNow'></div></div></div>`;
      if (it.carList?.length > 0) {
        let angleCalc: number = 180;
        let reverseFlag = false;
        if (it?.status === '0') {
          angleCalc = it.carList[it.carList?.length - 1]?.azimuth || 180;
          if ((angleCalc >= 0 && angleCalc <= 90) || (angleCalc >= 270 && angleCalc <= 360)) {
            // 西北和东北方向，车子调头
            reverseFlag = true;
          }
        }
        let carTtpe = getTypeCar(reverseFlag, it?.status);

        const carDiv = `<div class='carRadiusContainer ${
          reverseFlag && isOnline ? 'carReveseContainer' : null
        }'>
        <div class='carDisClass ${carTtpe}'></div><div class="carSquare sibClass3"></div><div class="carSquare sibClass4"></div>
        </div>`;

        vehicleMarker[index] = new AMap.Marker({
          position: [
            it.carList[it.carList?.length - 1].longitude,
            it.carList[it.carList?.length - 1].latitude,
          ],
          title: '车辆信息',
          content: carDiv,
          offset: new AMap.Pixel(-29, -52),
          zIndex: 15,
          extData: {
            className: 'carInfoClass',
          },
        });

        vehicleMarker[index].setLabel({
          direction: 'top',
          size: 120,
          zIndex: 100,
          // offset: new AMap.Pixel(-29, -52),
          content: contentCar, // 设置文本标注内容
          style: { 'background-Color': 'red' },
        });
        vehicleMarker[index].on('click', () => {
          setDataDeviceId(it.deviceId);
          setCarId(it.carList[it.carList?.length - 1]?.id);
          setVehicleModalVisible(true);
          setDataDeviceName(it?.deviceId || it.deviceName);
        });
        // carPreLntg = {
        //   lng: i.carList[i.carList?.length - 1].longitude,
        //   lat: i.carList[i.carList?.length - 1].latitude,
        // };
        map.add(vehicleMarker[index]);

        if (it.carList?.length && it?.status === '0' && centerType !== 0) {
          map?.setZoomAndCenter(13, [
            it.carList[it.carList?.length - 1].longitude,
            it.carList[it.carList?.length - 1].latitude,
          ]);
          setCenterType(0);
        }
      }
    });
    // toggleLocus(showFlag);
  }, [props.isToday, props.carData]);

  // 监听路由的切换
  useEffect(() => {
    const unlisten = history.listen((location: any) => {
      if (location?.pathname !== '/inspectionBoard') {
        trafficLayer = null;
        mapSaliteLayer = null;
        // mapCluster = null;
        idistrict = null;
        map.off('zoomend', handleEvent);
        map.off('moveend', handleEvent);
        map.off('dragend', handleDragEvent);
        map && map.destroy();
        isFirstComeIn = false;
      }
    });
    return () => {
      unlisten();
    };
  }, []);

  return (
    <>
      <div id="container" className={`${styles.container}`} />
      <div id="modalDiv" className="modalSpecDiv" />
      {isModalVisible ? (
        <DraggerModal
          isModalVisible={isModalVisible}
          hideModal={hideModal}
          imgId={imgId}
          onRef={childRef}
          address={address}
          style={modalStyle}
          extraData={props?.extraData}
        />
      ) : null}
      {props.carData?.length && vehicleModalVisible ? (
        <CarCurrentStatus
          vehicleModalVisible={vehicleModalVisible}
          hideVehicleModal={hideVehicleModal}
          toggleLocus={toggleLocus}
          // data={props.carData}
          onRef={carRef}
          carInfo={carInfo}
          dataDeviceName={dataDeviceName}
          dataDeviceId={dataDeviceId}
        />
      ) : null}
    </>
  );
});
export default Map;
