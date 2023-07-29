import React, { useEffect, useState, useRef } from 'react';
import { useHistory, useModel } from 'umi';
import { Select, Button, Radio, Image, Modal } from 'antd';
// import CommonTable from '../../../../components/CommonTable';
import DataReport from './DataReport';
import ProTable from '@ant-design/pro-table';
import { ReactComponent as ListBack } from '../../../../assets/img/backDisease/back.svg';
import { ReactComponent as Pull } from '../../../../assets/img/rodeDetection/pull.svg';
import { ReactComponent as More } from '../../../../assets/img/rodeDetection/more.svg';
import { ReactComponent as Close } from '../../../../assets/img/rodeDetection/close.svg';
// import { ReactComponent as Left } from '../../../../assets/img/rodeDetection/left.svg';
// import { ReactComponent as Right } from '../../../../assets/img/rodeDetection/right.svg';
import { ReactComponent as Down } from '../../../../assets/img/pullUp/down.svg';
import { ReactComponent as Up } from '../../../../assets/img/pullUp/up.svg';
import styles from './styles.less';
import { commonRequest, commonExport } from '../../../../utils/commonMethod';
import { LeftCircleOutlined, RightCircleOutlined } from '@ant-design/icons';
import ImgCanvas from './ImgCanvas';
import img from '../../../../assets/img/errorImg/error.svg';

let map: any = null;
const { AMap }: any = window;
let polyline1: any = null;
let polyline2: any = null;

const directionEnum = {
  0: '上行',
  1: '下行',
};

const keys = ['pqiData', 'pciData', 'rqiData', 'tciData'];

const { Option } = Select;

const requestList = [
  { url: '/traffic/road/project/detial/pavement/select', method: 'GET' },
  { url: '/traffic/road/project/road/technical', method: 'GET' },
  { url: '/traffic/road/project/report', method: 'POST' },
  { url: '/traffic/road/project/stake/punctuation', method: 'GET' },
  { url: '/traffic/road/project/road/stake/img/disease', method: 'POST' },
  { url: '/traffic/road/project/alone/stake/img/disease', method: 'POST' },
  { url: '/traffic/road/project/export/report', method: 'POST', blob: true },
];

