import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.less';
import {
  Button,
  Select,
  DatePicker,
  message,
  Image,
  Modal,
  Space,
  Input,
  // Switch,
  TreeSelect,
  Radio,
} from 'antd';
import moment from 'moment';
import ProTable from '@ant-design/pro-table';
import { getFacilitityList } from '../../../services/commonApi';
import DistressCanvas from '../../../components/DistressCanvas';
import { useAccess, useHistory, useLocation } from 'umi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useDiseaseScrollObj } from '../../../utils/tableScrollSet';
import { changeTableScrollBarPosition } from '../../../utils/commonMethod';
import MutiSelect from '../../../components/MutiSelect';
import { useLocalStorageState } from 'ahooks';
// import {
//   diseaseTypeList,
//   diseaseUrgency3,
//   diseaseUrgency4,
//   // disease3,
// } from '../../../utils/dataDic';
import placeholdSvg from '../../../../public/images/placeholder.svg';
import { ReactComponent as LeftImg } from '../../../assets/img/leftAndRight/leftImg.svg';
import { ReactComponent as RightImg } from '../../../assets/img/leftAndRight/rightImg.svg';
import { exportCom } from '../../../utils/exportCom';
import { useKeepAlive } from '../../../components/ReactKeepAlive';
import { useActivate } from 'react-activation';
import { isEqual } from 'lodash';

import {
  downlodExcel,
  getListInfo,
  toggleDiseaseStatus,
  getPhDiseaseInfo,
  exportPdf,
} from './service';

