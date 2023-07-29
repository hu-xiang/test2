import { Input } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.less';
import { commonRequest } from 'baseline/src/utils/commonMethod';
import styles1 from './MapPoint/styles.less';
import markerIcon from 'baseline/src/assets/img/mapPng/marker.png';
import { isEqual, debounce } from 'lodash';

const requestList = [{ url: '/traffic-bsl/project/roadDetail', method: 'get' }];

type Iprops = {
  id?: string;
};

let timer: any = null;
let map: any = null;
const { AMap }: any = window;
let markers: any = [];
let layer: any = null;

const BasicInfo: React.FC<Iprops> = (props) => {
  const compareMapRef = useRef<any>(null);
  const [roadName, setRoadName] = useState<string>('');
  const [roadType, setRoadType] = useState<string>('');
  const [roadLevel, setRoadLevel] = useState<string>('');
  const [start, setStart] = useState<string>('');
  const [end, setEnd] = useState<string>('');
  const [sceneMark, setSceneMark] = useState<string>('');
  const [trouble, setTrouble] = useState<string>('');
  const [accident, setAccident] = useState<string>('');
  // 存地图可视区域四个角位置数据
  const [pathBound, setPathBound] = useState<any>([]);
  const [pointList, setPointList] = useState<any>([]);

  // 是否在可视区域
  const isInview = () => {
    if (map) {
      const bounds = map?.getBounds();
      const NorthEast = bounds?.getNorthEast();
      const SouthWest = bounds?.getSouthWest();
      const SouthEast = [NorthEast.lng, SouthWest.lat];
      const NorthWest = [SouthWest.lng, NorthEast.lat];
      const path = [
        [NorthEast.lng, NorthEast.lat],
        SouthEast,
        [SouthWest.lng, SouthWest.lat],
        NorthWest,
      ]; // 将地图可视区域四个角位置按照顺序放入path，用于判断point是否在可视区域
      setPathBound(path);
    }
  };

  const mapDraw = (list: any) => {
    /* eslint-disable */
    if (list.length) {
      markers = [];
      layer = new AMap.LabelsLayer({
        zooms: [3, 20],
        zIndex: 1000,
        collision: false,
      });

      // 将图层添加到地图
      map?.add(layer);
      const icon = {
        type: 'image',
        image: markerIcon,
        size: [20, 26],
        anchor: 'bottom-center',
      };

      for (let i = 0; i < list.length; i++) {
        const curData = {
          position: list[i]?.lnglat,
          icon,
        };

        const labelMarker = new AMap.LabelMarker(curData);
        markers.push(labelMarker);
        if (map?.getZoom() > 18) {
          const marker: any = new AMap.Marker({
            offset: [0, -15],
            anchor: 'bottom-center',
          });

          let address = '';
          AMap.plugin('AMap.Geocoder', () => {
            const geocoder = new AMap.Geocoder();
            geocoder.getAddress(list[i]?.lnglat, (status: string, result: any) => {
              if (status === 'complete' && result.info === 'OK') {
                // result为对应的地理位置详细信息
                address = result.regeocode.formattedAddress;
              }
            });
          });
          // 给marker绑定事件
          labelMarker.on('mouseover', () => {
            marker.setContent(
              `<div class="amap-info-window">${address}
                <div class="amap-info-sharp"></div></div>`,
            );
            marker.setPosition(list[i]?.lnglat);
            map.add(marker);
          });

          labelMarker.on('mouseout', () => {
            map.remove(marker);
          });

          marker.on('mouseover', () => {
            marker.setContent(
              `<div class="amap-info-window">${address}
                <div class="amap-info-sharp"></div></div>`,
            );
            marker.setPosition(list[i]?.lnglat);
            map?.add(marker);
          });

          marker.on('mouseout', () => {
            map.remove(marker);
          });
        }
      }
      // 一次性将海量点添加到图层
      layer.add(markers);
    }
    /* eslint-enable */
  };

  const getBasicInfo = async (params: any) => {
    const res = await commonRequest({ ...requestList[0], params });
    setRoadName(res?.data?.fkFacName);
    setRoadType(res?.data?.roadType);
    setRoadLevel(res?.data?.roadLevel);
    setStart(res?.data?.startPoint);
    setEnd(res?.data?.endPoint);
    setSceneMark(res?.data?.calibrationStatus === 1 ? '已完成' : '未完成');
    setTrouble(res?.data?.checkStatus === 1 ? '已完成' : '未完成');
    setAccident(res?.data?.uploadStatus === 1 ? '已完成' : '未完成');
    if (layer) map?.remove(layer);
    if (map) map?.remove(markers);
    setPointList(res?.data?.trackList || []);
    if (res?.data?.trackList?.length) {
      // map?.setCenter(res?.data?.trackList[0]?.lnglat);
      // mapDraw(res?.data?.trackList);
      // if (map?.getZoom() > 15) {
      //   mapDraw(res?.data?.trackList);
      // } else {
      //   /* eslint no-lonely-if:0 */
      //   if (res?.data?.trackList?.length > 1000) {
      //     mapDraw(res?.data?.trackList?.slice(0, 1000));
      //   } else {
      //     mapDraw(res?.data?.trackList);
      //   }
      // }
      // if (res?.data?.trackList?.length > 1000) {
      //   let index1 = 0;
      //   timer = setInterval(() => {
      //     const end =
      //       (index1 + 1) * 1000 > res?.data?.trackList?.length ? res?.data?.trackList?.length : (index1 + 1) * 1000;
      //       mapDraw(res?.data?.trackList?.slice(index1 * 1000, end));
      //     index1 += 1;
      //     if (index1 === Math.ceil(res?.data?.trackList?.length / 1000)) {
      //       clearInterval(timer);
      //     }
      //   }, 100);
      // } else {
      //   mapDraw(res?.data?.trackList);
      // }
    }
  };

  const debounceMapEvent = debounce(
    () => {
      isInview();
    },
    500,
    {
      leading: false,
      trailing: true,
    },
  );
  const handleEvent = () => {
    // console.log('e',e )
    debounceMapEvent();
  };
  const handleDragEvent = () => {
    // console.log('edrag',e )
    debounceMapEvent();
    map.setDefaultCursor('grab');
  };

  const newPathData = (val: any) => {
    if (!isEqual(compareMapRef.current, val)) {
      compareMapRef.current = val;
    }
    return compareMapRef.current;
  };

  useEffect(() => {
    return () => {
      map.off('zoomend', handleEvent);
      map.off('moveend', handleEvent);
      map.off('dragend', handleDragEvent);
      // 销毁地图，并清空地图容器
      if (map) map.destroy();
      map = null;
      clearInterval(timer);
      timer = null;
    };
  }, []);

  useEffect(() => {
    if (map) {
      setPointList([]);
      // 销毁地图，并清空地图容器
      if (layer) map.remove(layer);
      if (markers.length) {
        map.remove(markers);
        markers = [];
      }
      map.off('zoomend', handleEvent);
      map.off('moveend', handleEvent);
      map.off('dragend', handleDragEvent);
      map.destroy();
      map = null;
    }
    map = new AMap.Map('container', {
      zoom: 10,
      // zooms: [2, 30],
      center: [114.514859, 38.042306],
      pitch: 40, // 地图俯仰角度，有效范围 0 度- 83 度
      viewMode: '3D', // 地图模式
    });
    map.on('zoomstart', () => {
      // stopInterval();
    });
    map.on('zoomend', handleEvent);

    map.on('movestart', () => {
      // stopInterval();
    });
    // map.on('zoomchange', () => {
    //    console.log('ddgg',map.getZooms(),map.getZoom())
    //   });
    map.on('moveend', handleEvent);
    map.on('dragstart', () => {
      // map.setDefaultCursor('grabbing');
      // stopInterval();
    });
    map.on('dragend', handleDragEvent);
    debounceMapEvent();
  }, [props?.id]);

  const isPointInRing = (path: any, arr: any) => {
    const arr1: any = arr?.filter((item: any) =>
      AMap.GeometryUtil.isPointInRing(item?.lnglat, path),
    );
    return arr1;
  };

  useEffect(() => {
    if (pointList?.length) {
      setTimeout(() => {
        map?.setZoomAndCenter(18, pointList[0]?.lnglat, true);
      }, 0);
    }
  }, [pointList]);

  // 地图可视区域四个角位置变化后请求聚合数据
  useEffect(() => {
    if (pathBound && pathBound?.length) {
      if (props?.id) {
        let params: any = {
          id: props?.id,
        };
        params = {
          id: props?.id,
          // latitude1: pathBound[0][1],
          // latitude2: pathBound[1][1],
          // latitude3: pathBound[2][1],
          // latitude4: pathBound[3][1],
          // longitude1: pathBound[0][0],
          // longitude2: pathBound[1][0],
          // longitude3: pathBound[2][0],
          // longitude4: pathBound[3][0],
        };

        if (!pointList?.length) {
          getBasicInfo(params);
        } else {
          const arr: any = isPointInRing(pathBound, pointList);
          if (layer) map?.remove(layer);
          if (map) map?.remove(markers);
          if (map?.getZoom() > 15) {
            mapDraw(arr);
          } else {
            /* eslint no-lonely-if:0 */
            if (arr?.length > 1000) {
              mapDraw(arr?.slice(0, 1000));
            } else {
              mapDraw(arr);
            }
          }
        }
      }
    }
  }, [newPathData(pathBound)]);
  return (
    <div className={styles.BasicInfo}>
      <div className={styles.formInfo}>
        <div className={styles.formRowInfo}>
          <div className={styles.formItemInfo}>
            <div className={styles.itemLabel}>道路名称</div>
            <div className={styles.itemInput}>
              <Input value={roadName} disabled />
            </div>
          </div>
          <div className={styles.formItemInfo}>
            <div className={styles.itemLabel}>道路类别</div>
            <div className={styles.itemInput}>
              <Input value={roadType} disabled />
            </div>
          </div>
          <div className={styles.formItemInfo}>
            <div className={styles.itemLabel}>道路等级</div>
            <div className={styles.itemInput}>
              <Input value={roadLevel} disabled />
            </div>
          </div>
          <div className={styles.formItemInfo}>
            <div className={styles.itemLabel}>起点</div>
            <div className={styles.itemInput}>
              <Input value={start} disabled />
            </div>
          </div>
        </div>

        <div className={styles.formRowInfo}>
          <div className={styles.formItemInfo}>
            <div className={styles.itemLabel}>终点</div>
            <div className={styles.itemInput}>
              <Input value={end} disabled />
            </div>
          </div>
          <div className={styles.formItemInfo}>
            <div className={styles.itemLabel}>场景标定</div>
            <div className={styles.itemInput}>
              <Input
                value={sceneMark}
                disabled
                className={sceneMark === '未完成' ? 'redTxt' : 'greenTxt'}
              />
            </div>
          </div>
          <div className={styles.formItemInfo}>
            <div className={styles.itemLabel}>隐患排查</div>
            <div className={styles.itemInput}>
              <Input
                value={trouble}
                disabled
                className={trouble === '未完成' ? 'redTxt' : 'greenTxt'}
              />
            </div>
          </div>
          <div className={styles.formItemInfo}>
            <div className={styles.itemLabel}>事故上传</div>
            <div className={styles.itemInput}>
              <Input
                value={accident}
                disabled
                className={accident === '未完成' ? 'redTxt' : 'greenTxt'}
              />
            </div>
          </div>
        </div>
      </div>
      <div className={styles.mapInfo}>
        <div className={styles1.mapLocation}>
          <div className={styles1.mapBox}>
            <div
              className={styles1.mapBigs}
              style={{ height: 'calc(100vh - 408px)' }}
              id={'container'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default BasicInfo;
