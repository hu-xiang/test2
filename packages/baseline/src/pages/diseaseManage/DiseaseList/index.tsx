import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.less';
import { Button, Select, DatePicker, message, Image, Modal, Space, Input, TreeSelect } from 'antd';
import moment from 'moment';
import ProTable from '@ant-design/pro-table';
import { getListInfo, dellistinfo, getDiseaseInfo } from './service';
import { getFacilitityList } from '../../../services/commonApi';
import ImportModal from './component/importModal';
import DistressCanvas from '../../../components/DistressCanvas';
import { useAccess, useHistory, useLocation } from 'umi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useDiseaseScrollObj } from '../../../utils/tableScrollSet';
import { changeTableScrollBarPosition } from '../../../utils/commonMethod';
import BatchExport from './component/batchExport';
import MutiSelect from '../../../components/MutiSelect';
import { useActivate } from 'react-activation'; // useUnactivate,useAliveController
import { isEqual } from 'lodash';
// import { useActivate, useUnactivate,useAliveController} from 'react-activation';
import { useKeepAlive } from '../../../components/ReactKeepAlive';
import { useLocalStorageState } from 'ahooks';
// import {
//   diseaseTypeList,
//   diseaseUrgency3,
//   diseaseUrgency4,
//   // disease3,
//   // diseaseObj,
// } from '../../../utils/dataDic';

import { ReactComponent as LeftImg } from '../../../assets/img/leftAndRight/leftImg.svg';
import { ReactComponent as RightImg } from '../../../assets/img/leftAndRight/rightImg.svg';

export type Member = {
  startTime: string;
  endTime: string;
  checkCode: string;
  disease: string;
  diseaseImp: string;
  // fkFacilitiesId: number;
  fkFacilitiesIdList?: string[];
  openStatus: any;
};
interface lsType {
  diseaseNameZh: string;
  area: string;
  length: string;
  collectTime: string;
  diseaseType: string;
}
const { Option } = Select;
const { RangePicker } = DatePicker;
const ls: lsType[] = [];
const { confirm } = Modal;
// const { AMap }: any = window;
let switchImgDirection = '';

