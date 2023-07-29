import React, { useState, useEffect, useImperativeHandle, useRef } from 'react';
import CarCurrentStatus from './DraggerModalStatus';
import styles from '../../styles.less';
import { getCarInfos } from '../../service';
// import { message } from 'antd';
import moment from 'moment';
import { history } from 'umi';
import DraggerModal from './newDraggerModal';
// import Request from 'umi-request';
import { useCompare } from '../../../../utils/commonMethod';
import pointSvg from '../../../../../public/images/map-point.svg';
import pointBigSvg from '../../../../../public/images/bigMaker.svg';

interface Iprops {
  mapData: any[];
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
}
let map: any;
let polyline: any = [];
const comfortPolylineArr: any = [];
const polylineStartPoints: any = [];
let trafficLayer: any = null;
let mapSaliteLayer: any = null;
let defaultLayer: any = null;
const vehicleMarker: any = [];
let renderMarker: any = null;
let mapCluster: any = null;
let prevMarker: any = null;
let iconMarker = null;
let idistrict: any = null;
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
// let disProvince: any;
// const { CancelToken } = Request;
const Map: React.FC<Iprops> = React.memo((props: Iprops) => {
  // let isUnmount: boolean = false;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [vehicleModalVisible, setVehicleModalVisible] = useState(false);
  const [isFirstFlag, setIsFirstFlag] = useState(false);
  const [immediateFlag, setImmediateFlag] = useState(false);
  const [imgId, setImgId] = useState<any>('');
  const preMarkRef: any = useRef();
  const childRef: any = useRef();
  const carRef: any = useRef();
  // const firstClustMakerRef: any = useRef();
  const [address, setAddress] = useState('');
  const [modalStyle, setModalStyle] = useState({ x: 0, y: 0 });
  const { AMap }: any = window;
  // const [firstClustMaker, setFirstClustMaker] = useState<any>();
  const [dataDeviceId, setDataDeviceId] = useState();
  const [dataDeviceName, setDataDeviceName] = useState<string>('');
  const [carInfo, setCarInfo] = useState();
  const [showFlag, setShowFlag] = useState([]);
  const { mapData, fkFacilitiesId, mapInfo } = props;
  // const comfortData = useCompare(props.comfortData);

  const resetCarLine = () => {
    if (props.carData && props.carData?.length > 0) {
      props.carData.forEach((item: any, ind: any) => {
        if (dataDeviceId === item.deviceId && polyline[ind]) {
          map.remove(polyline[ind]);
          if (polylineStartPoints[ind]) {
            map.remove(polylineStartPoints[ind]);
          }
        }
      });
    } else {
      /* eslint-disable */
      if (polylineStartPoints?.length > 0) {
        polylineStartPoints.forEach((it: any, index: any) => {
          if (polylineStartPoints[index]) {
            map.remove(polylineStartPoints[index]);
          }
        });
      }
      if (polyline?.length > 0) {
        polyline.forEach((ii: any, index: any) => {
          if (polyline[index]) {
            map.remove(polyline[index]);
          }
        });
      }
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
  const toggleLocus = (locusVisible: any) => {
    if (locusVisible !== showFlag) {
      setShowFlag(locusVisible);
    }
    const devList: any = [];
    if (props.carData?.length > 0) {
      props.carData.forEach((i: any) => {
        devList.push(i.deviceId);
      });
    }
    const unique = (arr: any) => {
      return arr.filter((item: any, index: any) => {
        return arr.indexOf(item, 0) === index;
      });
    };
    const list = unique(devList);
    const firstIndex = list.findIndex((i: any) => i === dataDeviceId);
    if (!polyline?.length) {
      polyline = Array.from({ length: props.carData?.length }, () => null);
    }
    if (!locusVisible[firstIndex]) {
      if (props.carData?.length > 0) {
        props.carData.forEach((item: any, ind: any) => {
          if (dataDeviceId === item.deviceId && polyline[ind]) {
            map.remove(polyline[ind]);
            if (polylineStartPoints[ind]) {
              map.remove(polylineStartPoints[ind]);
            }
          }
        });
      }
      return;
    }

    if (!props.carData || !props.carData?.length) return;

    props.carData.forEach((item: any, ind: any) => {
      const path: any = [];
      if (dataDeviceId === item.deviceId) {
        if (polyline[ind]) {
          map.remove(polyline[ind]);
        }
        if (polylineStartPoints[ind]) {
          map.remove(polylineStartPoints[ind]);
        }
        item.carList.forEach((i: any) => {
          path.push([i.longitude, i.latitude]);
        });
        polyline[ind] = new AMap.Polyline({
          path, // 设置线覆盖物路径
          showDir: false,
          dirColor: 'pink',
          strokeColor: 'rgba(255, 255, 255, 0.8)', // 线颜色
          strokeWeight: 4, // 线宽
        });
        const pointDiv = `<div class='carRadiusContainer'>
        <div class='pointClass'></div><div class="pointSquare sibClass3"></div><div class="pointSquare sibClass4"></div>
        </div>`;
        polylineStartPoints[ind] = new AMap.Marker({
          position: [item?.carList[0]?.longitude, item?.carList[0]?.latitude],
          content: pointDiv,
          offset: new AMap.Pixel(0, 0),
          zIndex: 100,
        });
        map.add(polylineStartPoints[ind]);
        map.add(polyline[ind]);
      }
    });
  };
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
  useEffect(() => {
    let center: any = mapInfo?.center || [114.058141, 22.543544];
    let zoom = 10;
    if (mapData?.length) {
      center = [mapData[0].longitude, mapData[0].latitude];
      if (fkFacilitiesId) {
        zoom = 13;
      }
    }
    mapSaliteLayer = new AMap.TileLayer.Satellite({});
    defaultLayer = AMap.createDefaultLayer();
    map = new AMap.Map('container', {
      zoom: mapInfo?.zoom || zoom,
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

    // 高亮显示省市区域
    if (mapInfo?.districtSearch) {
      if (Platform_Flag === 'boshilin') {
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
        AMap.plugin('AMap.DistrictSearch', () => {
          new AMap.DistrictSearch({
            level: 'province',
            extensions: 'all',
            subdistrict: 1,
          }).search(mapInfo.districtSearch, (status: any, result: any) => {
            // 外多边形坐标数组和内多边形坐标数组
            var outer = [
              new AMap.LngLat(-360, 90, true),
              new AMap.LngLat(-360, -90, true),
              new AMap.LngLat(360, -90, true),
              new AMap.LngLat(360, 90, true),
            ];
            // console.log('result', result.districtList);
            var holes = result.districtList[0].boundaries;

            var pathArray = [outer];
            pathArray.push.apply(pathArray, holes);
            var polygon = new AMap.Polygon({
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

    map.on('click', (event: any) => {
      closeModal();
      // if (prevMarker) {
      //   prevMarker.marker.setIcon(iconNormalMarker);
      //   prevMarker.marker.setTop(false);
      //   prevMarker.marker.setOffset(normalOffset);
      //   prevMarker = undefined;
      // }
      // if (preMarkRef.current && preMarkRef.current.marker) {
      //   preMarkRef.current.marker.setIcon(iconNormalMarker);
      //   preMarkRef.current.marker.setTop(false);
      //   preMarkRef.current.marker.setOffset(normalOffset);
      //   preMarkRef.current = undefined;
      // }
    });

    map.on('movestart', () => {
      if (props.isToday) {
        props.clearTimeInterval(true);
      }
    });
    // map.on('zoomchange', () => {
    //    console.log('ddgg',map.getZooms(),map.getZoom())
    //   });
    map.on('moveend', () => {
      if (props.isToday) {
        props.clearTimeInterval(false); // 地图移动结束后触发，包括平移，以及中心点变化的缩放。如地图有拖拽缓动效果，则在缓动结束后触发
      }
    });
    map.on('dragstart', () => {
      map.setDefaultCursor('grabbing');
      if (props.isToday) {
        props.clearTimeInterval(true);
      }
    });
    map.on('dragend', () => {
      if (props.isToday) {
        props.clearTimeInterval(false);
      }
      map.setDefaultCursor('grab');
    });

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
  }, []);

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

  useEffect(() => {
    if (map) {
      if (props?.mapType === '3d') {
        if (mapSaliteLayer) {
          mapSaliteLayer.setMap(null);
        }
        map.setPitch(52.34782608695647);
        defaultLayer.setMap(map);
      } else {
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
    // if (vehicleModalVisible) {
    closeCarModal();
    // }
    // if (isModalVisible) {
    closeModal();
    // }
  };

  const handleCarSel = (rowInfo: any) => {
    if (rowInfo?.deviceId) {
      const index = props.carData.findIndex((it: any) => {
        return it.deviceId === rowInfo?.deviceId;
      });
      if (index > -1) {
        const lgnt = [
          props.carData[index]?.carList[props.carData[index]?.carList?.length - 1]?.longitude,
          props.carData[index]?.carList[props.carData[index]?.carList?.length - 1]?.latitude,
        ];
        map.setZoomAndCenter(15, lgnt);
        setVehicleModalVisible(true);
        setDataDeviceId(rowInfo?.deviceId);
        setDataDeviceName(rowInfo?.deviceId || rowInfo?.deviceName);
      }
    }
  };
  const handleDiseaseSel = (rowInfo: any) => {
    if (rowInfo) {
      map.setStatus({ jogEnable: true, animateEnable: true });
      const positionArray = [rowInfo?.longitude, rowInfo?.latitude];
      map.setZoomAndCenter(21, positionArray);
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
  }));

  useEffect(() => {
    if (immediateFlag && mapData?.length) {
      map.setStatus({ jogEnable: false, animateEnable: false });
      let zoom = 10;
      const center = [mapData[0].longitude, mapData[0].latitude] || [114.058141, 22.543544];
      if (fkFacilitiesId) {
        zoom = 13;
      }
      map.setZoomAndCenter(zoom, center);
      // map.setZoomAndCenter(zoom,firstClustMakerRef.current?._position || [114.058141, 22.543544]);
      setImmediateFlag(false);
    } else if (immediateFlag && mapData?.length === 0) {
      setImmediateFlag(false);
    }
  }, [immediateFlag]);

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
      // if (!firstClustMakerRef.current) {
      //   firstClustMakerRef.current = context.marker;
      // }
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

    renderMarker = (context: any) => {
      let offset = normalOffset;
      iconMarker = iconNormalMarker;
      if (prevMarker) {
        if (prevMarker?.id && context.data?.length && prevMarker?.id === context.data[0]?.id) {
          iconMarker = iconBigMarker;
          offset = bigOffset;
          const newmarker = context.marker;
          // newmarker.setzIndex(22);
          newmarker.setTop(true);
          prevMarker = { marker: newmarker, id: context.data[0]?.id };
        }
      }

      // context.marker.topWhenClick = true;
      context.marker.bubble = true;
      context.marker.setTop(false);
      // context.marker.setzIndex(20);
      context.marker.setIcon(iconMarker);
      context.marker.setOffset(offset);
      context.marker.on('click', (event: any) => {
        if (
          prevMarker &&
          prevMarker?.id &&
          context.data?.length &&
          prevMarker?.id !== context.data[0]?.id
        ) {
          prevMarker.marker.setIcon(iconNormalMarker);
          // prevMarker.marker.setzIndex(20);
          prevMarker.marker.setTop(false);
        }
        setModalStyle(event.pixel);
        setImgId(context.data[0].imgId);
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
        prevMarker = { marker: event.target, id: context.data[0]?.id };
        event.target.setTop(true);
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
        iconMarker = iconBigMarker;
        context.marker.setTop(true);
        context.marker.setIcon(iconBigMarker);
        // context.marker.setzIndex(22);
        preMarkRef.current = { ...preMarkRef.current, marker: context.marker };
      }
    };
    function addCluster() {
      const gridSize = setGridSizeNum(mapData?.length);
      AMap.plugin('AMap.MarkerCluster', () => {
        // 异步加载插件
        // eslint-disable-next-line no-new
        mapCluster = new AMap.MarkerCluster(map, mapData, {
          gridSize, // 设置网格像素大小
          renderClusterMarker, // 自定义聚合点样式
          renderMarker, // 自定义非聚合点样式
          maxZoom: 20,
          minClusterSize: 2, // 聚合的最小数量。默认值为2，即小于2个点则不能成为一个聚合
        });
      });
    }
    // firstClustMakerRef.current = undefined;
    // console.log('isFirstFlag',isFirstFlag);
    // 数据中需包含经纬度信息字段 lnglat
    if (mapData && mapData.length > 0) {
      if (mapCluster) {
        mapCluster.setMap(null);
      }
      if (!isFirstFlag) {
        // addCluster();
        setIsFirstFlag(true);
        map.setCenter([mapData[0].longitude, mapData[0].latitude]);
      }
      addCluster();
    } else {
      /* eslint-disable */
      if (mapCluster) {
        mapCluster.setMap(null);
      }
      if (mapInfo && mapInfo?.center) {
        map.setCenter((mapInfo && mapInfo?.center) || [114.487854, 38.03504]);
      }
    }
  }, [useCompare(mapData)]);

  useEffect(() => {
    if (!dataDeviceId) return;
    let index: number = -1;
    if (props.carData?.length > 0) {
      index = props.carData.findIndex((it: any) => {
        return it.deviceId === dataDeviceId;
      });
    }
    async function fetchCarData() {
      try {
        const res = await getCarInfos({
          id: props.carData[index]?.carList[props.carData[index]?.carList?.length - 1]?.id,
        });
        if (res?.status === 0) {
          setCarInfo(res.data);
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
  }, [vehicleModalVisible, dataDeviceId, props.carData]);

  useEffect(() => {
    if (vehicleModalVisible) {
      if (carRef && carRef.current) {
        carRef.current.initLocus(showFlag);
      }
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
    let rec = null;
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
    if (!props.isToday) {
      trafficLayer?.hide();
      // 数据可能存在空白，所以需要遍历
      props.carData.forEach((i: any, index: any) => {
        if (vehicleMarker[index]) {
          map.remove(vehicleMarker[index]);
        }
      });
    } else {
      if (!props.carData || !props.carData?.length) {
        if (vehicleMarker?.length > 0) {
          vehicleMarker.forEach((it: any, index: any) => {
            if (vehicleMarker[index]) {
              map.remove(vehicleMarker[index]);
            }
          });
        }
      }

      if (props.roadStatus === 'roadCondition') {
        trafficLayer?.show();
      }
    }
    if (
      !props.carData ||
      !props.carData?.length ||
      moment(props.parTime).diff(moment(moment().format('yyyy-MM-DD')), 'days') < 0
    ) {
      resetCarLine();
      return;
    }
    const devList: any = [];
    props.carData.forEach((i: any) => {
      devList.push(i.deviceId);
    });
    const unique = (arr: any) => {
      return arr.filter((item: any, index: any) => {
        return arr.indexOf(item, 0) === index;
      });
    };
    const list = unique(devList);
    list.forEach((it: any) => {
      const firstIndex = props.carData.findIndex((i: any) => i.deviceId === it);
      const i = props.carData[firstIndex];
      // 车辆位置信息
      if (vehicleMarker && vehicleMarker?.length > 0 && vehicleMarker[firstIndex]) {
        map.remove(vehicleMarker[firstIndex]);
      }
      const isOnline = isCarOnline(i?.status);
      const colorType = getColorType(i?.deviceStatus, isOnline);
      const contentCar = `<div class='carTrailContainer  ${
        isOnline ? 'onlineBar' : 'offLineBar'
      }'><div class='cartop'><span class='carLeftIcon' style="background:${colorType}"></span><span class='carTrailTxt'>${
        i?.deviceName || i?.deviceId || '巡检车辆'
      }</span></div><div class='carProcessBar'><div class='progressNow'></div></div></div>`;
      if (i.carList?.length > 0) {
        let angleCalc: number = 180;
        let reverseFlag = false;
        if (i?.status === '0') {
          angleCalc = i.carList[i.carList?.length - 1]?.azimuth || 180;
          if ((angleCalc >= 0 && angleCalc <= 90) || (angleCalc >= 270 && angleCalc <= 360)) {
            // 西北和东北方向，车子调头
            reverseFlag = true;
          }
        }
        let carTtpe = getTypeCar(reverseFlag, i?.status);

        const carDiv = `<div class='carRadiusContainer ${
          reverseFlag && isOnline ? 'carReveseContainer' : null
        }'>
        <div class='carDisClass ${carTtpe}'></div><div class="carSquare sibClass3"></div><div class="carSquare sibClass4"></div>
        </div>`;

        vehicleMarker[firstIndex] = new AMap.Marker({
          position: [
            i.carList[i.carList?.length - 1].longitude,
            i.carList[i.carList?.length - 1].latitude,
          ],
          title: '车辆信息',
          content: carDiv,
          offset: new AMap.Pixel(-29, -52),
          zIndex: 15,
          extData: {
            className: 'carInfoClass',
          },
        });

        vehicleMarker[firstIndex].setLabel({
          direction: 'top',
          size: 120,
          zIndex: 100,
          // offset: new AMap.Pixel(-29, -52),
          content: contentCar, // 设置文本标注内容
          style: { 'background-Color': 'red' },
        });
        vehicleMarker[firstIndex].on('click', () => {
          setDataDeviceId(i.deviceId);
          setVehicleModalVisible(true);
          setDataDeviceName(i?.deviceId || i.deviceName);
        });
        // carPreLntg = {
        //   lng: i.carList[i.carList?.length - 1].longitude,
        //   lat: i.carList[i.carList?.length - 1].latitude,
        // };
        map.add(vehicleMarker[firstIndex]);
      }
    });
    toggleLocus(showFlag);
  }, [props.isToday, props.carData]);

  // 监听路由的切换
  useEffect(() => {
    const unlisten = history.listen((location: any) => {
      if (location?.pathname !== '/inspectionBoard') {
        trafficLayer = null;
        mapSaliteLayer = null;
        mapCluster = null;
        idistrict = null;
        map && map.destroy();
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
        />
      ) : null}
      {props.carData?.length && vehicleModalVisible ? (
        <CarCurrentStatus
          vehicleModalVisible={vehicleModalVisible}
          hideVehicleModal={hideVehicleModal}
          toggleLocus={toggleLocus}
          data={props.carData}
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
