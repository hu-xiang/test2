import { Card, Select, message, TreeSelect, ConfigProvider, List, Image, Pagination } from 'antd';
import React, { useState, useRef, useEffect, memo, useImperativeHandle } from 'react';
import styles from '../styles.less';
import uploadNullImg from '../../../assets/img/uploadIcon/uploadImg.png';
import DistressCanvas from '../../../components/DistressCanvas';
import { getDiseaseImgInfo } from '../service';
import toDownArrow from '../../../assets/img/InspectionBoard/toDownArrow.svg';
import MileageLineModal from './mileageStaticsModal';
import Legend from './Legend';
import FacilityPieModal from './facilityPieModal';
import EllipsisTooltip from '../../../components/EllipsisTooltip';
import EmptyStatus from '../../../components/TableEmpty';
import ProTable from '@ant-design/pro-table';
import { diseaseTypeList } from '@/utils/dataDic';
import { useCarListScrollObj } from '@/utils/tableScrollSet';

interface lsType {
  diseaseNameZh: string;
  area: string;
  length: string;
  collectTime: string;
  diseaseType: string;
}
type Iprop = {
  totalMile: number;
  mapType: string;
  switchPage: (page: any) => void;
  switchPageCar: (page: any) => void;
  carTableInfo: any;
  disDiseaseList: any;
  onRef: any;
  handleSwitchCar: (type: any) => void;
  handleSwitchDisease: (keys: any) => void;
  diseaseTotal: number;
  isFullScreen: boolean;
  handleCarSelect: (rowInfo: any) => void;
  handleDiseaseSelect: (rowInfo: any) => void;
  roadStatus: string;
};
const { Option } = Select;
const MapRightPanel: React.FC<Iprop> = memo((props) => {
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
  const [diseaseKeys, setDiseaseKeys] = useState<any>([]);
  const defaultExpandedKeys = [10000];
  const parentNodes = [1001, 1002, 1003];
  // const [taskType, setTaskType] = useState<any>(1);
  const [isFacilityVisible, setIsFacilityVisible] = useState(false);
  const [isMileageVisible, setIsMileageVisible] = useState(false);
  const carInfos = [
    { id: 1, key: '', value: '全部' },
    { id: 2, key: 0, value: '在线' },
    { id: 3, key: 1, value: '离线' },
  ];
  // const [totalMileageNum, setTotalMileageNum] = useState<any>(1986); // 总巡检里程
  // const [humanInput, setHumanInput] = useState<any>(35); // 累计减少人力投入
  // const [humanInputRadio, setHumanInputRadio] = useState<any>(95); // 累计变化率
  const [carType, setCarType] = useState<any>('');

  const modalTitle = '图表放大图';
  const resetPage = () => {
    setPageCurrent(1);
  };
  useImperativeHandle(props.onRef, () => ({
    // 暴露给父组件的方法
    resetPage,
  }));

  const getChildren = (val: any) => {
    const rec: any = [];
    const dg = (arr: any) => {
      if (!arr || !arr?.length) {
        return;
      }
      arr.forEach((i: any) => {
        if (i.value !== 10000 && !parentNodes.includes(i.value)) {
          rec.push(i?.value);
        } else {
          /* eslint-disable */
          if (i.children && i.children.length > 0) {
            dg(i.children);
          }
        }
      });
      return rec;
    };
    let recItem: any = [];
    diseaseTypeList.forEach((it: any) => {
      if (it.value === val) {
        recItem.push(it);
        return;
      }
      if (it?.children && it?.children.length > 0) {
        let frec = it?.children.find((m: any) => m.value === val);
        if (frec) {
          recItem.push(frec);
        }
      }
    });
    if (recItem && recItem?.length > 0) {
      dg(recItem);
    }
    return rec;
  };
  const getChildrenNodes = (value: any) => {
    let arr: any = [];
    if (value?.length > 0) {
      value.forEach((it: any) => {
        if (it === 10000 || parentNodes.includes(it)) {
          const recValue = getChildren(it);
          arr = [...arr, ...recValue];
        } else {
          arr.push(it);
        }
      });
      return arr;
    }
    return [];
  };
  const handleCarType = (text: any, option: any) => {
    setCarType(option?.key || '');
    props.handleSwitchCar(option?.key || '');
  };
  const handleDiseaseType = (text: any, option: any) => {
    const keys = getChildrenNodes(text);
    setDiseaseKeys(keys);
    setPageCurrent(1);
    props.handleSwitchDisease(keys);
  };
  useEffect(() => {
    if (props.isFullScreen && !diseaseKeys?.length) {
      const allKeys = getChildrenNodes([10000]);
      setDiseaseKeys(allKeys);
    }
  }, [props.isFullScreen]);
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
      const totalMileInfo: any = props.totalMile;
      if (totalMileInfo > 0) {
        // const item = totalMileInfo / 50 - totalMileInfo / 500;
        // setHumanInput(item && item < 1 ? 0 : Math.floor(item));
        // const radio =
        // Math.abs((totalMileInfo / 500 - totalMileInfo / 50) / (totalMileInfo / 50)) * 100;
        // setHumanInputRadio(radio.toFixed(0));
      }
      // const dd = props.totalMile ? Number(props.totalMile).toFixed(2) : 0;
      // setTotalMileageNum(1986);
    } catch (error) {
      message.error({
        content: '获取累计巡检总里程数失败',
        key: '获取累计巡检总里程数失败',
      });
    }
  };
  useEffect(() => {
    if (props.totalMile) {
      getTotalMileageDatas();
    }
  }, [props.totalMile]);

  // const selectValue = (text: any) => {
  //   setTaskType(text);
  // };

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
      title: '序号',
      dataIndex: 'index',
      valueType: 'index',
      ellipsis: true,
      render: (deviceName: any, record: any) => {
        /* eslint-disable */
        const colorTxt = record?.deviceStatus === '0' ? 'lightColor' : 'darkColor';
        return <span className={colorTxt}>{deviceName}</span>;
      },
    },
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
    {
      title: '状态',
      dataIndex: 'deviceStatus',
      key: 'deviceStatus',
      width: 80,
      // ellipsis: true,
      render: (deviceStatus: any) => {
        /* eslint-disable */
        const statusStr = deviceStatus === '0' ? '在线' : deviceStatus === '1' ? '离线' : '-';
        const colorTxt = deviceStatus === '0' ? 'lightColor' : 'darkColor';
        return <span className={colorTxt}>{statusStr}</span>;
      },
    },
  ];
  const previewBigImg = (url: string) => {
    setPreviewImgUrl(url);
  };
  const getImgInfo = async (infos: any) => {
    if (!infos) return;
    const detRes = await getDiseaseImgInfo(infos.id);
    // setImgData({ ls: imgData?.ls, url: imgData?.url, num: 1 });
  };
  useEffect(() => {
    if (!imgData.ls.length && imageInfo?.id) {
      // getImgInfo(imageInfo);
    } else {
      setImgData({ ls: imgData?.ls, url: imgData?.url, num: 1 });
    }
  }, [flagList, previewImgUrl]);

  let resetyStyle: any = {
    border: 'none',
    background: 'transparent',
    'backdrop-filter': 'blur(0)',
    marginTop: 0,
  };
  return (
    <>
      <div className={`${styles.rightPanelClass}`}>
        <div
          className={`${!props.isFullScreen ? styles.rightBgPanel : styles.rightTransPanel} ${
            styles.panelClass
          } ${styles.rightPanel} ${styles.rightPanelWrapper}`}
        >
          {/* 不区分是否全屏 */}
          <div className={styles.rightPanelInner}>
            <div className={styles.rightFirstCard}>
              <div className={`${styles.rightFirstTitle} ${styles.totalOverviewTitle}`}>
                <span className={styles.firstTitleImg}></span>
                <span className={styles.titleTxt}>累计总览</span>
                <div className={styles.highlight}></div>
              </div>
              <div className={styles.staticsClass}>
                <div className={styles.staticsCardClass}>
                  <EllipsisTooltip
                    title={'累计巡检总里程(公里)'}
                    customEclipseClass="staticsRightLiCheng"
                  >
                    <span className={`${styles.staticsNameClass} ${styles.inspectMilesageTag}`}>
                      累计巡检总里程(公里)
                    </span>
                  </EllipsisTooltip>
                  <span className={`${styles.staticsNumClass} ${styles.inspectMilesageCount}`}>
                    {1986}
                  </span>
                </div>
                <div className={styles.staticsCardClass}>
                  <EllipsisTooltip
                    title={'累计减少人力投入(人天)'}
                    customEclipseClass="staticsRightLiCheng"
                  >
                    <span className={`${styles.staticsNameClass} ${styles.inspectMilesageTag}`}>
                      累计减少人力投入(人天)
                    </span>
                  </EllipsisTooltip>
                  <div className={styles.staticsBottomClass}>
                    <span className={`${styles.staticsNumClass} ${styles.inspectMilesageCount}`}>
                      {35}
                    </span>
                    <div className={styles.radioClass}>
                      {95}%
                      <img className={styles.numPercentImgClass} src={toDownArrow} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Card
              type="inner"
              className={`${styles.customDiseaseInfoWrapper} ${styles.cardBcg} ${
                styles.cardDiseaseInfo
              } ${props.isFullScreen && props?.mapType !== '3d' ? `${styles.fullBg}` : null}`}
            >
              <div className={`${styles.cardTitle} ${styles.cardHeight}`}>
                <div className={styles.firstChartRow}>
                  <EllipsisTooltip title={'病害信息'} customEclipseClass="tableTitleRow">
                    <span className={styles.leftImg} />
                    <span
                      className={`${styles.cardTxtName} ${styles.colorLight} ${styles.comSubTitle}`}
                    >
                      病害信息
                    </span>
                  </EllipsisTooltip>
                </div>
                <div className={styles.cardTitleRight}>
                  <TreeSelect
                    treeData={diseaseTypeList}
                    value={diseaseKeys}
                    className="searchFacilityClass treeSelectClass selectMg10"
                    popupClassName="dropdownSelectClass"
                    maxTagCount={'responsive'}
                    onChange={handleDiseaseType}
                    allowClear={true}
                    treeCheckable="true"
                    treeDefaultExpandedKeys={defaultExpandedKeys}
                    showCheckedStrategy="SHOW_PARENT"
                    placeholder="请选择病害类型"
                    style={{
                      marginRight: 0,
                    }}
                  />
                </div>
                <div className={styles.highlight}></div>
              </div>
              <div className={styles.diseaseInfoClass}>
                {props?.disDiseaseList?.length > 0 ? (
                  <>
                    <div className={styles.diseaseInfoList}>
                      <List
                        className={styles.customDiseaseListWrapper}
                        itemLayout="horizontal"
                        dataSource={props?.disDiseaseList || []}
                        renderItem={(item: any, index: any) => {
                          const listArr = Array.from({ length: pageSize }, () => false);
                          return (
                            <>
                              <List.Item className={styles.customDiseaseItem} style={resetyStyle}>
                                <div className={styles.customDiseaseItemInner}>
                                  <List.Item.Meta
                                    avatar={
                                      <>
                                        <Image
                                          width={111}
                                          height={100}
                                          src={item?.imgUrl || 'error'}
                                          preview={{
                                            visible: flagList[index],
                                            src: previewImgUrl,
                                            onVisibleChange: (value) => {
                                              handleListClick(item);
                                              if (false) {
                                                listArr[index] = value;
                                                setFlagList([...listArr]);
                                                setImageInfo({ ...item });
                                                if (!value) {
                                                  setImgData({ ls });
                                                  setPreviewImgUrl('');
                                                  setImageInfo({});
                                                }
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
                                </div>
                              </List.Item>
                            </>
                          );
                        }}
                      />
                    </div>
                    <div className={`${styles.bottomPage} ${styles.customDiseaseTabPagination}`}>
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
                    <span
                      className={`${styles.cardTxtName} ${styles.colorLight} ${styles.comSubTitle}`}
                    >
                      车辆信息
                    </span>
                  </EllipsisTooltip>
                </div>
                <div className={styles.cardTitleRight}>
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
                </div>
                <div className={styles.highlight}></div>
              </div>
              <div className={styles.cardDiseaseCommon}>
                <div className={`${styles.cardDiseaseCarList} ${styles.carTabInfo}`}>
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
                        styles.customCarInfoTab
                      } ${props.carTableInfo?.rows?.length === 0 ? 'emptyTableData' : null}`}
                      scroll={{ y: scrollObj?.y }}
                      dataSource={props.carTableInfo?.rows}
                      tableAlertRender={false}
                      pagination={false}
                      columns={customViewInfoColumns}
                    />
                  </ConfigProvider>
                </div>
                {props.carTableInfo?.rows?.length > 0 ? (
                  <div className={`${styles.bottomPage} ${styles.customDiseaseTabPagination}`}>
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
          </div>

          <Card
            type="inner"
            className={`${styles.cardBcg} ${styles.rightBgPanel} ${styles.rightBottomClass} ${
              props.isFullScreen && props?.mapType !== '3d' ? `${styles.fullBg}` : null
            } ${styles.customLegendWrapper}`}
          >
            <div className={`${styles.cardTitle}  ${styles.cardRightTitle} ${styles.lineBottom}`}>
              <div
                className={`${styles.rightFirstTitle} ${styles.rightBottomTitle} ${styles.reset}`}
              >
                <span className={styles.firstTitleImg}></span>
                <span className={`${styles.titleTxt} ${styles.comSubTitle}`}>图例标识</span>
                {/* <div className={styles.highlight}></div> */}
              </div>
            </div>
            <div className={styles.legendPanelClass}>
              <Legend fullScreenFlag={props.isFullScreen} roadStatus={props.roadStatus} />
            </div>
          </Card>
        </div>
      </div>
      {isMileageVisible ? (
        <MileageLineModal
          name={modalTitle}
          modalShow={isMileageVisible}
          onCancel={() => setIsMileageVisible(false)}
        />
      ) : null}
      {isFacilityVisible ? (
        <FacilityPieModal
          name={modalTitle}
          modalShow={isFacilityVisible}
          onCancel={() => setIsFacilityVisible(false)}
        />
      ) : null}
    </>
  );
});

export default MapRightPanel;
