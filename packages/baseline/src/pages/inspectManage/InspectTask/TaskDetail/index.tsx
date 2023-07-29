import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Space, Badge, Select, Tabs, message, TreeSelect, DatePicker } from 'antd';
import { urgencyDegree, checkStatusEnum, PUSH_STATUES } from '../enum';
import styles from './styles.less';
import { useAccess, useHistory } from 'umi';
import { ProTable } from '@ant-design/pro-table';
import { getListInfo, getMapInfo, pushDisease } from './serves';
import { useScrollObjSta } from '../../../../utils/tableScrollSet';
import Map from './Map';
import MutiSelect from '../../../../components/MutiSelect';
import { ReactComponent as ListBack } from '../../../../assets/img/backDisease/back.svg';
import { ReactComponent as PullUp } from '../../../../assets/img/pullUp/pullUp.svg';
import { ReactComponent as Down } from '../../../../assets/img/pullUp/down.svg';
import { ReactComponent as Up } from '../../../../assets/img/pullUp/up.svg';
import TecStatus from './TecStatus';
import moment from 'moment';
import {
  commonExport,
  commonDel,
  // formatNowTime,
  commonRequest,
} from '../../../../utils/commonMethod';
import type { TabsProps } from 'antd';
// import { ExclamationCircleOutlined } from '@ant-design/icons';

const requestList = [
  { url: '/traffic/patrol/task/detail', method: 'get' },
  { url: '/traffic/patrol/task/export/pdf', method: 'post', blob: true }, // 导出病害报告接口
  { url: '/traffic/patrol/task/exportDisease', method: 'post', blob: true }, // 基线导出病害结果接口
  { url: '/traffic/patrol/task/review', method: 'post' }, // 基线复核接口
  { url: '/sm-traffic-yc/disease/statistics/download', method: 'post', blob: true }, // 盐城导出病害结果接口，待后端基线导出病害结果接口兼容盐城后去掉
  { url: '/sm-traffic-yc/ycApi/updateAndPush', method: 'put' }, // 盐城复核接口，待后端基线复核接口兼容盐城后去掉
  { url: '/traffic/patrol/task/update/stake', method: 'get' },
];

const { Option } = Select;
const { RangePicker } = DatePicker;
// const { confirm } = Modal;
type Iprops = {
  proName?: string;
};

