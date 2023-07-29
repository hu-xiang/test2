import { Select, Input, Button, Image, Modal, message } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import ProTable from '@ant-design/pro-table';
import DetectCanvas from './DetectCanvas';
import PreviewCanvas from './PreviewCanvas';
import styles from './styles.less';
import { commonRequest } from '../../../../../utils/commonMethod';

import point from '../../../../../assets/img/mapPng/point.png';
import pointRed from '../../../../../assets/img/mapPng/pointRed.png';
import pointGreen from '../../../../../assets/img/mapPng/pointGreen.png';

const { Option } = Select;
const { confirm } = Modal;

let map: any = null;
const { AMap }: any = window;
let markers: any = [];
let layer: any = null;

type Iprops = {
  currentTab?: string | number;
};

const requestList = [
  { url: '/traffic/road/project/select/pavement', method: 'get' },
  { url: '/traffic/road/project/img/map', method: 'get' },
  { url: '/traffic/road/project/alone/img/map', method: 'get' },
  { url: '/traffic/road/project/technical/check', method: 'get' },
  { url: '/traffic/road/project/technical', method: 'get' },
];

type dataItemType = {
  flag: number;
  imgName: string;
  imgUrl: string;
  jsonString: any;
};
const dataItem: dataItemType = {
  flag: 0,
  imgName: '',
  imgUrl: '',
  jsonString: '',
};

let firstClick = true;
let prevMarker: any = null;
let preIcon: any = null;

