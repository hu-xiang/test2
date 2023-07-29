import styles from './styles.less';
import { Image } from 'antd';
import React, { useEffect, useRef, useState, useImperativeHandle } from 'react';
import { taskMap, getMapImg } from '../serves';
import beginIcon from '../../../../../assets/img/facility/begin.svg';
import endIcon from '../../../../../assets/img/facility/end.svg';
import pointSvg from '../../../../../../public/images/map-ppoint-normal.svg';
import pointBigSvg from '../../../../../../public/images/map-ppoint-bigger.svg';
import tcSvg from '../../../../../../public/images/tc-normal.svg';
import tcBigSvg from '../../../../../../public/images/tc-bigger.svg';
// import markerIcon from '../../../../../assets/img/facility/marker.svg';
// import markerIcon from '../../../../../assets/img/map/mapPoint.svg';

type Iprops = {
  height?: number;
  // isNotSetNull?: boolean;
  patrolTaskId?: string | number;
  // typeList?: any[];
  // page?: string | number;
  // pageSize?: string | number;
  // reviewStatus?: string | number;
  diseaseList: any;
  rowId?: string | undefined;
  diseaseType?: string | undefined;
  facilityId?: string | number;
  currentTime?: any;
  onRef?: any;
};
let map: any = null;
const { AMap }: any = window;
// 路径线
let polyline: any = new Map();
// 公里桩
let markers: any = new Map();
// 病害marker
// let disMarkers: any = null;

let renderMarkerEva: any = null;
let mapClusterEva: any = null;
// const normalOffset = new AMap.Pixel(-11, -28);

let infoWindow: any = null;
const stakeOffset = new AMap.Pixel(-8, -8);
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

let isRow: boolean = false;

