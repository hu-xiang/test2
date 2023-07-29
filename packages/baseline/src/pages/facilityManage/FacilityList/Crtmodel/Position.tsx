import { Card, Input } from 'antd';
import type { InputRef } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { useModel } from 'umi';
import '../styles.less';
import styles from '../styles.less';
import beginIcon from '../../../../assets/img/facility/begin.svg';
import endIcon from '../../../../assets/img/facility/end.svg';
import markerIcon from '../../../../assets/img/facility/marker.svg';

type Iprops = {
  searchVisible?: boolean;
};
let map: any = null;
let polyline: any = null;
const markers: any = [];

const Position: React.FC<Iprops> = (props) => {
  const filterAddress = useRef<InputRef>(null);
  const [lnglat, setLnglat] = useState('');
  // const [lnglatArr, setLnglatArr] = useState<any[]>([]);
  const [tracklineVisible, setTracklineVisible] = useState(false);
  const { searchVisible } = props;
  const { lnglatArr, setLnglatArr } = useModel<any>('facility');

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
      }
    });
  };

  const getLnglat = (e: any) => {
    setLnglat(`${e.lnglat.getLng()},${e.lnglat.getLat()}`);
  };

  useEffect(() => {
    const center: any = [114.058141, 22.543544];
    const zoom = 10;
    map = new AMap.Map('mapContainer', {
      zoom,
      center,
    });

    if (searchVisible) {
      mapAutoComplete();
    }

    map.on('click', getLnglat);
    return () => {
      map.off('click', getLnglat);
      map = null;
    };
  }, [searchVisible]);

  /**
   *
   * @param twoDimArr
   * @param val
   * @returns number 返回在数组中的位置
   */
  const isExsit = (twoDimArr: any[], val: string) => {
    for (let i = 0; i < twoDimArr.length; i++) {
      if (String(twoDimArr[i]) === val) {
        return i;
      }
    }
    return -1;
  };

  const addPoint = () => {
    if (lnglat !== '' && isExsit(lnglatArr, lnglat) === -1) {
      const commaPos = lnglat.indexOf(',');
      const newLnglat = [Number(lnglat.slice(0, commaPos)), Number(lnglat.slice(commaPos + 1))];

      setLnglatArr([...lnglatArr, newLnglat]);
    }
  };

  const removePoint = () => {
    const copyArr = JSON.parse(JSON.stringify(lnglatArr));
    const pos = isExsit(lnglatArr, lnglat); // 当前经纬度是否在经纬度数组中
    if (pos !== -1) {
      copyArr.splice(pos, 1);
      setLnglatArr([...copyArr]);
    }
  };

  useEffect(() => {
    map.remove(markers);
    for (let i = 0, marker: any; i < lnglatArr.length; i++) {
      let icon = markerIcon;
      if (i === 0) {
        icon = beginIcon;
      } else if (lnglatArr.length > 1 && i === lnglatArr.length - 1) {
        icon = endIcon;
      }
      marker = new AMap.Marker({
        map,
        icon,
        position: lnglatArr[i],
        anchor: 'bottom-center',
      });
      marker.on('click', () => {
        // eslint-disable-next-line no-underscore-dangle
        setLnglat(`${marker._position[0]},${marker._position[1]}`);
      });
      markers.push(marker);
    }
  }, [lnglatArr.length]);

  const showTrackline = () => {
    if (lnglatArr.length) {
      polyline = new AMap.Polyline({
        path: lnglatArr,
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
      map.add([polyline]);
      setTracklineVisible(true);
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
    setLnglatArr([]);
    map.clearMap();
  };

  return (
    <>
      <div id="mapContainer"></div>
      <div style={searchVisible ? { display: 'block' } : { display: 'none' }}>
        <div className={styles.searchInput}>
          <Input ref={filterAddress} placeholder="输入关键字筛选位置" />
        </div>
        <div className={styles.positionOperateArea}>
          <Card
            style={{
              width: '200px',
              background: '#F9F9F9',
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
          {!tracklineVisible ? (
            <div className={styles.showTrack} onClick={showTrackline}>
              显示轨迹
            </div>
          ) : (
            <div className={styles.showTrack} onClick={hideTrackline}>
              隐藏轨迹
            </div>
          )}

          <div className={styles.clearMap} onClick={clearMap}>
            清除地图
          </div>
        </div>
      </div>
    </>
  );
};

export default Position;