const DetectContent: React.FC<Iprops> = (props) => {
  const ref = useRef<any>();
  const { currentTab } = props;
  const [imgUrl, setImgUrl] = useState<any>(null);
  const [visible, setVisible] = useState<boolean>(false);
  const [isAdd, setAdd] = useState(false);
  const [nextItem, setNextItem] = useState<any>();
  const [preItem, setPreItem] = useState<any>();
  const [flag, setFlag] = useState(false);
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);
  const [list, setList] = useState<any>([]);
  const [data, setData] = useState<any>(dataItem);
  const [colorInd, setColorInd] = useState<any>();
  const [isGetNext, setIsGetNext] = useState<boolean>(false);
  const [direct, setDirect] = useState<any>();
  const [laneList, setLaneList] = useState<any>([]);
  const [imgName, setImgName] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [stakeNo, setStakeNo] = useState<any>(null);
  const [nextDisabled, setNextDisabled] = useState<boolean>(false);
  const [preDisabled, setPreDisabled] = useState<boolean>(false);
  const [bigScreen, setBigScreen] = useState<boolean>(true);
  const [currentData1, setCurrentData1] = useState<any>();
  const [currentData2, setCurrentData2] = useState<any>();

  const getLaneList = async () => {
    setDirect(null);
    const res = await commonRequest({
      ...requestList[0],
      params: { id: sessionStorage?.getItem('road_detection_id') },
    });
    setLaneList(res?.data);

    Object.keys(res?.data).forEach((item: any, i: number) => {
      if (i === 0) {
        setDirect(item);
      }
    });
  };

  useEffect(() => {
    if (currentTab === '2') {
      setCurrentData1({
        ...data,
        nextDisabled,
        preDisabled,
        direct,
      });
      setDirect(currentData2?.direct || '0');
    } else if (currentTab === '1') {
      setCurrentData2({
        ...data,
        nextDisabled,
        preDisabled,
        direct,
      });
      Object.keys(laneList).forEach((item: any, i: number) => {
        if (i === 0) {
          setDirect(currentData1?.direct || item);
        }
      });
    }
  }, [currentTab]);

  const markerClick = (e: any) => {
    const targetMarker = e?.target ? e?.target : e;
    const image = targetMarker?.getIcon()?.image;
    const icon = {
      type: 'image',
      image,
      size: [26, 36],
      anchor: 'bottom-center',
    };
    if (prevMarker && preIcon) {
      // 上一个marker还原
      prevMarker.setTop(false);
      const small = {
        type: 'image',
        image: preIcon,
        size: [20, 26],
        anchor: 'bottom-center',
      };
      prevMarker.setIcon(small);
    }
    prevMarker = targetMarker;
    preIcon = image;
    targetMarker.setTop(true);
    targetMarker.setIcon(icon);
  };

  const getMapData = async () => {
    const res = await commonRequest(
      currentTab === '1'
        ? { ...requestList[1], params: { id: direct } }
        : {
            ...requestList[2],
            params: { direct, projectId: sessionStorage?.getItem('road_detection_id') },
          },
    );
    if (layer) layer?.remove(markers);
    if (res?.data?.length) {
      markers = [];
      layer = new AMap.LabelsLayer({
        zooms: [3, 20],
        zIndex: 1000,
        collision: false,
      });

      map.add(layer);

      for (let i = 0; i < res?.data?.length; i++) {
        // const marker: any = null;
        let icon = point;
        if (res?.data[i]?.imgStatus === 0) {
          icon = point;
        } else if (res?.data[i]?.imgStatus === 1) {
          icon = pointRed;
        } else {
          icon = pointGreen;
        }
        // marker = new AMap.Marker({
        //   map,
        //   icon,
        //   position: [res?.data[i]?.longitude, res?.data[i]?.latitude],
        //   anchor: 'bottom-center',
        // });
        // markers.push(marker);

        const curData = {
          position: [res?.data[i]?.longitude, res?.data[i]?.latitude],
          icon: {
            type: 'image',
            image: icon,
            size: [20, 26],
            anchor: 'bottom-center',
          },
        };

        const labelMarker = new AMap.LabelMarker(curData);
        markers.push(labelMarker);

        labelMarker.on('click', (e: any) => {
          nextItem?.fn(res?.data[i]?.id);
          markerClick(e);
        });

        if (
          res?.data[i]?.longitude === data?.entity?.longitude &&
          res?.data[i]?.latitude === data?.entity?.latitude
        ) {
          map.setCenter([res?.data[i]?.longitude, res?.data[i]?.latitude]);
          markerClick(labelMarker);
        }
      }
      // map.add(markers);
      // 一次性将海量点添加到图层
      layer.add(markers);
    } else {
      map.setCenter([114.058141, 22.543544]);
      if (layer) layer?.remove(markers);
      if (map) map.remove(layer);
    }
  };

  useEffect(() => {
    getLaneList();
    map = new AMap.Map('container', {
      zoom: 15,
      // center: [114.058141, 22.543544],
    });
    if (window.matchMedia('(max-width: 1400px)').matches) {
      setBigScreen(false);
    } else {
      setBigScreen(true);
    }
    return () => {
      if (map) {
        map.destroy();
        map = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isGetNext) {
      ref.current.reload();
      setIsGetNext(false);
    }
  }, [isGetNext]);

  useEffect(() => {
    if (data?.entity?.imgUrl) {
      setSelectedRowKey([]);
      const indList: any = [];
      data?.list?.forEach((item: any, index: any) => {
        data.list[index].id = item.id;
        indList.push(item.id);
        if (index === data?.list?.length - 1) {
          setSelectedRowKey(indList);
        }
      });

      setList(data?.list?.length ? [...data?.list] : []);
      setFlag(true);
      setImgName(data?.entity?.imgName);
      setStakeNo(data?.entity?.stakeNo);
      setLocation(`${data?.entity?.longitude}, ${data?.entity?.latitude}`);
    }
    if (!data?.entity) {
      setSelectedRowKey([]);
      setImgName('');
      setStakeNo('');
      setLocation('');
    }

    if (!data?.list?.length) {
      setList([]);
    }

    if (!flag) return;

    if (!data?.entity?.imgUrl || !data?.dataNull) {
      setFlag(false);
    } else {
      setFlag(true);
    }
  }, [data, flag, data.list]);

  useEffect(() => {
    if (direct || direct === '0') {
      setTimeout(() => {
        getMapData();
      }, 0);
    }
  }, [data]);

  // const getImgUrl = (url: string) => {
  //   setImgUrl(url);
  // };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKey(newSelectedRowKeys);
  };

  const nextItemFn = (fn: void) => {
    setNextItem({ fn });
  };

  const preItemFn = (fn: void) => {
    setPreItem({ fn });
  };

  const DataFn = (datas: any) => {
    setData(datas);
  };

  const setFirstClick = () => {
    firstClick = true;
  };

  const nextItemDebounce = () => {
    if (firstClick && !nextDisabled) {
      nextItem?.fn();
      firstClick = false;
    }
  };

  const preItemDebounce = () => {
    if (firstClick && !preDisabled) {
      preItem?.fn();
      firstClick = false;
    }
  };

  document.onkeyup = (e) => {
    if (!flag) return;
    e.preventDefault();
    console.log(e);
    // if (e.key === '`') {
    //   nextItemDebounce();
    // }
    if ((e.key === '`' || e.key === '~') && !isAdd) {
      setAdd(true);
    }
    if (e.key === 'Q' || e.key === 'q') {
      preItemDebounce();
    }
    if (e.key === 'W' || e.key === 'w') {
      nextItemDebounce();
    }
    // if (e.code === 'Space') {
    //   clickHeadRow();
    // }
  };

  const getNext = (val: boolean) => {
    setIsGetNext(val);
  };

  const updateBtn = async () => {
    const params = {
      projectId: sessionStorage?.getItem('road_detection_id'),
    };
    const res = await commonRequest({ ...requestList[3], params });
    // const title = res ? '尚有图片未完成人工检测，是否更新指标计算？' : '已完成所有图片的人工检测，是否更新指标计算？'
    if (res?.status !== 500) {
      const title = res?.data;
      confirm({
        title,
        // icon: <ExclamationCircleOutlined />,
        okText: '确定',
        okType: 'danger',
        zIndex: 1100,
        cancelText: '取消',
        async onOk() {
          try {
            const res1 = await commonRequest({ ...requestList[4], params });
            if (res1.status === 0) {
              message.success({
                content: '更新成功',
                key: '更新成功',
              });
            }
          } catch (error) {
            message.error({
              content: '更新失败',
              key: '更新失败',
            });
          }
        },
        onCancel() {},
      });
    }
  };

  const columns: any =
    currentTab === '1'
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
            key: 'diseaseZh',
            width: 100,
            ellipsis: true,
            render: (text: any, recode: any) => {
              return (
                <span
                  className={`${styles.cursor} ${colorInd === recode.id ? styles.selLight : ''}`}
                  onClick={() => {
                    if (colorInd === recode.id) {
                      setColorInd(undefined);
                    } else {
                      setColorInd(recode.id);
                    }
                  }}
                >
                  {
                    /* eslint-disable */
                    // !(recode?.diseaseZh?.indexOf('水泥') < 0) ||
                    // !(recode?.diseaseZh?.indexOf('沥青') < 0)
                    //   ? recode?.diseaseZh
                    //   : recode?.cementOrAsphalt === 1
                    //   ? `水泥路面-${recode?.diseaseZh}`
                    //   : `沥青路面-${recode?.diseaseZh}`
                    /* eslint-enable */
                    recode?.diseaseZh
                  }
                </span>
              );
            },
          },
          {
            title: '病害面积(㎡)',
            dataIndex: 'area',
            key: 'area',
            width: 120,
            ellipsis: true,
            render: (_text: any, recode: any) => {
              if (!recode?.area) {
                return '-';
              }
              return <span>{Number(recode?.area)?.toFixed(4)}</span>;
            },
          },
          {
            title: '病害长度(m)',
            dataIndex: 'length',
            key: 'length',
            width: 100,
            ellipsis: true,
            render: (_text: any, recode: any) => {
              if (!recode?.length) {
                return '-';
              }
              return <span>{Number(recode?.length)?.toFixed(4)}</span>;
            },
          },
          { title: '桩号', dataIndex: 'stakeNo', key: 'stakeNo', width: 80, ellipsis: true },
          {
            title: '检测方式',
            dataIndex: 'checkType',
            key: 'checkType',
            width: 80,
            ellipsis: true,
            render: (_text: any, recode: any) => {
              /* eslint-disable */
              if (recode?.checkType === 0) {
                return <span>自动识别</span>;
              } else if (recode?.checkType === 1) {
                return <span>手动标注</span>;
              } else {
                return <span>报表导入</span>;
              }
              /* eslint-enable */
            },
          },
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
            key: 'diseaseZh',
            width: 100,
            ellipsis: true,
            render: (text: any, recode: any) => {
              return (
                <div
                  className={`${styles.cursor} ${colorInd === recode.id ? styles.selLight : ''}`}
                  onClick={() => {
                    if (colorInd === recode.id) {
                      setColorInd(undefined);
                    } else {
                      setColorInd(recode.id);
                    }
                  }}
                >
                  {text}
                </div>
              );
            },
          },
          {
            title: '损坏长度(m)',
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
          {
            title: '检测方式',
            dataIndex: 'checkType',
            key: 'checkType',
            width: 80,
            ellipsis: true,
            render: (_text: any, recode: any) => {
              /* eslint-disable */
              if (recode?.checkType === 0) {
                return <span>自动识别</span>;
              } else if (recode?.checkType === 1) {
                return <span>手动标注</span>;
              } else {
                return <span>报表导入</span>;
              }
              /* eslint-enable */
            },
          },
        ];
  return (
    <div className={styles.detectContent}>
      <div className={styles.detectHeader}>
        <div className={styles.headerItem}>
          <span style={{ display: 'inline-block', width: '28px', margin: '0 10px 0 20px' }}>
            {currentTab === '1' ? '车道' : '方向'}
          </span>
          <Select
            allowClear
            placeholder="请选择"
            onChange={(e) => {
              if (currentTab === '1') {
                setCurrentData1(null);
              } else {
                setCurrentData2(null);
              }
              setDirect(e);
            }}
            value={direct}
          >
            {currentTab === '1' ? (
              Object.keys(laneList).map((item: any) => (
                <Option key={item} value={item}>
                  {laneList[item]}
                </Option>
              ))
            ) : (
              <>
                <Option key={'0'} value={'0'}>
                  上行
                </Option>
                <Option key={'1'} value={'1'}>
                  下行
                </Option>
              </>
            )}
          </Select>
        </div>
        {/* <div className={styles.headerItem} style={{ marginLeft: '-20px' }}>
          <span className={styles.rowLabel}>图片序号</span>
          <Input autoComplete="off" placeholder="图片序号" disabled />
        </div> */}

        <div className={styles.headerItem} style={{ marginLeft: '-20px' }}>
          <span className={styles.rowLabel}>图片名称</span>
          <Input autoComplete="off" placeholder="图片名称" disabled value={imgName} />
        </div>

        <div className={styles.headerItem} style={{ marginRight: '12px' }}>
          <span className={styles.rowLabel}>图片桩号</span>
          <Input autoComplete="off" placeholder="图片桩号" disabled value={stakeNo} />
        </div>

        <div className={styles.headerItem}>
          <span className={styles.rowLabel}>图片经纬度</span>
          <Input autoComplete="off" placeholder="图片经纬度" disabled value={location} />
        </div>
        <Button
          type="primary"
          className={styles.headerBtn}
          onClick={updateBtn}
          disabled={!data?.entity?.imgUrl}
        >
          更新指标计算
        </Button>
      </div>
      <div className={styles.detectMain}>
        <div className={styles.detectLeft}>
          <div className={styles.picContent}>
            <DetectCanvas
              preItemFn={preItemFn}
              nextItemFn={nextItemFn}
              setImgUrl={() => {}}
              DataFn={DataFn}
              setAdd={setAdd}
              isAdd={isAdd}
              selectedRowKey={selectedRowKey}
              selObj={{
                projectId: sessionStorage?.getItem('road_detection_id'),
                direct,
              }}
              flags={flag}
              colorInd={colorInd}
              setSelectedRowKey={setSelectedRowKey}
              setColorInd={setColorInd}
              isGetNext={getNext}
              setFirstClick={setFirstClick}
              currentTab={currentTab}
              setDisabled={(val1: any, val2: any) => {
                setNextDisabled(val1);
                setPreDisabled(val2);
              }}
              currentData1={currentData1}
              currentData2={currentData2}
            />
            <Image
              width={200}
              style={{ display: 'none' }}
              preview={{
                visible,
                src: imgUrl,
                onVisibleChange: (value) => {
                  setVisible(value);
                },
              }}
            />
            {visible && (
              <PreviewCanvas
                setImgUrl={(url: any) => setImgUrl(url)}
                data={data}
                currentTab={currentTab}
              />
            )}
          </div>
          <div className={styles.footerBtn}>
            <Button
              style={{ marginLeft: '10px' }}
              onClick={() => setVisible(true)}
              disabled={!data?.entity?.imgUrl}
            >
              放大
            </Button>
            <Button
              type="primary"
              style={{ marginLeft: '10px' }}
              disabled={isAdd || !data?.entity?.imgUrl}
              onClick={() => setAdd(true)}
            >
              添加标注（~）
            </Button>
            {/* <Button
              type="primary"
              style={{ marginLeft: '10px' }}
              onClick={() => setModalShow(true)}
            >
              添加标注（~）
            </Button> */}
            <Button
              style={{ marginLeft: '10px' }}
              onClick={() => {
                preItemDebounce();
              }}
              disabled={preDisabled}
            >
              上一张（Q）
            </Button>
            <Button
              style={{ marginLeft: '10px' }}
              onClick={() => {
                nextItemDebounce();
              }}
              disabled={nextDisabled}
            >
              下一张（W）
            </Button>
          </div>
        </div>
        <div className={styles.detectRight}>
          <div className={styles.rightTitle}>检测结果</div>
          <div className={bigScreen ? styles.rightTable : styles.smallRightTable}>
            <ProTable
              columns={columns}
              dataSource={list}
              rowKey="id"
              rowSelection={{
                selectedRowKeys: selectedRowKey,
                type: 'checkbox',
                onChange: onSelectChange,
              }}
              scroll={{ y: 'calc(100vh - 215px)' }}
              pagination={false}
              tableAlertRender={false}
              toolBarRender={false}
              search={false}
              actionRef={ref}
            />
          </div>
          <div className={bigScreen ? styles.rightMap : styles.smallRightMap}>
            <div
              id="container"
              style={{
                height: bigScreen ? 'calc(100vh - 626px)' : 'calc(100vh - 576px)',
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DetectContent;
