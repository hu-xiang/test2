import React, { useEffect, useState } from 'react';
import { useHistory } from 'umi';
import { Select } from 'antd';
import { ReactComponent as ListBack } from '@/assets/img/backDisease/backRight.svg';
import styles from './styles.less';
import { getProjectScore, getProjectLane, queryFacilitiesLocation } from '../ProjectList/serves';

let map: any = null;
const { AMap }: any = window;
let polyline: any = null;

let directionEnum = {};

const { Option } = Select;

export default (): React.ReactNode => {
  const history = useHistory();
  const [direction, setDirection] = useState(0);
  const [laneId, setLaneId] = useState(null);
  const [laneList, setLaneList] = useState<any>({});
  const [scoreList, setScoreList] = useState<any>([]);

  const getLocation = async () => {
    try {
      const res = await queryFacilitiesLocation(sessionStorage.getItem('projectId'));
      const path = res?.data?.map((item: any) => new AMap.LngLat(item.longitude, item.latitude));
      const center = res?.data.length
        ? [res?.data[0].longitude, res?.data[0].latitude]
        : [114.058141, 22.543544];
      map = new AMap.Map('container', {
        zoom: 13,
        center,
      });
      polyline = new AMap.Polyline({
        path,
        borderWeight: 1, // 线条宽度，默认为 1
        strokeWeight: 10,
        strokeColor: '#AD00FF', // 线条颜色
        lineJoin: 'round', // 折线拐点连接处样式
      });

      if (res?.data.length === 1) {
        const startIcon = new AMap.Icon({
          // 图标尺寸
          size: new AMap.Size(25, 34),
          // 图标的取图地址
          image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png',
          // 图标所用图片大小
          imageSize: new AMap.Size(25, 34),
          // 图标取图偏移量
          // imageOffset: new AMap.Pixel(-9, -3)
        });
        // 打点图标公共配置
        const marker = new AMap.Marker({
          icon: startIcon,
          position: center,
          offset: new AMap.Pixel(-13, -30),
        });
        marker.setMap(map);
      }
    } catch (error) {
      map = new AMap.Map('container', {
        zoom: 13,
        center: [114.058141, 22.543544],
      });
    }

    map.add(polyline);
  };

  const projectLane = async () => {
    directionEnum = {};
    const res = await getProjectLane(sessionStorage.getItem('projectId'));
    setDirection(res?.data[0]?.direction);
    setLaneId(res?.data[0]?.id);
    const obj: any = {
      0: [],
      1: [],
    };
    res?.data.forEach((item: any) => {
      if (item.direction === 0) directionEnum[item.direction] = '上行';
      if (item.direction === 1) directionEnum[item.direction] = '下行';
      obj[item.direction].push(item);
    });
    setLaneList(obj);
  };

  const projectScore = async () => {
    const res = await getProjectScore(laneId);
    setScoreList(res?.data);
  };

  useEffect(() => {
    projectLane();
    getLocation();
    return () => {
      // 销毁地图，并清空地图容器
      if (map) {
        map.remove(polyline);
        map.destroy();
      }
      map = null;
      polyline = null;
    };
  }, []);

  useEffect(() => {
    if (laneList && laneList[direction]) setLaneId(laneList[direction][0].id);
  }, [direction]);

  useEffect(() => {
    if (laneId || laneId === 0) projectScore();
  }, [laneId]);

  return (
    <div className={styles.regularProjectMap}>
      <div id="container" style={{ width: '100%', height: '100%' }}></div>
      <div
        className={styles.backButton}
        onClick={() => {
          history.push('/regularInspection/projectList');
        }}
      >
        <span className={styles.backTitle}>项目列表</span>
        <ListBack />
      </div>
      <div className={styles.footerContent}>
        <div className={styles.footerTitleBox}>
          <p className={styles.footerTitleContent}>指标得分</p>
        </div>
        <div className={styles.selectContent}>
          <div>
            <Select
              placeholder="请选择车道方向"
              className={styles.rowSelect}
              onChange={(e) => {
                setDirection(e);
              }}
              value={direction}
            >
              {Object.keys(directionEnum).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {directionEnum[item]}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="请选择车道"
              className={styles.rowSelect}
              value={laneId}
              onChange={(e) => {
                setLaneId(e);
              }}
            >
              {laneList[direction]?.map((item: any) => (
                <Option key={item.id} value={item.id}>
                  {item.lane}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <span style={{ background: '#89CB9B' }} className={styles.colorType}></span>
            <span className={styles.colorTypeLetter}>A</span>
            <span style={{ background: '#4684F7' }} className={styles.colorType}></span>
            <span className={styles.colorTypeLetter}>B</span>
            <span style={{ background: '#F2C935' }} className={styles.colorType}></span>
            <span className={styles.colorTypeLetter}>C</span>
            <span style={{ background: '#EB7D57' }} className={styles.colorType}></span>
            <span>D</span>
          </div>
        </div>
        <div className={styles.scoreContent}>
          <div className={styles.columnTitleContent}>
            <div className={`${styles.itemColumn} ${styles.firstColumn}`}>桩号</div>
            <div className={`${styles.itemColumn} ${styles.otherColumn}`}>PQI</div>
            <div className={`${styles.itemColumn} ${styles.otherColumn}`}>PCI</div>
            <div className={`${styles.itemColumn} ${styles.otherColumn}`}>RQI</div>
          </div>
          {scoreList.map((item: any, index: number) => {
            return (
              <div className={styles.columnContent} key={item.unitNo}>
                {index === scoreList?.length - 1 ? (
                  <div className={`${styles.scoreColumn} ${styles.unitLast}`}>
                    <span>{item.unitStart}</span>
                    <span>{item.unitEnd}</span>
                  </div>
                ) : (
                  <div className={`${styles.scoreColumn} ${styles.unitStart}`}>
                    {item.unitStart}
                  </div>
                )}

                <div
                  className={styles.scoreColumn}
                  style={{ borderBottom: '1px solid #fff' }}
                  title={item.pqi}
                >
                  {item.pqiLv === 'A' && <div style={{ background: '#89CB9B' }}></div>}
                  {item.pqiLv === 'B' && <div style={{ background: '#4684F7' }}></div>}
                  {item.pqiLv === 'C' && <div style={{ background: '#F2C935' }}></div>}
                  {item.pqiLv === 'D' && <div style={{ background: '#EB7D57' }}></div>}
                </div>
                <div
                  className={styles.scoreColumn}
                  style={{ borderBottom: '1px solid #fff' }}
                  title={item.pci}
                >
                  {item.pciLv === 'A' && <div style={{ background: '#89CB9B' }}></div>}
                  {item.pciLv === 'B' && <div style={{ background: '#4684F7' }}></div>}
                  {item.pciLv === 'C' && <div style={{ background: '#F2C935' }}></div>}
                  {item.pciLv === 'D' && <div style={{ background: '#EB7D57' }}></div>}
                </div>
                <div className={styles.scoreColumn} title={item.rqi}>
                  {item.rqiLv === 'A' && <div style={{ background: '#89CB9B' }}></div>}
                  {item.rqiLv === 'B' && <div style={{ background: '#4684F7' }}></div>}
                  {item.rqiLv === 'C' && <div style={{ background: '#F2C935' }}></div>}
                  {item.rqiLv === 'D' && <div style={{ background: '#EB7D57' }}></div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