const TaskDetail: React.FC<Iprops> = (props: Iprops) => {
  const access: any = useAccess();
  const history: any = useHistory();
  const ref: any = useRef();
  const mapRef: any = useRef();
  const [openStatus, setOpenStatus] = useState<any>([]);
  const [btnType, setBtnType] = useState(3);
  const [pickTime, setPickTime] = useState<any>({ startTime: undefined, endTime: undefined });
  const [timerDate, setTimerDate] = useState<any>([undefined, undefined]);
  const [currentTime, setCurrentTime] = useState<any>();
  const [taskStatus, setTaskStatus] = useState<number>(3);
  const [patrolTaskId, setPatrolTaskId] = useState<number>(1);
  const [facilityId, setFacilityId] = useState<any>();
  // const [mileage, setMileage] = useState<string>('0个');
  const [total, setTotal] = useState<string>('0km');
  const [typeList, setTypeList] = useState<any>([]);
  const [reviewStatus, setReviewStatus] = useState<any>(null);
  // const [endTime, setEndTime] = useState<any>(null);
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [tabpagesize, setTabpagesize] = useState(20);
  const [tableData, setTableData] = useState<any>([]);
  const [isShowMap, setIsShowMap] = useState<boolean>(false);
  const [bigScreen, setBigScreen] = useState<boolean>(true);
  const [rowId, setRowId] = useState<any>('');
  const [diseaseType, setDiseaseType] = useState<any>('');
  const [diseaseList, setDiseaseList] = useState<any>([]);
  const scrollObj = useScrollObjSta(tableData, { x: 1200, y: 'calc(100vh - 240px)' });
  const childRef: any = useRef<React.ElementRef<typeof MutiSelect>>();
  const [columns, setColumns] = useState<any>([]);
  // const [curPageList, setCurPageList] = useState<any>([]);
  const [pushStatus, setPushStatus] = useState<any>(null);
  const [severity, setSeverity] = useState<number | undefined>();

  const getDisease = async (params: any) => {
    const res = await getMapInfo(params);
    setDiseaseList(res?.data || []);
  };

  useEffect(() => {
    const taskInfo: any = sessionStorage.getItem('taskInfo');
    setTaskStatus(JSON.parse(taskInfo)?.taskStatus);
    setPatrolTaskId(JSON.parse(taskInfo)?.id);
    setFacilityId(JSON.parse(taskInfo)?.facilitiesId);
    // setEndTime(JSON.parse(taskInfo)?.endTime);
    getDisease(
      props?.proName === 'mpgs'
        ? {
            patrolTaskId: JSON.parse(taskInfo)?.id,
            typeList,
            // page: currentPage,
            // pageSize: tabpagesize,
            reviewStatus,
            pushStatus,
            openStatus,
            startTime: pickTime?.startTime,
            endTime: pickTime?.endTime,
            severity,
          }
        : {
            patrolTaskId: JSON.parse(taskInfo)?.id,
            typeList,
            // page: currentPage,
            // pageSize: tabpagesize,
            reviewStatus,
            severity,
          },
    );
    if (window.matchMedia('(max-width: 1500px)').matches) {
      setBigScreen(false);
    } else {
      setBigScreen(true);
    }
  }, []);

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

  // useEffect(() => {
  //   setSelectedRowKey([]);
  // }, [typeList, reviewStatus]);

  useEffect(() => {
    if (isShowMap) {
      if (window.matchMedia('(max-width: 1500px)').matches) {
        setBigScreen(false);
      } else {
        setBigScreen(true);
      }
    }
  }, [window.matchMedia('(max-width: 1500px)').matches]);

  // 点击查询
  const onSearch = (type: boolean, isClear: boolean = false) => {
    if (!type) setCurrentPage(1);
    setSelectedRowKey([]);
    ref.current.reload();
    getDisease(
      props?.proName === 'mpgs'
        ? {
            patrolTaskId,
            typeList: isClear ? undefined : typeList,
            // page: currentPage,
            // pageSize: tabpagesize,
            reviewStatus: isClear ? undefined : reviewStatus,
            pushStatus: isClear ? undefined : pushStatus,
            openStatus: isClear ? undefined : openStatus,
            startTime: isClear ? undefined : pickTime?.startTime,
            endTime: isClear ? undefined : pickTime?.endTime,
            severity: isClear ? undefined : severity,
          }
        : {
            patrolTaskId,
            typeList: isClear ? undefined : typeList,
            // page: currentPage,
            // pageSize: tabpagesize,
            reviewStatus: isClear ? undefined : reviewStatus,
            severity: isClear ? undefined : severity,
          },
    );
  };

  const onLoad = (dataSource: any) => {
    if (!dataSource?.length) {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        setCurrentPage(1);
      }
    }
    setTableData(dataSource);
  };

  // 判断是否有表格上面操作按钮权限，给特定样式
  const isExist = () => {
    const arrlist = [
      'InspectManage/diseaseData:btn_update',
      'InspectManage/InspectDetail:btn_export', // 导出病害结果按钮
      'InspectManage/InspectDetail:btn_exportPdf', // 导出病害报告
      'InspectManage/InspectDetail:btn_batchCheck',
      'InspectManage/diseaseData:btn_update',
    ];
    const rec = arrlist.some((it: string) => {
      if (access[it]) {
        return true;
      }
      return false;
    });
    return rec;
  };

  // 盐城单独有的导出结果
  const exportResult = async () => {
    const params: any = {
      inspectionId: patrolTaskId,
    };
    commonExport({ ...requestList[4], params });
  };
  const updateStake = async () => {
    const params = { TaskId: patrolTaskId };
    const res = await commonRequest({ ...requestList[6], params });
    if (res.status === 0) {
      message.success({
        content: '已完成桩号更新！',
        key: '已完成桩号更新！',
      });
      onSearch(false);
      if (isShowMap) {
        mapRef?.current?.getPathAndStake();
      }
    }
  };
  const batchExport = async () => {
    const params: any =
      props?.proName === 'mpgs'
        ? {
            ids: selectedRowKey,
            patrolTaskId,
            reviewStatus,
            typeList,
            page: currentPage,
            pageSize: tabpagesize,
            pushStatus,
            openStatus,
            startTime: pickTime?.startTime,
            endTime: pickTime?.endTime,
            severity,
          }
        : {
            ids: selectedRowKey,
            patrolTaskId,
            reviewStatus,
            typeList,
            page: currentPage,
            pageSize: tabpagesize,
            severity,
          };
    commonExport({ ...requestList[2], params });
  };

  // 到处病害报告
  const exportPdf = () => {
    if (!selectedRowKey?.length) {
      message.warning({
        content: '需要选中数据进行病害报告导出',
        key: '需要选中数据进行病害报告导出',
      });
      return;
    }
    const params: any = {
      ids: selectedRowKey,
      patrolTaskId,
      // reviewStatus,
      // typeList,
    };

    commonExport({ ...requestList[1], params }, 'application/octet-stream');
  };

  // 表格选中变化
  const onSelectChange = (selectedRowKeys: any) => {
    setSelectedRowKey(selectedRowKeys);
  };

  // 点击表格行
  const clickRow = (record: any) => {
    const arr = selectedRowKey.filter((i: any) => i !== record.id);
    if (selectedRowKey.includes(record.id)) setSelectedRowKey(arr);
    else setSelectedRowKey([...arr, record.id]);
  };

  // 表格变化
  const changetabval = (text: any) => {
    if (text?.current !== currentPage) setCurrentPage(text.current as number);
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
    setSelectedRowKey([]);
  };

  const handletreeselect = (value: any) => {
    setTypeList(value);
  };

  // 清除
  const onSelNull = () => {
    setBtnType(3);
    setReviewStatus(undefined);
    setTypeList(undefined);
    setPushStatus(undefined);
    setTimerDate([undefined, undefined]);
    setPickTime({ startTime: undefined, endTime: undefined });
    setOpenStatus([]);
    setSeverity(undefined);
    if (childRef?.current) {
      childRef?.current.clearFunc(true);
    }
    if (btnType === 3) setTimerDate([undefined, undefined]);
    onSearch(false, true);
  };

  const catMap = (row: any) => {
    setIsShowMap(true);
    setDiseaseType(row?.diseaseType);
    setRowId(row?.id);
    setCurrentTime(new Date().valueOf());
  };

  const hasClassName = () => {
    if (!isExist()) {
      if (isShowMap) return 'page-table-map-box-nobutton';
      return 'page-table-oneLine-box-nobutton';
    }
    return null;
  };

  const checking = async (params: any) => {
    const res: any = await commonDel(
      '是否完成复核？',
      {
        ...requestList[3],
        params,
      },
      '复核',
    );
    if (res) {
      setSelectedRowKey([]);
      onSearch(true);
    }
  };

  // 复核
  const check = async (record: any, isBatch: boolean) => {
    if (isBatch) {
      const list = tableData
        .filter((item: any) => selectedRowKey.includes(item.id))
        .filter((e: any) => e.reviewStatus !== 1);
      if (list.length < selectedRowKey.length) {
        message.error({
          content: '不能勾选已经复核的数据',
          key: '不能勾选已经复核的数据',
        });
      } else {
        checking(selectedRowKey);
      }
    } else {
      const params = [record.id];
      checking(params);
    }
  };
  useEffect(() => {
    let columnsList: any = [
      {
        title: '序号',
        key: 'id',
        render: (text: any, record: any, index: any) =>
          `${(currentPage - 1) * tabpagesize + (index + 1)}`,
        width: 60,
      },
      {
        title: '物理病害编号',
        dataIndex: 'realDiseaseNo',
        key: 'realDiseaseNo',
        width: 160,
        ellipsis: true,
      },
      {
        title: '图片名称',
        dataIndex: 'fkImgName',
        key: 'fkImgName',
        width: 160,
        ellipsis: true,
      },
      {
        title: '复核状态',
        dataIndex: 'reviewStatusName',
        key: 'reviewStatusName',
        width: 80,
        ellipsis: true,
        render: (_text: any, item: any) => {
          return (
            <Badge
              color={item.reviewStatus === 1 ? '#54A325' : '#999'}
              text={item.reviewStatusName || '未复核'}
            />
          );
        },
      },
      {
        title: '病害类型',
        dataIndex: 'diseaseNameZh',
        key: 'diseaseNameZh',
        width: 80,
        ellipsis: true,
      },
      {
        title: '紧急程度',
        dataIndex: 'diseaseImp',
        key: 'diseaseImp',
        width: 80,
        ellipsis: true,
        valueEnum: urgencyDegree,
      },
      {
        title: '严重程度',
        dataIndex: 'severity',
        key: 'severity',
        width: 80,
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
        width: 160,
        ellipsis: true,
      },
      {
        title: '道路名称',
        dataIndex: 'facilities',
        key: 'facilities',
        width: 120,
        ellipsis: true,
      },
      {
        title: '桩号',
        dataIndex: 'stakeNo',
        key: 'stakeNo',
        width: 100,
        ellipsis: true,
      },
      {
        title: '采集时间',
        dataIndex: 'collectTime',
        key: 'collectTime',
        width: 160,
        ellipsis: true,
      },
      {
        title: '操作',
        key: 'option',
        width: 120,
        fixed: 'right',
        valueType: 'option',
        render: (text: any, record: any) => (
          <Space size="middle">
            {access['InspectManage/InspectDetail:btn_watchMap'] && (
              <a className="ahover" onClick={() => catMap(record)}>
                查看地图
              </a>
            )}
            {access['InspectManage/InspectDetail:btn_check'] && (
              <a
                className={`ahover ${record.reviewStatus !== 1 ? '' : styles.disableCss}`}
                onClick={() => {
                  if (record.reviewStatus === 1) return;
                  check(record, false);
                }}
              >
                复核
              </a>
            )}
          </Space>
        ),
      },
    ];
    if (props.proName === 'mpgs') {
      // columnsList.splice(3, 0, {
      //   title: '推送状态',
      //   dataIndex: 'pushStatus',
      //   key: 'pushStatus',
      //   width: 80,
      //   ellipsis: true,
      //   render: (_text: any, item: any) => {
      //     return (
      //       <Badge
      //         color={item.pushStatus === 1 ? '#54A325' : '#999'}
      //         text={item.pushStatus === 1 ? '已推送' : '未推送'}
      //       />
      //     );
      //   },
      // });

      columnsList = [
        {
          title: '序号',
          key: 'id',
          render: (text: any, record: any, index: any) =>
            `${(currentPage - 1) * tabpagesize + (index + 1)}`,
          width: 60,
        },
        {
          title: '桩号',
          dataIndex: 'stakeNo',
          key: 'stakeNo',
          width: 100,
          ellipsis: true,
        },
        {
          title: '采集时间',
          dataIndex: 'collectTime',
          key: 'collectTime',
          width: 160,
          ellipsis: true,
        },
        {
          title: '物理病害编号',
          dataIndex: 'realDiseaseNo',
          key: 'realDiseaseNo',
          width: 160,
          ellipsis: true,
        },
        {
          title: '图片名称',
          dataIndex: 'fkImgName',
          key: 'fkImgName',
          width: 160,
          ellipsis: true,
        },
        {
          title: '病害类型',
          dataIndex: 'diseaseNameZh',
          key: 'diseaseNameZh',
          width: 80,
          ellipsis: true,
        },
        {
          title: '紧急程度',
          dataIndex: 'diseaseImp',
          key: 'diseaseImp',
          width: 80,
          ellipsis: true,
          valueEnum: urgencyDegree,
        },
        {
          title: '严重程度',
          dataIndex: 'severity',
          key: 'severity',
          width: 80,
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
          width: 120,
          ellipsis: true,
        },
        {
          title: '推送状态',
          dataIndex: 'pushStatus',
          key: 'pushStatus',
          width: 80,
          ellipsis: true,
          render: (_text: any, item: any) => {
            return (
              <Badge
                color={item.pushStatus === 1 ? '#54A325' : '#999'}
                text={item.pushStatus === 1 ? '已推送' : '未推送'}
              />
            );
          },
        },
        {
          title: '复核状态',
          dataIndex: 'reviewStatusName',
          key: 'reviewStatusName',
          width: 80,
          ellipsis: true,
          render: (_text: any, item: any) => {
            return (
              <Badge
                color={item.reviewStatus === 1 ? '#54A325' : '#999'}
                text={item.reviewStatusName || '未复核'}
              />
            );
          },
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

        // {
        //   title: '所在区域',
        //   dataIndex: 'address',
        //   key: 'address',
        //   width: 160,
        //   ellipsis: true,
        // },

        {
          title: '操作',
          key: 'option',
          width: 120,
          fixed: 'right',
          valueType: 'option',
          render: (text: any, record: any) => (
            <Space size="middle">
              {access['InspectManage/InspectDetail:btn_watchMap'] && (
                <a className="ahover" onClick={() => catMap(record)}>
                  查看地图
                </a>
              )}
              {access['InspectManage/InspectDetail:btn_check'] && (
                <a
                  className={`ahover ${record.reviewStatus !== 1 ? '' : styles.disableCss}`}
                  onClick={() => {
                    if (record.reviewStatus === 1) return;
                    check(record, false);
                  }}
                >
                  复核
                </a>
              )}
            </Space>
          ),
        },
      ];
    }
    setColumns(columnsList);
  }, []);

  const handleDataPush = async () => {
    const hide = message.warning({
      content: '数据正在推送中，请稍候！',
      key: '数据正在推送中，请稍候！',
    });
    const res = await pushDisease({ taskId: patrolTaskId });
    hide();
    if (res.status === 0) {
      message.success({
        content: '推送成功',
        key: '推送成功',
      });
    }
  };

  const handleChangeStatus = (val: any) => {
    setOpenStatus(val);
  };

  const disabledDate = (current: any) => {
    return current && current > moment().endOf('day');
  };

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

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `病害数据`,
      children: (
        <>
          <div
            className={` ${styles.topSelect} ${
              props?.proName === 'mpgs' ? 'head-one-box-mpgs' : 'head-one-box'
            }`}
          >
            <div className={`${styles.rowClass}`}>
              <span className={styles.inpBox}>
                病害数量
                <Input
                  className={styles.comClass}
                  autoComplete="off"
                  disabled
                  maxLength={60}
                  placeholder=""
                  value={total}
                />
              </span>
              {/* <span className={styles.inpBox}>
                巡检里程
                <Input
                  className={styles.comClass}
                  disabled
                  autoComplete="off"
                  maxLength={60}
                  placeholder=""
                  value={mileage}
                />
              </span> */}
              <span className={styles.inpBox}>
                复核状态
                <Select
                  allowClear
                  placeholder="请选择"
                  onChange={(e) => setReviewStatus(e)}
                  value={reviewStatus}
                >
                  {Object.keys(checkStatusEnum).map((item: any) => (
                    <Option key={item} value={item * 1}>
                      {checkStatusEnum[item]}
                    </Option>
                  ))}
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
              <span className={styles.inpBox}>
                病害类型
                <MutiSelect urgency={2} onRef={childRef} handletreeselect={handletreeselect} />
              </span>
              {props.proName === 'mpgs' && (
                <span className={styles.inpBox}>
                  推送状态
                  <Select
                    allowClear
                    placeholder="请选择"
                    onChange={(e) => setPushStatus(e)}
                    value={pushStatus}
                  >
                    {Object.keys(PUSH_STATUES).map((item: any) => (
                      <Option key={item} value={item * 1}>
                        {PUSH_STATUES[item]}
                      </Option>
                    ))}
                  </Select>
                </span>
              )}
              {props.proName !== 'mpgs' && (
                <div className={styles.selBtnBox}>
                  <Button
                    type="primary"
                    onClick={() => {
                      onSearch(false);
                    }}
                  >
                    查询
                  </Button>
                  <Button
                    onClick={() => {
                      onSelNull();
                    }}
                  >
                    清除
                  </Button>
                </div>
              )}
            </div>
            {props.proName === 'mpgs' && (
              <div className={`${styles.rowClass}`} style={{ marginTop: '20px' }}>
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
                    value={openStatus}
                    onChange={handleChangeStatus}
                    maxTagCount={'responsive'}
                    style={{ marginRight: 0 }}
                    allowClear
                    placeholder="请选择"
                  />
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
                        defaultValue: [
                          moment('00:00:00', 'HH:mm:ss'),
                          moment('23:59:59', 'HH:mm:ss'),
                        ],
                      }}
                      disabledDate={disabledDate}
                      onChange={timeRangeSelect}
                      value={timerDate}
                    />
                  </span>
                </span>
                <div className={styles.selBtnBox}>
                  <Button
                    type="primary"
                    onClick={() => {
                      onSearch(false);
                    }}
                  >
                    查询
                  </Button>
                  <Button
                    onClick={() => {
                      onSelNull();
                    }}
                  >
                    清除
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div className={'row-button'}>
            {access['InspectManage/diseaseData:btn_update'] && (
              <Button
                type="primary"
                onClick={updateStake}
                disabled={![3, 4, 5].includes(taskStatus)}
              >
                更新桩号
              </Button>
            )}
            {Platform_Flag === 'yancheng' && (
              <Button type="primary" onClick={exportResult}>
                导出结果
              </Button>
            )}
            {access['InspectManage/InspectDetail:btn_export'] && (
              <Button onClick={batchExport} disabled={!total}>
                导出病害列表
              </Button>
            )}
            {access['InspectManage/InspectDetail:btn_exportPdf'] && (
              <Button
                className={'buttonClass'}
                onClick={exportPdf}
                disabled={!selectedRowKey?.length}
              >
                导出病害报告
              </Button>
            )}
            {access['InspectManage/InspectDetail:btn_batchCheck'] && (
              <Button
                className={'buttonClass'}
                disabled={selectedRowKey.length === 0 || ![3, 4, 5].includes(taskStatus)}
                onClick={() => check(null, true)}
              >
                批量复核
              </Button>
            )}
            {access['InspectManage/InspectDetail:btn_dataPush'] && props.proName === 'mpgs' && (
              <Button className={'buttonClass'} onClick={() => handleDataPush()}>
                数据推送
              </Button>
            )}
          </div>
          <div className={`${props?.proName === 'mpgs' ? 'mpgs' : 'noMpgs'}`}>
            <div
              className={`${
                isShowMap ? 'page-table-map-box' : 'page-table-oneLine-box'
              }  ${hasClassName()}`}
            >
              <ProTable
                columns={columns}
                onLoad={onLoad}
                params={
                  {
                    // reviewStatus,
                    // typeList,
                    // patrolTaskId,
                  }
                }
                request={async (params) => {
                  const obj =
                    props?.proName === 'mpgs'
                      ? {
                          reviewStatus,
                          typeList,
                          patrolTaskId,
                          pushStatus,
                          openStatus,
                          startTime: pickTime?.startTime,
                          endTime: pickTime?.endTime,
                          severity,
                        }
                      : {
                          reviewStatus,
                          typeList,
                          patrolTaskId,
                          severity,
                        };
                  Object.assign(params, obj);
                  const res = await getListInfo(params);
                  // setMileage(`${res?.mileage} km`);
                  setTotal(`${res?.total} 个`);
                  // setCurPageList(res?.data || []);
                  return res;
                }}
                rowKey="id"
                rowSelection={{
                  selectedRowKeys: selectedRowKey,
                  type: 'checkbox',
                  onChange: onSelectChange,
                }}
                onRow={(record: any) => {
                  return {
                    onClick: (e: any) => {
                      // if (record.reviewStatus === 1) return;
                      if (
                        e?.target &&
                        (e?.target?.nodeName === 'svg' || e?.target?.nodeName === 'path')
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
                pagination={{
                  showQuickJumper: false,
                  current: currentPage,
                  defaultPageSize: 20,
                  showSizeChanger: true,
                  pageSizeOptions: ['10', '20', '50', '100', '500'],
                }}
                tableAlertRender={false}
                toolBarRender={false}
                search={false}
                actionRef={ref}
                scroll={scrollObj || { x: '100%' }}
                onChange={changetabval}
              />
            </div>
          </div>
          <PullUp className={`${isShowMap ? styles.pullupMap : styles.pullup}`} />
          <div className={`${isShowMap ? styles.pullupContentMap : styles.pullupContent}`}>
            <a className={`${styles.mapIcon} ahover`}>{isShowMap ? <Down /> : <Up />}</a>
            <a
              onClick={() => {
                const isPull = !isShowMap;
                setRowId(null);
                setIsShowMap(isPull);
              }}
              className={`${styles.mapTitle} ahover`}
            >
              <span>地图预览</span>
            </a>
          </div>
          {isShowMap && (
            <div className={styles.mapContainer}>
              <Map
                height={bigScreen ? 300 : 175}
                diseaseList={diseaseList}
                patrolTaskId={patrolTaskId}
                rowId={rowId}
                diseaseType={diseaseType}
                facilityId={facilityId}
                currentTime={currentTime}
                onRef={mapRef}
              />
            </div>
          )}
        </>
      ),
    },
    {
      key: '2',
      label: `路面状况`,
      // disabled: !!(formatNowTime('YYYY-MM-DD') < endTime),
      children: <TecStatus patrolTaskId={patrolTaskId}></TecStatus>,
    },
  ];

  return (
    <div id={styles.taskDetail} className={`${styles.taskPageList}`}>
      <div className={styles.divider} />
      <div
        className={styles.taskBack}
        onClick={() => {
          history.push('/InspectManage/InspectTask');
        }}
      >
        <ListBack />
        <div className={styles.backText}>任务列表</div>
      </div>

      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};
export default TaskDetail;