export type Member = {
  startTime: string;
  endTime: string;
  checkCode: string;
  disease: string;
  diseaseImp: string;
  // fkFacilitiesId: number;
  fkFacilitiesIdList?: string[];
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
const defalutSearchKey = {
  startTime: undefined,
  endTime: undefined,
  disease: [],
  keyword: undefined,
  // fkFacilitiesId: undefined,
  openStatus: [],
  diseaseImp: undefined,
  fkFacilitiesIdList: [],
};
// const { AMap }: any = window;
let switchImgDirection = '';

export default (): React.ReactElement => {
  useKeepAlive();
  const location: any = useLocation();
  const [pickTime, setPickTime] = useState<any>({ startTime: undefined, endTime: undefined });
  const [btnType, setBtnType] = useState(3);

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
  const [imgUrl, setImgUrl] = useState('');
  const [data, setData] = useState<any>({ ls });
  const [tableData, setTableData] = useState([]);
  const [info, setInfo] = useState<any>({});
  const access: any = useAccess();
  // const [facilityId, setFacilityId] = useState<number>();

  const [diseaseStatus, setDiseaseStatus] = useState<any>([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const [isExpandRowImg, setIsExpandRowImg] = useState<boolean>(false);
  const [curPreviewRowId, setCurPreviewRowId] = useState<string>('');

  const [nextDisabled, setNextDisabled] = useState(false); // true： 置灰不可点  false: 表示可点
  const [preDisabled, setPreDisabled] = useState(false); // true： 置灰不可点  false: 表示可点
  const [curPreviewImgIndex, setCurPreviewImgIndex] = useState<number>(-1); // 当前预览的病害图片在列表中的序号
  const [previewPage, setPreviewPage] = useState<number>(1); // 预览图片时 当前页码
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
    checkCode, // 复核状态
    disease, // 病害类型
    keyword: comprehensiveSearch, // 综合搜索
    // fkFacilitiesId: facilityId, // 设施名称
    openStatus: [], // 病害状态
    diseaseImp: undefined, // 紧急状态
    fkFacilitiesIdList: [], // 设施名称
  });

  const [facilityVal, setFacilityVal] = useState<any>([]);
  const [severity, setSeverity] = useState<number | undefined>();

  const actionRef = useRef<any>();
  const [imgFlag, setImgFlag] = useState(false);
  const history = useHistory();
  const scrollObj = useDiseaseScrollObj(tableData, { x: 1200, y: 'calc(100vh - 287px)' });

  useActivate(() => {
    // 从详情返回时，去相应的页数与高亮相应数据
    // console.log('病害列表activated', location.state?.listPage);
    // setSearchPage(location.state?.listPage);
    setTabpage(location.state?.listPage);
    setCurPreviewRowId(location.state?.listId);
    changeTableScrollBarPosition(location.state?.curDiseaIndex);
  });

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
      setPickTime({ startTime: undefined, endTime: undefined });
    }
  }, [btnType]);
  const disabledDate = (current: any) => {
    return current && current > moment().endOf('day');
  };
  const getFacilitiesList = async () => {
    let rec: any = [];
    try {
      const res = await getFacilitityList({ name: '' });
      if (res?.status === 0) {
        res?.data.forEach((it: any) => {
          rec.push({ title: it.facilitiesName, value: it.id, key: it.id });
          // rec.push({ title: it.facilitiesName, value: it.id, key: `0-${i}` });
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
  // 获取设施列表
  useEffect(() => {
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
    const id = isExpandRowImg ? infos.recode.diseaseId : infos.recode.id;
    const detRes = await getPhDiseaseInfo(id);
    if (detRes.status === 0) {
      setData(detRes.data);
    } else {
      setInfo({});
      actionRef.current.reload();
    }
  };
  useEffect(() => {
    if (!data.ls.length && (info?.recode?.id || info?.recode?.diseaseId)) {
      imgInfo(info);
    } else {
      setData({ ls: data.ls, url: data.url, num: 1 });
    }
  }, [imgFlag, imgUrl]);

  const exportBatch = async (type: string) => {
    if (
      (selectedRowKey?.length === 0 && dataTotal > totalLimit) ||
      selectedRowKey?.length > totalLimit
    ) {
      message.error({
        content: `超过数据上限，最多可导出${totalLimit}条数据!`,
        key: `超过数据上限，最多可导出${totalLimit}条数据!`,
      });
      return;
    }
    const hide = message.loading({
      content: '正在导出',
      key: '正在导出',
    });
    const { startTime, endTime, keyword, openStatus, diseaseImp, fkFacilitiesIdList } = searchKey;
    const obj = {
      ids: selectedRowKey?.length === 0 ? [] : selectedRowKey,
      startTime,
      endTime,
      disease,
      keyword,
      // fkFacilitiesId,
      openStatus,
      diseaseImp,
      pageSize: tabpagesize,
      page: tabpage,
      fkFacilitiesIdList,
      severity: severity ? [severity] : undefined,
    };
    try {
      let res: any = null;
      if (type === 'excel') {
        res = await downlodExcel(obj);
        exportCom(res);
      }
      if (type === 'pdf') {
        res = await exportPdf(obj);
        exportCom(res, undefined, 'application/octet-stream');
      }

      hide();
      message.success({
        content: '导出成功',
        key: '导出成功',
      });
    } catch (error) {
      hide();
      message.error({
        content: '导出失败!',
        key: '导出失败!',
      });
    }
  };

  // const handerImgClick = (e: any) => {
  //   e.stopPropagation();
  // };

  // const handlerTabDiseaseStatus = (checked: boolean, e: any, fkRealDiseaseId: string) => {
  //   e.stopPropagation();

  //   const todo = checked ? '打开' : '关闭';
  //   confirm({
  //     title: `是否${todo}该病害记录？`,
  //     icon: <ExclamationCircleOutlined />,
  //     okText: '确定',
  //     okType: 'danger',
  //     cancelText: '取消',
  //     async onOk() {
  //       const res = await toggleDiseaseStatus({ fkRealDiseaseId, type: checked ? 1 : 2 });
  //       if (res.status === 0) {
  //         actionRef.current.reload();
  //       }
  //       actionRef.current.reload();
  //     },
  //     onCancel() {
  //       actionRef.current.reload();
  //     },
  //   });
  //   return false;
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
    if (curPreviewImgIndex === 0 && previewPage === 1) {
      setPreDisabled(true);
    }
    if (previewPage === Math.ceil(previewCurPageDataTotal / previewPageSize)) {
      if (curPreviewImgIndex === previewCurPageData.length - 1) {
        setNextDisabled(true);
      }
    }
  }, [curPreviewImgIndex]);

  const changeStatus = async (row: any) => {
    let status: number = row?.openStatus || 1;
    confirm({
      icon: '',
      content: (
        <Radio.Group
          onChange={(e: any) => {
            status = e?.target?.value;
          }}
          defaultValue={status}
        >
          <Radio value={1}>待修复</Radio>
          <Radio value={2}>修复中</Radio>
          <Radio value={3}>已修复</Radio>
        </Radio.Group>
      ),
      async onOk() {
        const res = await toggleDiseaseStatus({
          fkRealDiseaseId: row?.fkRealDiseaseId,
          type: status,
        });
        if (res.status === 0) {
          message.success({
            content: '状态更改成功',
            key: '状态更改成功',
          });
          actionRef.current.reload();
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const columns: any = [
    {
      title: '序号',
      key: 'nums',
      render: (text: any, record: any, index: any) =>
        `${(tabpage - 1) * tabpagesize + (index + 1)}`,
      width: 48,
      fixed: 'left',
    },
    {
      title: '病害图片',
      dataIndex: 'imgUrl',
      key: 'imgUrl',
      width: 99,
      render: (text: any, recode: any) => {
        return (
          <img
            src={text}
            style={{ width: '58px', height: '46px', cursor: 'pointer' }}
            onClick={() => {
              setImgFlag(true);
              setIsExpandRowImg(false);
              setInfo({ recode });
              setCurPreviewRowId(recode.id);
              handlePreviewImgIndex(recode.id);
            }}
          />
        );
      },
    },
    {
      title: '物理病害编号',
      dataIndex: 'realDiseaseNo',
      key: 'realDiseaseNo',
      width: 207,
      ellipsis: true,
    },
    {
      title: '图片名称',
      dataIndex: 'fkImgName',
      key: 'fkImgName',
      width: 110,
      ellipsis: true,
    },
    // {
    //   title: '病害状态',
    //   dataIndex: 'diseStatuts',
    //   key: 'diseStatuts',
    //   width: 100,
    //   render: (text: any, recode: any) => {
    //     return (
    //       <div>
    //         <Switch
    //           checkedChildren="打开"
    //           unCheckedChildren="关闭"
    //           checked={recode?.openStatus === 1}
    //           defaultChecked={recode?.openStatus === 1}
    //           onClick={(checked: boolean, e: any) =>
    //             handlerTabDiseaseStatus(checked, e, recode?.fkRealDiseaseId)
    //           }
    //         />
    //       </div>
    //     );
    //   },
    // },
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
    {
      title: '病害类型',
      dataIndex: 'diseaseNameZh',
      key: 'diseaseNameZh',
      width: 160,
    },
    {
      title: ' 紧急程度',
      dataIndex: 'diseaseImp',
      key: 'diseaseImp',
      width: 115,
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
      width: 214,
      ellipsis: true,
    },
    {
      title: '道路名称',
      dataIndex: 'facilities',
      key: 'facilities',
      width: 108,
      ellipsis: true,
    },
    {
      title: '桩号',
      dataIndex: 'stakeNo',
      key: 'stakeNo',
      width: 137,
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
      width: 166,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (text: any, row: any) => {
        return (
          <Space size="middle">
            {access['physicalDiseaseList/index:btn_detail'] && (
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
                      searchKey.openStatus,
                      text.fkDiseaseId,
                    ]}`,
                  );
                  sessionStorage.setItem('disease_severity', searchKey.severity);
                  sessionStorage.setItem('disease_disease', searchKey.disease);
                  sessionStorage.setItem(
                    'disease_fkFacilitiesIdList',
                    searchKey.fkFacilitiesIdList,
                  );
                  history.push(`/diseasemanage/physicalDiseaseList/physicalDiseaseDetail`);
                }}
              >
                详情
              </a>
            )}
            {access['physicalDiseaseList/index:btn_status'] && (
              <a
                className="ahover"
                onClick={() => {
                  changeStatus(row);
                }}
              >
                状态
              </a>
            )}
          </Space>
        );
      },
    },
  ];

  // 选中当前行
  const onSelectChange = (selectedRowKeys: any) => {
    // setSelectedRow(selectedRows[0]);
    setSelectedRowKey(selectedRowKeys);
  };

  const clickRow = (record: any) => {
    // setSelectedRow(record);
    // setSelectedRowKey([record.id]); // 单选
    const arr = selectedRowKey.filter((i) => i !== record.id);
    if (selectedRowKey.includes(record.id)) setSelectedRowKey(arr);
    else setSelectedRowKey([...arr, record.id]);
  };
  const changetabval = (text: any) => {
    // if (text?.current !== searchPage) {
    //   setSearchPage(text?.current as number);
    //   setTabpage(text?.current as number);
    // }
    setTabpage(text?.current as number);
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
  const onSelChange3 = (sel: any) => {
    setUrgency(sel);
    if (childRef?.current) {
      childRef?.current.clearFunc(true);
    }
    setDisease([]);
  };

  // const handlerTToggleStatus = (val: number) => {
  //   setDiseaseStatus(val);
  // };
  const handleChangeStatus = (val: any) => {
    setDiseaseStatus(val);
  };

  const handleFacilityChange = (val: any) => {
    setFacilityVal(val);
  };
  const onSearch = () => {
    setSearchKey({
      startTime: pickTime.startTime,
      endTime: pickTime.endTime,
      // checkCode, // 复核状态
      disease, // 病害类型
      keyword: comprehensiveSearch, // 综合搜索
      // fkFacilitiesId: facilityId, // 设施名称
      diseaseImp: urgency, // 紧急程度
      openStatus: diseaseStatus, // 病害状态
      fkFacilitiesIdList: facilityVal, // 设施名称
      severity, // 严重程度
    });
    setSelectedRowKey([]);
    setTabpage(1);
    setCurPreviewRowId('');
    // setSearchPage(1);
    switchImgDirection = '';
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
  }, [pickTime, disease, comprehensiveSearch, facilityVal, urgency, severity]);
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
    // setDisease([]);
    setCheckCode(undefined);
    // setFacilityId(undefined);
    setComprehensiveSearch(undefined);
    setUrgency(undefined);
    setDiseaseStatus([]);
    setSeverity(undefined);
    setFacilityVal([]);
    if (childRef?.current) {
      childRef?.current.clearFunc(true);
    }
    setDisease([]);
    clearPage();
    // setProductModelList(diseaseAll1);
    if (btnType === 3) setTimerDate([undefined, undefined]);
  };

  // const refreshPage = () => {
  //   actionRef.current.reload();
  // };

  const debouceSearch = (e: any) => {
    setComprehensiveSearch(e.target.value);
  };
  const handletreeselect = (value: any) => {
    setDisease(value);
  };
  // 嵌套表格
  const expandedRowRender = (record: any) => {
    const innerData = [];
    innerData.push({
      key: `${record?.id}_child`,
      realCollectTime: record?.realCollectTime,
      realImgName: record?.realImgName,
      realDiseaseNo: record?.realDiseaseNo,
      realImgUrl: record?.realImgUrl,
      diseaseId: record?.diseaseId,
    });
    return (
      <>
        <ProTable
          tableClassName={'ant-table-expanded-row-fixed-tab'}
          columns={[
            {
              title: '病害图片',
              dataIndex: 'realImgUrl',
              key: 'realImgUrl',
              width: 199,
              className: 'tab_custom_inner_cell',
              render: (text: any, recode: any) => {
                return (
                  <>
                    <img
                      src={text}
                      style={{ width: '58px', height: '46px', cursor: 'pointer' }}
                      onClick={() => {
                        setImgFlag(true);
                        setInfo({ recode });
                        setIsExpandRowImg(true);
                      }}
                    />
                  </>
                );
              },
            },
            {
              title: '物理病害编号',
              dataIndex: 'realDiseaseNo',
              key: 'realDiseaseNo',
              width: 207,
              ellipsis: true,
            },
            {
              title: '图片名称',
              dataIndex: 'realImgName',
              key: 'realImgName',
              width: 380,
              ellipsis: true,
            },
            {
              title: '采集时间',
              dataIndex: 'realCollectTime',
              key: 'realCollectTime',
              width: 577,
            },
          ]}
          headerTitle={false}
          search={false}
          options={false}
          dataSource={innerData}
          pagination={false}
          rowClassName={(curRecord: any) => {
            return curPreviewRowId === curRecord.id
              ? 'tab_custom_inner_row highlight-row'
              : 'tab_custom_inner_row';
          }}
        />
      </>
    );
  };

  // 嵌套表格展开 关闭
  const handlerExpand = (expanded: any, record: any) => {
    if (expanded) {
      setExpandedRowKeys([record?.id]);
    } else {
      setExpandedRowKeys([]);
    }
  };

  const handleUpdatePreviewInfo = (parmas: any, res: any) => {
    setPreviewPage(parmas?.current);
    setPreviewPageSize(parmas?.pageSize);
    setPreviewCurPageData(res?.data);
    setPreviewCurPageDataTotal(+res?.total);
  };

  const handleUpdateImgInfo = async (isPageChange: boolean, todo: string, id: string) => {
    setCurPreviewRowId(id);
    const res = await getPhDiseaseInfo(id);
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
      }
      if (isPageChange) {
        if (todo === 'toPrePage') {
          // setPreviewPage(previewPage - 1);
          setCurPreviewImgIndex(previewCurPageData.length - 1);
        } else {
          // setPreviewPage(previewPage + 1);
          setCurPreviewImgIndex(0);
        }
      }
    } else {
      setInfo({});
    }
  };
  const handleGetPageListInfo = async (todo: string) => {
    const page = todo === 'toPrePage' ? previewPage - 1 : previewPage + 1;
    setTabpage(page);
    // setSearchPage(page);
  };

  useEffect(() => {
    if (switchImgDirection && previewCurPageData?.length) {
      console.log(switchImgDirection);
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
    if (curPreviewImgIndex === 0 && previewPage > 1) {
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
      previewPage < Math.ceil(previewCurPageDataTotal / previewPageSize)
    ) {
      handleGetPageListInfo('toNextPage');
    } else {
      const nextId = previewCurPageData[curPreviewImgIndex + 1].id;
      handleUpdateImgInfo(false, 'toNextPage', nextId);
    }
  };

  return (
    <div id={styles.container} className="page-list-common">
      <div className={` ${styles.topSelect} head-two-box`}>
        <div className={`${styles.rowClass}`}>
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
          {/* <span className={styles.inpBox}>
            病害状态
            <Select
              allowClear
              placeholder="请选择"
              onChange={handlerTToggleStatus}
              value={diseaseStatus}
            >
              <Option value={1}>已打开</Option>
              <Option value={2}>已关闭</Option>
            </Select>
          </span> */}

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
        <div className={`${styles.rowClass} `}>
          <span className={`${styles.inpBox} ${styles.inpBox3}`}>
            病害类型
            <MutiSelect urgency={urgency} onRef={childRef} handletreeselect={handletreeselect} />
          </span>
          <span className={` ${styles.inpBox6} ${styles.inpBox7}${styles.inpBox3}`}>
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
                showTime={{
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }}
                disabled={btnType === 1 || btnType === 2}
                inputReadOnly
                format="YYYY-MM-DD HH:mm:ss"
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
        {access['physicalDiseaseList/index:btn_export'] && (
          <Button
            className={'buttonClass'}
            type="primary"
            onClick={() => {
              if (selectedRowKey.length === 0) {
                confirm({
                  title: '是否导出查询列表所有数据？',
                  icon: <ExclamationCircleOutlined />,
                  okText: '确定',
                  okType: 'danger',
                  cancelText: '取消',
                  async onOk() {
                    return exportBatch('excel');
                  },
                  onCancel() {},
                });
              } else {
                exportBatch('excel');
              }
            }}
          >
            导出病害列表
          </Button>
        )}
        {access['physicalDiseaseList/index:btn_export_pdf'] && (
          <Button
            className={'buttonClass'}
            disabled={selectedRowKey.length === 0}
            onClick={() => {
              if (selectedRowKey.length === 0) {
                confirm({
                  title: '是否导出查询列表所有数据？',
                  icon: <ExclamationCircleOutlined />,
                  okText: '确定',
                  okType: 'danger',
                  cancelText: '取消',
                  async onOk() {
                    return exportBatch('pdf');
                  },
                  onCancel() {},
                });
              } else {
                exportBatch('pdf');
              }
            }}
          >
            导出病害报告
          </Button>
        )}
      </div>
      <div
        className={`physical_tab_wrapper page-table-two-box ${
          isExist() ? null : `page-table-two-box-nobutton`
        }`}
      >
        <Image
          style={{ display: 'none' }}
          placeholder={true}
          fallback={placeholdSvg}
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
                if (!isExpandRowImg) {
                  changeTableScrollBarPosition(curPreviewImgIndex);
                }
              }
            },
          }}
        />
        <ProTable<Member>
          columns={columns}
          actionRef={actionRef}
          rowClassName={(record: any) => {
            return curPreviewRowId === record.id ? 'highlight-row' : '';
          }}
          request={async (params: any) => {
            const res = await getListInfo(params);
            // setExpandedTabData(res?.data || [])
            setDataTotal(res.total * 1);

            handleUpdatePreviewInfo(params, res);
            // 表单搜索项会从 params 传入，传递给后端接口。
            return res;
          }}
          expandable={{
            expandedRowRender,
            onExpand: (expanded: any, record: any) => handlerExpand(expanded, record),
            expandedRowKeys,
            columnWidth: 52,
          }}
          params={{
            startTime: searchKey.startTime,
            endTime: searchKey.endTime,
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
            columnWidth: 52,
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
          tableAlertRender={false}
          // polling={polling || undefined}
          pagination={{
            showQuickJumper: false,
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
      {imgFlag ? (
        <>
          <DistressCanvas setImgUrl={previewBigImg} data={data} />{' '}
        </>
      ) : (
        ''
      )}

      {/* 左右切换按钮 */}
      {imgFlag && !isExpandRowImg && data?.ls.length ? (
        <>
          <LeftImg
            className={`${styles.arrLeftIcon} ${styles.toggleIcon} ${
              preDisabled ? styles.arrIconDisabled : ''
            }`}
            onClick={preDisabled ? undefined : handleToPrevImg}
          />
          <RightImg
            onClick={nextDisabled ? undefined : handleToNextImg}
            className={`${styles.arrRightIcon} ${styles.toggleIcon} ${
              nextDisabled ? styles.arrIconDisabled : ''
            }`}
          />
        </>
      ) : (
        ''
      )}
    </div>
  );
};
