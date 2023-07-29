import React, { useState, useEffect, useRef } from 'react';
import { Input, Image, message, Button, Spin, Modal } from 'antd';
// import ProTable from '@ant-design/pro-table';
import {
  getdetail,
  getListInfo,
  putCheck,
  getDiseaseInfo,
  getDisListInfo,
  getPhyDisListInfo,
  getPhDetail,
  getPhListInfo,
} from './service';
import styles from './styles.less';
import { ReactComponent as ListBack } from '../../../../assets/img/backDisease/back.svg';
import { ReactComponent as Back } from '../../../../assets/img/backDisease/backList.svg';
import { ReactComponent as LeftImg } from '../../../../assets/img/leftAndRight/leftImg.svg';
import { ReactComponent as RightImg } from '../../../../assets/img/leftAndRight/rightImg.svg';
import DisMapDataNull from '../../../../assets/icon/disMapDataNull.svg';
import { useHistory } from 'umi';
import ProTable from '@ant-design/pro-table';
import DistressCanvas from '../../../../components/DistressCanvas';
import { Empty } from 'antd';
import { useLocalStorageState } from 'ahooks';

import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useDiseaseCardScrollObj } from '../../../../utils/tableScrollSet';

import { useLocation } from 'umi';

const arr = [
  { value: 1, text: '轻度' },
  { value: 2, text: '中度' },
  { value: 3, text: '重度' },
];

export type Member = {
  startTime: string;
  endTime: string;
  checkCode: string;
  disease: string;
};
interface lsType {
  diseaseNameZh: string;
  area: string;
  length: string;
  collectTime: string;
  diseaseType: string;
}

const ls: lsType[] = [];
const { confirm } = Modal;

