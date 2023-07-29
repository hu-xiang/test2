import React, { useState, useEffect, useImperativeHandle, useRef } from 'react';
import DraggerModal from '../../InspectionScreen/components/map/newDraggerModal';
import styles from '../styles.less';
import { getSubFacInfo, getPhpInfo } from '../service';
import { history, useModel } from 'umi';
import { roadLevelColor } from '../data.d';
import { useCompare } from '../../../utils/commonMethod';
import pointSvg from '../../../../public/images/map-point.svg';
import pointBigSvg from '../../../../public/images/bigMaker.svg';
import facSvg from '../../../../public/images/icon-fac.svg';
import subfacSvg from '../../../../public/images/icon-subfac.svg';
import subfacBigSvg from '../../../../public/images/icon-subfac-bigger.svg';

interface Iprops {
  mapProjData: any[];
  mapType: string;
  onRef: any;
  mapInfo: any;
  buttonVal: number;
  isClickProject: boolean;
  setProject: (id: any) => void;
  extraData?: any;
}
let idistrict: any = null;
let map: any;
const polyline: any = new Map();
// let trafficLayerEva: any = null;
let mapSaliteLayerEva: any = null;
const projectMarkers: any = [];
const stakeMarkers: any = new Map();

let renderMarkerEva: any = null;
let mapClusterEva: any = null;
let prevMarkerEva: any = null;
let iconMarkerEva = null;
let projectData: any[] = [];
enum enumType {
  '上行' = 0,
  '下行' = 1,
}

// let carPreLntg: any = null;
const iconFacMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(26, 23),
  // 图标的取图地址
  image: facSvg,
  // 图标所用图片大小
  imageSize: new AMap.Size(26, 23),
  // 图标取图偏移量
});
const iconSubfacMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(22, 26),
  // 图标的取图地址
  image: subfacSvg,
  // 图标所用图片大小
  imageSize: new AMap.Size(22, 26),
  // 图标取图偏移量
  // imageOffset: new AMap.Pixel(-14, -28)
});
const iconDisMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(22, 28),
  // 图标的取图地址
  image: pointSvg,
  // 图标所用图片大小
  imageSize: new AMap.Size(22, 28),
});

const iconBigSubFacMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(41, 48),
  // 图标的取图地址
  image: subfacBigSvg,
  // 图标所用图片大小
  imageSize: new AMap.Size(41, 48),
});

