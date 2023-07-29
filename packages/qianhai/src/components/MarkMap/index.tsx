import styles from './styles.less';
import { Card, Input } from 'antd';
import type { InputRef } from 'antd';
import { useEffect, useState, useRef } from 'react';
import { useModel } from 'umi';
import beginIcon from '../../assets/img/facility/begin.svg';
import endIcon from '../../assets/img/facility/end.svg';
import markerIcon from '../../assets/img/facility/marker.svg';
import { SearchOutlined } from '@ant-design/icons';

let map: any = null;
const { AMap }: any = window;
let polyline: any = null;
const markers: any = [];

type Iprops = {
  searchVisible?: boolean;
};
const MapLocation: React.FC<Iprops> = (props) => {
  const filterAddress = useRef<InputRef>(null);
  const [lnglat, setLnglat] = useState('');
  const [tracklineVisible, setTracklineVisible] = useState(false);
  const [searchValue, setSearchValue] = useState<any>('');
  const { searchVisible } = props;
  const { lnglatArr, setLnglatArr } = useModel<any>('facility');

  const getLnglat = (e: any) => {
    setLnglat(`${e.lnglat.getLng()},${e.lnglat.getLat()}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
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

  const getAdress = (list: any, i: any, icon: any) => {
    AMap.plugin('AMap.Geocoder', () => {
      const geocoder = new AMap.Geocoder();
      let address = '';
      geocoder.getAddress(list[i], (status: string, result: any) => {
        if (status === 'complete' && result.info === 'OK') {
          // result为对应的地理位置详细信息
          address = result.regeocode.formattedAddress;
          const marker: any = new AMap.Marker({
            map,
            icon,
            position: list[i],
            anchor: 'bottom-center',
          });
          marker.on('click', () => {
            // setLnglat(`${e.lnglat.getLng()},${e.lnglat.getLat()}`);
            setLnglat(`${list[i][0]},${list[i][1]}`);
          });
          marker.setLabel({
            direction: 'right',
            offset: new AMap.Pixel(10, 0), // 设置文本标注偏移量
            content: `<div class='info'>${address}</div>`, // 设置文本标注内容
          });
          markers.push(marker);
        }
      });
    });
  };

  const mapDraw = (locationList: any) => {
    const list = locationList.filter((item: any) => {
      return item[0] && item[1];
    });
    if (list.length) {
      map.remove(markers);
      if (polyline) {
        map.remove(polyline);
      }
      for (let i = 0; i < list.length; i++) {
        let icon = markerIcon;
        if (i === 0 && list.length > 1) {
          icon = beginIcon;
        } else if (list.length > 1 && i === list.length - 1) {
          icon = endIcon;
        }
        getAdress(list, i, icon);
      }
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
      map.remove(markers);
    }
  };

  useEffect(() => {
    map = new AMap.Map('container', {
      zoom: 10,
      center: [114.058141, 22.543544],
    });

    mapAutoComplete();

    map.on('click', getLnglat);

    // return () => {
    //   map.off('click', getLnglat);
    //   return map;
    // };
  }, []);

  useEffect(() => {
    mapDraw(lnglatArr);
  }, [tracklineVisible]);

  useEffect(() => {
    mapDraw(lnglatArr);
  }, [lnglatArr.length]);

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

  const hideTrackline = () => {
    if (polyline) {
      map.remove(polyline);
      polyline = null;
      setTracklineVisible(false);
    }
  };

  const clearMap = () => {
    setLnglatArr([[]]);
    map.clearMap();
  };

  return (
    <div className={styles.mapLocation}>
      <div className={styles.mapBox} id={'container'}></div>
      <div style={searchVisible ? { display: 'block' } : { display: 'none' }}>
        <div className={styles.searchInput}>
          <Input
            ref={filterAddress}
            placeholder="输入关键字筛选位置"
            suffix={<SearchOutlined className="input-search" />}
            value={searchValue}
            onChange={handleInputChange}
          />
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
    </div>
  );
};
export default MapLocation;
