import { Card, ConfigProvider, List, Image, Pagination } from 'antd';
import React, { useState, useRef, useEffect, memo, useImperativeHandle } from 'react';
import styles from '../styles.less';
import uploadNullImg from '../../../assets/img/uploadIcon/uploadImg.png';
import MileageBar from './MileageBar';
import DistressCanvas from '../../../components/DistressCanvas';
// import doLarger from '../../../assets/img/InspectionBoard/doLarger.svg';
import { getDiseaseImgInfo, getTotalMile } from '../service';
// import MileageLineModal from './mileageStaticsModal';
import Legend from './Legend';
// import FacilityPieModal from './facilityPieModal';
import EllipsisTooltip from '../../../components/EllipsisTooltip';
import EmptyStatus from '../../../components/TableEmpty';
import MutiSelect from '../../../components/MutiSelect';
import ProTable from '@ant-design/pro-table';
import moment from 'moment';

import { useCarListScrollObj } from '../../../utils/tableScrollSet';

interface lsType {
  diseaseNameZh: string;
  area: string;
  length: string;
  collectTime: string;
  diseaseType: string;
}
type rightInfoType = {
  diseaseCount: number;
  todayMile: number;
  online: number;
  allNum: number;
};
type Iprop = {
  // totalMile: number;
  mapType: string;
  switchPage: (page: any) => void;
  switchPageCar: (page: any) => void;
  carTableInfo: any;
  disDiseaseList: any;
  onRef: any;
  handleSwitchCar: (type: any) => void;
  handleSwitchDisease: (keys: any) => void;
  diseaseTotal: number;
  rightInfo: rightInfoType;
  isFullScreen: boolean;
  handleCarSelect: (rowInfo: any) => void;
  handleDiseaseSelect: (rowInfo: any) => void;
  roadStatus: string;
};
// const { Option } = Select;
let isUnmount: boolean = false;
const typeTitle: any = {
  1: '近七天',
  2: '近30天',
  3: '近12个月',
};
const MapRightPanel: React.FC<Iprop> = memo((props) => {
  const [typeTime, setTypeTime] = useState<number>(1);
  const typeTimeList = [
    { name: '周', type: 1 },
    { name: '月', type: 2 },
    { name: '年', type: 3 },
  ];
  const handleTypeTime = (type: any) => {
    setTypeTime(type);
  };

  const { rightInfo } = props;
  const ls: lsType[] = [];
  const scrollObj: any = useCarListScrollObj(props.carTableInfo?.rows);
  const [imgData, setImgData] = useState<any>({ ls });
  // const [modalTitle, setModalTitle] = useState('图表放大图');
  const pageSize = 10;
  const pageSizeCar = 5;
  const [flagList, setFlagList] = useState<any>(Array.from({ length: pageSize }, () => false));
  const [pageCurrent, setPageCurrent] = useState<any>(1);
  const [pageCarCurrent, setPageCarCurrent] = useState<any>(1);
  const actionRef = useRef<any>();
  const [previewImgUrl, setPreviewImgUrl] = useState<any>();
  const [imageInfo, setImageInfo] = useState<any>();
  // const [isFacilityVisible, setIsFacilityVisible] = useState(false);
  // const [isMileageVisible, setIsMileageVisible] = useState(false);
  // const carInfos = [
  //   { id: 1, key: '', value: '全部' },
  //   { id: 2, key: 0, value: '在线' },
  //   { id: 3, key: 1, value: '离线' },
  // ];
  const [totalMileageNum, setTotalMileageNum] = useState<any>(0); // 总巡检里程
  const [onlineRate, setOnlineRate] = useState<string>('0/0');
  // const [carType, setCarType] = useState<any>('');
  const resetPage = () => {
    setPageCurrent(1);
  };
  useImperativeHandle(props.onRef, () => ({
    // 暴露给父组件的方法
    resetPage,
  }));
  // const handleCarType = (text: any, option: any) => {
  //   setCarType(option?.key || '');
  //   props.handleSwitchCar(option?.key || '');
  // };
  const handleDiseaseType = (text: any) => {
    setPageCurrent(1);
    props.handleSwitchDisease(text);
  };

  const handleTableRow = (record: any) => {
    if (record) {
      props.handleCarSelect(record);
    }
  };
  const handleListClick = (record: any) => {
    if (record) {
      props.handleDiseaseSelect(record);
    }
  };

  const switchDiseaseInfo = (current: number) => {
    setPageCurrent(current);
    props.switchPage(current);
  };
  const switchCar = (current: number) => {
    setPageCarCurrent(current);
    props.switchPageCar(current);
  };
  const getTotalMileageDatas = async () => {
    try {
      const rec = await getTotalMile();
      if (rec?.status === 0 && !isUnmount) {
        setTotalMileageNum(rec?.data?.total);
      }
    } catch (error) {
      console.log('error', error);
    }
  };
  useEffect(() => {
    isUnmount = false;
    getTotalMileageDatas();
    return () => {
      isUnmount = true;
    };
  }, []);
  useEffect(() => {
    setOnlineRate(rightInfo?.allNum ? `${rightInfo?.online}/${rightInfo?.allNum}` : '0/0');
  }, [rightInfo?.allNum]);

  // const handleLargeChart = (name: any, id: any) => {
  //   setModalTitle(name);
  //   if (id === 'mileageID') {
  //     setIsMileageVisible(true);
  //   } else if (id === 'facilityPieID') {
  //     setIsFacilityVisible(true);
  //   }
  // };
  const customViewInfoColumns: any = [
    {
      title: '设备名称',
      dataIndex: 'deviceName',
      valueType: 'deviceName',
      ellipsis: true,
      render: (deviceName: any, record: any) => {
        /* eslint-disable */
        const colorTxt = record?.deviceStatus === '0' ? 'lightColor' : 'darkColor';
        return <span className={colorTxt}>{deviceName}</span>;
      },
    },
    {
      title: '巡检员',
      dataIndex: 'ipqcName',
      key: 'ipqcName',
      ellipsis: true,
      render: (ipqcName: any, record: any) => {
        /* eslint-disable */
        const colorTxt = record?.deviceStatus === '0' ? 'lightColor' : 'darkColor';
        return <span className={colorTxt}>{ipqcName}</span>;
      },
    },
    {
      title: '联系方式',
      dataIndex: 'ipqcTel',
      key: 'ipqcTel',
      ellipsis: true,
      render: (ipqcTel: any, record: any) => {
        /* eslint-disable */
        const colorTxt = record?.deviceStatus === '0' ? 'lightColor' : 'darkColor';
        return <span className={colorTxt}>{ipqcTel}</span>;
      },
    },
    // {
    //   title: '状态',
    //   dataIndex: 'deviceStatus',
    //   key: 'deviceStatus',
    //   // width: 80,
    //   ellipsis: true,
    //   render: (_deviceStatus: any, record: any) => {
    //     /* eslint-disable */
    //     const statusStr =
    //       record?.deviceStatus === '0' ? '在线' : record?.deviceStatus === '1' ? '离线' : '-';
    //     const colorTxt = record?.deviceStatus === '0' ? 'lightColor' : 'darkColor';
    //     return <span className={colorTxt}>{statusStr}</span>;
    //   },
    // },
    {
      title: '巡检日期',
      dataIndex: 'collectTime',
      key: 'collectTime',
      // width: 60,
      ellipsis: true,
      render: (collectTime: any, record: any) => {
        /* eslint-disable */
        const collectTimeFormat = record?.collectTime
          ? moment(record?.collectTime)?.format('yyyy-MM-DD')
          : '-';
        const colorTxt = record?.deviceStatus === '0' ? 'lightColor' : 'darkColor';
        return <span className={colorTxt}>{collectTimeFormat}</span>;
      },
    },
  ];
  const previewBigImg = (url: string) => {
    setPreviewImgUrl(url);
  };
  const getImgInfo = async (infos: any) => {
    if (!infos) return;
    const detRes = await getDiseaseImgInfo(infos.id);
    if (detRes?.status === 0 && !isUnmount) {
      setImgData(detRes.data);
    }
  };
  useEffect(() => {
    if (!imgData.ls.length && imageInfo?.id) {
      getImgInfo(imageInfo);
    } else {
      setImgData({ ls: imgData?.ls, url: imgData?.url, num: 1 });
    }
  }, [flagList, previewImgUrl]);

  return (
    <>
      <div className={`${styles.rightPanelClass}`}>
        <div
          className={`${!props.isFullScreen ? styles.rightBgPanel : styles.rightTransPanel} ${
            styles.panelClass
          } ${styles.rightPanel}`}
        >
          {!props.isFullScreen ? (
            <>
              <div className={styles.rightFirstCard}>
                <div className={styles.rightFirstTitle}>
                  <span className={styles.firstTitleImg}></span>
                  <span className={styles.titleTxt}>今日概况</span>
                  <div className={styles.highlight}></div>
                </div>
                <div className={styles['content-first-box']}>
                  <div className={styles['disease-statics-class']}>
                    <div className={styles['disease-bcgimg-class']}>
                      {/* <div className={styles['img-cover']}></div> */}
                      {/* <img className={styles['img-cover']} src={rightDiseaseImg}></img> */}
                      <span className={styles['disease-Name-txt']}>新增病害数(个)</span>
                      <span className={styles['disease-num-txt']}>
                        {rightInfo?.diseaseCount || 0}
                      </span>
                    </div>
                  </div>
                  <div className={`${styles.staticsClass} ${styles['desc-class']}`}>
                    <div className={`${styles['img-statics-box']} ${styles[`bg-left`]}`}>
                      <div className={`${styles['box-wrapper']} `}>
                        <EllipsisTooltip
                          title={'巡检公里数(公里)'}
                          customEclipseClass="staticsRightLiCheng"
                        >
                          <span className={`${styles.staticsNameClass} ${styles['mar-bt-6']}`}>
                            巡检公里数(公里)
                          </span>
                        </EllipsisTooltip>
                        <span className={styles.staticsNumClass}>{rightInfo?.todayMile || 0}</span>
                      </div>
                    </div>
                    <div className={`${styles['img-statics-box']} ${styles[`bg-right`]}`}>
                      <div className={`${styles['box-wrapper']} `}>
                        <EllipsisTooltip
                          title={'设备在线/总数(台)'}
                          customEclipseClass="staticsRightLiCheng"
                        >
                          <span className={`${styles.staticsNameClass} ${styles['mar-bt-6']}`}>
                            设备在线/总数(台)
                          </span>
                        </EllipsisTooltip>
                        <span className={styles.staticsNumClass}>{onlineRate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Card type="inner" className={`${styles.cardBcg} ${styles.cardRoad}`}>
                <div className={`${styles.cardTitle}  ${styles.cardRightTitle}`}>
                  <div className={`${styles.rightFirstTitle} ${styles.rightPadTitle}`}>
                    <span className={styles.firstTitleImg}></span>
                    <span
                      className={`${styles.titleTxt} ${styles.titleTxtHide}`}
                      title={`${typeTitle[typeTime]}巡检里程统计(公里)`}
                    >{`${typeTitle[typeTime]}巡检里程统计(公里)`}</span>
                    {/* <span
                      className={styles.cardTitleleftImg}
                      onClick={() => {
                        handleLargeChart('巡检里程统计(公里)', 'mileageID');
                      }}
                    >
                      <img className={styles.cardTitleImg} src={doLarger} />
                    </span> */}
                    <span className={styles.timeSelect}>
                      {typeTimeList.map((it: any) => (
                        <span
                          key={it?.type}
                          onClick={() => {
                            handleTypeTime(it?.type || 1);
                          }}
                          className={`${it?.type === typeTime ? styles.activeClass : ''} ${
                            styles.liClass
                          }`}
                        >
                          <span>{it?.name}</span>
                        </span>
                      ))}
                    </span>
                  </div>
                  <div className={styles.highlight}></div>
                </div>
                <div className={styles['mile-box']}>
                  <div className={styles['yearmile-statics-class']}>
                    <span className={styles['statics-Name-txt']}>本年度累计巡检总里程(公里)</span>
                    <span className={styles['statics-num-txt']}>{totalMileageNum}</span>
                  </div>
                  <div className={styles['chart-mile-class']}>
                    {/* <MileageBar dataType={1} type={1} /> */}
                    <MileageBar dataType={typeTime} type={1} />
                  </div>
                </div>
              </Card>
            </>
          ) : (
            <>
              <Card
                type="inner"
                className={`${styles.cardBcg} cardCars ${styles.cardCar} ${
                  props.isFullScreen && props?.mapType !== '3d' ? `${styles.fullBg}` : null
                }`}
              >
                <div className={`${styles.cardTitle} ${styles.cardHeight}`}>
                  <div className={styles.firstChartRow}>
                    <EllipsisTooltip title={'车辆信息'} customEclipseClass="tableTitleRow">
                      <span className={styles.leftImg} />
                      <span className={`${styles.cardTxtName}`}>车辆信息</span>
                    </EllipsisTooltip>
                  </div>
                  {/* <div className={styles.cardTitleRight}>
                    <Select
                      popupClassName="dropdownSelectClass"
                      style={{ marginRight: 0 }}
                      value={carType !== '' ? Number(carType) : ''}
                      defaultValue={''}
                      className="searchFacilityClass selectMg10"
                      onChange={handleCarType}
                      placeholder="请选择车辆类型"
                    >
                      {carInfos.map((item: any) => (
                        <Option key={item?.key} className="facClass" value={item?.key}>
                          {item?.value}
                        </Option>
                      ))}
                    </Select>
                  </div> */}
                  <div className={styles.highlight}></div>
                </div>
                <div className={styles.cardDiseaseCommon}>
                  <div className={styles.cardDiseaseCarList}>
                    <ConfigProvider renderEmpty={EmptyStatus}>
                      <ProTable<any>
                        rowKey="id"
                        toolBarRender={false}
                        search={false}
                        actionRef={actionRef}
                        onRow={(record: any) => {
                          return {
                            onClick: () => {
                              handleTableRow(record);
                            }, // 点击行
                          };
                        }}
                        className={`${styles.viewDetailTableClass} ${styles.carTableClass} ${
                          props.carTableInfo?.rows?.length === 0 ? 'emptyTableData' : null
                        }`}
                        scroll={{ y: scrollObj?.y }}
                        dataSource={props.carTableInfo?.rows}
                        tableAlertRender={false}
                        pagination={false}
                        columns={customViewInfoColumns}
                      />
                    </ConfigProvider>
                  </div>
                  {props.carTableInfo?.rows?.length > 0 ? (
                    <div className={styles.bottomPage}>
                      <Pagination
                        size="small"
                        current={pageCarCurrent}
                        pageSize={pageSizeCar}
                        defaultPageSize={1}
                        total={props.carTableInfo?.total}
                        showSizeChanger={false}
                        className={styles.diseasePageClass}
                        style={{ textAlign: 'right' }}
                        onChange={switchCar}
                      />
                    </div>
                  ) : null}
                </div>
              </Card>
              <Card
                type="inner"
                className={`${styles.cardBcg} ${styles.cardDiseaseInfo} ${
                  props.isFullScreen && props?.mapType !== '3d' ? `${styles.fullBg}` : null
                }`}
              >
                <div className={`${styles.cardTitle} ${styles.cardHeight}`}>
                  <div className={styles.firstChartRow}>
                    <EllipsisTooltip title={'病害信息'} customEclipseClass="tableTitleRow">
                      <span className={styles.leftImg} />
                      <span className={`${styles.cardTxtName}`}>病害信息</span>
                    </EllipsisTooltip>
                  </div>
                  <div className={styles.cardTitleRight}>
                    <MutiSelect
                      selectedAll={true}
                      handletreeselect={handleDiseaseType}
                      popupClassName={'dropdownSelectClass'}
                      customclassName={
                        'multi-select searchFacilityClass treeSelectClass selectMg10'
                      }
                    />
                  </div>
                  <div className={styles.highlight}></div>
                </div>
                <div className={styles.diseaseInfoClass}>
                  {props?.disDiseaseList?.length > 0 ? (
                    <>
                      <div className={styles.diseaseInfoList}>
                        <List
                          itemLayout="horizontal"
                          dataSource={props?.disDiseaseList || []}
                          renderItem={(item: any, index: any) => {
                            const listArr = Array.from({ length: pageSize }, () => false);
                            return (
                              <>
                                <List.Item>
                                  <List.Item.Meta
                                    avatar={
                                      <>
                                        <Image
                                          width={111}
                                          height={84}
                                          src={item?.imgUrl || 'error'}
                                          preview={{
                                            visible: flagList[index],
                                            src: previewImgUrl,
                                            onVisibleChange: (value) => {
                                              listArr[index] = value;
                                              setFlagList([...listArr]);
                                              setImageInfo({ ...item });
                                              if (!value) {
                                                setImgData({ ls });
                                                setPreviewImgUrl('');
                                                setImageInfo({});
                                              }
                                            },
                                          }}
                                          fallback={uploadNullImg}
                                        />
                                        {flagList[index] ? (
                                          <>
                                            <DistressCanvas
                                              setImgUrl={previewBigImg}
                                              data={imgData}
                                            />
                                          </>
                                        ) : (
                                          ''
                                        )}
                                      </>
                                    }
                                  />
                                  <div
                                    className={styles.listDiseaseInfo}
                                    onClick={() => handleListClick(item)}
                                  >
                                    <span className={styles.itemInfoClass} title={item?.diseaseNo}>
                                      图片名称：{item?.fkImgName || '-'}
                                    </span>
                                    <span
                                      className={styles.itemInfoClass}
                                      title={item?.diseaseNameZh}
                                    >
                                      {item?.diseaseNameZh || '-'}
                                    </span>
                                    <span
                                      className={styles.itemInfoClass}
                                      title={item?.collectTime}
                                    >
                                      {item?.collectTime || '-'}
                                    </span>
                                    <span className={styles.itemInfoClass} title={item?.address}>
                                      位置：{item?.address || '-'}
                                    </span>
                                  </div>
                                </List.Item>
                              </>
                            );
                          }}
                        />
                      </div>
                      <div className={styles.bottomPage}>
                        <Pagination
                          size="small"
                          current={pageCurrent}
                          pageSize={pageSize}
                          defaultPageSize={1}
                          total={props.diseaseTotal}
                          showSizeChanger={false}
                          className={styles.diseasePageClass}
                          style={{ textAlign: 'right' }}
                          onChange={switchDiseaseInfo}
                        />
                      </div>
                    </>
                  ) : (
                    <EmptyStatus customEmptyClass={styles.diseaseEmpty} />
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
        <Card
          type="inner"
          className={`${styles.cardBcg} ${styles.rightBgPanel} ${styles.rightBottomClass} ${
            props.isFullScreen && props?.mapType !== '3d' ? `${styles.fullBg}` : null
          }`}
        >
          <div className={`${styles.cardTitle}  ${styles.cardRightTitle}`}>
            <div className={`${styles.rightFirstTitle} ${styles.rightBottomTitle}`}>
              <span className={styles.firstTitleImg}></span>
              <span className={styles.titleTxt}>图例标识</span>
              <div className={styles.highlight}></div>
            </div>
          </div>
          <div className={styles.legendPanelClass}>
            <Legend fullScreenFlag={props.isFullScreen} roadStatus={props.roadStatus} />
          </div>
        </Card>
      </div>
      {/* {isMileageVisible ? (
        <MileageLineModal
          name={modalTitle}
          modalShow={isMileageVisible}
          onCancel={() => setIsMileageVisible(false)}
        />
      ) : null} */}
      {/* {isFacilityVisible ? (
        <FacilityPieModal
          name={modalTitle}
          modalShow={isFacilityVisible}
          onCancel={() => setIsFacilityVisible(false)}
        />
      ) : null} */}
    </>
  );
});

export default MapRightPanel;