export default (): React.ReactNode => {
  const ref = useRef<any>();
  const childRef = useRef<any>();
  const history = useHistory();
  const { setDataInfo } = useModel<any>('dataReport');
  const [openRight, setOpenRight] = useState<boolean>(false);
  const [showBig, setShowBig] = useState<boolean>(false);
  const [rowIndex, setRowIndex] = useState<number>(-1);
  const [clientX, setClientX] = useState<number>(-1);
  const [clientY, setClientY] = useState<number>(-1);
  const [direction, setDirection] = useState(0);
  const [laneId, setLaneId] = useState(null);
  const [laneList, setLaneList] = useState<any>([]);
  const [scoreList, setScoreList] = useState<any>([]);
  const [rowItem, setRowItem] = useState<any>();
  const [mode, setMode] = useState<string>('0');
  const [picList, setPicList] = useState<any>();
  const [currentImg, setCurrentImg] = useState<any>([]);
  const [url, setUrl] = useState<any>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [tableData, setTableData] = useState<any>([]);
  const [tableData1, setTableData1] = useState<any>([]);
  // const [isReport, setIsReport] = useState<boolean>(false);
  const [dataReport, setDataReport] = useState<string>('');
  const [checkType, setCheckType] = useState<any>();
  const [moreIndex, setMoreIndex] = useState<number>(-1);

  const [direction1, setDirection1] = useState(0);
  const [laneId1, setLaneId1] = useState(null);
  const [laneList1, setLaneList1] = useState<any>([]);

  const getMapData = async () => {
    const res = await commonRequest({
      ...requestList[3],
      params: { FacId: sessionStorage.getItem('road_detection_facId') },
    });
    return res?.data;
  };

  const getLocation = async () => {
    try {
      const res: any = await getMapData();
      console.log(res[0]);
      console.log(res[0][0]);
      const path1 = res[0]?.map((item: any) => new AMap.LngLat(item.longitude, item.latitude));
      const path2 = res[1]?.map((item: any) => new AMap.LngLat(item.longitude, item.latitude));
      const center = res[0]?.length
        ? [res[0][0]?.longitude, res[0][0]?.latitude]
        : [114.058141, 22.543544];
      map = new AMap.Map('container', {
        zoom: 13,
        center,
      });
      polyline1 = new AMap.Polyline({
        path: path1,
        borderWeight: 1, // 线条宽度，默认为 1
        strokeWeight: 10,
        strokeColor: '#AD00FF', // 线条颜色
        lineJoin: 'round', // 折线拐点连接处样式
      });

      polyline2 = new AMap.Polyline({
        path: path2,
        borderWeight: 1, // 线条宽度，默认为 1
        strokeWeight: 10,
        strokeColor: '#AD00FF', // 线条颜色
        lineJoin: 'round', // 折线拐点连接处样式
      });

      // if (res?.length === 1) {
      //   const startIcon = new AMap.Icon({
      //     // 图标尺寸
      //     size: new AMap.Size(25, 34),
      //     // 图标的取图地址
      //     image: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png',
      //     // 图标所用图片大小
      //     imageSize: new AMap.Size(25, 34),
      //     // 图标取图偏移量
      //     // imageOffset: new AMap.Pixel(-9, -3)
      //   });
      //   // 打点图标公共配置
      //   const marker = new AMap.Marker({
      //     icon: startIcon,
      //     position: center,
      //     offset: new AMap.Pixel(-13, -30),
      //   });
      //   marker.setMap(map);
      // }
    } catch (error) {
      map = new AMap.Map('container', {
        zoom: 13,
        center: [114.058141, 22.543544],
      });
    }

    map.add([polyline1, polyline2]);
  };

  const getTableData = async (val: any, e: any) => {
    const res = await commonRequest({
      ...requestList[2],
      params: {
        direct: typeof e === 'number' ? e : direction,
        pavementId: val,
        projectId: sessionStorage.getItem('road_detection_id'),
      },
    });
    setTableData1(res?.data);
  };

  const getLaneList = async (e: any, type: number = 0, isQuest = true) => {
    let newLanelId = null;
    if (type) {
      setLaneId1(null);
      setTableData1([]);
    } else {
      setLaneId(null);
      newLanelId = null;
    }
    const direct = type ? direction1 : direction;
    const newDirec = typeof e === 'number' ? e : direct;
    // console.log(typeof e);
    // console.log(typeof e === 'number');
    const res = await commonRequest({
      ...requestList[0],
      params: {
        projectId: sessionStorage.getItem('road_detection_id'),
        direct: typeof e === 'number' ? e : direct,
      },
    });
    if (type) {
      setLaneList1(res?.data);
      if (!Object.keys(res?.data)[0]) {
        setTableData1([]);
      }
    } else {
      setLaneList(res?.data);
      if (!Object.keys(res?.data)[0]) {
        setScoreList([]);
        setOpenRight(false);
      }
    }

    Object.keys(res?.data).forEach((item: any, i: number) => {
      if (i === 0) {
        if (type) {
          if (isQuest) {
            setLaneId1(item);
            newLanelId = item;
            getTableData(item, e);
          } else {
            newLanelId = laneId;
            setLaneId1(laneId);
            getTableData(laneId, direction);
          }
        } else {
          newLanelId = item;
          setLaneId(item);
        }
      }
    });
    setDataInfo({ direction: newDirec, laneId: newLanelId });
  };

  const getData = async () => {
    const res = await commonRequest({
      ...requestList[1],
      params: { pavementId: laneId, direct: direction },
    });
    setScoreList(res?.data);
  };

  const getRightData = async (row: any, type: string) => {
    const params = {
      startPoint: row?.startPoint,
      endPoint: row?.endPoint,
      pavementId: laneId,
      projectId: sessionStorage.getItem('road_detection_id'),
    };
    const res = await commonRequest(
      type === '1' ? { ...requestList[5], params } : { ...requestList[4], params },
    );
    setPicList(res?.data);
    setCurrentIndex(0);
    setCurrentImg(Object.keys(res?.data)[0]);
    const list: any = res?.data[Object.keys(res?.data)[0]];
    setTableData(
      list?.map((item: any, num: number) => {
        return {
          ...item,
          id: num,
        };
      }),
    );
    setUrl(Object.keys(res?.data)[0]);
  };

  useEffect(() => {
    setCheckType(sessionStorage?.getItem('road_detection_checkType'));
    getLocation();
    getLaneList(false, 0);
    return () => {
      // 销毁地图，并清空地图容器
      if (map) {
        map.remove([polyline1, polyline2]);
        map.destroy();
      }
      map = null;
      polyline1 = null;
      polyline2 = null;
    };
  }, []);

  useEffect(() => {
    if (laneId) {
      getData();
      setLaneId1(laneId);
      if (openRight) getRightData(rowItem, mode);
    }
  }, [laneId]);

  useEffect(() => {
    if (!openRight) {
      setMoreIndex(-1);
    }
  }, [openRight]);

  const onMouseEnter = (e: any, index: number) => {
    setRowIndex(index);
    setClientX(e?.clientX);
    setClientY(e?.clientY);
  };

  const onMouseLeave = () => {
    setRowIndex(-1);
  };

  const showMore = (row: any, index: number) => {
    if (moreIndex === index) return;
    setMoreIndex(index);
    setRowItem(row);
    getRightData(row, mode);
    setOpenRight(true);
  };

  const handleModeChange = (val: any) => {
    setMode(val?.target?.value);
    if (val?.target?.value === '0') {
      getRightData(rowItem, '0');
    } else {
      getRightData(rowItem, '1');
    }
  };

  useEffect(() => {
    if (openRight) ref.current.reload();
  }, [tableData]);

  useEffect(() => {
    childRef?.current?.reload();
  }, [tableData1]);

  const left = () => {
    if (currentIndex === 0) return;
    const index = currentIndex - 1;
    setCurrentIndex(index);
    setCurrentImg(Object.keys(picList)[index]);
    const list: any = picList[Object.keys(picList)[index]];
    setTableData(
      list?.map((item: any, num: number) => {
        return {
          ...item,
          id: num,
        };
      }),
    );
    setUrl(Object.keys(picList)[index]);
  };

  const right = () => {
    if (!(currentIndex < Object?.keys(picList || 1)?.length - 1)) return;
    const index = currentIndex + 1;
    setCurrentIndex(index);
    setCurrentImg(Object.keys(picList)[index]);
    const list: any = picList[Object.keys(picList)[index]];
    setTableData(
      list?.map((item: any, num: number) => {
        return {
          ...item,
          id: num,
        };
      }),
    );
    setUrl(Object.keys(picList)[index]);
  };

  const setImgUrl = (url1: any) => {
    setCurrentImg(url1);
  };

  const downloadflie = async () => {
    const params = {
      direct: direction1,
      pavementId: laneId1,
      projectId: sessionStorage.getItem('road_detection_id'),
    };
    commonExport({ ...requestList[6], params });
  };

  const columns: any =
    mode === '0'
      ? [
          {
            title: '序号',
            dataIndex: 'index',
            valueType: 'index',
            width: 50,
          },
          {
            title: '病害类型',
            dataIndex: 'diseaseZh',
            key: 'diseaseNameZh',
            width: 100,
            ellipsis: true,
          },
          {
            title: '病害面积(㎡)',
            dataIndex: 'area',
            key: 'area',
            width: 120,
            ellipsis: true,
            render: (_text: any, recode: any) => {
              return (
                <span>
                  {recode?.area || recode?.area === 0 || recode?.area === '0'
                    ? Number(recode?.area)?.toFixed(4)
                    : '-'}
                </span>
              );
            },
          },
          {
            title: '病害长度(m)',
            dataIndex: 'length',
            key: 'length',
            width: 100,
            ellipsis: true,
            render: (_text: any, recode: any) => {
              return (
                <span>
                  {recode?.length || recode?.length === 0 || recode?.length === '0'
                    ? Number(recode?.length)?.toFixed(4)
                    : '-'}
                </span>
              );
            },
          },
          { title: '桩号', dataIndex: 'stakeNo', key: 'stakeNo', width: 80, ellipsis: true },
        ]
      : [
          {
            title: '序号',
            dataIndex: 'index',
            valueType: 'index',
            width: 50,
          },
          {
            title: '病害类型',
            dataIndex: 'diseaseZh',
            key: 'diseaseNameZh',
            width: 100,
            ellipsis: true,
          },
          {
            title: '病害长度(m)',
            dataIndex: 'length',
            key: 'length',
            width: 100,
            ellipsis: true,
            render: (_text: any, recode: any) => {
              return (
                <span>
                  {recode?.length || recode?.length === 0 || recode?.length === '0'
                    ? Math.round(recode?.length)
                    : '-'}
                </span>
              );
            },
          },
          { title: '桩号', dataIndex: 'stakeNo', key: 'stakeNo', width: 80, ellipsis: true },
        ];

  const columns1: any = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'index',
      width: 50,
    },
    { title: '项目名称', key: 'projectName', dataIndex: 'projectName', ellipsis: true, width: 140 },
    {
      title: '道路名称',
      key: 'facilitiesName',
      dataIndex: 'projectName',
      ellipsis: true,
      width: 150,
    },
    {
      title: '方向',
      key: 'direct',
      width: 60,
      dataIndex: 'direct',
      render: (_text: any, record: any) => {
        return <span>{record?.direct ? '下行' : '上行'}</span>;
      },
    },
    { title: '车道', key: 'pavementName', dataIndex: 'pavementName', width: 100, ellipsis: true },
    {
      title: '桩号',
      key: 'stakeNo',
      dataIndex: 'stakeNo',
      width: 160,
      ellipsis: true,
      render: (_text: any, record: any) => {
        return (
          <span>
            {record?.startPoint} - {record?.endPoint}
          </span>
        );
      },
    },
    { title: 'PQI', key: 'pqi', dataIndex: 'pqi', ellipsis: true, width: 60 },
    { title: 'PCI', key: 'pci', dataIndex: 'pci', ellipsis: true, width: 60 },
    { title: 'RQI', key: 'rqi', dataIndex: 'rqi', ellipsis: true, width: 60 },
    { title: 'TCI', key: 'tci', dataIndex: 'tci', ellipsis: true, width: 60 },
    { title: '检测时间', key: 'checkTime', dataIndex: 'checkTime', ellipsis: true, width: 160 },
  ];

  return (
    <div className={styles.projectDetail}>
      <div className={styles.backButton}>
        <div
          onClick={() => {
            history.push('/roadDetection/projectList');
          }}
          className={styles.backLeft}
        >
          <ListBack style={{ margin: '16px 10px 0 20px' }} />
          <span className={styles.backTitle}>检测详情</span>
        </div>
        <div>
          <Button
            type="primary"
            style={{ margin: '0 20px' }}
            onClick={() => {
              setDirection1(direction);
              getLaneList(direction, 1, false);
              const plaVal: any = sessionStorage?.getItem('road_detection_checkType');
              setDataReport(plaVal.toString() === '1' ? 'platform' : 'report');
              // setIsReport(true);
            }}
          >
            数据报表
          </Button>
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <div style={{ position: 'relative', width: openRight ? '70%' : '100%' }}>
          <div
            id="container"
            style={{
              height: 'calc(100vh - 169px)',
              margin: openRight ? '0 0 20px 20px' : '0 20px 20px 20px',
            }}
          ></div>
          <div
            className={`${showBig ? styles.footerBigContent : styles.footerContent} ${
              styles.footerCommon
            }`}
            style={{ width: openRight ? 'calc(100% - 40px)' : 'calc(100% - 60px)' }}
          >
            <Pull style={{ position: 'absolute', top: '-25px', left: 'calc(50% - 105px' }}></Pull>
            <div
              style={{
                display: 'inline-flex',
                position: 'absolute',
                top: '-22px',
                left: 'calc(50% - 30px)',
              }}
            >
              <a className={`ahover`} style={{ marginTop: '3px' }}>
                {showBig ? <Down /> : <Up />}
              </a>
              <a
                onClick={() => {
                  const isPull = !showBig;
                  setShowBig(isPull);
                }}
                className={`${styles.mapTitle} ahover`}
              >
                <span>{showBig ? '列表折叠' : '列表展开'}</span>
              </a>
            </div>
            <div className={styles.selectContent}>
              <div>
                <Select
                  placeholder="请选择车道方向"
                  className={styles.rowSelect}
                  onChange={(e) => {
                    setDirection(e);
                    getLaneList(e, 0);
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
                    setDataInfo({ direction, laneId: e });
                  }}
                >
                  {Object.keys(laneList).map((item: any) => (
                    <Option key={item} value={item}>
                      {laneList[item]}
                    </Option>
                  ))}
                </Select>
              </div>
              <div>
                <span style={{ paddingRight: '10px' }}>公路技术状况：</span>
                <span style={{ background: '#70CB89' }} className={styles.colorType}></span>
                <span className={styles.colorTypeLetter}>优</span>
                <span style={{ background: '#5C91F4' }} className={styles.colorType}></span>
                <span className={styles.colorTypeLetter}>良</span>
                <span style={{ background: '#FAD755' }} className={styles.colorType}></span>
                <span className={styles.colorTypeLetter}>中</span>
                <span style={{ background: '#EBA157' }} className={styles.colorType}></span>
                <span className={styles.colorTypeLetter}>次</span>
                <span style={{ background: '#FF4D4F' }} className={styles.colorType}></span>
                <span>差</span>
              </div>
            </div>
            <div className={styles.scoreContent}>
              <div className={styles.rowTitleContent}>
                <div className={styles.itemColumn}>桩号</div>
                <div className={styles.itemColumn}>PQI</div>
                <div className={styles.itemColumn}>PCI</div>
                <div className={styles.itemColumn}>RQI</div>
                <div className={styles.itemColumn}>TCI</div>
              </div>
              <div className={styles.rows} onMouseLeave={onMouseLeave}>
                {scoreList.map((item: any, index: number) => {
                  return (
                    <div className={styles.rowItem} key={item.startPoint}>
                      {rowIndex === index && (
                        <div
                          className={styles.hoverShow}
                          style={{
                            position: 'fixed',
                            left: `${clientX}px`,
                            top: `${clientY - 46}px`,
                          }}
                        >
                          <div
                            className={styles.row1}
                          >{`${item?.startPoint}-${item?.endPoint}`}</div>
                          <div className={styles.row2}>
                            <div>PQI: {item?.pqi}</div>
                            <div>PCI: {item?.pci}</div>
                          </div>
                          <div className={styles.row2}>
                            <div>RQI: {item?.rqi}</div>
                            <div>TCI: {item?.tci}</div>
                          </div>
                        </div>
                      )}
                      <div className={styles.firstColumn}>
                        <span
                          onClick={() => {
                            if (checkType === '0') return;
                            showMore(item, index);
                          }}
                          style={
                            moreIndex === index
                              ? { color: '#0013c1', paddingRight: '10px' }
                              : { paddingRight: '10px' }
                          }
                        >{`${item?.startPoint}-${item?.endPoint}`}</span>
                        {checkType === '1' && (
                          <More
                            style={
                              checkType === '0'
                                ? {
                                    cursor: 'not-allowed',
                                    marginTop: '15px',
                                    color: '#eee!important',
                                  }
                                : { marginTop: '15px' }
                            }
                            onClick={() => {
                              if (checkType === '0') return;
                              showMore(item, index);
                            }}
                          ></More>
                        )}
                      </div>
                      {keys.map((key: any) => {
                        return (
                          <div
                            className={styles.otherColumn}
                            key={key}
                            onMouseEnter={(e) => onMouseEnter(e, index)}
                          >
                            {(item[key] === '优' || item[key] === 'A') && (
                              <div
                                className={styles.background}
                                style={{
                                  background: '#70CB89',
                                  borderBottom: '1px solid rgb(232 232 232 / 25%)',
                                  borderRight: '1px solid rgb(232 232 232 / 25%)',
                                }}
                              ></div>
                            )}
                            {(item[key] === '良' || item[key] === 'B') && (
                              <div
                                className={styles.background}
                                style={{
                                  background: '#5C91F4',
                                  borderBottom: '1px solid rgb(232 232 232 / 25%)',
                                  borderRight: '1px solid rgb(232 232 232 / 25%)',
                                }}
                              ></div>
                            )}
                            {(item[key] === '中' || item[key] === 'C') && (
                              <div
                                className={styles.background}
                                style={{
                                  background: '#FAD755',
                                  borderBottom: '1px solid rgb(232 232 232 / 25%)',
                                  borderRight: '1px solid rgb(232 232 232 / 25%)',
                                }}
                              ></div>
                            )}
                            {(item[key] === '次' || item[key] === 'D') && (
                              <div
                                className={styles.background}
                                style={{
                                  background: '#EBA157',
                                  borderBottom: '1px solid rgb(232 232 232 / 25%)',
                                  borderRight: '1px solid rgb(232 232 232 / 25%)',
                                }}
                              ></div>
                            )}
                            {(item[key] === '差' || item[key] === 'E') && (
                              <div
                                className={styles.background}
                                style={{
                                  background: '#FF4D4F',
                                  borderBottom: '1px solid rgb(232 232 232 / 25%)',
                                  borderRight: '1px solid rgb(232 232 232 / 25%)',
                                }}
                              ></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {openRight && (
          <div className={styles.rightContent}>
            <div className={styles.rightTitle}>
              <div
                className={styles.titleText}
              >{`${rowItem?.startPoint}-${rowItem?.endPoint}`}</div>
              <div className={styles.closeIcon} onClick={() => setOpenRight(false)}>
                <Close />
              </div>
            </div>

            <div className={styles.rightPic}>
              <div className={styles.rightRadio}>
                <Radio.Group onChange={handleModeChange} defaultValue={mode}>
                  <Radio.Button value="0">路面</Radio.Button>
                  <Radio.Button value="1">街景</Radio.Button>
                </Radio.Group>
              </div>

              <div className={styles.picBox}>
                <div className={styles.picPre}>
                  {/* <Left onClick={left}/> */}
                  <LeftCircleOutlined
                    onClick={left}
                    style={{ fontSize: '35px', color: 'rgba(0, 0, 0, 0.2)' }}
                    className={currentIndex > 0 ? styles.iconHover : styles.iconNone}
                  />
                </div>
                <div className={styles.picContent} style={{ textAlign: 'center' }}>
                  <Image
                    width={currentImg ? '100%' : '60%'}
                    height={currentImg ? 'calc(100vh - 620px)' : 'calc((100vh - 620px) * 0.6)'}
                    src={url ? currentImg : img}
                  />
                  <ImgCanvas
                    setImgUrl={(url1: any) => setImgUrl(url1)}
                    data={{
                      url,
                      id: `${url}-${new Date().valueOf()}`,
                      ls: tableData,
                    }}
                    currentTab={mode}
                  />{' '}
                </div>
                <div className={styles.picNext}>
                  {/* <Right onClick={right}/> */}
                  <RightCircleOutlined
                    onClick={right}
                    style={{ fontSize: '35px', color: 'rgba(0, 0, 0, 0.2)' }}
                    className={
                      currentIndex < Object?.keys(picList || 1)?.length - 1
                        ? styles.iconHover
                        : styles.iconNone
                    }
                  />
                </div>
              </div>
            </div>

            <div className={styles.rightTable}>
              <ProTable
                columns={columns}
                dataSource={tableData}
                rowKey="id"
                rowSelection={false}
                scroll={{ x: '100%', y: '270px' }}
                pagination={false}
                tableAlertRender={false}
                toolBarRender={false}
                search={false}
                actionRef={ref}
              />
            </div>
          </div>
        )}
      </div>

      {dataReport && dataReport === 'report' && (
        <Modal
          title="数据报表"
          width={'1100px'}
          bodyStyle={{
            paddingBottom: '20px',
            height: 'calc(80vh - 150px)',
          }}
          maskClosable={false}
          open={!!dataReport}
          footer={false}
          onCancel={() => setDataReport('')}
          style={{ top: '10vh' }}
        >
          <Select
            placeholder="请选择车道方向"
            className={styles.rowSelect}
            style={{ width: '140px', marginRight: '10px' }}
            onChange={(e) => {
              setDirection1(e);
              getLaneList(e, 1);
            }}
            value={direction1}
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
            value={laneId1}
            style={{ width: '140px', marginRight: '10px' }}
            onChange={(e) => {
              setLaneId1(e);
              getTableData(e, direction1);
            }}
          >
            {Object.keys(laneList1).map((item: any) => (
              <Option key={item} value={item}>
                {laneList1[item]}
              </Option>
            ))}
          </Select>
          <Button type="primary" style={{ marginBottom: '20px' }} onClick={downloadflie}>
            全部导出
          </Button>
          <div className={styles.tableContent}>
            <ProTable
              columns={columns1}
              dataSource={tableData1}
              rowKey="id"
              rowSelection={false}
              scroll={{ x: '100%', y: '270px' }}
              pagination={false}
              tableAlertRender={false}
              toolBarRender={false}
              search={false}
              actionRef={childRef}
            />
          </div>
        </Modal>
      )}
      {dataReport && dataReport === 'platform' ? (
        <DataReport dataReport={dataReport} onCancel={() => setDataReport('')} />
      ) : null}
    </div>
  );
};