const iconBigDisMarker = new AMap.Icon({
  // 图标尺寸
  size: new AMap.Size(41, 48),
  // 图标的取图地址
  image: pointBigSvg,
  // 图标所用图片大小
  imageSize: new AMap.Size(41, 48),
});
const normalfacOffset = new AMap.Pixel(-13, -23);
const stakeOffset = new AMap.Pixel(-10, -10);
const normalDisOffset = new AMap.Pixel(-11, -26);
const normalOffset = new AMap.Pixel(-11, -28);
const bigOffset = new AMap.Pixel(-21, -48);
let isUnmountMap = false;
const EvaMap: React.FC<Iprops> = (props: Iprops) => {
  const { currentType } = useModel<any>('inspect'); // 左侧面板附属设施，物理病害切换
  const { mapProjData, buttonVal, mapInfo } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imgId, setImgId] = useState<string>('');
  const [projectId, setProjectId] = useState<any>('');
  const preMarkRef: any = useRef();
  const childRef: any = useRef();
  const currentTypeRef: any = useRef();
  const projRef: any = useRef();
  const curRef: any = useRef();
  // 存的附属设施或者物理病害的接口数据
  const mapdataRef: any = useRef();
  const [address, setAddress] = useState('');
  const [modalStyle, setModalStyle] = useState({ x: 0, y: 0 });
  projectData = useCompare(mapProjData);
  const { AMap }: any = window;
  const hideStakeMaker = (proid: string, zoomFlag: boolean) => {
    // console.log('hideStakeMaker',zoomFlag,proid,stakeMarkers);
    if (stakeMarkers?.size) {
      [...stakeMarkers].forEach((itaValue: any) => {
        if (itaValue && itaValue?.length && itaValue[1]) {
          itaValue[1].forEach((itr: any) => {
            // const extraInfo = itr.getExtData();
            itr.setLabel({
              // direction: extraInfo?.direct===1?'right':'left',
              content: ``, // 设置文本标注内容
            });
            if (zoomFlag) {
              itr.hide();
            }
          });
        }
      });
    }
  };

  // 地图放大显示桩号
  const openStakeMaker = (zoomMakerflag: boolean, zoomLabelflag: boolean, proid?: string) => {
    if (stakeMarkers?.size) {
      [...stakeMarkers].forEach((iteValue: any) => {
        if (proid) {
          if (iteValue && iteValue?.length && iteValue[0] === proid && iteValue[1]) {
            iteValue[1].forEach((itr: any) => {
              if (zoomMakerflag) {
                itr.show();
              }
              const extraInfo = itr.getExtData();
              if (zoomLabelflag) {
                itr.setLabel({
                  direction: extraInfo?.direct === 1 ? 'right' : 'left',
                  zIndex: 100,
                  anchor: 'top-right',
                  offset: extraInfo?.direct === 1 ? new AMap.Pixel(-3, 0) : new AMap.Pixel(5, -5),
                  content: `<div class='stake-bg ${
                    extraInfo?.direct === 1 ? 'left-transtion' : 'right-transtion'
                  }'><span class='stake-name-class'>${`${extraInfo?.label}${
                    enumType[extraInfo?.direct]
                  }`}</span></div>`, // 设置文本标注内容
                });
              } else {
                itr.setLabel({
                  content: ``, // 设置文本标注内容
                });
              }
            });
          }
        } else {
          /* eslint-disable */
          if (iteValue && iteValue?.length && iteValue[1]) {
            iteValue[1].forEach((itm: any) => {
              // itm.show();
              if (zoomMakerflag) {
                itm.show();
              }
              if (zoomLabelflag) {
                const extraInfo = itm.getExtData();
                itm.setLabel({
                  direction: extraInfo?.direct === 1 ? 'right' : 'left',
                  zIndex: 100,
                  anchor: 'top-right',
                  offset: extraInfo?.direct === 1 ? new AMap.Pixel(-3, 0) : new AMap.Pixel(5, -5),
                  content: `<div class='stake-bg ${
                    extraInfo?.direct === 1 ? 'left-transtion' : 'right-transtion'
                  }'><span class='stake-name-class'>${`${extraInfo?.label}${
                    enumType[extraInfo?.direct]
                  }`}</span></div>`, // 设置文本标注内容
                });
              } else {
                itm.setLabel({
                  content: ``, // 设置文本标注内容
                });
              }
            });
          }
        }
      });
    }
  };

  const mapZoom = (zoom: number) => {
    // if (Platform_Flag !== 'meiping') {
    //   return;
    // }
    const zoomMakerflag = zoom > 10;
    const zoomLabelflag = zoom > 17;
    // console.log('mapZoom',zoomLabelflag,zoomMakerflag)
    if (zoomMakerflag) {
      // 展示
      openStakeMaker(zoomMakerflag, zoomLabelflag, projRef?.current ? projRef?.current : '');
    } else {
      hideStakeMaker(projRef?.current ? projRef?.current : '', !zoomMakerflag);
    }
  };
  const handleZoom = () => {
    const newZoom = map.getZoom();
    mapZoom(newZoom); // >17显示百里桩
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

  // 初始化地图
  useEffect(() => {
    // const center: any = mapInfo?.center || [114.058141, 22.543544];
    const mapCenter: any = localStorage?.getItem('map-center');
    const center: any = JSON.parse(mapCenter);
    const zoom = 10;

    map = new AMap.Map('containerEvation', {
      zoom: mapInfo?.zoom || zoom,
      center,
      mapStyle: 'amap://styles/5cfb475a7621dccba5ff381b2f3c8ab4',
      pitch: props?.mapType === '3d' ? 52.34782608695647 : 50, // 地图俯仰角度，有效范围 0 度- 83 度
      viewMode: '3D', // 地图模式
      jogEnable: true,
      animateEnable: false,
      zooms: [4.54, 23],
      defaultCursor: 'grab',
      skyColor: props?.mapType === '3d' ? '#1f263a' : '#343530', // 3D 模式下带有俯仰角时会显示
    });

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

    map.on('click', () => {
      // 点击地图关闭弹窗
      if (childRef && childRef.current) {
        childRef.current?.resetMaskClosableFlag(false);
      }
      setIsModalVisible(false);
      const offset = currentTypeRef.current === 'subfac' ? normalDisOffset : normalOffset;
      // 存在放大的marker就放小
      if (prevMarkerEva) {
        prevMarkerEva.marker.setIcon(
          currentTypeRef.current === 'subfac' ? iconSubfacMarker : iconDisMarker,
        );
        prevMarkerEva.marker.setTop(false);
        prevMarkerEva.marker.setOffset(offset);
        prevMarkerEva = undefined;
      }
      if (preMarkRef.current && preMarkRef.current.marker) {
        preMarkRef.current.marker.setIcon(
          currentTypeRef.current === 'subfac' ? iconSubfacMarker : iconDisMarker,
        );
        preMarkRef.current.marker.setOffset(offset);
        preMarkRef.current.marker.setTop(false);
        preMarkRef.current = undefined;
      }
    });
    map.on('zoomend', handleZoom);
    map.on('dragstart', () => {
      map.setDefaultCursor('grabbing');
    });
    map.on('dragend', () => {
      map.setDefaultCursor('grab');
    });
    // 实时路况图层
    // trafficLayerEva = new AMap.TileLayer.Traffic({
    //   zIndex: 10,
    //   zooms: [7, 22],
    // });
    // trafficLayerEva.setMap(map);
  }, []);

  // 切换地图类型
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

  // 提供给父组件左侧组件里的返回按钮事件
  const resetProjectId = () => {
    setProjectId('');
    projRef.current = '';
  };

  // 父组件选择完设施后的设施id
  const setProjID = (id: string) => {
    setProjectId(id);
    projRef.current = id;
  };
  // 切换路面舒适度
  const setPolylineOpt = (val: number) => {
    if (!polyline || !polyline?.size) {
      return;
    }
    if (projectId) {
      // console.log('sss',projectId,polyline.get(projectId));
      polyline.get(projectId).forEach((it: any) => {
        const extraInfo = it.getExtData();
        it.setOptions({
          strokeColor:
            extraInfo?.pciLevel && extraInfo?.rqiLevel
              ? roadLevelColor[extraInfo?.roadType || 0][
                  `${val === 1 ? extraInfo?.pciLevel : extraInfo?.rqiLevel}`
                ] || '#aaa'
              : '#aaa',
        });
      });
    } else {
      [...polyline].forEach((iteValue: any) => {
        if (iteValue && iteValue?.length && iteValue[1]) {
          iteValue[1].forEach((itm: any) => {
            const extradInfo = itm.getExtData();
            itm.setOptions({
              strokeColor:
                extradInfo?.pciLevel && extradInfo?.rqiLevel
                  ? roadLevelColor[extradInfo?.roadType || 0][
                      `${val === 1 ? extradInfo?.pciLevel : extradInfo?.rqiLevel}`
                    ] || '#aaa'
                  : '#aaa',
            });
          });
        }
      });
    }
  };

  const hideOverlay = (projId: string) => {
    if (polyline?.size) {
      [...polyline].forEach((itaValue: any) => {
        if (itaValue && itaValue?.length && itaValue[0] !== projId && itaValue[1]) {
          itaValue[1].forEach((itr: any) => {
            itr.hide();
          });
        }
      });
    }
    if (projectMarkers?.length > 0) {
      projectMarkers.forEach((itb: any) => {
        // const extInfo = itb.getExtData();
        // if (extInfo?.id !== projId) {
        //   itb.hide();
        // }
        itb.hide();
      });
    }
  };

  const openOverlay = () => {
    [...polyline].forEach((iteValue: any) => {
      if (iteValue && iteValue?.length && iteValue[1]) {
        iteValue[1].forEach((itm: any) => {
          itm.show();
        });
      }
    });
    projectMarkers.forEach((itb: any, ind: number) => {
      if (ind === 0) {
        /* eslint-disable */
        if (itb?._position?.length) {
          map.setZoomAndCenter(16, itb?._position);
        }
      }
      itb.show();
    });
  };
  const clearOverlay = () => {
    projectMarkers.forEach((it: any, index: any) => {
      if (projectMarkers[index]) {
        map.remove(projectMarkers[index]);
      }
    });
    [...polyline].forEach((itemValue: any) => {
      if (itemValue && itemValue?.length && itemValue[1]) {
        map.remove(itemValue[1]);
      }
    });
    if (polyline?.size > 0) {
      polyline.clear();
    }
    if (projectMarkers.length) {
      projectMarkers.length = 0;
    }
    [...stakeMarkers].forEach((iteValue: any) => {
      if (iteValue && iteValue?.length && iteValue[1]) {
        map.remove(iteValue[1]);
      }
    });
    if (stakeMarkers?.size > 0) {
      stakeMarkers.clear();
    }
  };
  useImperativeHandle(props.onRef, () => ({
    // 暴露给父组件的方法
    resetProjectId,
    setPolylineOpt,
    setProjID,
  }));

  // 点击道路设施标记
  const clickEvent = (evt: any, ind: number) => {
    const extraInfo = projectMarkers[ind].getExtData();
    const positionArray = evt ? [evt?.lnglat?.lng, evt?.lnglat?.lat] : extraInfo.lnglat;
    map.setZoomAndCenter(18, positionArray);
    props?.setProject(extraInfo?.id);
    setProjectId(extraInfo?.id);
    projRef.current = extraInfo?.id;
    curRef.current = {
      facilitiesName: extraInfo?.facilitiesName,
    };
    hideOverlay(extraInfo?.id);
  };
  // const isArrEqual = (arr1: any, arr2: any) => {
  //   return (
  //     arr1.length === arr2.length &&
  //     arr1.every((ele: any, index: number) => Object.is(ele, arr2[index]))
  //   );
  // };

  // 从父组件传过来的地图上的数据
  useEffect(() => {
    clearOverlay();
    if (!mapProjData || !mapProjData?.length) {
      return;
    }
    mapProjData.forEach((it: any, index: number) => {
      if (it.point?.length > 1 && it.point[0] && it.point[1]) {
        if (!projectId) {
          // 设施id不存在时，显示道路设施标记
          projectMarkers[index] = new AMap.Marker({
            position: it.point,
            title: it?.facilitiesName,
            icon: iconFacMarker,
            offset: normalfacOffset,
            zIndex: 15,
            extData: {
              className: 'projectClass',
              id: it?.id,
              lnglat: it.point,
              facilitiesName: it?.facilitiesName,
              facilitiesType: it?.facilitiesType,
            },
          });
          // 点击道路设施标记
          projectMarkers[index].on('click', () => {
            clickEvent(null, index);
          });

          map.add(projectMarkers[index]);

          if (index === 0 && it.point?.length && it.point[0] && it.point[1]) {
            map.setZoomAndCenter(16, it.point);
          }
        } else {
          /* eslint-disable */
          if (
            index === 0 &&
            it.point?.length &&
            it.point[0] &&
            it.point[1] &&
            !mapdataRef.current?.length
          ) {
            map.setZoomAndCenter(16, it.point);
          }
        }
        polyline.set(it?.id, []);
        stakeMarkers.set(it?.id, []);
        // 上行桩号数据
        const upList: any = [];
        // 下行桩号数据
        const downList: any[] = [];
        const upStakeList: any = [];
        const downStakeList: any[] = [];
        // console.log('stakeList',it?.stakeList)

        // 某个道路设施下面的桩号数据遍历，每条数据下面有起始桩号
        if (it?.stakeList?.length > 0) {
          it?.stakeList.forEach((itn: any) => {
            if (itn?.direct === 1) {
              downList.push(itn);
            } else {
              upList.push(itn);
            }
            // 公里桩之间的线段
            const polylineItem = new AMap.Polyline({
              path: itn?.coordinate, // 设置线覆盖物路径，公里桩之间的线段起点终点
              // showDir: false,
              // dirColor: 'pink',
              strokeOpacity: 1,
              strokeColor:
                itn?.pciLevel && itn?.rqiLevel
                  ? roadLevelColor[it?.roadType || 0][
                      `${buttonVal === 1 ? itn?.pciLevel : itn?.rqiLevel}`
                    ] || '#aaa'
                  : '#aaa',
              strokeWeight: 4, // 线宽
              extData: {
                id: it?.id,
                facilitiesName: it?.facilitiesName,
                facilitiesType: it?.facilitiesType,
                roadType: it?.roadType,
                pciLevel: itn?.pciLevel,
                rqiLevel: itn?.rqiLevel,
                // routeMode:enumType[itn?.direct]
              },
            });
            polyline.get(it?.id).push(polylineItem);
            map.add(polylineItem);

            // 画出所有的公里桩
            if (itn?.startPoint) {
              const reg = /[/s/S]*\+[/s/S]*(?=000)/g;
              if (reg.test(itn?.startPoint)) {
                if (itn?.direct === 1) {
                  downStakeList.push(itn);
                } else {
                  upStakeList.push(itn);
                }
                const newStakeMarkers = new AMap.Marker({
                  position: itn?.coordinate[0],
                  title: `${itn?.startPoint}${enumType[itn?.direct]}`,
                  content: `<div class="stake-icon"><div class="stake-icon-inner"></div></div>`,
                  // icon: iconFacMarker,
                  offset: stakeOffset,
                  zIndex: 15,
                  extData: {
                    className: 'projectClass',
                    id: it?.id,
                    direct: itn?.direct,
                    startPoint: itn?.startPoint,
                    label: itn?.startPoint,
                  },
                });
                stakeMarkers.get(it?.id).push(newStakeMarkers);
                map.add(newStakeMarkers);
                // newStakeMarkers.hide();
              }
            }
          });
        }

        // if (Platform_Flag === 'meiping') {
        if (upList?.length) {
          // 上行起点
          let firstPoint: any;
          // 上行终点
          let firstDownPoint: any;
          // if (upStakeList?.length) {
          // 比较他们是否相等
          //   firstPoint = isArrEqual(upStakeList[0]?.coordinate[0], upList[0]?.coordinate[0])
          //     ? undefined
          //     : upList[0];
          //   firstDownPoint = isArrEqual(
          //     upStakeList[upStakeList?.length - 1]?.coordinate[1],
          //     upList[upList?.length - 1]?.coordinate[1],
          //   )
          //     ? undefined
          //     : upList[upList?.length - 1];
          // } else {
          //   firstPoint = upList[0];
          //   firstDownPoint = upList[upList?.length - 1];
          // }
          firstPoint = upList[0];
          firstDownPoint = upList[upList?.length - 1];
          if (firstPoint) {
            const newStakeMarker = new AMap.Marker({
              position: firstPoint?.coordinate[0],
              title: `${firstPoint?.startPoint}${enumType[firstPoint?.direct]}`,
              content: `<div class="stake-icon"><div class="stake-icon-inner"></div></div>`,
              // icon: iconFacMarker,
              offset: stakeOffset,
              zIndex: 15,
              extData: {
                className: 'projectClass',
                // id: it?.id,
                direct: firstPoint?.direct,
                startPoint: firstPoint?.startPoint,
                label: firstPoint?.startPoint,
              },
            });
            stakeMarkers.get(it?.id).push(newStakeMarker);
            map.add(newStakeMarker);
            // newStakeMarker.hide();
          }
          if (firstDownPoint) {
            const newDownMarker = new AMap.Marker({
              position: firstDownPoint?.coordinate[1],
              title: `${firstDownPoint?.endPoint}${enumType[firstDownPoint?.direct]}`,
              content: `<div class="stake-icon"><div class="stake-icon-inner"></div></div>`,
              // icon: iconFacMarker,
              offset: stakeOffset,
              zIndex: 15,
              extData: {
                className: 'projectClass',
                // id: it?.id,
                direct: firstDownPoint?.direct,
                startPoint: firstDownPoint?.startPoint,
                label: firstDownPoint?.endPoint,
              },
            });
            stakeMarkers.get(it?.id).push(newDownMarker);
            map.add(newDownMarker);
            // newDownMarker.hide();
          }
        }
        //  console.log('downList',downList,downStakeList);
        if (downList?.length) {
          let endUpPoint: any;
          let endDownPoint: any;
          // if (downStakeList?.length) {
          //   // 比较他们是否相等
          //   endUpPoint = isArrEqual(downStakeList[0]?.coordinate[0], downList[0]?.coordinate[0])
          //     ? undefined
          //     : downList[0];
          //   endDownPoint = isArrEqual(
          //     downStakeList[downStakeList?.length - 1]?.coordinate[1],
          //     downList[downList?.length - 1]?.coordinate[1],
          //   )
          //     ? undefined
          //     : downList[downList?.length - 1];
          // } else {
          //   endUpPoint = downList[0];
          //   endDownPoint = downList[downList?.length - 1];
          // }
          endUpPoint = downList[0];
          endDownPoint = downList[downList?.length - 1];
          // console.log('endUpPoint',endUpPoint,endDownPoint)
          if (endUpPoint) {
            const newStakeEndMarker = new AMap.Marker({
              position: endUpPoint?.coordinate[0],
              title: `${endUpPoint?.startPoint}${enumType[endUpPoint?.direct]}`,
              content: `<div class="stake-icon"><div class="stake-icon-inner"></div></div>`,
              // icon: iconFacMarker,
              offset: stakeOffset,
              zIndex: 15,
              extData: {
                className: 'projectClass',
                // id: it?.id,
                direct: endUpPoint?.direct,
                startPoint: endUpPoint?.startPoint,
                label: endUpPoint?.startPoint,
              },
            });
            stakeMarkers.get(it?.id).push(newStakeEndMarker);
            map.add(newStakeEndMarker);
          }
          if (endDownPoint) {
            const newEndDownMarker = new AMap.Marker({
              position: endDownPoint?.coordinate[1],
              title: `${endDownPoint?.endPoint}${enumType[endDownPoint?.direct]}`,
              content: `<div class="stake-icon"><div class="stake-icon-inner"></div></div>`,
              // icon: iconFacMarker,
              offset: stakeOffset,
              zIndex: 15,
              extData: {
                className: 'projectClass',
                // id: it?.id,
                direct: endDownPoint?.direct,
                startPoint: endDownPoint?.startPoint,
                label: endDownPoint?.endPoint,
              },
            });
            stakeMarkers.get(it?.id).push(newEndDownMarker);
            map.add(newEndDownMarker);
          }
        }
        // }
      }
    });
  }, [projectData]);

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
  // useEffect(()=>{
  //  if()
  //  {

  //  }
  // },[buttonVal])
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
      let offset = currentType === 'subfac' ? normalDisOffset : normalOffset;
      iconMarkerEva = currentType === 'subfac' ? iconSubfacMarker : iconDisMarker;
      if (prevMarkerEva) {
        if (
          prevMarkerEva?.id &&
          context.data?.length &&
          prevMarkerEva?.id === context.data[0]?.id
        ) {
          iconMarkerEva = currentType === 'subfac' ? iconBigSubFacMarker : iconBigDisMarker;
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
          prevMarkerEva.marker.setIcon(currentType === 'subfac' ? iconSubfacMarker : iconDisMarker);
        }
        setModalStyle(event.pixel);
        setImgId(`${context.data[0]?.id}-${context.data[0]?.fkDiseaseId}`);
        if (preMarkRef.current && preMarkRef.current.marker) {
          preMarkRef.current.marker.setIcon(
            currentType === 'subfac' ? iconSubfacMarker : iconDisMarker,
          );
        }
        preMarkRef.current = undefined;
        setIsModalVisible(true);
        if (childRef && childRef.current) {
          childRef.current?.resetMaskClosableFlag(true);
        }
        prevMarkerEva = { marker: event.target, id: context.data[0]?.id };
        event.target.setIcon(currentType === 'subfac' ? iconBigSubFacMarker : iconBigDisMarker);
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
        iconMarkerEva = currentType === 'subfac' ? iconBigSubFacMarker : iconBigDisMarker;
        context.marker.setIcon(currentType === 'subfac' ? iconBigSubFacMarker : iconBigDisMarker);
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
      addCluster();
      map.setCenter([mapData[0].longitude, mapData[0].latitude] || [114.058141, 22.543544]);
    } else {
      if (!polyline.get(projectId)?.length) {
        // if (mapInfo && mapInfo?.center) {
        //   map.setCenter(mapInfo && mapInfo?.center);
        // }
        const mapCenter: any = localStorage?.getItem('map-center');
        const center: any = JSON.parse(mapCenter);
        map.setCenter(center);
      }
    }
  };
  // 获取某个设施的附属设施点
  const getDetailProjInfo = async (id: string) => {
    const rec =
      currentType === 'subfac'
        ? await getSubFacInfo({ facilitiesId: id })
        : await getPhpInfo({ facilitiesId: id });
    if (rec?.status === 0 && !isUnmountMap) {
      const ndata = rec?.data || [];
      mapdataRef.current = ndata;
      handleDiseaseInfo(ndata, id);
    }
  };

  // 设施id变化或者左侧面板附属设施，物理病害切换
  useEffect(() => {
    currentTypeRef.current = currentType;
    if (projectId) {
      hideOverlay(projectId);
      getDetailProjInfo(projectId);
    } else {
      if (mapClusterEva) {
        mapClusterEva.setMap(null);
      }
      openOverlay();
    }
    if (childRef && childRef.current) {
      childRef.current?.resetMaskClosableFlag(false);
    }
    setIsModalVisible(false);
  }, [projectId, currentType]);

  const hideModal = () => {
    if (preMarkRef.current && preMarkRef.current.marker) {
      preMarkRef.current.marker.setIcon(
        currentType === 'subfac' ? iconSubfacMarker : iconDisMarker,
      );
      preMarkRef.current = undefined;
    }
    setIsModalVisible(false);
    if (prevMarkerEva) {
      prevMarkerEva.marker.setIcon(currentType === 'subfac' ? iconSubfacMarker : iconDisMarker);
      prevMarkerEva = undefined;
    }
  };

  // 监听路由的切换
  useEffect(() => {
    isUnmountMap = false;
    const unlisten = history.listen((location: any) => {
      if (location?.pathname !== '/facilityAssets') {
        // trafficLayerEva = null;
        mapSaliteLayerEva = null;
        mapClusterEva = null;
        idistrict = null;
        map.off('zoomend', handleZoom);
        map && map.destroy();
      }
    });
    return () => {
      isUnmountMap = true;
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
          modalTitle={currentType === 'subfac' ? '附属设施信息' : '病害信息'}
          platform={currentType === 'subfac' ? 'subfac' : 'phpdisease'}
          extraData={props?.extraData}
        />
      ) : null}
    </div>
  );
};
export default EvaMap;