export default (): React.ReactElement => {
  const location: any = useLocation();
  useKeepAlive(); // '/diseasemanage/diseaselist'
  // dropScope将卸载命中 <KeepAlive> 的所有内容，包括 <KeepAlive> 中嵌套的所有 <KeepAlive>
  // const { getCachingNodes} = useAliveController();
  // const location = useLocation()
  // const curPath = location.pathname
  // const cachingNodes = getCachingNodes();
  // console.log('列表页',cachingNodes);
  const [diseaseStatus, setDiseaseStatus] = useState<any>([]);
  const [pickTime, setPickTime] = useState<any>({ startTime: undefined, endTime: undefined });
  const [btnType, setBtnType] = useState(3);
  const [exportFlag, setExportFlag] = useState<boolean>(false);
  const [exportType, setExportType] = useState<any>('excel');
  // const [isClear, setIsClear] = useState<boolean>(false);
  const childRef: any = useRef<React.ElementRef<typeof MutiSelect>>();
  const [timerDateCopy, setTimerDateCopy] = useLocalStorageState<any>('timerDateCopy', {
    timerDateCopy: [undefined, undefined],
  });
  const totalLimit: number = 10000;
  const [timerDate, setTimerDate] = useState<any>([undefined, undefined]);
  const [selectedRowKey, setSelectedRowKey] = useState<string[]>([]);
  const [facilitiesList, setFacilitiesList] = useState<any>([]);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(20);
  const [dataTotal, setDataTotal] = useState<any>();
  const [checkCode, setCheckCode] = useState();
  const [comprehensiveSearch, setComprehensiveSearch] = useState();
  const [urgency, setUrgency] = useState<number | undefined>();
  const [severity, setSeverity] = useState<number | undefined>();
  const [imgUrl, setImgUrl] = useState('');
  const [data, setData] = useState<any>({ ls });
  const [tableData, setTableData] = useState([]);
  const [info, setInfo] = useState<any>({});
  const access: any = useAccess();
  // const [searchPage, setSearchPage] = useState(1);
  const [importFlag, setImportFlag] = useState<any>(false);
  // const [facilityId, setFacilityId] = useState<number>();

  const [nextDisabled, setNextDisabled] = useState(false); // true： 置灰不可点  false: 表示可点
  const [preDisabled, setPreDisabled] = useState(false); // true： 置灰不可点  false: 表示可点
  const [curPreviewImgIndex, setCurPreviewImgIndex] = useState<number>(-1); // 当前预览的病害图片在列表中的序号
  // const [previewPage, setPreviewPage] = useState<number>(1); // 预览图片时 当前页码
  const [previewPageSize, setPreviewPageSize] = useState<number>(20); // 预览图片时 当前每页条数
  const [previewCurPageData, setPreviewCurPageData] = useState<any>(); // 预览图片时 当前页数据数
  const [previewCurPageDataTotal, setPreviewCurPageDataTotal] = useState<any>(); // 预览图片时 对应行数据的id

  const [disease, setDisease] = useState<number[]>([]);

  const [searchKey, setSearchKey] = useState<any>({
    startTime:
      (timerDateCopy[0] && moment(timerDateCopy[0]).format('YYYY-MM-DD HH:mm:ss')) ||
      pickTime.startTime,
    endTime:
      (timerDateCopy[1] && moment(timerDateCopy[1]).format('YYYY-MM-DD HH:mm:ss')) ||
      pickTime.endTime,
    // startTime: pickTime.startTime,
    // endTime: pickTime.endTime,
    checkCode,
    disease,
    keyword: comprehensiveSearch,
    // fkFacilitiesId: facilityId,
    fkFacilitiesIdList: [], // 设施名称
    openStatus: [],
    severity: undefined,
  });
  const [facilityVal, setFacilityVal] = useState<any>([]);
  const defalutSearchKey = {
    startTime: undefined,
    endTime: undefined,
    checkCode: undefined,
    disease: [],
    keyword: undefined,
    // fkFacilitiesId: undefined,
    diseaseImp: undefined,
    fkFacilitiesIdList: [],
    openStatus: [],
  };
  const actionRef = useRef<any>();
  const [imgFlag, setImgFlag] = useState(false);
  const history = useHistory();
  const scrollObj = useDiseaseScrollObj(tableData, { x: 1200, y: 'calc(100vh - 287px)' });
  const [curPreviewRowId, setCurPreviewRowId] = useState<string>('');

  useActivate(() => {
    // console.log('病害列表activated', location.state?.listPage);
    // setSearchPage(location.state?.listPage);
    setTabpage(location.state?.listPage);
    setCurPreviewRowId(location.state?.listId);
    changeTableScrollBarPosition(location.state?.curDiseaIndex);
  });
  // useUnactivate(() => {
  //   console.log('病害列表unactivated')
  // })

  const isExist = () => {
    const arrlist = [
      'diseaseList/index:btn_upload',
      'diseaseList/index:btn_export_list',
      'diseaseList/index:btn_export_pdf',
      'diseaseList/index:btn_batchdel',
    ];
    const rec = arrlist.some((it: string) => {
      if (access[it]) {
        return true;
      }
      return false;
    });
    return rec;
  };

  useEffect(() => {
    if (btnType === 1) {
      setTimerDate([moment().startOf('isoWeek'), moment().endOf('isoWeek')]);
      setPickTime({
        startTime: moment().startOf('week').format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment().endOf('week').format('YYYY-MM-DD HH:mm:ss'),
      });
    } else if (btnType === 2) {
      setTimerDate([moment().startOf('month'), moment().endOf('month')]);
      setPickTime({
        startTime: moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment().endOf('month').format('YYYY-MM-DD HH:mm:ss'),
      });
    } else {
      setTimerDate([undefined, undefined]);
      setPickTime({
        startTime: undefined,
        endTime: undefined,
      });
    }
  }, [btnType]);
  const disabledDate = (current: any) => {
    return current && current > moment().endOf('day');
  };
  // 获取设施列表
  useEffect(() => {
    const getFacilitiesList = async () => {
      let rec: any = [];
      try {
        const res = await getFacilitityList({ name: '' });
        if (res?.status === 0) {
          res?.data.forEach((it: any) => {
            // rec.push({ title: it.facilitiesName, value: it.id, key: `0-${i}` });
            rec.push({ title: it.facilitiesName, value: it.id, key: it.id });
          });
          const treeData = [
            {
              title: '全部',
              value: '0',
              key: '0',
              children: rec,
            },
          ];
          setFacilitiesList(treeData);
        }
      } catch (error) {
        rec = [];
      }
    };
    getFacilitiesList();
    if (timerDate && !timerDate[0] && timerDateCopy && timerDateCopy[0]) {
      setPickTime({
        startTime: moment(timerDateCopy[0]).format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment(timerDateCopy[1]).format('YYYY-MM-DD HH:mm:ss'),
      });
      setTimerDate([moment(timerDateCopy[0]), moment(timerDateCopy[1])]);
    }
    return () => {
      setTimerDateCopy([undefined, undefined]);
      // console.log('list组件卸载');
    };
  }, []);
  // 时间
  const timeRangeSelect = (dates: any, dateStrings: any) => {
    if (dateStrings[0] === '' && dateStrings[1] !== '') {
      setTimerDate([undefined, moment(dateStrings[1], 'YYYY-MM-DD HH:mm:ss')]);
    } else if (dateStrings[1] === '' && dateStrings[0] !== '') {
      setTimerDate([moment(dateStrings[0], 'YYYY-MM-DD HH:mm:ss'), undefined]);
    } else if (dateStrings[1] === '' && dateStrings[0] === '') {
      setTimerDate([undefined, undefined]);
    } else {
      setTimerDate([
        moment(dateStrings[0], 'YYYY-MM-DD HH:mm:ss'),
        moment(dateStrings[1], 'YYYY-MM-DD HH:mm:ss'),
      ]);
    }

    setPickTime({ startTime: dateStrings[0], endTime: dateStrings[1] });
  };

  const previewBigImg = (url: string) => {
    setImgUrl(url);
  };

  const imgInfo = async (infos: any) => {
    if (!infos?.recode) return;
    const detRes = await getDiseaseInfo(infos.recode.id);
    if (detRes.status === 0) {
      setData(detRes.data);
    } else {
      // message.error({
      //   content: detRes.message,
      //   key: detRes.message,
      // });
      setInfo({});
      actionRef.current.reload();
    }
  };

  useEffect(() => {
    if (!data.ls.length && info?.recode?.id) {
      imgInfo(info);
    } else {
      setData({ ls: data.ls, url: data.url, num: 1 });
    }
  }, [imgFlag, imgUrl]);

  const getIds = (type: any, id?: any) => {
    let ids: any = [];
    if (type === 'batch') {
      ids = selectedRowKey?.length === 0 ? [] : selectedRowKey;
    } else {
      ids = [id];
    }
    return ids;
  };

  const onDel = (deleteType: any, text?: any) => {
    const params = {
      ids: getIds(deleteType, text?.id),
    };
    confirm({
      title: '是否删除该病害记录？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          const formData = new FormData();
          formData.append('ids', params?.ids);
          const res = await dellistinfo(formData);
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            setSelectedRowKey([]);
            // 删除了当前页所有数据
            if (params?.ids.length >= previewCurPageData.length) {
              setTabpage(tabpage - 1 > 1 ? tabpage - 1 : 1);
              if (tabpage === 1) {
                actionRef.current.reload();
              }
            } else {
              actionRef.current.reload();
            }
          }

          return true;
        } catch (error) {
          message.error({
            content: '删除失败!',
            key: '删除失败!',
          });
          return false;
        }
      },
      onCancel() {},
    });
  };

  const handleExport = (type: any) => {
    if (
      (type === 'excel' && selectedRowKey?.length === 0 && dataTotal > totalLimit) ||
      selectedRowKey?.length > totalLimit
    ) {
      message.error({
        content: `超过数据上限，最多可导出${totalLimit}条数据!`,
        key: `超过数据上限，最多可导出${totalLimit}条数据!`,
      });
      return;
    }
    setExportType(type);
    setExportFlag(true);
  };

  // const handerImgClick = (e: any, record: any) => {
  //   e.stopPropagation();
  //   setPreviewingRowId(record.id);
  // };

  const handlePreviewImgIndex = (id: string) => {
    try {
      const previewCurPageDataCopy = previewCurPageData.slice();
      const index = previewCurPageDataCopy.findIndex((item: any) => item.id === id);
      setCurPreviewImgIndex(index);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    setPreDisabled(false);
    setNextDisabled(false);

    if (curPreviewImgIndex === 0 && tabpage === 1) {
      setPreDisabled(true);
    }
    if (tabpage === Math.ceil(previewCurPageDataTotal / previewPageSize)) {
      if (curPreviewImgIndex === previewCurPageData.length - 1) {
        setNextDisabled(true);
      }
    }
  }, [curPreviewImgIndex, tabpage]);

  const columnsDiff: any =
    Platform_Flag === 'meiping'
      ? [
          {
            title: '病害图片',
            dataIndex: 'imgUrl',
            key: 'imgUrl',
            width: 100,
            render: (text: any, recode: any) => {
              return (
                <img
                  src={text}
                  style={{ width: '58px', height: '46px', cursor: 'pointer' }}
                  onClick={() => {
                    setImgFlag(true);
                    setInfo({ recode });
                    setCurPreviewRowId(recode.id);
                    handlePreviewImgIndex(recode.id);
                  }}
                />
              );
            },
            // ellipsis: true,
            // fixed: 'left',
          },
          {
            title: '桩号',
            dataIndex: 'stakeNo',
            key: 'stakeNo',
            width: 180,
            render: (text: any, recode: any) => {
              let name = '';
              if (recode.routeMode === 0) {
                name = '上行';
              } else {
                name = recode.routeMode === 1 ? '下行' : '';
              }
              return `${recode.stakeNo ? recode.stakeNo : '-'} ${recode.stakeNo ? name : ''}`;
            },
          },
          {
            title: '采集时间',
            dataIndex: 'collectTime',
            key: 'collectTime',
            width: 180,
            ellipsis: true,
          },
          {
            title: '病害编号',
            dataIndex: 'diseaseNo',
            key: 'diseaseNo',
            width: 150,
            ellipsis: true,
          },
          {
            title: '图片名称',
            dataIndex: 'fkImgName',
            key: 'fkImgName',
            width: 240,
            ellipsis: true,
          },
          {
            title: '病害类型',
            dataIndex: 'diseaseNameZh',
            key: 'diseaseNameZh',
            width: 160,
            ellipsis: true,
          },
          {
            title: ' 紧急程度',
            dataIndex: 'diseaseImp',
            key: 'diseaseImp',
            width: 100,
            valueEnum: {
              0: { text: '非紧急' },
              1: { text: '紧急' },
            },
          },
          {
            title: '严重程度',
            dataIndex: 'severity',
            key: 'severity',
            width: 100,
            valueEnum: {
              0: { text: '-' },
              1: { text: '轻度' },
              2: { text: '中度' },
              3: { text: '重度' },
            },
          },
          {
            title: '道路名称',
            dataIndex: 'facilities',
            key: 'facilities',
            width: 140,
            ellipsis: true,
            // render: (text: any, recode: any) => {
            //   return `${recode.longitude}, ${recode.latitude}`;
            // },
          },
          {
            title: '复核状态',
            dataIndex: 'checkCode',
            key: 'checkCode',
            valueEnum: {
              0: { text: '未复核', status: 'Default' },
              1: { text: '已复核', status: 'Success' },
            },
            width: 100,
          },
          {
            title: '维修状态',
            dataIndex: 'openStatus',
            key: 'openStatus',
            valueEnum: {
              1: { text: '待修复', status: 'Default' },
              2: { text: '修复中', status: 'Warning' },
              3: { text: '已修复', status: 'Success' },
            },
            width: 100,
          },
        ]
      : [
          {
            title: '病害图片',
            dataIndex: 'imgUrl',
            key: 'imgUrl',
            width: 100,
            render: (text: any, recode: any) => {
              return (
                <img
                  src={text}
                  style={{ width: '58px', height: '46px', cursor: 'pointer' }}
                  onClick={() => {
                    setImgFlag(true);
                    setInfo({ recode });
                    setCurPreviewRowId(recode.id);
                    handlePreviewImgIndex(recode.id);
                  }}
                />
              );
            },
            // ellipsis: true,
            // fixed: 'left',
          },
          {
            title: '病害编号',
            dataIndex: 'diseaseNo',
            key: 'diseaseNo',
            width: 150,
            ellipsis: true,
          },
          {
            title: '图片名称',
            dataIndex: 'fkImgName',
            key: 'fkImgName',
            width: 240,
            ellipsis: true,
          },
          {
            title: '复核状态',
            dataIndex: 'checkCode',
            key: 'checkCode',
            valueEnum: {
              0: { text: '未复核', status: 'Default' },
              1: { text: '已复核', status: 'Success' },
            },
            width: 100,
          },
          {
            title: '病害类型',
            dataIndex: 'diseaseNameZh',
            key: 'diseaseNameZh',
            width: 160,
            ellipsis: true,
          },
          {
            title: '紧急程度',
            dataIndex: 'diseaseImp',
            key: 'diseaseImp',
            width: 100,
            valueEnum: {
              0: { text: '非紧急' },
              1: { text: '紧急' },
            },
          },
          {
            title: '严重程度',
            dataIndex: 'severity',
            key: 'severity',
            width: 100,
            valueEnum: {
              0: { text: '-' },
              1: { text: '轻度' },
              2: { text: '中度' },
              3: { text: '重度' },
            },
          },
          {
            title: '所在区域',
            dataIndex: 'address',
            key: 'address',
            width: 280,
            ellipsis: true,
            // render: (text: any, recode: any) => {
            //   return `${recode.longitude}, ${recode.latitude}`;
            // },
          },
          {
            title: '道路名称',
            dataIndex: 'facilities',
            key: 'facilities',
            width: 140,
            ellipsis: true,
            // render: (text: any, recode: any) => {
            //   return `${recode.longitude}, ${recode.latitude}`;
            // },
          },
          {
            title: '桩号',
            dataIndex: 'stakeNo',
            key: 'stakeNo',
            width: 180,
            render: (text: any, recode: any) => {
              let name = '';
              if (recode.routeMode === 0) {
                name = '上行';
              } else {
                name = recode.routeMode === 1 ? '下行' : '';
              }
              return `${recode.stakeNo ? recode.stakeNo : '-'} ${recode.stakeNo ? name : ''}`;
            },
          },
          {
            title: '采集时间',
            dataIndex: 'collectTime',
            key: 'collectTime',
            width: 180,
            ellipsis: true,
          },
        ];

  const columns: any = [
    {
      title: '序号',
      key: 'nums',
      render: (text: any, record: any, index: any) =>
        `${(tabpage - 1) * tabpagesize + (index + 1)}`,
      width: 80,
      ellipsis: true,
    },
    ...columnsDiff,
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (text: any) => {
        return (
          <Space size="middle">
            {access['diseaseList/index:btn_detail'] && (
              <a
                className="ahover"
                onClick={() => {
                  sessionStorage.setItem(
                    'diseaseObj',
                    `${[
                      text.id,
                      tabpage,
                      tabpagesize,
                      searchKey.startTime,
                      searchKey.endTime,
                      searchKey.checkCode,
                      // searchKey.disease,
                      // searchKey.fkFacilitiesId,
                      searchKey.diseaseImp,
                      searchKey.keyword,
                      undefined,
                      dataTotal,
                    ]}`,
                  );
                  sessionStorage.setItem('disease_severity', searchKey.severity);
                  sessionStorage.setItem('disease_disease', searchKey.disease);
                  sessionStorage.setItem(
                    'disease_fkFacilitiesIdList',
                    searchKey.fkFacilitiesIdList,
                  );
                  history.push(`/diseasemanage/diseaselist/diseasecard`);
                }}
              >
                详情
              </a>
            )}
            {access['diseaseList/index:btn_singledel'] && (
              <a
                className="ahover"
                onClick={() => {
                  onDel('single', text);
                  // setDelId(text.id);
                }}
              >
                删除
              </a>
            )}
          </Space>
        );
      },
    },
  ];

  // 选中当前行
  const onSelectChange = (selectedRowKeys: any) => {
    setSelectedRowKey(selectedRowKeys);
  };

  const clickRow = (record: any) => {
    const arr = selectedRowKey.filter((i) => i !== record.id);
    if (selectedRowKey.includes(record.id)) setSelectedRowKey(arr);
    else setSelectedRowKey([...arr, record.id]);
  };

  const changetabval = (text: any) => {
    // console.log(text?.current, searchPage);
    // if (text?.current !== searchPage) {
    // setSearchPage(text?.current as number);
    setTabpage(text?.current as number);
    // }
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
    setSelectedRowKey([]);
  };

  const onload = (dataSource: any) => {
    // if (!dataSource?.length) {
    //   if (searchPage > 1) {
    //     setSearchPage(searchPage - 1);
    //   } else {
    //     setSearchPage(1);
    //   }
    // }
    if (tableData.length !== dataSource.length) {
      setTableData(dataSource);
    }
  };

  const changeCode = (sel: any) => {
    setCheckCode(sel);
  };

  const onSelChange3 = (sel: any) => {
    setUrgency(sel);
    if (childRef?.current) {
      childRef?.current.clearFunc(true);
    }
    setDisease([]);
  };

  const handleFacilityChange = (val: any) => {
    setFacilityVal(val);
  };

  const onSearch = () => {
    setSearchKey({
      startTime: pickTime.startTime,
      endTime: pickTime.endTime,
      checkCode,
      disease,
      keyword: comprehensiveSearch,
      // fkFacilitiesId: facilityId,
      diseaseImp: urgency,
      severity,
      fkFacilitiesIdList: facilityVal, // 设施名称
      openStatus: diseaseStatus,
    });
    setSelectedRowKey([]);
    setTabpage(1);
    setCurPreviewRowId('');
    switchImgDirection = ''; // 为空时预览图片初始化，不请求预览数据
    actionRef.current.reload();
  };

  useEffect(() => {
    const listener = (event: any) => {
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        event.preventDefault();
        onSearch();
      }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [pickTime, checkCode, disease, comprehensiveSearch, facilityVal, urgency, severity]);

  const clearPage = () => {
    if (!isEqual(defalutSearchKey, searchKey)) {
      // setSearchPage(1);
      setSearchKey({ ...defalutSearchKey });
      setSelectedRowKey([]);
      actionRef.current.reload();
    }
  };
  const onSelNull = () => {
    setBtnType(3);
    setTimerDate([undefined, undefined]);
    setPickTime({ startTime: undefined, endTime: undefined });
    setDisease([]);
    setCheckCode(undefined);
    // setFacilityId(undefined);
    setComprehensiveSearch(undefined);
    setUrgency(undefined);
    setSeverity(undefined);
    setFacilityVal([]);
    setDiseaseStatus([]);
    if (childRef?.current) {
      childRef?.current.clearFunc(true);
    }
    // setProductModelList(diseaseAll1);
    if (btnType === 3) setTimerDate([undefined, undefined]);
    clearPage();
  };

  const refreshPage = () => {
    actionRef.current.reload();
  };

  const handleImport = () => {
    // 弹出框
    setImportFlag(true);
  };

  const debouceSearch = (e: any) => {
    setComprehensiveSearch(e.target.value);
  };
  const handletreeselect = (value: any) => {
    setDisease(value);
  };

  const handleUpdatePreviewInfo = (parmas: any, res: any) => {
    setPreviewPageSize(parmas?.pageSize);
    setPreviewCurPageData(res?.data);
    setPreviewCurPageDataTotal(+res?.total);
  };

  const handleUpdateImgInfo = async (isPageChange: boolean, todo: string, id: string) => {
    const res = await getDiseaseInfo(id);
    setCurPreviewRowId(id);

    if (res.status === 0) {
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

      if (!isPageChange) {
        if (todo === 'toPrePage') {
          setCurPreviewImgIndex(curPreviewImgIndex - 1);
        } else {
          setCurPreviewImgIndex(curPreviewImgIndex + 1);
        }
      } else if (isPageChange) {
        if (todo === 'toPrePage') {
          setCurPreviewImgIndex(previewCurPageData.length - 1);
        } else {
          setCurPreviewImgIndex(0);
        }
      }
    } else {
      setInfo({});
    }
  };

  const handleGetPageListInfo = async (todo: string) => {
    const page = todo === 'toPrePage' ? tabpage - 1 : tabpage + 1;
    setTabpage(page); // 图片分页后表格跟随分页
    // const { keyword, openStatus, startTime, endTime, fkFacilitiesId, diseaseImp } = searchKey;
    // const params: any = {
    //   current: page,
    //   pageSize: previewPageSize,
    //   keyword,
    //   openStatus,
    //   fkFacilitiesId,
    //   diseaseImp,
    //   startTime,
    //   endTime,
    //   disease: searchKey.disease,
    // };
    // const res = await getListInfo(params);

    // setPreviewCurPageData(res?.data);
    // setPreviewCurPageDataTotal(+res?.total);
    // console.log(previewCurPageData, 'preview')
    // let id = null;
    // if (todo === 'toPrePage') {
    //   id = previewCurPageData[previewCurPageData.length - 1].id;
    // } else {
    //   id = previewCurPageData[0].id;
    // }
    // handleUpdateImgInfo(true, todo, id);
    // setCurPreviewRowId(id);
  };

  useEffect(() => {
    if (switchImgDirection && previewCurPageData?.length) {
      let id = null;
      if (switchImgDirection === 'toPrePage') {
        id = previewCurPageData[previewCurPageData.length - 1].id;
      } else {
        id = previewCurPageData[0].id;
      }
      handleUpdateImgInfo(true, switchImgDirection, id);
    }
  }, [previewCurPageData]);

  // 切换预览图片相关
  const handleToPrevImg = () => {
    switchImgDirection = 'toPrePage';
    // console.log(curPreviewImgIndex, tabpage);
    if (curPreviewImgIndex === 0 && tabpage > 1) {
      handleGetPageListInfo('toPrePage');
    } else {
      const preId = previewCurPageData[curPreviewImgIndex - 1].id;
      handleUpdateImgInfo(false, 'toPrePage', preId);
    }
  };

  const handleToNextImg = () => {
    switchImgDirection = 'toNextPage';
    if (
      curPreviewImgIndex === previewCurPageData.length - 1 &&
      tabpage < Math.ceil(previewCurPageDataTotal / previewPageSize)
    ) {
      handleGetPageListInfo('toNextPage');
    } else {
      const nextId = previewCurPageData[curPreviewImgIndex + 1].id;
      handleUpdateImgInfo(false, 'toNextPage', nextId);
    }
  };

  // const getValue = () => {
  //   // 0 非紧急1 紧急
  //   const newdata: any = [];
  //   diseaseTypeList.forEach((inf: any) => {
  //     inf?.children?.forEach((it: any) => {
  //       const filterChild: any[] =
  //         urgency === 0 || urgency === 1
  //           ? it?.children?.filter((itn: any) =>
  //               urgency === 0 ? diseaseUrgency4[itn.value] : diseaseUrgency3[itn.value],
  //             )
  //           : it?.children;
  //       if (filterChild?.length) {
  //         filterChild.forEach((item: any) => {
  //           newdata.push(item.value);
  //         });
  //       }
  //     });
  //   });
  //   console.log(newdata);
  //   return newdata;

  // };

  // useEffect(() => {
  //   setDisease(getValue());
  // }, [urgency]);

  const handleChangeStatus = (val: any) => {
    setDiseaseStatus(val);
  };

  return (
    // <KeepAlive name="/diseaselist" id={curPath}  saveScrollPosition="screen">
    <div id={styles.container} className="page-list-common">
      <div className={` ${styles.topSelect} head-two-box`}>
        {/* <div className={`${styles.rowClass} ${flag1 ? styles.ipnBigBox2 : ''}  ${flag ? styles.ipnBigBox1 : ''}`}> */}
        <div
          className={`${Platform_Flag === 'meiping' ? styles.mpgsRow : styles.commonRow} ${
            styles.rowClass
          }`}
        >
          <span className={styles.inpBox}>
            综合搜索
            <Input
              className={styles.comClass}
              autoComplete="off"
              maxLength={60}
              placeholder="请输入病害编号、图片名称、所在区域"
              value={comprehensiveSearch}
              onChange={(e) => debouceSearch(e)}
            />
          </span>
          <span className={styles.inpBox}>
            复核状态
            <Select allowClear placeholder="请选择" onChange={changeCode} value={checkCode}>
              <Option value={0}>未复核</Option>
              <Option value={1}>已复核</Option>
            </Select>
          </span>
          {Platform_Flag === 'meiping' && (
            <span className={styles.inpBox}>
              维修状态
              <TreeSelect
                treeCheckable
                treeData={[
                  {
                    title: '全部',
                    value: '0',
                    key: '0',
                    children: [
                      { title: '待修复', value: 1, key: 1 },
                      { title: '修复中', value: 2, key: 2 },
                      { title: '已修复', value: 3, key: 3 },
                    ],
                  },
                ]}
                value={diseaseStatus}
                onChange={handleChangeStatus}
                maxTagCount={'responsive'}
                style={{ marginRight: 0 }}
                allowClear
                placeholder="请选择"
              />
            </span>
          )}
          <span className={styles.inpBox}>
            紧急程度
            <Select allowClear placeholder="请选择" onChange={onSelChange3} value={urgency}>
              <Option value={1}>紧急</Option>
              <Option value={0}>非紧急</Option>
            </Select>
          </span>

          <span className={styles.inpBox}>
            严重程度
            <Select
              allowClear
              placeholder="请选择"
              onChange={(val: any) => setSeverity(val)}
              value={severity}
            >
              <Option value={1}>轻度</Option>
              <Option value={2}>中度</Option>
              <Option value={3}>重度</Option>
              <Option value={0}>其他</Option>
            </Select>
          </span>
        </div>
        <div className={`${styles.rowClass} ${styles.commonRow}`}>
          <span className={`${styles.inpBox}`}>
            病害类型
            {/* <Select
              allowClear
              placeholder="请选择"
              style={{ marginRight: 0 }}
              onChange={onSelChange}
              value={disease}
            >
              {productModelList.map((item: any) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select> */}
            <MutiSelect urgency={urgency} onRef={childRef} handletreeselect={handletreeselect} />
          </span>
          <span className={` ${styles.inpBox}`}>
            道路名称
            <TreeSelect
              treeCheckable
              treeData={facilitiesList}
              value={facilityVal}
              onChange={handleFacilityChange}
              maxTagCount={'responsive'}
              style={{ marginRight: 0 }}
              allowClear
              placeholder="请选择"
            />
            {/* <Select
              allowClear
              placeholder="请选择"
              style={{ marginRight: 0 }}
              onChange={handleFacilityChange}
              value={facilityId}
            >
              {facilitiesList.map((item: any) => (
                <Option key={item.value} value={item.value}>
                  {item.label}
                </Option>
              ))}
            </Select> */}
          </span>
          <span className={` ${styles.timerBox}`}>
            <span>采集时间</span>
            <div
              onClick={() => setBtnType(1)}
              className={`${styles.dateSel} ${btnType === 1 && styles.btnLight}`}
            >
              本周
            </div>
            <div
              onClick={() => setBtnType(2)}
              className={`${styles.dateSel} ${btnType === 2 && styles.btnLight}`}
            >
              本月
            </div>
            <div
              onClick={() => setBtnType(3)}
              className={`${styles.dateSel} ${btnType === 3 && styles.btnLight}`}
            >
              自定义
            </div>
            <span className={styles.timeBox}>
              <RangePicker
                // showTime
                disabled={btnType === 1 || btnType === 2}
                inputReadOnly
                format="YYYY-MM-DD HH:mm:ss"
                showTime={{
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }}
                disabledDate={disabledDate}
                onChange={timeRangeSelect}
                value={timerDate}
              />
            </span>
            <div className={styles.selBtnBox}>
              <Button
                type="primary"
                onClick={() => {
                  onSearch();
                }}
              >
                查询
              </Button>
              <Button
                // className="kong-btn"
                // disabled={selectedRowKey.length === 0}
                onClick={() => {
                  onSelNull();
                }}
              >
                清除
              </Button>
            </div>
          </span>
        </div>
      </div>
      <div className={'row-button'}>
        {access['diseaseList/index:btn_upload'] && (
          <Button
            className={'buttonClass'}
            type="primary"
            onClick={() => {
              handleImport();
            }}
          >
            批量导入
          </Button>
        )}
        {access['diseaseList/index:btn_export_list'] && (
          <Button
            disabled={dataTotal === 0}
            className={'buttonClass'}
            // type="primary"
            onClick={() => {
              handleExport('excel');
            }}
          >
            导出病害列表
          </Button>
        )}
        {access['diseaseList/index:btn_export_pdf'] && (
          <Button
            // type="primary"
            className={'buttonClass'}
            disabled={selectedRowKey.length === 0}
            onClick={() => {
              handleExport('pdf');
            }}
          >
            导出病害报告
          </Button>
        )}
        {/* <Button
          // disabled={selectedRowKey.length === 0}
          // className="kong-btn"
          // disabled={selectedRowKey.length === 0}
          onClick={() => setRemDupSiteShow(true)}
          style={{ marginRight: 20 }}
        >
          去重设置
        </Button> */}
        {access['diseaseList/index:btn_batchdel'] && (
          <Button
            className={'buttonClass'}
            disabled={selectedRowKey.length === 0}
            // className="kong-btn"
            // disabled={selectedRowKey.length === 0}
            onClick={() => onDel('batch')}
          >
            批量删除
          </Button>
        )}
      </div>
      <Image
        placeholder={true}
        style={{ display: 'none' }}
        rootClassName={'table-preview-img-root'}
        preview={{
          visible: imgFlag,
          src: imgUrl,
          onVisibleChange: (value) => {
            // setCurPreviewRowId(recode.id);
            setImgFlag(value);
            // setInfo({ recode });
            // handlePreviewImgIndex(recode.id);
            if (!value) {
              // setCurPreviewRowId('');
              switchImgDirection = '';
              setData({ ls });
              setImgUrl('');
              setInfo({});
              // 不在可见区域内更改滚动条的位置
              changeTableScrollBarPosition(curPreviewImgIndex);
            }
          },
        }}
      />
      <div className={`page-table-two-box ${isExist() ? null : `page-table-two-box-nobutton`}`}>
        <ProTable<Member>
          columns={columns}
          actionRef={actionRef}
          request={async (params) => {
            const res = await getListInfo(params);
            setDataTotal(res.total * 1);

            handleUpdatePreviewInfo(params, res);
            // 表单搜索项会从 params 传入，传递给后端接口。
            return res;
          }}
          params={{
            startTime: searchKey.startTime,
            endTime: searchKey.endTime,
            checkCode: searchKey.checkCode,
            disease: searchKey.disease,
            keyword: searchKey.keyword,
            // fkFacilitiesId: searchKey.fkFacilitiesId,
            fkFacilitiesIdList: searchKey.fkFacilitiesIdList,
            openStatus: searchKey.openStatus,
            diseaseImp: searchKey.diseaseImp,
            severity: searchKey.severity,
          }}
          rowKey="id"
          // postData={postData}
          rowSelection={{
            selectedRowKeys: selectedRowKey,
            type: 'checkbox',
            onChange: onSelectChange,
          }}
          onRow={(record) => {
            return {
              onClick: (e: any) => {
                if (
                  e?.target &&
                  (e?.target?.nodeName === 'IMG' || e?.target?.nodeName === 'path')
                ) {
                  return;
                }
                if (
                  e?.target &&
                  (e.target?.className.indexOf('ahover') > -1 ||
                    e.target?.className.indexOf('ant-dropdown-menu-title-content') > -1)
                ) {
                  return;
                }
                clickRow(record);
              }, // 点击行
            };
          }}
          rowClassName={(record: any) => {
            return curPreviewRowId === record.id ? 'highlight-row' : '';
          }}
          tableAlertRender={false}
          pagination={{
            showQuickJumper: false,
            defaultPageSize: 20,
            current: tabpage,
            pageSizeOptions: ['10', '20', '50', '100', '500'],
            showSizeChanger: true,
          }}
          toolBarRender={false}
          search={false}
          scroll={scrollObj || { x: '100%' }}
          onChange={changetabval}
          onLoad={onload}
        />
      </div>

      {importFlag && (
        <ImportModal
          importShow={importFlag}
          onCancel={() => {
            setImportFlag(false);
          }}
          refreshPage={refreshPage}
          // pkid={libraryIdUpload}
        />
      )}
      {exportFlag && (
        <BatchExport
          exportFlagshow={exportFlag}
          searchParams={searchKey}
          onCancel={() => {
            setExportFlag(false);
          }}
          exportType={exportType}
          idsArray={selectedRowKey?.length === 0 ? [] : selectedRowKey}
        />
      )}
      {imgFlag ? (
        <>
          <DistressCanvas setImgUrl={previewBigImg} data={data} />{' '}
        </>
      ) : (
        ''
      )}

      {/* 左右切换按钮 */}
      {imgFlag && data?.ls.length ? (
        <LeftImg
          className={`${styles.arrLeftIcon} ${styles.toggleIcon} ${
            preDisabled ? styles.arrIconDisabled : ''
          }`}
          onClick={preDisabled ? undefined : handleToPrevImg}
        />
      ) : (
        ''
      )}
      {imgFlag && data?.ls.length ? (
        <RightImg
          onClick={nextDisabled ? undefined : handleToNextImg}
          className={`${styles.arrRightIcon} ${styles.toggleIcon} ${
            nextDisabled ? styles.arrIconDisabled : ''
          }`}
        />
      ) : (
        ''
      )}
    </div>
    // </KeepAlive>
  );
};
