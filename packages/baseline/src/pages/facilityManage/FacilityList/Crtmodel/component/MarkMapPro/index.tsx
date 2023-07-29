import styles from './styles.less';
import { Card, Select, Button, DatePicker, message, Input } from 'antd';
import type { DatePickerProps } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import { useModel } from 'umi';
import bigNormal from '../../../../../../assets/img/mapPng/bigNormal.png';
import normal from '../../../../../../assets/img/mapPng/normal.png';
import upStart from '../../../../../../assets/img/mapPng/upStart.png';
import up from '../../../../../../assets/img/mapPng/up.png';
import upEnd from '../../../../../../assets/img/mapPng/upEnd.png';
import downStart from '../../../../../../assets/img/mapPng/downStart.png';
import down from '../../../../../../assets/img/mapPng/down.png';
import downEnd from '../../../../../../assets/img/mapPng/downEnd.png';
import { commonRequest } from '../../../../../../utils/commonMethod';
import { ReactComponent as Warn } from '../../../../../../assets/icon/warn.svg';
import { ReactComponent as UpSvg } from '../../../../../../assets/img/map/up.svg';
import { ReactComponent as DownSvg } from '../../../../../../assets/img/map/down.svg';
import moment from 'moment';

const requestList = [
  { url: '/traffic/facility/location/queryLocations', method: 'get' },
  { url: '/traffic/inspection/selectDevices', method: 'get' },
];
const { Option } = Select;
let map: any = null;
const { AMap }: any = window;
let markers: any = [];
let infoWindow: any = null;
let timer: any = null;
let layer: any = null;
let show: any = false;
let isQuery: boolean = false;
const kind = {
  1: '上行起点',
  3: '上行终点',
  4: '下行起点',
  6: '下行终点',
};
const iconEnum = {
  0: normal,
  1: upStart,
  2: up,
  3: upEnd,
  4: downStart,
  5: down,
  6: downEnd,
};
type Iprops = {
  searchVisible?: boolean;
  canNotEdit?: boolean;
  isEdit?: boolean;
  height?: string;
};
const MarkMapPro: React.FC<Iprops> = (props) => {
  const { searchVisible, canNotEdit = false, isEdit } = props;
  const [leftNumber, setLeftNumber] = useState<string>('000');
  const [rightNumber, setRightNumber] = useState<string>('000');
  const {
    lnglatArr,
    setLnglatArr,
    upStartIndex,
    setUpStartIndex,
    upEndIndex,
    setUpEndIndex,
    downStartIndex,
    setDownStartIndex,
    downEndIndex,
    setDownEndIndex,
    canMark,
    setCanMark,
    pointTypeList,
    setPointTypeList,
    stakeNo,
    setStakeNo,
  } = useModel<any>('facility');
  const [modalShow, setModalShow] = useState<any>(false);
  const [currentType, setCurrentType] = useState<number>(0);
  const [pointType, setPointType] = useState<any>(null);
  const [index, setIndex] = useState<number>(-1);
  // const [pointTypeList, setPointTypeList] = useState<any>([]);
  const [deviceList, setDeviceList] = useState<any>([]);
  const [deviceId, setDeviceId] = useState<any>('');
  const [startTime, setStartTime] = useState<any>(null);
  const [endTime, setEndTime] = useState<any>(null);
  const [isStartOrEnd, setIsStartOrEnd] = useState<any>(false);
  // const [canMark, setCanMark] = useState<any>(false);
  const [currentMarker, setCurrentMarker] = useState<any>();
  const modalRef = useRef(null);

  const getPosition = async () => {
    setCanMark(true);
    const res: any = await commonRequest({
      ...requestList[0],
      params: { startTime, deviceId, endTime },
    });
    if (res?.data?.length) map?.setCenter([res?.data[0].longitude, res?.data[0].latitude]);
    isQuery = true;
    setLnglatArr(res?.data);
    setPointTypeList([]);
  };

  const getDevice = async () => {
    const res: any = await commonRequest({ ...requestList[1], params: {} });
    setDeviceList(res?.data);
  };

  useEffect(() => {
    if (startTime && endTime && deviceId) {
      getPosition();
    }
  }, [deviceId, startTime, endTime]);

  useEffect(() => {
    getDevice();
  }, [isEdit]);

  useEffect(() => {
    if (stakeNo && stakeNo?.length > 0) {
      stakeNo.forEach((itd: any, ind: number) => {
        if (ind === 0) {
          setLeftNumber(itd);
        } else {
          setRightNumber(itd);
        }
      });
    }
    return () => {
      setModalShow(false);
      show = false;
      infoWindow = null;
      if (layer) map?.remove(layer);
      layer = null;
      map.clearInfoWindow();
      // 销毁地图，并清空地图容器
      if (markers.length) {
        map.remove(markers);
        markers = [];
      }
      if (map) map.destroy();
      map = null;
      if (timer) {
        clearInterval(timer);
      }
    };
  }, []);
  const resetIcon = () => {
    // const icon = new AMap.Icon({
    //   size: new AMap.Size(20, 26), // 图标尺寸
    //   image: normal,
    //   imageSize: new AMap.Size(20, 26),
    // });
    const icon = {
      type: 'image',
      image: normal,
      size: [20, 26],
      imageSize: [20, 26],
      anchor: 'bottom-center',
    };
    currentMarker?.setIcon(icon);
  };

  const markerClick = (iconType: number, i: number, labelMarker: any) => {
    if (!canMark) return;
    setIndex(i);
    if ([1, 3, 4, 6].includes(iconType)) {
      setIsStartOrEnd(true);
    } else {
      if (upStartIndex !== -1 && upEndIndex !== -1 && downStartIndex !== -1 && downEndIndex !== -1)
        return;
      setIsStartOrEnd(false);
    }
    setCurrentMarker(labelMarker);
    setCurrentType(iconType);
    if ([0, 1, 3, 4, 6].includes(iconType)) {
      if (iconType === 0) {
        // const icon = new AMap.Icon({
        //   size: new AMap.Size(26, 36), // 图标尺寸
        //   image: bigNormal,
        //   imageSize: new AMap.Size(26, 36),
        // });

        const icon = {
          type: 'image',
          image: bigNormal,
          size: [26, 36],
          imageSize: [26, 36],
          anchor: 'bottom-center',
        };

        labelMarker.setIcon(icon);
      }
      setModalShow(true);
      show = true;
      infoWindow.setContent(modalRef?.current);
      infoWindow.open(map, labelMarker?.getPosition());
    }
  };

  const renderMarkers = (
    curPosition: any,
    i: number,
    iconType: number,
    stakeNo1?: string,
    normalMarker?: any,
  ) => {
    let address = '';
    /* eslint  no-unneeded-ternary: 0 */
    AMap.plugin('AMap.Geocoder', () => {
      const geocoder = new AMap.Geocoder();
      geocoder.getAddress(curPosition, (status: string, result: any) => {
        if (status === 'complete' && result.info === 'OK') {
          // result为对应的地理位置详细信息
          address = result.regeocode.formattedAddress;
        }
      });
    });

    const type = iconType ? iconType : 0;
    // const icon = new AMap.Icon({
    //   size: [1, 3, 4, 6].includes(type) ? new AMap.Size(26, 36) : new AMap.Size(20, 26), // 图标尺寸
    //   image: type ? iconEnum[type] : normal,
    //   imageSize: [1, 3, 4, 6].includes(type) ? new AMap.Size(26, 36) : new AMap.Size(20, 26),
    // });

    const icon = {
      type: 'image',
      image: type ? iconEnum[type] : normal,
      size: [1, 3, 4, 6].includes(type) ? [26, 36] : [20, 26],
      imageSize: [1, 3, 4, 6].includes(type) ? [26, 36] : [20, 26],
      anchor: 'bottom-center',
    };

    const marker: any = new AMap.LabelMarker({
      // map,
      icon,
      position: curPosition,
      anchor: 'bottom-center',
      extData: {
        type,
      },
    });

    markers.push(marker);

    // 给marker绑定事件
    marker.on('click', () => {
      markerClick(type, i, marker);
    });
    let text = '';
    if ([1, 2, 3]?.includes(type)) {
      text = '上行';
    }
    if ([4, 5, 6]?.includes(type)) {
      text = '下行';
    }
    // marker.on('mouseover', () => {
    //   if (!show && address) {
    //     if (stakeNo1) {
    //       infoWindow.setContent(
    //         `<div class="amap-info-window">桩号:${stakeNo1}${text}<br/>地址:${address}
    //         <div class="amap-info-sharp"></div></div>`,
    //       );
    //     } else {
    //       infoWindow.setContent(
    //         `<div class="amap-info-window">地址:${address}
    //         <div class="amap-info-sharp"></div></div>`,
    //       );
    //     }

    //     infoWindow.open(map, marker?.getPosition());
    //   }
    // });

    // marker.on('mouseout', () => {
    //   if (!show) {
    //     map.clearInfoWindow();
    //   }
    // });

    // 给marker绑定事件
    marker.on('mouseover', function () {
      if (!show) {
        if (stakeNo1) {
          normalMarker.setContent(
            address
              ? `<div class="amap-info-window">桩号:${stakeNo1}${text}<br/>地址:${address}
            <div class="amap-info-sharp"></div></div>`
              : `<div class="amap-info-window">桩号:${stakeNo1}${text}
            <div class="amap-info-sharp"></div></div>`,
          );
          normalMarker.setPosition(curPosition);
          map.add(normalMarker);
        } else {
          /* eslint-disable */
          if (address) {
            normalMarker.setContent(
              `<div class="amap-info-window">地址:${address}
              <div class="amap-info-sharp"></div></div>`,
            );
            normalMarker.setPosition(curPosition);
            map.add(normalMarker);
          }
          /* eslint-enable */
        }
      }
    });

    marker.on('mouseout', function () {
      map.remove(normalMarker);
    });
  };

  const drawMap = (locationList: any, startIndex: number = 0) => {
    const list = locationList.filter((item: any) => {
      return item?.longitude && item?.latitude;
    });
    if (list.length) {
      // 普通点
      const normalMarker = new AMap.Marker({
        anchor: 'bottom-center',
        offset: [0, -15],
      });
      for (let i = 0; i < list.length; i++) {
        renderMarkers(
          [list[i].longitude, list[i].latitude],
          i + startIndex,
          list[i]?.type,
          list[i]?.stakeNo,
          normalMarker,
        );
      }
      // map?.add(markers);
      // 一次性将海量点添加到图层
      layer.add(markers);
    }
  };

  useEffect(() => {
    if (!map || isQuery) {
      map = new AMap.Map('container', {
        zoom: 15,
        center:
          lnglatArr.length > 1
            ? [lnglatArr[1].longitude, lnglatArr[1].latitude]
            : [114.058141, 22.543544],
        showLabel: false,
        showIndoorMap: false,
      });
      if (isQuery) isQuery = false;
    }
    infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, 0), isCustom: true });
    if (layer) {
      layer?.remove(markers);
      map?.remove(layer);
    }
    if (markers.length) {
      map?.remove(markers);
      markers = [];
    }

    // map.on('complete', function () {
    layer = new AMap.LabelsLayer({
      zooms: [3, 20],
      zIndex: 1000,
      collision: false,
    });
    // 将图层添加到地图
    map.add(layer);

    // drawMap(lnglatArr);
    // })
    if (lnglatArr?.length > 1000) {
      let index1 = 0;
      timer = setInterval(() => {
        const startIndex = index1 * 1000;
        // const isEnd = index1 === Math.floor(lnglatArr?.length / 1000);
        const end =
          (index1 + 1) * 1000 > lnglatArr?.length ? lnglatArr?.length : (index1 + 1) * 1000;
        drawMap(lnglatArr.slice(index1 * 1000, end), startIndex);

        index1 += 1;
        if (index1 === Math.ceil(lnglatArr?.length / 1000)) {
          clearInterval(timer);
        }
      }, 100);
    } else {
      drawMap(lnglatArr, 0);
    }
  }, [lnglatArr]);

  const clearMap = () => {
    if (!canMark && props?.isEdit) return;
    const list = lnglatArr.map((item: any) => {
      return {
        ...item,
        type: 0,
      };
    });
    setUpStartIndex(-1);
    setUpEndIndex(-1);
    setDownStartIndex(-1);
    setDownEndIndex(-1);
    setPointTypeList([]);
    setLnglatArr(!canMark ? [[]] : list);
  };
  // 首尾中间的标记点替换
  const markerChange = (list: any) => {
    list.forEach((item: any, i: number) => {
      item.type = 0;
      if (!(upStartIndex < 0) && i === upStartIndex) item.type = 1;
      if (!(upEndIndex < 0) && i === upEndIndex) item.type = 3;
      if (!(downStartIndex < 0) && i === downStartIndex) item.type = 4;
      if (!(downEndIndex < 0) && i === downEndIndex) item.type = 6;

      if (upStartIndex !== -1 && upEndIndex !== -1) {
        if (upStartIndex < upEndIndex && i > upStartIndex && i < upEndIndex) item.type = 2;
        if (upStartIndex > upEndIndex && i > upEndIndex && i < upStartIndex) item.type = 2;
      }

      if (downStartIndex !== -1 && downEndIndex !== -1) {
        if (downStartIndex < downEndIndex && i > downStartIndex && i < downEndIndex) item.type = 5;
        if (downStartIndex > downEndIndex && i > downEndIndex && i < downStartIndex) item.type = 5;
      }
    });
    setLnglatArr(JSON.parse(JSON.stringify(list)));
  };

  const handleCancel = () => {
    if (!lnglatArr[index]?.type) {
      resetIcon();
    }
    setPointType(null);
    setIsStartOrEnd(false);
    map.clearInfoWindow();
    show = false;
    setTimeout(() => {
      setIndex(-1);
    }, 0);
  };

  /* eslint-disable */
  const compareIndex = (center: number, hadPoint: number, current: number) => {
    if (hadPoint > current) {
      if (center > current && center < hadPoint) return true;
      else return false;
    } else {
      if (center < index && center > hadPoint) return true;
      else return false;
    }
  };
  /* eslint-enable */

  const isCross = () => {
    switch (pointType) {
      case 1:
        if (upEndIndex !== -1) {
          // 操作上行起点时，上行终点已存在，判断下行的起终点是否有交叉
          if (downStartIndex !== -1) return compareIndex(downStartIndex, upEndIndex, index);
          if (downEndIndex !== -1) return compareIndex(downEndIndex, upEndIndex, index);
        }
        break;
      case 3:
        if (upStartIndex !== -1) {
          // 操作上行终点时，上行起点已存在，判断下行的起终点是否有交叉
          if (downStartIndex !== -1) return compareIndex(downStartIndex, upStartIndex, index);
          if (downEndIndex !== -1) return compareIndex(downEndIndex, upStartIndex, index);
        }
        break;
      case 4:
        if (downEndIndex !== -1) {
          // 操作下行起点时，下行终点已存在，判断上行的起终点是否有交叉
          if (upStartIndex !== -1) return compareIndex(upStartIndex, downEndIndex, index);
          if (upEndIndex !== -1) return compareIndex(upEndIndex, downEndIndex, index);
        }
        break;
      case 6:
        if (downStartIndex !== -1) {
          // 操作下行终点时，下行起点已存在，判断上行的起终点是否有交叉
          if (upStartIndex !== -1) return compareIndex(upStartIndex, downStartIndex, index);
          if (upEndIndex !== -1) return compareIndex(upEndIndex, downStartIndex, index);
        }
        break;
      default:
        break;
    }
    return false;
  };

  const handleOk = () => {
    if (!lnglatArr[index]?.type && pointType === null) {
      resetIcon();
    }
    if (isStartOrEnd) {
      switch (currentType) {
        case 1:
          setUpStartIndex(-1);
          break;
        case 3:
          setUpEndIndex(-1);
          break;
        case 4:
          setDownStartIndex(-1);
          break;
        case 6:
          setDownEndIndex(-1);
          break;
        default:
          break;
      }
    } else {
      if (isCross()) {
        setPointType(null);
        map.clearInfoWindow();
        resetIcon();
        return message.warn({
          content: '上下行标点不能交叉!',
          key: '上下行标点不能交叉!',
        });
      }
      switch (pointType) {
        case 1:
          setUpStartIndex(index);
          break;
        case 3:
          setUpEndIndex(index);
          break;
        case 4:
          setDownStartIndex(index);
          break;
        case 6:
          setDownEndIndex(index);
          break;
        default:
          break;
      }
    }
    let list: any = [];
    if (isStartOrEnd) list = pointTypeList.filter((item: any) => item !== currentType);
    if ((pointTypeList.length ? !pointTypeList.includes(pointType) : true) && !isStartOrEnd)
      list = [...pointTypeList, pointType];
    setPointTypeList(list);
    setPointType(null);
    map.clearInfoWindow();
    show = false;
    setTimeout(() => {
      setIndex(-1);
    }, 0);
    return true;
  };

  const dateStartTimeChange: DatePickerProps['onChange'] = (_date, dateString) => {
    if (!dateString) {
      setEndTime('');
    }
    setStartTime(dateString);
  };
  const dateEndTimeChange: DatePickerProps['onChange'] = (_date, dateString) => {
    if (new Date(dateString).getTime() < new Date(startTime).getTime()) {
      message.warn({
        content: '结束时间不能早于开始时间',
      });
      return;
    }
    setEndTime(dateString);
  };

  useEffect(() => {
    if (index !== -1) markerChange(lnglatArr);
  }, [upStartIndex, upEndIndex, downStartIndex, downEndIndex]);

  const numberChange = (e: any, type: string) => {
    let vdal = '';
    if (e.target.value) {
      vdal = e.target.value.replace(/\D/g, '');
    }
    if (type === 'left') {
      setLeftNumber(vdal);
    } else {
      setRightNumber(vdal);
    }
    setStakeNo((val: any) => {
      const newvals = val.map((it: any, ind: number) => {
        if (type === 'left') {
          return ind === 0 ? vdal : it;
        }
        return ind === 1 ? vdal : it;
      });
      return newvals;
    });
  };
  const range = (start: number, end: number) => {
    const result = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };
  return (
    <div className={styles.markMapPro}>
      <div
        className={styles.mapBox}
        id={'container'}
        style={props.height ? { height: `${props.height}` } : { height: '600px' }}
      ></div>
      <div style={searchVisible ? { display: 'block' } : { display: 'none' }}>
        <div className={styles.positionOperateArea}>
          {!canNotEdit && (
            <Card
              style={{
                width: '232px',
                // height: '190px',
                // background: '#F9F9F9',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                borderRadius: '4px',
              }}
              bodyStyle={{
                padding: '16px',
              }}
              bordered={false}
            >
              <div className={styles.positionTitle}>设备名称</div>
              <Select
                style={{ width: '200px', marginBottom: '20px' }}
                placeholder="请选择"
                allowClear
                onChange={(e: any) => setDeviceId(e)}
              >
                {deviceList.map((item: any) => (
                  <Option key={item.id} value={item.name}>
                    {item.name}
                  </Option>
                ))}
              </Select>
              <div className={styles.positionTitle}>选择日期</div>
              <DatePicker
                placeholder={'请选择开始日期'}
                format="YYYY-MM-DD HH:mm:ss"
                showTime
                style={{ width: '200px', marginBottom: '10px' }}
                onChange={dateStartTimeChange}
              />
              <DatePicker
                placeholder={'请选择结束日期'}
                format="YYYY-MM-DD HH:mm:ss"
                disabled={!startTime}
                showTime
                disabledDate={(current: any) => {
                  return (
                    moment(current).format('YYYY-MM-DD') !== moment(startTime).format('YYYY-MM-DD')
                  );
                }}
                disabledTime={() => {
                  const H: any = moment(startTime).format('HH');
                  const M: any = moment(startTime).format('mm');
                  const S: any = moment(startTime).format('ss');
                  return {
                    disabledHours: () => range(0, 24).splice(0, H),
                    disabledMinutes: () => range(0, M),
                    disabledSeconds: () => range(0, S),
                  };
                }}
                style={{ width: '200px', marginBottom: '20px' }}
                onChange={dateEndTimeChange}
              />
              <div className={styles.positionTitle}>起点桩号</div>
              <div className={styles['row-stake-class']}>
                <span>K</span>
                {/* parser={(text: any)=>/^\d+$/.test(text)? text:000} */}
                <Input
                  defaultValue={'000'}
                  placeholder="请输入"
                  className={styles['input-box']}
                  disabled={!canMark}
                  onChange={(evt: any) => {
                    numberChange(evt, 'left');
                  }}
                  value={leftNumber}
                  min={0}
                  maxLength={3}
                />
                <span>+</span>
                <Input
                  className={styles['input-box']}
                  defaultValue={'000'}
                  placeholder="请输入"
                  disabled={!canMark}
                  onChange={(evt: any) => {
                    numberChange(evt, 'right');
                  }}
                  value={rightNumber}
                  min={0}
                  maxLength={3}
                />
              </div>
            </Card>
          )}
          {!canNotEdit && (
            <div
              className={!canMark && props?.isEdit ? styles.notClearMap : styles.clearMap}
              onClick={clearMap}
            >
              清除地图
            </div>
          )}
        </div>
      </div>
      <div className={styles.mapTip} style={{ bottom: canNotEdit ? '20px' : '101px' }}>
        <div className={styles.upSvg}>
          <UpSvg />
          <span className={styles.mapTitle}>上行位置</span>
        </div>
        <div className={styles.downSvg}>
          <DownSvg />
          <span className={styles.mapTitle}>下行位置</span>
        </div>
      </div>
      {modalShow && (
        <div
          ref={modalRef}
          className={`${isStartOrEnd ? styles.cancelModal : styles.selectModal}`}
          id={styles.infoWindow}
        >
          {!isStartOrEnd ? (
            <Select
              style={{ width: '210px' }}
              placeholder="请选择上行/下行的起点/终点"
              allowClear
              onChange={(e) => setPointType(e)}
              value={pointType}
            >
              {Object.keys(kind).map((item: any) => (
                <Option
                  key={item}
                  disabled={pointTypeList.length ? pointTypeList?.includes(item * 1) : false}
                  value={item * 1}
                >
                  {kind[item]}
                </Option>
              ))}
            </Select>
          ) : (
            <div>
              <Warn className={styles.warn} />
              {`是否取消该点的${kind[currentType]}设置？`}
            </div>
          )}

          <div className={styles.infoWindowBtn}>
            <Button size="small" onClick={handleCancel}>
              取消
            </Button>
            <Button type="primary" size="small" onClick={handleOk}>
              确定
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
export default MarkMapPro;
