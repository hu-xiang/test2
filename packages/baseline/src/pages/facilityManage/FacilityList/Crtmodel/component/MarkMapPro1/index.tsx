import styles from './styles.less';
import { Card, Select, Button, DatePicker, message } from 'antd';
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

const requestList = [
  { url: '/traffic/facility/location/queryLocation', method: 'get' },
  { url: '/traffic/inspection/selectDevices', method: 'get' },
];
const { Option } = Select;
let map: any = null;
const { AMap }: any = window;
let markers: any = [];
let infoWindow: any = null;
let layer: any = null;
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
  } = useModel<any>('facility');
  const [modalShow, setModalShow] = useState<any>(false);
  const [currentType, setCurrentType] = useState<number>(0);
  const [pointType, setPointType] = useState<any>(null);
  const [index, setIndex] = useState<number>(-1);
  const [pointTypeList, setPointTypeList] = useState<any>([]);
  const [deviceList, setDeviceList] = useState<any>([]);
  const [deviceId, setDeviceId] = useState<any>('');
  const [collectTime, setCollectTime] = useState<any>(null);
  const [isStartOrEnd, setIsStartOrEnd] = useState<any>(false);
  const [canMark, setCanMark] = useState<any>(false);
  const [currentMarker, setCurrentMarker] = useState<any>();
  const modalRef = useRef(null);

  const getPosition = async () => {
    if (isEdit) {
      setCanMark(true);
    }
    const res: any = await commonRequest({ ...requestList[0], params: { collectTime, deviceId } });
    setLnglatArr(res?.data);
  };

  const getDevice = async () => {
    const res: any = await commonRequest({ ...requestList[1], params: {} });
    setDeviceList(res?.data);
  };

  useEffect(() => {
    if (collectTime && deviceId) getPosition();
  }, [collectTime, deviceId]);

  useEffect(() => {
    getDevice();
  }, [isEdit]);

  useEffect(() => {
    map = new AMap.Map('container', {
      zoom: 15,
      center: [114.058141, 22.543544],
    });
    return () => {
      setModalShow(false);
      infoWindow = null;
      map.clearInfoWindow();
      if (layer) map.remove(layer);
      // 销毁地图，并清空地图容器
      if (markers.length) {
        map.remove(markers);
        markers = [];
      }
      if (map) map.destroy();
      map = null;
    };
  }, []);
  const resetIcon = () => {
    const icon = {
      type: 'image',
      image: normal,
      size: [20, 26],
      anchor: 'bottom-center',
    };
    currentMarker?.setIcon(icon);
  };

  const markerClick = (iconType: number, i: number, labelMarker: any) => {
    if (isEdit && !canMark) return;
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
        const icon = {
          type: 'image',
          image: bigNormal,
          size: [26, 36],
          anchor: 'bottom-center',
        };
        labelMarker.setIcon(icon);
      }
      setModalShow(true);
      infoWindow.setContent(modalRef?.current);
      infoWindow.open(map, labelMarker?.getPosition());
    }
  };

  const renderMarkers = (
    normalMarker: any,
    curPosition: any,
    icon: any,
    i: number,
    type: number,
  ) => {
    const iconType = type || 0;
    const curData = {
      position: curPosition,
      icon,
      extData: {
        type: iconType,
      },
    };
    let address = '';
    AMap.plugin('AMap.Geocoder', () => {
      const geocoder = new AMap.Geocoder();
      geocoder.getAddress(curPosition, (status: string, result: any) => {
        if (status === 'complete' && result.info === 'OK') {
          // result为对应的地理位置详细信息
          address = result.regeocode.formattedAddress;
        }
      });
    });
    const labelMarker = new AMap.LabelMarker(curData);
    markers.push(labelMarker);
    // 给marker绑定事件
    labelMarker.on('mouseover', () => {
      normalMarker.setContent(
        `<div class="amap-info-window">${address}
    <div class="amap-info-sharp"></div></div>`,
      );
      normalMarker.setPosition(curPosition);
      map.add(normalMarker);
    });
    // 给marker绑定事件
    labelMarker.on('click', () => {
      markerClick(iconType, i, labelMarker);
    });

    // 给marker绑定事件
    normalMarker.on('click', () => {
      markerClick(iconType, i, normalMarker);
    });
    labelMarker.on('mouseout', function () {
      map.remove(normalMarker);
    });
  };

  const drawMap = (locationList: any) => {
    const list = locationList.filter((item: any) => {
      return item?.longitude && item?.latitude;
    });
    infoWindow = new AMap.InfoWindow({ offset: new AMap.Pixel(0, -30), isCustom: true });
    if (markers.length) {
      map.remove(markers);
      markers = [];
    }
    if (list.length) {
      if (layer) map.remove(layer);
      // 创建 AMap.LabelsLayer 图层
      layer = new AMap.LabelsLayer({
        zooms: [3, 20],
        zIndex: 1000,
        collision: false,
      });
      // 将图层添加到地图
      map.add(layer);
      // 普通点
      const normalMarker = new AMap.Marker({
        anchor: 'bottom-center',
        offset: [0, -15],
      });
      if (map && index === -1) {
        map.setCenter([list[0].longitude, list[0].latitude]);
      }
      for (let i = 0; i < list.length; i++) {
        const icon = {
          type: 'image',
          image: list[i]?.type ? iconEnum[list[i]?.type] : normal,
          size: [1, 3, 4, 6].includes(list[i]?.type) ? [26, 36] : [20, 26],
          anchor: 'bottom-center',
        };
        renderMarkers(normalMarker, [list[i].longitude, list[i].latitude], icon, i, list[i]?.type);
      }
      // 一次性将海量点添加到图层
      layer.add(markers);
    } else {
      if (layer) map.remove(layer);
      map.remove(markers);
    }
  };

  useEffect(() => {
    drawMap(lnglatArr);
  }, [lnglatArr]);

  const clearMap = () => {
    if (isEdit && !canMark) return;
    const list = lnglatArr.map((item: any) => {
      return {
        ...item,
        type: 0,
      };
    });
    setPointTypeList([]);
    setLnglatArr(list);
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
    return true;
  };

  const dateChange: DatePickerProps['onChange'] = (_date, dateString) => {
    setCollectTime(dateString);
  };

  useEffect(() => {
    if (index !== -1) markerChange(lnglatArr);
  }, [upStartIndex, upEndIndex, downStartIndex, downEndIndex]);
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
                height: '190px',
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
              <DatePicker style={{ width: '200px' }} onChange={dateChange} />
            </Card>
          )}
          {!canNotEdit && (
            <div className={styles.clearMap} onClick={clearMap}>
              清除地图
            </div>
          )}
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
