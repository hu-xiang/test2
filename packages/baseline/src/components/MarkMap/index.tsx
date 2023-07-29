import styles from './styles.less';
import { Card, Input } from 'antd';
import type { InputRef } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { useModel } from 'umi';
import beginIcon from '../../assets/img/mapPng/start.png';
import endIcon from '../../assets/img/mapPng/end.png';
import markerIcon from '../../assets/img/mapPng/marker.png';
import { SearchOutlined } from '@ant-design/icons';
import { useCompare } from '../../utils/commonMethod';

let map: any = null;
const { AMap }: any = window;
let polyline: any = null;
let markerList: any = [];
let layer: any = null;

type Iprops = {
  searchVisible?: boolean;
  canNotEdit?: boolean;
  isOne?: boolean;
  height?: string;
};
const MarkMap: React.FC<Iprops> = (props) => {
  const filterAddress = useRef<InputRef>(null);
  const [lnglat, setLnglat] = useState('');
  const [tracklineVisible, setTracklineVisible] = useState(false);
  const [searchValue, setSearchValue] = useState<any>('');
  const { searchVisible, canNotEdit = false, isOne = false } = props;
  const { lnglatArr, setLnglatArr } = useModel<any>('facility');
  const [currentMarker, setCurrentMarker] = useState<any>();

  const getLnglat = (e: any) => {
    setLnglat(`${e.lnglat.getLng()},${e.lnglat.getLat()}`);
  };

  // 地图输入提示
  const mapAutoComplete = () => {
    const autoOptions = {
      input: filterAddress.current?.input,
    };

    AMap.plugin(['AMap.PlaceSearch', 'AMap.AutoComplete'], () => {
      const auto = new AMap.AutoComplete(autoOptions);
      const placeSearch = new AMap.PlaceSearch({
        map,
      }); // 构造地点查询类
      auto.on('select', select); // 注册监听，当选中某条记录时会触发
      function select(e: any) {
        placeSearch.setCity(e.poi.adcode);
        placeSearch.search(e.poi.name); // 关键字查询查询
        setSearchValue(e.poi.name);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    mapAutoComplete();
  };

  const markerEvent = (item: any, icon: any, isStartOrEnd: boolean) => {
    const curData = {
      position: item,
      icon: {
        type: 'image',
        image: icon,
        size: isStartOrEnd ? [26, 36] : [20, 26],
        anchor: 'bottom-center',
      },
    };

    const labelMarker = new AMap.LabelMarker(curData);
    const marker: any = new AMap.Marker({
      offset: [0, -15],
      anchor: 'bottom-center',
    });

    markerList.push(labelMarker);
    let address = '';
    AMap.plugin('AMap.Geocoder', () => {
      const geocoder = new AMap.Geocoder();
      geocoder.getAddress(item, (status: string, result: any) => {
        if (status === 'complete' && result.info === 'OK') {
          // result为对应的地理位置详细信息
          address = result.regeocode.formattedAddress;
          if (isOne) {
            marker.setContent(
              `<div class="amap-info-window">${address}
              <div class="amap-info-sharp"></div></div>`,
            );
            marker.setPosition(item);
            map.add(marker);
            setCurrentMarker(marker);
          }
        }
      });
    });

    // 给marker绑定事件
    if (!isOne) {
      labelMarker.on('mouseover', () => {
        marker.setContent(
          `<div class="amap-info-window">${address}
          <div class="amap-info-sharp"></div></div>`,
        );
        marker.setPosition(item);
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
        marker.setPosition(item);
        map.add(marker);
      });

      marker.on('mouseout', () => {
        map.remove(marker);
      });
    }

    // getAdress(list, i, icon);
    labelMarker.on('click', () => {
      setLnglat(`${item[0]},${item[1]}`);
    });
    labelMarker.on('click', () => {
      setLnglat(`${item[0]},${item[1]}`);
    });
    marker.on('click', () => {
      setLnglat(`${item[0]},${item[1]}`);
    });
    marker.on('click', () => {
      setLnglat(`${item[0]},${item[1]}`);
    });
  };

  const mapDraw = (locationList: any) => {
    const list = locationList.filter((item: any) => {
      return item[0] && item[1];
    });
    if (list.length) {
      if (layer) map.remove(layer);
      map.remove(markerList);
      markerList = [];
      if (polyline) {
        map.remove(polyline);
      }
      // map.on('complete', function () {
      // 创建 AMap.LabelsLayer 图层
      layer = new AMap.LabelsLayer({
        zooms: [3, 20],
        zIndex: 1000,
        collision: false,
      });

      // 将图层添加到地图
      map.add(layer);
      for (let i = 0; i < list.length; i++) {
        let icon = markerIcon;
        let isStartOrEnd = false;
        if (i === 0 && list.length > 1) {
          icon = beginIcon;
          isStartOrEnd = true;
        } else if (list.length > 1 && i === list.length - 1) {
          icon = endIcon;
          isStartOrEnd = true;
        }
        markerEvent(list[i], icon, isStartOrEnd);
      }
      // 一次性将海量点添加到图层
      layer.add(markerList);

      // });
      if (tracklineVisible) {
        polyline = new AMap.Polyline({
          path: list,
          isOutline: true,
          outlineColor: '#ffeeff',
          borderWeight: 1,
          strokeColor: '#3366FF',
          strokeOpacity: 1,
          strokeWeight: 3,
          strokeStyle: 'solid',
          strokeDasharray: [10, 5],
          lineJoin: 'round',
          lineCap: 'round',
          zIndex: 50,
        });
        map.add(polyline);
      }
      map.on('click', getLnglat);
    } else {
      map.on('click', getLnglat);
      if (layer) map.remove(layer);
      map.remove(markerList);
    }
  };

  useEffect(() => {
    map = new AMap.Map('container', {
      zoom: 15,
      center: lnglatArr[1] || [114.058141, 22.543544],
    });

    // mapAutoComplete();

    map.on('click', getLnglat);

    return () => {
      map.off('click', getLnglat);
      // 销毁地图，并清空地图容器
      if (map) map.destroy();
      map = null;
      polyline = null;
    };
  }, []);

  useEffect(() => {
    if (tracklineVisible) mapDraw(lnglatArr);
  }, [tracklineVisible]);

  useEffect(() => {
    mapDraw(lnglatArr);
  }, [useCompare(lnglatArr)]);

  const showTrackline = () => {
    if (lnglatArr.length) {
      polyline = null;
      setTracklineVisible(true);
    }
  };

  const isExsit = (twoDimArr: any[], val: string) => {
    for (let i = 0; i < twoDimArr.length; i++) {
      if (String(twoDimArr[i]) === val) {
        return i;
      }
    }
    return -1;
  };

  const addPoint = () => {
    if (isExsit(lnglatArr, lnglat) === -1) {
      const commaPos = lnglat.indexOf(',');
      const newLnglat = [Number(lnglat.slice(0, commaPos)), Number(lnglat.slice(commaPos + 1))];
      if (isOne) {
        if (currentMarker) map.remove(currentMarker);
        setLnglatArr([[], newLnglat]);
      } else setLnglatArr([...lnglatArr, newLnglat]);
    }
  };

  const removePoint = () => {
    if (!lnglat) return;
    const copyArr = JSON.parse(JSON.stringify(lnglatArr));
    const pos = isExsit(lnglatArr, lnglat); // 当前经纬度是否在经纬度数组中
    if (pos !== -1) {
      copyArr.splice(pos, 1);
      setLnglatArr([...copyArr]);
      if (isOne) {
        if (currentMarker) map.remove(currentMarker);
      }
    }
  };

  const hideTrackline = () => {
    if (polyline) {
      map.remove(polyline);
      polyline = null;
      setTracklineVisible(false);
    }
  };

  const clearMap = () => {
    if (markerList.length) {
      map.remove(markerList);
      markerList = [];
    }
    if (isOne) {
      if (currentMarker) map.remove(currentMarker);
    }
    setLnglatArr([[]]);
    if (polyline) {
      map.remove(polyline);
      polyline = null;
      setTracklineVisible(false);
    }
    if (layer) map.remove(layer);
    // map.clearMap();
  };

  return (
    <div className={styles.markMap}>
      <div
        className={styles.mapBox}
        id={'container'}
        style={props.height ? { height: `${props.height}` } : { height: '600px' }}
      ></div>
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
                width: '200px',
                // background: '#F9F9F9',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
              }}
              bodyStyle={{
                padding: '16px',
              }}
              bordered={false}
            >
              <div className={styles.positionTitle}>添加标点</div>
              <Input defaultValue={lnglat} key={lnglat} />
              <div className={styles.btnOperate}>
                <button onClick={removePoint}>删除</button>
                <button onClick={addPoint}>添加</button>
              </div>
            </Card>
          )}
          {!isOne && (
            <>
              {!tracklineVisible ? (
                <div className={styles.showTrack} onClick={showTrackline}>
                  显示轨迹
                </div>
              ) : (
                <div className={styles.showTrack} onClick={hideTrackline}>
                  隐藏轨迹
                </div>
              )}
              {!canNotEdit && (
                <div className={styles.clearMap} onClick={clearMap}>
                  清除地图
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default MarkMap;