const MapLocation: React.FC<Iprops> = (props) => {
  const [imageUrl, setImageUrl] = useState<any>('');
  const [modalShow, setModalShow] = useState<any>(false);
  const modalRef = useRef(null);

  const setZoomMapCenter = (position: any) => {
    /* eslint  no-async-promise-executor: 0 */
    return new Promise(async (resolve) => {
      map?.setZoomAndCenter(50, position, true);
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  };

  const changeIcon = (targetMarker: any, id: any, type: any, url: any) => {
    /* eslint no-underscore-dangle: 0 */

    if (prevMarker && prevMarker?.id && prevMarker?.id !== id) {
      const markerArr = map?.getAllOverlays('marker');
      const marker = markerArr?.filter((item: any) => item?.extData?.id === prevMarker?.id)[0];
      const typeD = marker?.extData?.diseaseType || prevMarker?.diseaseType;
      const preicon = typeD === 14 ? iconTcMarker : iconNormalMarker;
      marker?.setTop(false);
      marker?.setIcon(preicon);
      // 上一个marker还原
      prevMarker?.marker?.setTop(false);
      prevMarker?.marker?.setIcon(preicon);
      // prevMarker.marker.setzIndex(20);
    }
    // 重新定义上一个marker为最新的(如果为首尾marker不需要重新定义)
    prevMarker = { marker: targetMarker, id, diseaseType: type };
    // icon变大，(如果为首尾marker不需要变大)
    const icon = type === 14 ? iconTcBigMarker : iconBigMarker;
    targetMarker?.setTop(true);
    targetMarker?.setIcon(icon);
    // targetMarker.setzIndex(22);
    setImageUrl(url);
    setModalShow(true);
    infoWindow?.setContent(modalRef.current);
    infoWindow?.open(map, targetMarker?.getPosition());
    isRow = false;
  };

  const markerClick = async (e: any, id: any, diseaseType: any) => {
    isRow = true;
    setTimeout(async () => {
      const res1: any = await getMapImg(id);
      let targetMarker: any = null;
      let type: any = null;
      if (!e) {
        setZoomMapCenter([res1?.data?.longitude, res1?.data?.latitude])?.then((res) => {
          if (res) {
            const markerArr = map?.getAllOverlays('marker');
            targetMarker = markerArr?.filter((item: any) => item?.extData?.id === id)[0];
            type = targetMarker?.extData?.diseaseType;
            // if (!targetMarker) return;
            changeIcon(targetMarker, id, type, res1?.data?.imageUrl);
          }
        });
      } else {
        type = diseaseType;
        targetMarker = e?.target;
        // if (!targetMarker) return;
        changeIcon(targetMarker, id, type, res1?.data?.imageUrl);
      }
    }, 100);
  };

  const clearMap = (type: number) => {
    if (type === 2) {
      // disMarkers?.forEach((item: any) => {
      //   if (item && item?.marker) {
      //     map?.remove(item?.marker);
      //   }
      // });
      // if (disMarkers?.length) {
      //   disMarkers.length = 0;
      // }
    }
    if (type === 1) {
      [...polyline]?.forEach((item: any) => {
        if (item && item?.length && item[1]) {
          map.remove(item[1]);
        }
      });
      if (polyline?.size > 0) {
        polyline?.clear();
      }

      [...markers]?.forEach((item: any) => {
        if (item && item?.length && item[1]) {
          map?.remove(item[1]);
        }
      });
      if (markers?.size > 0) {
        markers?.clear();
      }
    }
  };

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

  const renderDisMarker = (list: any) => {
    clearMap(2);
    if (!list || !list?.length) {
      return;
    }
    // disMarkers = [];
    // list?.forEach((item: any) => {
    //   const marker = new AMap.Marker({
    //     icon: item?.diseaseType === 14 ? iconTcMarker : iconNormalMarker,
    //     position: item?.lnglat,
    //     anchor: 'bottom-center',
    //     zIndex: 20,
    //     map,
    //   });
    //   marker.on('click', (e: any) => {
    //     markerClick(e, item?.id, item?.diseaseType);
    //   });
    //   map?.add(marker);
    //   disMarkers?.push({ marker, id: item?.id, diseaseType: item?.diseaseType });
    // });

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
      size = Math.round(30 + (context.count / list?.length) ** (1 / 5) * 25);
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
      // let offset = normalOffset;
      context.marker.topWhenClick = true;
      context.marker.bubble = true;
      context.marker.extData = {
        id: context.data[0]?.id,
        diseaseType: context.data[0]?.diseaseType,
      };
      context.marker.setzIndex(20);
      let icon = context.data[0]?.diseaseType === 14 ? iconTcMarker : iconNormalMarker;
      if (prevMarker && prevMarker?.id && prevMarker?.id === context.data[0]?.id && !isRow) {
        icon = context.data[0]?.diseaseType === 14 ? iconTcBigMarker : iconBigMarker;
        context.marker.setIcon(icon);
        context.marker?.setTop(true);
      } else {
        context.marker.setIcon(icon);
        context.marker?.setTop(false);
      }
      // context.marker.setIcon(icon);
      // context.marker.setOffset(offset);
      context.marker.on('click', (event: any) => {
        markerClick(event, context.data[0]?.id, context.data[0]?.diseaseType);
      });
    };
    function addCluster() {
      const gridSize = setGridSizeNum(list?.length);
      AMap.plugin('AMap.MarkerCluster', () => {
        // 异步加载插件
        // eslint-disable-next-line no-new
        mapClusterEva = new AMap.MarkerCluster(map, list, {
          gridSize, // 设置网格像素大小
          renderClusterMarker, // 自定义聚合点样式
          renderMarker: renderMarkerEva, // 自定义非聚合点样式
          maxZoom: 20,
          minClusterSize: 2, // 聚合的最小数量。默认值为2，即小于2个点则不能成为一个聚合
        });
      });
    }
    if (mapClusterEva) {
      mapClusterEva.setMap(null);
    }
    if (list && list.length > 0) {
      addCluster();
      // map.setCenter([list[0].longitude, list[0].latitude] || [114.058141, 22.543544]);
    }
  };

  const renderUPDown = (list: any, type: number) => {
    const direct = type === 0 ? '上行' : '下行';
    list?.forEach((item: any, index: number) => {
      if (index !== list?.length - 1) {
        // 公里桩之间的线段
        const polylineItem = new AMap.Polyline({
          path: [
            [item?.longitude, item?.latitude],
            [list[index + 1]?.longitude, list[index + 1]?.latitude],
          ], // 设置线覆盖物路径，公里桩之间的线段起点终点
          // showDir: false,
          // dirColor: 'pink',
          strokeOpacity: 1,
          strokeColor: item?.isDoneTask || list[index + 1]?.isDoneTask ? '#54A325' : '#999',
          strokeWeight: 3, // 线宽
          extData: {
            id: item?.id,
          },
        });
        polyline.get(props.patrolTaskId).push(polylineItem);
        map.add(polylineItem);
      }

      const newStakeMarkers = new AMap.Marker({
        position: [item?.longitude, item?.latitude],
        title: `${item?.stakeNo}${direct}`,
        content: item?.isDoneTask
          ? `<div class="inspect-stake-icon"><div class="inspect-stake-icon-inner"></div></div>`
          : `<div class="inspect-stake-dark-icon"><div class="inspect-stake-icon-inner"></div></div>`,
        // icon: iconFacMarker,
        offset: stakeOffset,
        zIndex: 10,
        extData: {
          className: 'projectClass',
          id: item?.id,
          direct: type,
          startPoint: item?.stakeNo,
          label: item?.stakeNo,
        },
      });
      if (index === 0 || index === list?.length - 1) {
        let icon: any = beginIcon;
        if (type === 0 && index === list?.length - 1) {
          icon = endIcon;
        }
        if (type === 1 && index === 0) {
          icon = endIcon;
        }
        const startEndMarker = new AMap.Marker({
          position: [item?.longitude, item?.latitude],
          icon,
          anchor: 'bottom-center',
          zIndex: 15,
          extData: {
            isStartOrEnd: true,
          },
        });
        markers.get(props.patrolTaskId).push(startEndMarker);
        map.add(startEndMarker);
      }
      markers.get(props.patrolTaskId).push(newStakeMarkers);
      map.add(newStakeMarkers);
    });
  };

  const renderPathAndStake = (list: any) => {
    clearMap(1);
    if (list[0]?.length) {
      map.setZoomAndCenter(10, [list[0][0]?.longitude, list[0][0]?.latitude]);
    } else {
      /* eslint no-lonely-if: 0 */
      if (list[1]?.length) {
        map.setZoomAndCenter(10, [list[1][0]?.longitude, list[1][0]?.latitude]);
      }
    }
    polyline.set(props.patrolTaskId, []);
    markers.set(props.patrolTaskId, []);

    renderUPDown(list[0], 0);
    renderUPDown(list[1], 1);
  };

  const getPathAndStake = async () => {
    const params: any = {
      facilityId: props?.facilityId,
      taskId: props?.patrolTaskId,
    };
    const res: any = await taskMap(params);
    renderPathAndStake(res?.data);
  };

  useImperativeHandle(props.onRef, () => ({
    // 暴露给父组件的方法
    getPathAndStake,
  }));

  useEffect(() => {
    setTimeout(() => {
      if (modalShow) {
        map?.clearInfoWindow();
      }
      if (prevMarker) {
        const markerArr = map?.getAllOverlays('marker');
        const targetMarker = markerArr?.filter(
          (item: any) => item?.extData?.id === prevMarker?.id,
        )[0];
        const type = targetMarker?.extData?.diseaseType || prevMarker?.diseaseType;
        const preicon = type === 14 ? iconTcMarker : iconNormalMarker;
        targetMarker?.setTop(false);
        targetMarker?.setIcon(preicon);
        prevMarker.marker.setTop(false);
        prevMarker.marker.setIcon(preicon);
        prevMarker = undefined;
      }
      renderDisMarker(props?.diseaseList || []);
    }, 100);
  }, [props?.diseaseList]);

  useEffect(() => {
    setTimeout(() => {
      if (props.rowId) {
        markerClick(null, props.rowId, '');
      }
    }, 100);
  }, [props.currentTime]);

  const hideStakeMaker = (zoomFlag: boolean) => {
    // console.log('hideStakeMaker',zoomFlag,proid,stakeMarkers);
    if (markers?.size) {
      [...markers].forEach((itaValue: any) => {
        if (itaValue && itaValue?.length && itaValue[1]) {
          itaValue[1].forEach((itr: any) => {
            if (!itr?.getExtData()?.isStartOrEnd) {
              // const extraInfo = itr.getExtData();
              itr.setLabel({
                // direction: extraInfo?.direct===1?'right':'left',
                content: ``, // 设置文本标注内容
              });
              if (zoomFlag) {
                itr.hide();
              }
            }
          });
        }
      });
    }
  };

  // 地图放大显示桩号
  const openStakeMaker = (zoomMakerflag: boolean, zoomLabelflag: boolean) => {
    if (markers?.size) {
      [...markers].forEach((iteValue: any) => {
        if (iteValue && iteValue?.length && iteValue[1]) {
          iteValue[1].forEach((itr: any) => {
            const extraInfo = itr.getExtData();
            if (!extraInfo?.isStartOrEnd) {
              if (zoomMakerflag) {
                itr.show();
              }

              if (zoomLabelflag) {
                itr.setLabel({
                  direction: extraInfo?.direct === 1 ? 'right' : 'left',
                  zIndex: 100,
                  anchor: 'top-right',
                  offset: extraInfo?.direct === 1 ? new AMap.Pixel(-3, 0) : new AMap.Pixel(5, -5),
                  content: `<div class='stake-bg ${
                    extraInfo?.direct === 1 ? 'left-transtion' : 'right-transtion'
                  }'><span class='inspect-stake-name-class'>${`${extraInfo?.label}${
                    extraInfo?.direct === 0 ? '上行' : '下行'
                  }`}</span></div>`, // 设置文本标注内容
                });
              } else {
                itr.setLabel({
                  content: ``, // 设置文本标注内容
                });
              }
            }
          });
        }
      });
    }
  };

  const mapZoom = (zoom: number) => {
    const zoomMakerflag = zoom > 10;
    const zoomLabelflag = zoom > 17;
    if (zoomMakerflag) {
      // 展示
      openStakeMaker(zoomMakerflag, zoomLabelflag);
    } else {
      hideStakeMaker(!zoomMakerflag);
    }
  };
  const handleZoom = () => {
    if (prevMarker && prevMarker?.id && infoWindow?.getIsOpen()) {
      const markers = map?.getAllOverlays('marker');
      const hasMarker = markers?.filter((item: any) => item?.extData?.id === prevMarker?.id)[0];
      if (!hasMarker) {
        setImageUrl('');
        map?.clearInfoWindow();
        prevMarker = undefined;
      }
    }
    const newZoom = map?.getZoom();
    mapZoom(newZoom); // >17显示百里桩
  };

  useEffect(() => {
    markers = new Map();
    polyline = new Map();
    infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -30), isCustom: true });
    const center: any = [114.058141, 22.543544];
    const zoom = 10;
    map = new AMap.Map('container', {
      zoom,
      center,
      // mapStyle: 'amap://styles/5cfb475a7621dccba5ff381b2f3c8ab4',
      // pitch: 60, // 地图俯仰角度，有效范围 0 度- 83 度
      // viewMode: '3D', // 地图模式
      jogEnable: true,
      animateEnable: false,
      zooms: [4.54, 23],
      defaultCursor: 'grab',
      // skyColor: '#1f263a', // 3D 模式下带有俯仰角时会显示
    });
    getPathAndStake();

    map.on('click', () => {
      // 点击地图关闭弹窗
      map.clearInfoWindow();
      if (prevMarker) {
        const markerArr = map?.getAllOverlays('marker');
        const targetMarker = markerArr?.filter(
          (item: any) => item?.extData?.id === prevMarker?.id,
        )[0];
        const type = targetMarker?.extData?.diseaseType || prevMarker?.diseaseType;
        const preicon = type === 14 ? iconTcMarker : iconNormalMarker;
        targetMarker?.setTop(false);
        targetMarker?.setIcon(preicon);
        prevMarker.marker.setTop(false);
        prevMarker.marker.setIcon(preicon);
        prevMarker = undefined;
      }
    });

    map.on('zoomend', handleZoom);
    return () => {
      setImageUrl('');
      setModalShow(false);
      isRow = false;
      infoWindow = null;
      prevMarker = undefined;
      map?.clearInfoWindow();
      map.off('zoomend', handleZoom);
      // 销毁地图，并清空地图容器
      if (map) map.destroy();
      map = null;
      polyline = new Map();
    };
  }, []);

  return (
    <div className={styles.taskMapContainer}>
      <div className={styles.mapLocation}>
        <div className={styles.mapBox}>
          <div
            className={styles.mapBigs}
            style={props.height ? { height: `${props.height}px` } : { height: '300px' }}
            id="container"
            onDoubleClick={() => {}}
          />
        </div>
      </div>
      {modalShow ? (
        <div
          ref={modalRef}
          style={{ marginTop: '-10px', marginLeft: '12px' }}
          className={styles.infoWindow}
        >
          <Image src={imageUrl} style={{ width: 120, height: 90 }} placeholder={true} />
        </div>
      ) : null}
    </div>
  );
};
export default MapLocation;
