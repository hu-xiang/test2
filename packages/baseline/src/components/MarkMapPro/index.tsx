import styles from './styles.less';
import { Card, Input, Select, Button, DatePicker } from 'antd';
import type { InputRef } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { useModel } from 'umi';
import nooverimg from '../../assets/img/mapPng/no-over.svg';
import overimg from '../../assets/img/mapPng/over.svg';
import normal from '../../assets/img/mapPng/normal.png';
import upStart from '../../assets/img/mapPng/upStart.png';
import up from '../../assets/img/mapPng/up.png';
import upEnd from '../../assets/img/mapPng/upEnd.png';
import downStart from '../../assets/img/mapPng/downStart.png';
import down from '../../assets/img/mapPng/down.png';
import downEnd from '../../assets/img/mapPng/downEnd.png';
import { SearchOutlined } from '@ant-design/icons';

const { Option } = Select;

let map: any = null;
const { AMap }: any = window;
let markers: any = [];
// const infoWindow: any = null;
let layer: any = null;
const currentMarker: any = null;
const kind = {
  0: '上行起点',
  1: '上行终点',
  2: '下行起点',
  3: '下行终点',
};

type Iprops = {
  searchVisible?: boolean;
  canNotEdit?: boolean;
  imgIndex?: number;
  start?: number;
};
const MapLocation: React.FC<Iprops> = (props) => {
  const { lnglatArr, resetColorFlag, setResetColorFlag } = useModel<any>('facility');
  const { imgIndex } = props;
  const filterAddress = useRef<InputRef>(null);

  const [searchValue, setSearchValue] = useState<any>('');
  // const [lnglatList, setLnglatList] = useState<any[]>([]);
  const { searchVisible, canNotEdit = false, start } = props;

  const [modalShow, setModalShow] = useState<any>(false);
  const [pointType, setPointType] = useState<any>(null);
  const [pointTypeList, setPointTypeList] = useState<any>([]);
  const [isStartOrEnd, setIsStartOrEnd] = useState<any>(false);
  const modalRef = useRef(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  useEffect(() => {
    map = new AMap.Map('container', {
      zooms: [3, 21],
      zoom: 14,
      center: lnglatArr[0]?.lnglat || [114.487854, 38.03504],
      animateEnable: false,
      jogEnable: false,
    });

    map.on('mousewheel', (evt: any) => {
      evt?.originEvent?.stopPropagation();
    });
    return () => {
      setModalShow(false);
      // infoWindow = null;
      map?.clearInfoWindow();
      if (layer) map?.remove(layer);
      // 销毁地图，并清空地图容器
      if (markers.length) {
        map?.remove(markers);
        markers = [];
      }
      if (map) map.destroy();
      map = null;
    };
  }, []);

  const renderMarkers = (normalMarker: any, curPosition: any, icon: any) => {
    // console.log('rr',curPosition,icon);
    const curData = {
      position: curPosition,
      icon,
    };

    const labelMarker = new AMap.LabelMarker(curData);

    markers.push(labelMarker);
  };

  const resetColor = () => {
    if (!markers && !markers?.length) {
      return;
    }
    const icon = {
      type: 'image',
      image: nooverimg,
      size: [11, 14],
      anchor: 'bottom-center',
    };
    for (let i = 0; i < markers.length; i++) {
      if (i !== 0) {
        markers[i].setIcon(icon);
      }
    }
    setResetColorFlag(false);
  };
  useEffect(() => {
    if (resetColorFlag) {
      resetColor();
    }
  }, [resetColorFlag]);
  const clearMap = () => {
    if (markers.length) {
      map?.remove(markers);
      markers = [];
    }
    if (layer) map?.remove(layer);
    // map.clearMap();
  };
  useEffect(() => {
    map.on('complete', () => {
      clearMap();
      // 创建 AMap.LabelsLayer 图层
      layer = new AMap.LabelsLayer({
        zooms: [3, 21],
        zIndex: 1000,
        collision: false,
      });

      // 将图层添加到地图
      map.add(layer);

      let icon = {
        type: 'image',
        image: nooverimg,
        size: [11, 14],
        anchor: 'bottom-center',
      };

      // 普通点
      const normalMarker = new AMap.Marker({
        anchor: 'bottom-center',
        offset: [0, -15],
      });
      for (let i = 0; i < lnglatArr.length; i++) {
        icon = {
          type: 'image',
          image: i === start ? overimg : nooverimg,
          size: [11, 14],
          anchor: 'bottom-center',
        };
        if (i === 0) {
          map.setCenter(lnglatArr[0]?.lnglat);
        }
        // console.log('lnglatArr',lnglatArr[i])
        if (lnglatArr[i]?.longitude && lnglatArr[i]?.latitude) {
          renderMarkers(normalMarker, lnglatArr[i]?.lnglat, icon);
        }
      }
      // 一次性将海量点添加到图层
      layer.add(markers);
    });
  }, [lnglatArr]);
  // 走过的点的标记替换
  const markOverChange = (ind: number) => {
    if (markers[ind]) {
      markers[ind].setIcon({
        type: 'image',
        image: overimg,
        size: [11, 14],
        anchor: 'bottom-center',
      });
    }
  };
  useEffect(() => {
    setTimeout(() => {
      if (imgIndex > 0 && lnglatArr?.length > 0) {
        markOverChange(imgIndex);
        if (map) {
          // console.log('lnglatArr[imgIndex]?.lnglat', lnglatArr[imgIndex]?.lnglat);
          map.setCenter(lnglatArr[imgIndex]?.lnglat);
        }
      }
    }, 0);
  }, [imgIndex]);

  const getIndex = (list: any, type: any, isStart: boolean = false) => {
    if (isStartOrEnd && isStart)
      return markers.findIndex(
        (item: any) =>
          item?.getPosition()?.pos?.toString() === currentMarker?.getPosition()?.pos?.toString(),
      );
    if (list.includes(type))
      return markers.findIndex((item: any) => item?.getExtData()?.pointType === type);
    return null;
  };

  // 首尾中间的标记点替换
  const markerChange = (currentType: any, list: any) => {
    const isUp: boolean = !![0, 1].includes(currentType);
    const isStart: boolean = !![0, 2].includes(currentType);
    const startIndex = getIndex(list, isUp ? 0 : 2, isStart);
    const endIndex = getIndex(list, isUp ? 1 : 3, !isStart);
    if (startIndex === null || endIndex === null) return;
    const newMarkers: any =
      startIndex < endIndex
        ? markers.slice(startIndex + 1, endIndex)
        : markers.slice(endIndex + 1, startIndex);
    if (newMarkers.length) {
      /* eslint no-nested-ternary: 0 */
      newMarkers.forEach((item: any) => {
        item.setIcon({
          type: 'image',
          image: isStartOrEnd ? normal : isUp ? up : down,
          size: [22, 30],
          anchor: 'bottom-center',
        });
      });
    }
  };

  const handleCancel = () => {
    setPointType(null);
    setIsStartOrEnd(false);
    map?.clearInfoWindow();
  };

  const handleOk = () => {
    // console.log(currentMarker);
    let icon: any = null;
    switch (pointType) {
      case 0:
        icon = upStart;
        break;
      case 1:
        icon = upEnd;
        break;
      case 2:
        icon = downStart;
        break;
      case 3:
        icon = downEnd;
        break;

      default:
        icon = normal;
        break;
    }
    currentMarker.setIcon({
      type: 'image',
      image: isStartOrEnd ? normal : icon,
      size: [22, 30],
      anchor: 'bottom-center',
    });
    let list: any = [];
    currentMarker?.setExtData(
      isStartOrEnd
        ? {}
        : {
            pointType,
          },
    );
    if (isStartOrEnd) list = pointTypeList.filter((item: any) => item !== pointType);
    if ((pointTypeList.length ? !pointTypeList.includes(pointType) : true) && !isStartOrEnd)
      list = [...pointTypeList, pointType];
    setPointTypeList(list);
    markerChange(pointType, list);
    setPointType(null);
    map?.clearInfoWindow();
  };

  const getTitle = () => {
    let title: any = '';
    switch (pointType) {
      case 0:
        title = '上行起点';
        break;
      case 1:
        title = '上行终点';
        break;
      case 2:
        title = '下行起点';
        break;
      case 3:
        title = '下行终点';
        break;

      default:
        title = '上行起点';
        break;
    }
    return `是否取消该点的${title}设置？`;
  };

  return (
    <div className={styles.mapLocation}>
      <div className={styles.mapBox} id={'container'}></div>
      <div style={searchVisible ? { display: 'block' } : { display: 'none' }}>
        <div className={styles.searchInput} style={!canNotEdit ? { marginTop: '-10px' } : {}}>
          <Input
            ref={filterAddress}
            placeholder="输入关键字筛选位置"
            suffix={<SearchOutlined className="input-search" />}
            value={searchValue}
            onChange={handleInputChange}
          />
        </div>
        <div className={styles.positionOperateArea}>
          {!canNotEdit && (
            <Card
              style={{
                width: '232px',
                height: '190px',
                background: '#F9F9F9',
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
              ></Select>
              <div className={styles.positionTitle}>选择日期</div>
              <DatePicker style={{ width: '200px' }} />
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
        <div ref={modalRef} className={styles.infoWindow}>
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
                  value={item * 1}
                  disabled={pointTypeList.length ? pointTypeList?.includes(item * 1) : false}
                >
                  {kind[item]}
                </Option>
              ))}
            </Select>
          ) : (
            <div>{getTitle()}</div>
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
export default MapLocation;