export default (): React.ReactElement => {
  const [detInfo, setDetInfo] = useState<any>({});
  const [data, setData] = useState<any>({ ls });
  const [data2, setData2] = useState<any>({ ls });
  const [imgUrl, setImgUrl] = useState('');
  const [imgUrl2, setImgUrl2] = useState('');
  const [imgArea, setImgArea] = useState<any>();
  const [imgLength, setImgLength] = useState<any>();
  const [address, setAddress] = useState('');
  // const [diseaList, setDiseaList] = useState<any>([]);
  // const [newNum, setNewNum] = useState(0);
  const [nextDisabled, setNextDisabled] = useState(false); // true： 置灰不可点  false: 表示可点
  const [preDisabled, setPreDisabled] = useState(false); // true： 置灰不可点  false: 表示可点
  const [flag, setFlag] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(20);
  const [info, setInfo] = useState<any>({});
  const [bigImgVisible, setBigImgVisible] = useState(false);
  const str: any = sessionStorage?.getItem('diseaseObj');
  const disease_disease: any = sessionStorage?.getItem('disease_disease');
  const disease_fkFacilitiesIdList: any = sessionStorage?.getItem('disease_fkFacilitiesIdList');
  const disease_severity: any = sessionStorage?.getItem('disease_severity');
  const severity = disease_severity === 'undefined' ? undefined : disease_severity;

  const [searchPage, setSearchPage] = useState(1);
  const history = useHistory();
  const { AMap }: any = window;
  const actionRef = useRef<any>();
  const [imgFlag, setImgFlag] = useState(false);

  const [, setTimerDateCopy] = useLocalStorageState<any>('timerDateCopy', {
    timerDateCopy: [undefined, undefined],
  });

  const [curPageDiseaList, setCurPageDiseaList] = useState<any>([]);
  const [
    _listId,
    _page,
    _pageSize,
    _startTime,
    _endTime,
    _checkCode,
    // _fkFacilitiesId,
    _diseaseImp,
    _keyword,
    _CustomFlag,
    _total,
    _openStatus,
    _fkDiseaseId,
  ] = str.split(',');
  const [listId, setListId] = useState<any>(_listId);
  const [listPage, setListPage] = useState(+_page); // 列表页跳转详情时的页码
  const listPageSize = +_pageSize;
  const startTime = _startTime || '';
  const endTime = _endTime || '';
  const checkCode = _checkCode;
  const disease = disease_disease ? disease_disease.split(',') : [];
  // const fkFacilitiesId = _fkFacilitiesId || '';
  const fkFacilitiesIdList = disease_fkFacilitiesIdList.split(',') || [];
  const diseaseImp = _diseaseImp;
  const keyword = _keyword || '';
  const CustomFlag = _CustomFlag === 'Custom';
  const listTotal = +_total || 0;
  const openStatus = +_openStatus || '';
  const [curDiseaIndex, setCurDiseaIndex] = useState<number>(-1); // 当前病害项在列表中的序号
  const [disTrackListTotal, setDisTrackListTotal] = useState<number>(0);
  const [listFkDiseaseId, setListFkDiseaseId] = useState<any>(_fkDiseaseId);
  const [curPreviewRowId, setCurPreviewRowId] = useState<string>('');
  // const [dataLength, setDataLength] = useState(20);
  const [dataTotal, setDataTotal] = useState<any>(listTotal);

  const [tableData, setTableData] = useState([]);
  const scrollObj = useDiseaseCardScrollObj(tableData, { x: 900, y: 'calc(100vh - 544px)' });

  const location = useLocation();
  const isPhyDetailPage = location.pathname.indexOf('physicalDiseaseDetail') > 0; // 是否是物理病害详情页

  useEffect(() => {
    if (!detInfo?.id) return;
    if (!detInfo?.longitude || !detInfo?.latitude) return;
    const map = new AMap.Map('container', {
      zoom: 10,
      center: [detInfo?.longitude, detInfo?.latitude],
      mapStyle: 'amap://styles/macaron',
    });
    // 打点图标公共配置
    const marker = new AMap.Marker({
      icon: '//a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-red.png',
      position: [detInfo?.longitude, detInfo?.latitude],
      offset: new AMap.Pixel(-13, -30),
    });

    AMap.plugin('AMap.Geocoder', () => {
      const geocoder = new AMap.Geocoder();
      geocoder.getAddress(
        [detInfo?.longitude, detInfo?.latitude],
        (status: string, result: any) => {
          if (status === 'complete' && result.info === 'OK') {
            // result为对应的地理位置详细信息
            setAddress(result.regeocode.formattedAddress);
          } else {
            setAddress('');
          }
        },
      );
    });

    marker.setMap(map);
    // marker.setTitle(address);
    if (address) {
      marker.setLabel({
        direction: 'right',
        offset: new AMap.Pixel(10, 0), // 设置文本标注偏移量
        content: `<div class='info'>${address}</div>`, // 设置文本标注内容
      });
    }
  }, [detInfo, address]);

  useEffect(() => {
    if (!detInfo?.id) return;
    const map = new AMap.Map('containers', {
      zoom: 10,
      center: [detInfo?.longitude, detInfo?.latitude],
      mapStyle: 'amap://styles/macaron',
    });
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
      position: [detInfo?.longitude, detInfo?.latitude],
      offset: new AMap.Pixel(-13, -30),
    });

    marker.setMap(map);
    if (address) {
      marker.setLabel({
        direction: 'right',
        offset: new AMap.Pixel(10, 0), // 设置文本标注偏移量
        content: `<div class='info'>${address}</div>`, // 设置文本标注内容
      });
    }
  }, [isModalVisible]);

  const previewBigImg2 = (url: string) => {
    setImgUrl2(url);
  };
  const imgInfo = async (infos: any) => {
    if (!infos?.recode) return;

    const detRes = await getDiseaseInfo(infos.recode.id);
    if (detRes.status === 0) {
      setData2(detRes.data);
    } else {
      message.error({
        content: detRes.message,
        key: detRes.message,
      });
    }
  };
  useEffect(() => {
    // 第一次加载，获取img的信息
    if (!data2.ls.length && info?.recode?.id) {
      imgInfo(info);
    } else {
      setData2({ ls: data2.ls, url: data2.url, num: 1 });
    }
  }, [imgFlag, imgUrl2]);

  const handerImgClick = (e: any) => {
    e.stopPropagation();
  };

  const columns: any = [
    {
      title: '序号',
      key: 'nums',
      render: (text: any, record: any, index: any) =>
        `${(tabpage - 1) * tabpagesize + (index + 1)}`,
      width: 80,
    },
    {
      title: '缩略图',
      dataIndex: 'imgUrl',
      key: 'imgUrl',
      width: 100,
      render: (text: any, recode: any) => {
        return (
          <>
            <Image
              src={text}
              style={{ width: 58, height: 46 }}
              placeholder={true}
              onClick={(e: any) => handerImgClick(e)}
              preview={{
                visible: imgFlag && curPreviewRowId === recode.id,
                src: imgUrl2,
                onVisibleChange: (value) => {
                  setImgFlag(value);
                  setInfo({ recode });
                  setCurPreviewRowId(recode.id);
                  if (!value) {
                    setCurPreviewRowId('');
                    setData2({ ls });
                    setImgUrl2('');
                    setInfo({});
                  }
                },
              }}
            />
          </>
        );
      },
    },
    {
      title: '病害图片编号',
      dataIndex: 'diseaseNo',
      key: 'diseaseNo',
      width: 160,
    },
    {
      title: '病害类型',
      dataIndex: 'diseType',
      width: 160,
      render: (text: any, recode: any) => {
        return `${recode.diseaseNameZh || '-'}`;
      },
    },
    {
      title: '病害位置',
      dataIndex: 'location',
      width: 180,
      render: (text: any, recode: any) => {
        return `${recode.longitude}, ${recode.latitude}`;
      },
    },
    {
      title: '采集时间',
      dataIndex: 'collectTime',
      key: 'collectTime',
      width: 180,
    },
  ];
  const check = async () => {
    confirm({
      title: '是否完成复核？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const formData = new FormData();
        formData.append('id', listId);
        try {
          const res = await putCheck(formData);
          if (res.status === 0) {
            message.success({
              content: '复核成功',
              key: '复核成功',
            });
            const response = await getdetail(listId);
            setDetInfo(response.data);
          } else {
            message.error({
              content: res.message,
              key: res.message,
            });
          }
          return true;
        } catch (error) {
          message.error({
            content: '复核失败!',
            key: '复核失败!',
          });
          return false;
        }
      },
      onCancel() {},
    });
  };

  const reqErr = () => {
    message.error({
      content: '查询失败!',
      key: '查询失败!',
    });
  };

  const previewBigImg = (url: string) => {
    setImgUrl(url);
  };

  // 切换 上下个病害的状态
  useEffect(() => {
    setPreDisabled(false);
    setNextDisabled(false);
    if (curDiseaIndex === 0 && listPage === 1) {
      setPreDisabled(true);
    }
    if (listPage === Math.ceil(dataTotal / listPageSize)) {
      if (curDiseaIndex === curPageDiseaList.length - 1) {
        setNextDisabled(true);
      }
    }
  }, [curDiseaIndex]);

  const goListPage = () => {
    history.push({
      pathname: isPhyDetailPage
        ? '/diseasemanage/physicalDiseaseList'
        : '/diseasemanage/diseaselist',
      state: {
        listId,
        listPage,
        curDiseaIndex,
      },
    });
  };
  // 获取图片详情单个病害详情
  const handlerGetDiseaseInfo = async (sourceRes: any) => {
    if (isPhyDetailPage) {
      const area = sourceRes?.data?.area;
      const length = sourceRes?.data?.length;
      setImgArea(area ? (+area).toFixed(3) : 0);
      setImgLength(length ? (+length).toFixed(3) : 0);
      setData({
        ls: [
          {
            bbox: sourceRes?.data?.bbox || [],
            diseaseType: sourceRes?.data?.diseaseType,
            diseaseNameZh: sourceRes?.data?.diseaseNameZh || '-',
            area: sourceRes?.data?.area,
            length: sourceRes?.data?.length,
          },
        ],
        url: sourceRes?.data?.imgUrl || '',
        id: sourceRes?.data?.id,
      });
    } else {
      const id = sourceRes?.data?.id;
      const res = await getDiseaseInfo(id);
      if (res?.status === 0) {
        // fix 同一张图片有多个不同病害的情况 增加id
        setData({
          ls: [
            {
              bbox: res?.data?.ls[0]?.bbox || [],
              diseaseType: res?.data?.ls[0]?.diseaseType,
              diseaseNameZh: res?.data?.ls[0]?.diseaseNameZh || '-',
              area: res?.data?.ls[0]?.area,
              length: res?.data?.ls[0]?.length,
            },
          ],
          url: res?.data?.url || '',
          id: res?.data?.ls[0]?.id,
        });
        if (res?.data.ls.length) {
          res?.data.ls.forEach((item: any) => {
            if (item.diseaseType === sourceRes?.data?.diseaseType) {
              setImgArea(item?.area ? (+item?.area).toFixed(3) : 0);
              setImgLength(item?.length ? (+item?.length * 1).toFixed(3) : 0);
            }
          });
        }
      } else {
        // goListPage();
      }
    }
  };
  // 获取单个详情
  const handlerGetDetail = async (id: string | number) => {
    setFlag(true);
    let res: any = null;
    if (isPhyDetailPage) {
      res = await getPhDetail(id);
    } else {
      res = await getdetail(id);
    }
    if (res?.status === 0) {
      setFlag(false);
      setDetInfo(res?.data);
      handlerGetDiseaseInfo(res);
    } else {
      setFlag(false);
      // goListPage();
    }
  };
  const handlerRes = (res: any, todo: string | undefined) => {
    if (res?.success) {
      if (listTotal !== +res?.total) {
        setDataTotal(+res?.total);
      }
      setCurPageDiseaList([...res.data]);
      if (!todo) {
        const index = res?.data.findIndex((item: any) => item?.id === listId);
        setCurDiseaIndex(index);
        handlerGetDetail(listId);
      }
      if (todo === 'toPrePage') {
        setListId(res?.data[res?.data.length - 1].id);
        setCurDiseaIndex(res?.data.length - 1);
        handlerGetDetail(res?.data[res?.data.length - 1].id);
        setListFkDiseaseId(res?.data[res?.data.length - 1].fkDiseaseId);
      }
      if (todo === 'toNextPage') {
        setListId(res?.data[0].id);
        setCurDiseaIndex(0);
        handlerGetDetail(res?.data[0].id);
        setListFkDiseaseId(res?.data[0].fkDiseaseId);
      }
    } else {
      // 返回列表
      goListPage();
    }
  };

  // 获取病害列表/物理病害列表
  const getCurPageDiseaListInfo = async (page: number, pageSize: number) => {
    let res: any = null;
    if (isPhyDetailPage) {
      res = await getPhyDisListInfo({
        page,
        pageSize,
        startTime,
        endTime,
        checkCode,
        disease,
        fkFacilitiesIdList,
        diseaseImp,
        keyword,
        openStatus,
        severity,
      });
    } else {
      res = await getDisListInfo({
        page,
        pageSize,
        startTime,
        endTime,
        checkCode,
        disease,
        fkFacilitiesIdList,
        diseaseImp,
        keyword,
        severity,
      });
    }
    return res;
  };
  // 切换上下 病害列表  物理病害列表
  const getDetailInfo = async (todo: string | undefined) => {
    // 默认高亮
    setNextDisabled(false);
    setPreDisabled(false);
    setFlag(true);
    let res: any = null;
    if (!todo && curPageDiseaList.length < 1) {
      res = await getCurPageDiseaListInfo(listPage, listPageSize);
      if (res) {
        handlerRes(res, todo);
      }
    }

    // 切换上一页
    if (todo === 'toPrePage') {
      const prePage = listPage - 1;
      setListPage(prePage);
      res = await getCurPageDiseaListInfo(prePage, listPageSize);
      if (res) {
        handlerRes(res, todo);
      }
    }
    // 切换下一页
    if (todo === 'toNextPage') {
      const nextPage = listPage + 1;
      setListPage(nextPage);
      res = await getCurPageDiseaListInfo(nextPage, listPageSize);
      if (res) {
        handlerRes(res, todo);
      }
    }
  };

  useEffect(() => {
    const fn = async () => {
      // 获取行详细信息
      let res: any = null;
      if (isPhyDetailPage) {
        res = await getPhDetail(listId);
      } else {
        res = await getdetail(listId);
        setFlag(false);
      }
      if (res.status !== 0) {
        goListPage();
      }

      setDetInfo(res.data);
      // 获取图片详细信息
      const detRes = await getDiseaseInfo(res.data.id);
      if (detRes.status !== 0) {
        return;
      }
      setData(detRes.data);
      detRes.data.ls.map((i: any) => {
        if (i.diseaseType !== res.data.diseaseType) return false;
        setImgArea(i?.area ? (i?.area * 1).toFixed(3) : 0);
        setImgLength(i?.length ? (i?.length * 1).toFixed(3) : 0);
        return true;
      });
    };
    // CustomFlag区分是列表，还是全景调进来的
    if (CustomFlag) {
      fn();
    } else {
      // sendDetail();
      getDetailInfo('');
    }
  }, []);

  const preDisea = async () => {
    if (flag) return;
    if (curDiseaIndex === 0 && listPage > 1) {
      getDetailInfo('toPrePage');
    } else {
      setCurDiseaIndex(curDiseaIndex - 1);
      const preId = curPageDiseaList[curDiseaIndex - 1].id;
      setListId(preId);
      handlerGetDetail(preId);
      const preFkDiseaseId = curPageDiseaList[curDiseaIndex - 1].fkDiseaseId;
      setListFkDiseaseId(preFkDiseaseId);
    }
  };

  const nextDisea = () => {
    if (flag) return;
    if (
      curDiseaIndex === curPageDiseaList.length - 1 &&
      listPage < Math.ceil(dataTotal / listPageSize)
    ) {
      getDetailInfo('toNextPage');
    } else {
      setCurDiseaIndex(curDiseaIndex + 1);
      const nextId = curPageDiseaList[curDiseaIndex + 1].id;
      setListId(nextId);
      handlerGetDetail(nextId);
      const nextFkDiseaseId = curPageDiseaList[curDiseaIndex + 1].fkDiseaseId;
      setListFkDiseaseId(nextFkDiseaseId);
    }
  };
  const onLoad = (dataSource: any) => {
    if (tableData.length !== dataSource.length) {
      setTableData(dataSource);
    }
  };
  const changetabval = (text: any) => {
    if (text?.current !== searchPage) {
      setSearchPage(text?.current as number);
      setTabpage(text?.current as number);
    }
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
    // setSelectedRowKey([]);
  };

  // const getRouteMode = () => {
  //   let name = '';
  //   if (Object.keys(detInfo)?.length > 0) {
  //     name = detInfo?.routeMode === 0 ? '上行' : detInfo?.routeMode === 1 ? '下行' : '';
  //   }
  //   return `${detInfo.imgNo ? detInfo.imgNo : '-'} ${detInfo.imgNo ? name : ''}`;
  // };

  return (
    <div className={styles.DiseaseCard}>
      <Spin spinning={flag}>
        <div className={styles.iconBox}>
          <div
            className={styles.leftIconBox}
            onClick={() => {
              setTimerDateCopy([startTime, endTime]);
              // history.replace('/diseasemanage/diseaselist', {listId, listPage});
              // history.go(-1);
              goListPage();
            }}
          >
            <ListBack />
            <div className={`${styles.topBoxText} ${styles.topBoxText1}`}>
              {isPhyDetailPage ? '物理' : ''}病害列表
            </div>{' '}
          </div>
          {!CustomFlag && (
            <div className={`${styles.rightIconBox}`}>
              <div
                className={`${styles.topBoxText} ${styles.topBoxText2} ${
                  preDisabled ? styles.disabled : ''
                }`}
                onClick={preDisabled ? undefined : preDisea}
              >
                上一个病害
              </div>
              <div
                style={{ display: 'flex' }}
                onClick={nextDisabled ? undefined : nextDisea}
                className={` ${styles.topBoxText3}`}
              >
                <div className={`${styles.topBoxText} ${nextDisabled ? styles.disabled : ''}`}>
                  下一个病害
                </div>
                <Back className={`${nextDisabled ? styles.disabled : ''}`} />
              </div>
            </div>
          )}
        </div>
        <div className={styles.container}>
          <div className={styles.Toptitle}>病害详情-{detInfo?.diseaseNo}</div>
          <div className={`${styles.scrollBox} scrollBox`}>
            <div className={styles.infoBox}>
              <div className={styles.toptitle}>基本信息</div>
              <div className={`${styles['row-class']} ${styles.customRowCls}`}>
                <div className={styles.inpBox}>
                  物理病害编号
                  <Input disabled value={detInfo?.realDiseaseNo} />
                </div>
                <div className={styles.inpBox}>
                  图片名称
                  <Input disabled value={detInfo?.fkImgName} />
                </div>
                <div className={styles.inpBox}>
                  病害类型
                  <Input disabled value={detInfo?.diseaseNameZh} />
                </div>
                <div className={`${styles.inpBox} ${styles.inpLongBox}`}>
                  紧急程度
                  <Input disabled value={detInfo?.diseaseImp === 1 ? '紧急' : '非紧急'} />
                </div>
              </div>
              <div className={styles['row-class']}>
                <div className={styles.inpBox}>
                  严重程度
                  <Input
                    disabled
                    value={arr?.filter((item) => item?.value === detInfo?.severity)[0]?.text || '-'}
                  />
                </div>
                {!isPhyDetailPage && (
                  <div className={styles.inpBox}>
                    病害状态
                    <Input
                      disabled
                      value={
                        (detInfo?.checkCode === 0 && '未复核') ||
                        (detInfo?.checkCode === 1 && '已复核') ||
                        ''
                      }
                    />
                  </div>
                )}
                <div className={styles.inpBox}>
                  道路名称
                  <Input disabled value={detInfo?.facilities} />
                </div>
                <div className={styles.inpBox}>
                  采集时间
                  <Input disabled value={detInfo?.collectTime} />
                </div>
                {Platform_Flag === 'kunming' && detInfo?.diseaseType !== 14 ? (
                  <div className={`${styles.inpBox} ${styles.inpLongBox}`}>
                    预估养护费用
                    <Input disabled value={detInfo?.maintainCost || 10000} />
                  </div>
                ) : null}
              </div>
            </div>
            <div className={styles.imgAndMapBox}>
              <div className={styles.leftImg}>
                <div className={styles.toptitle}>病害标注情况</div>
                <div className={styles.imgBox}>
                  <div className={styles.txtBox}>
                    {detInfo?.diseaseType === 14 ? (
                      `跳车高度：${
                        detInfo?.displacement ? Number(detInfo?.displacement).toFixed(3) : 0
                      }cm`
                    ) : (
                      <>
                        <div className={styles.txt}>
                          面积 :{' '}
                          {detInfo?.diseaseType === 9 || detInfo?.diseaseType === 12
                            ? '-'
                            : `${imgArea || ''} m²`}
                        </div>
                        <div className={styles.txt}>
                          长度 :{' '}
                          {detInfo?.diseaseType === 9 || detInfo?.diseaseType === 12
                            ? '-'
                            : `${imgLength || ''} m`}
                        </div>
                      </>
                    )}
                  </div>
                  <div className={styles.imgBigs}>
                    <Image
                      src={imgUrl}
                      preview={{
                        visible: bigImgVisible,
                        onVisibleChange: (value) => {
                          setBigImgVisible(value);
                        },
                      }}
                      width={'100%'}
                      height={'100%'}
                      placeholder={true}
                    />
                    {data ? <DistressCanvas setImgUrl={previewBigImg} data={data} /> : ''}
                  </div>
                </div>
              </div>
              <div className={styles.rightMap}>
                <div className={styles.toptitle}>图片定位</div>
                {detInfo?.longitude && detInfo?.latitude ? (
                  <div className={styles.mapBox}>
                    <div className={styles.txtBox}>
                      病害位置 : {detInfo?.longitude || ''}
                      {detInfo?.longitude ? ',' : ''}
                      {detInfo?.latitude || ''}
                      {detInfo?.stakeNo && `(桩号${detInfo?.stakeNo})`}
                      {/* {detInfo?.imgNo && `(桩号${getRouteMode()})`} */}
                    </div>

                    <div
                      className={styles.mapBigs}
                      id={'container'}
                      onDoubleClick={() => setIsModalVisible(true)}
                    />
                  </div>
                ) : (
                  <div className={`${styles.mapBigs2} mapBigs2`}>
                    <Empty image={DisMapDataNull} />
                  </div>
                )}
              </div>
            </div>
            <div className={styles.tabBox}>
              <div className={styles.txtBox}>病害跟踪</div>
              <div
                className={`${styles.tableBox} ${disTrackListTotal < 1 ? styles.noDataTable : ''}`}
              >
                <ProTable<Member>
                  columns={columns}
                  actionRef={actionRef}
                  params={{
                    id: listId,
                    fkImgId: detInfo?.fkImgId,
                    fkDiseaseId: listFkDiseaseId,
                  }}
                  request={async (params: any) => {
                    let newParams = {};
                    let res = null;
                    const { id, fkImgId, fkDiseaseId, current, pageSize } = params;
                    if (isPhyDetailPage) {
                      newParams = {
                        current,
                        pageSize,
                        fkDiseaseId,
                      };
                      res = await getPhListInfo(newParams);
                    } else {
                      newParams = {
                        current,
                        pageSize,
                        id,
                        fkImgId,
                      };
                      res = await getListInfo(newParams);
                    }
                    setDisTrackListTotal(res?.total);
                    return res;
                  }}
                  rowKey="id"
                  tableAlertRender={false}
                  pagination={{
                    showQuickJumper: false,
                    defaultPageSize: 20,
                    current: searchPage,
                  }}
                  onLoad={onLoad}
                  toolBarRender={false}
                  search={false}
                  scroll={scrollObj || { x: '100%' }}
                  onChange={changetabval}
                  onRequestError={reqErr}
                />
              </div>
            </div>
            <div className={styles.checkBtnWrap}>
              {!isPhyDetailPage && (
                <Button
                  type="primary"
                  className={styles.checkBtn}
                  onClick={() => {
                    if (detInfo?.checkCode === 1) {
                      message.warning({
                        content: '该病害已复核！',
                        key: '该病害已复核！',
                      });
                    } else {
                      check();
                    }
                  }}
                >
                  复核
                </Button>
              )}
            </div>
          </div>
        </div>

        <Modal
          className={styles.mapMod}
          title=""
          footer={false}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
        >
          <div className={styles.mapBig2} id={'containers'} />
        </Modal>
        {imgFlag ? (
          <>
            <DistressCanvas setImgUrl={previewBigImg2} data={data2} />{' '}
          </>
        ) : (
          ''
        )}
      </Spin>
      {/* 参数说明  */}
      <LeftImg
        className={`${styles.distopBoxText} ${styles.distopBoxText2} ${
          preDisabled ? styles.disables : ''
        }`}
        onClick={preDisabled ? undefined : preDisea}
        style={!CustomFlag && bigImgVisible ? {} : { display: 'none' }}
      />
      <RightImg
        onClick={nextDisabled ? undefined : nextDisea}
        className={` ${styles.distopBoxText3} ${nextDisabled ? styles.disables : ''}`}
        style={!CustomFlag && bigImgVisible ? { display: 'flex' } : { display: 'none' }}
      />
    </div>
  );
};
