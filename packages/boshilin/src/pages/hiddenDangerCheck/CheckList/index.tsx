import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.less';
import { Button, Select, Dropdown, DatePicker, message, Modal, Space, Input } from 'antd';
import moment from 'moment';
import ProTable from '@ant-design/pro-table';
import { getMenuItem } from 'baseline/src/utils/commonMethod';
import { isEqual } from 'lodash';
// ,editRoad,delRoadinfo,
import {
  getListInfo,
  dellistinfo,
  delRoadinfo,
  wordReport,
  getRoadListInfo,
  projectEditShow,
} from './service';
import { adminstrativeLevelValues, typeEnum } from './data.d';
import { useAccess, useHistory } from 'umi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useScrollExpandObj } from 'baseline/src/utils/tableScrollSet';
import type MutiSelect from 'baseline/src/components/MutiSelect';
import { useLocalStorageState } from 'ahooks';
// import { disease3, diseaseObj } from '@/utils/dataDic';
// import { getMenuItem } from 'baseline/src/utils/commonMethod';
import CreateOrEditRoad from './components/CreateOrEditPro';
import CreateProj from './components/CreateProject';
// import { exportCom } from '../../../utils/exportCom';
// import { exportCom } from 'baseline/src/utils/exportCom';
import { useKeepAlive } from 'baseline/src/components/ReactKeepAlive';
import ReportListModal from './components/ReportListModal';

export type Member = {
  startTime: string;
  endTime: string;
  checkType: string;
  querykey: string;
};
const { Option } = Select;
const { RangePicker } = DatePicker;
const { confirm } = Modal;

export default (): React.ReactElement => {
  useKeepAlive('tabs');
  const defalutSearchKey = {
    startTime: undefined,
    endTime: undefined,
    checkType: undefined,
    queryKey: undefined,
  };
  const [todo, setTodo] = useState<string>('proAdd');
  const [edtInfo, setEdtInfo] = useState<any>();
  const [isLoading, setIsLoading] = useState<any>({});
  const [pickTime, setPickTime] = useState<any>({ startTime: undefined, endTime: undefined });
  const [btnType, setBtnType] = useState(3);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const childRef: any = useRef<React.ElementRef<typeof MutiSelect>>();
  const [timerDateCopy, setTimerDateCopy] = useLocalStorageState<any>('timerDateCopy', {
    timerDateCopy: [undefined, undefined],
  });
  const [timerDate, setTimerDate] = useState<any>([undefined, undefined]);
  const [sonTableData, setSonTableData] = useState<any[]>([]);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(20);
  // const [dataTotal, setDataTotal] = useState<any>();

  const [checkType, setCheckType] = useState('');
  const [queryKey, setQueryKey] = useState('');
  // const [projId, setProjId] = useState<string>('');
  const [innerDatas, setInnerDatas] = useState<any>({});

  const [tableData, setTableData] = useState([]);
  const access: any = useAccess();
  const history = useHistory();
  const [searchPage, setSearchPage] = useState(1);

  const [searchKey, setSearchKey] = useState<any>({
    startTime:
      (timerDateCopy[0] && moment(timerDateCopy[0]).format('YYYY-MM-DD HH:mm:ss')) ||
      pickTime.startTime,
    endTime:
      (timerDateCopy[1] && moment(timerDateCopy[1]).format('YYYY-MM-DD HH:mm:ss')) ||
      pickTime.endTime,
    checkType: '',
    queryKey: '',
  });

  const actionRef = useRef<any>();
  const actionSonRef = useRef<any>();
  // const [imgFlag, setImgFlag] = useState(false);
  const scrollObj = useScrollExpandObj(
    tableData,
    { x: 1660, y: 'calc(100vh - 220px)' },
    sonTableData,
    !!expandedRowKeys?.length,
  );

  // const [curPreviewRowId, setCurPreviewRowId] = useState<string>('');

  // 创建|编辑项目
  const [isShowProModal, setIsShowProModal] = useState<boolean>(false);
  // 创建|编辑道路
  const [isShowRoadModal, setIsShowRoadModal] = useState<boolean>(false);

  const [visibleReportList, setVisibleReportList] = useState<boolean>(false);
  const [rowInfo, setRowInfo] = useState<any>({});

  useEffect(() => {
    if (btnType === 0) {
      setTimerDate([moment().startOf('day'), moment().endOf('day')]);
      setPickTime({
        startTime: moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      });
    } else if (btnType === 1) {
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
    }
  }, [btnType]);
  const disabledDate = (current: any) => {
    return current && current > moment().endOf('day');
  };
  // 获取设施列表
  useEffect(() => {
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

  // const getIds = (type: any, id?: any) => {
  //   let ids: any = [];
  //   if (type === 'batch') {
  //     ids = selectedRowKey?.length === 0 ? [] : selectedRowKey;
  //   } else {
  //     ids = [id];
  //   }
  //   return ids;
  // };
  const getData = async (id: any) => {
    let innerData: any[] = [];
    const res = await getRoadListInfo({ projectId: id });
    if (res?.status === 0 && res?.data?.length) {
      innerData = res?.data.map((it: any, index: number) => {
        return { ...it, key: it?.id, num: index + 1 };
      });
    }
    setInnerDatas((state: any) => ({
      ...state,
      [id]: innerData,
    }));
    setSonTableData(innerData);
    setIsLoading({
      [id]: false,
    });
  };
  const handleDel = (deleteType: any, text?: any) => {
    const params =
      deleteType === 'road' ? { id: text?.id, projectId: text?.fkProId } : { idList: [text?.id] };
    confirm({
      title: deleteType !== 'road' ? '项目信息将删除，是否继续？' : '道路信息将删除，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          const res = deleteType !== 'road' ? await dellistinfo(params) : await delRoadinfo(params);
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            // setSelectedRowKey([]);
            if (deleteType === 'road') {
              getData(text?.fkProId);
            }
            actionRef.current.reload();
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
  const handleAddPro = (type?: string) => {
    setIsShowProModal(true);
    if (type === 'add') {
      setEdtInfo({});
      setTodo('proAdd');
      // setIsCreatePro(true);
    } else {
      // setIsCreatePro(false);
      setTodo('proEdit');
    }
  };
  const handleExport = async (e: any, row: any, isSubRow?: boolean) => {
    let newType = e?.key === 'all' ? 1 : 2;
    const params = {
      projectId: row?.id,
      type: newType,
    };
    if (isSubRow) {
      newType = 3;
      params.projectId = row.fkProId;
      params.type = 3;
    }
    await wordReport(params);
    // if (res.status === 0) {
    // }
    // if (newType === 2 && res?.data?.size === 0) {
    //   message.error({
    //     content: '没有数据，无法导出',
    //     key: '没有数据，无法导出',
    //   });
    //   return;
    // }
    // exportCom(
    //   res,
    //   undefined,
    //   [1, 3].includes(newType) ? 'application/msword' : 'application/octet-stream',
    // );
    // // exportCom(res);
    // message.success({
    //   content: '导出成功',
    //   key: '导出成功',
    // });
  };
  // 编辑项目点击的时候需要额外调用一个接口查询道路设施进行回填
  const getProjEditInfo = async (id: string) => {
    // let rec: any = [];
    try {
      const res = await projectEditShow({ projectId: id });
      if (res?.status === 0) {
        setEdtInfo(res?.data || {});
      }
    } catch (error) {
      // rec = [];
      setEdtInfo({});
    }
  };
  const handleProjEdit = (row: any) => {
    // if (row.checkStatus === 1) {
    //   message.warning({
    //     content: '已完成的数据不可编辑',
    //     key: '已完成的数据不可编辑',
    //   });
    //   return;
    // }
    if (row?.id) {
      getProjEditInfo(row?.id);
    }
    handleAddPro('edit');
  };
  // const handleSelect = (e: any, currentItem: any) => {
  //   if (e?.key === 'edit') {
  //     if (currentItem.checkStatus === 1) {
  //       message.warning({
  //         content: '已完成的数据不可编辑',
  //         key: '已完成的数据不可编辑',
  //       });
  //       return;
  //     }
  //     setEdtInfo(currentItem);
  //     handleAddPro('edit');
  //   } else if (e?.key === 'delete') {
  //     handleDel('single', currentItem);
  //   } else if (e?.key === 'export') {
  //     handleExport(currentItem);
  //   }
  // };
  // const handleGoSecenePage = (row: any) => {
  //   history.push(`/hiddenDangerCheck/CheckList/sceneDetail`);
  //   sessionStorage.setItem('checkList_proId', row?.id);
  //   sessionStorage.setItem('checkList_fkFacId', row?.fkFacId);
  // };
  const handleGoDetailPage = (row: any) => {
    history.push(`/hiddenDangerCheck/CheckList/detail`);
    // sessionStorage.setItem('checkList_proId', row?.id);
    sessionStorage.setItem('checkList_proId', row?.fkProId);
    sessionStorage.setItem('checkList_roadId', row?.id);
  };
  const handleCloseProModal = () => {
    setIsShowProModal(false);
  };
  const handleCloseRoadModal = () => {
    setIsShowRoadModal(false);
  };
  const onsetkey = (id?: any) => {
    actionRef.current.reload();
    if (id) {
      getData(id);
    }
  };

  const handleReportList = (row: any) => {
    setVisibleReportList(true);
    setRowInfo(row);
  };

  const columnParent: any = [
    {
      title: '序号',
      key: 'nums',
      render: (text: any, record: any, index: any) =>
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
      width: 78,
      ellipsis: true,
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 246,
      ellipsis: true,
    },
    {
      title: '项目编号',
      dataIndex: 'projectNo',
      key: 'projectNo',
      width: 262,
    },
    {
      title: '创建时间',
      dataIndex: 'crtTime',
      key: 'crtTime',
      width: 229,
      ellipsis: true,
    },
    {
      title: '场景标定',
      dataIndex: 'calibrationStatus',
      key: 'calibrationStatus',
      width: 189,
      valueEnum: typeEnum,
    },
    {
      title: '隐患排查',
      dataIndex: 'checkStatus',
      key: 'checkStatus',
      width: 189,
      valueEnum: typeEnum,
    },
    {
      title: '事故上传',
      dataIndex: 'uploadStatus',
      key: 'uploadStatus',
      width: 189,
      valueEnum: typeEnum,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 280,
      render: (row: any) => {
        const menulist: any = [];
        menulist.push({ key: 'all', name: '全部' });
        menulist.push({ key: 'some', name: '辖区' });
        const menuItems = menulist.map((it: any) => {
          return getMenuItem(it?.name, it?.key);
        });
        return (
          <Space size="middle">
            {access['hiddenDangerCheck/CheckList/index:btn_parent_edit'] && (
              <a
                className="ahover"
                onClick={() => {
                  handleProjEdit(row);
                }}
              >
                编辑
              </a>
            )}
            {access['hiddenDangerCheck/CheckList/index:btn_parent__del'] && (
              <a
                className="ahover"
                onClick={() => {
                  handleDel('project', row);
                }}
              >
                删除
              </a>
            )}
            {access['hiddenDangerCheck/CheckList/index:btn__export'] && menulist?.length > 0 ? (
              <Dropdown
                menu={{ items: menuItems, onClick: (key: any) => handleExport(key, row) }}
                // overlay={() => {
                //   return (
                //     <Menu onClick={(key: any) => handleExport(key, row)} items={menuItems}></Menu>
                //   );
                // }}
              >
                <span className="ahover">
                  报告生成<span className="dropDownIcon"></span>
                </span>
              </Dropdown>
            ) : null}
            {access['hiddenDangerCheck/CheckList/index:btn_reportList'] && (
              <a
                className="ahover"
                onClick={() => {
                  handleReportList(row);
                }}
              >
                报告列表
              </a>
            )}
            {/* <Dropdown
              overlay={() => {
                return (
                  <Menu onClick={(key: any) => handleSelect(key, text)} items={menuItems}></Menu>
                );
              }}
            >
              <span className="dropDownNameClass ahover">
                更多<span className="dropDownIcon"></span>
              </span>
            </Dropdown> */}
          </Space>
        );
      },
    },
  ];

  // 选中当前行
  // const onSelectChange = (selectedRowKeys: any) => {
  //   setSelectedRowKey(selectedRowKeys);
  // };

  // const clickRow = (record: any) => {
  //   const arr = selectedRowKey.filter((i) => i !== record.id);
  //   if (selectedRowKey.includes(record.id)) setSelectedRowKey(arr);
  //   else setSelectedRowKey([...arr, record.id]);
  // };
  const changetabval = (text: any) => {
    if (text?.current !== searchPage) {
      setSearchPage(text?.current as number);
      setTabpage(text?.current as number);
    }
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
    // setSelectedRowKey([]);
  };
  const onload = (dataSource: any) => {
    if (!dataSource?.length) {
      if (searchPage > 1) {
        setSearchPage(searchPage - 1);
      } else {
        setSearchPage(1);
      }
    }
    if (dataSource?.length > 0 && tableData.length !== dataSource?.length) {
      setTableData(dataSource);
    }
  };
  const changeCode = (sel: any) => {
    setCheckType(sel);
  };
  const onSearch = () => {
    setSearchKey({
      startTime: pickTime.startTime,
      endTime: pickTime.endTime,
      checkType,
      queryKey,
    });
    setSearchPage(1);
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
  }, [pickTime]);
  const clearPage = () => {
    if (!isEqual(defalutSearchKey, searchKey)) {
      setSearchPage(1);
      setSearchKey({ ...defalutSearchKey });
      actionRef.current.reload();
    }
  };
  const resetSearch = () => {
    setBtnType(3);
    setTimerDate([undefined, undefined]);
    setPickTime({ startTime: undefined, endTime: undefined });
    setQueryKey('');
    setCheckType('');
    if (childRef?.current) {
      childRef?.current.clearFunc(true);
    }
    if (btnType === 3) setTimerDate([undefined, undefined]);
    clearPage();
  };

  const debouceSearch = (e: any) => {
    setQueryKey(e.target.value);
  };

  // 判断是否有表格上面操作按钮权限，给特定样式
  const isExist = () => {
    const arrlist = ['InspectManage/InspectTask:btn_export'];
    const rec = arrlist.some((it: string) => {
      if (access[it]) {
        return true;
      }
      return false;
    });
    return rec;
  };
  const handleRoadEdit = (type: string, row: any) => {
    if (row.checkStatus === 1) {
      message.warning({
        content: '已完成的数据不可编辑',
        key: '已完成的数据不可编辑',
      });
      return;
    }
    setEdtInfo(type === 'roadEdit' ? row : {});
    setTodo(type);
    setIsShowRoadModal(true);
  };

  const handleGenerateReport = (row: any) => {
    handleExport('', row, true);
  };
  // 嵌套表格
  const expandedRowRender = (record: any) => {
    const data: any[] = innerDatas[record.id];

    const columnSon: any = [
      {
        title: '序号',
        key: 'num',
        dataIndex: 'num',
        // render: (text: any, record: any, index: any) =>
        //   `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
        width: 78,
        ellipsis: true,
      },
      {
        title: '道路名称',
        dataIndex: 'fkFacName',
        key: 'fkFacName',
        // width: '20.57%',
        ellipsis: true,
      },
      {
        title: '行政等级',
        dataIndex: 'grade',
        key: 'grade',
        // width: '20.57%',
        ellipsis: true,
        render: (text: any, row: any) => {
          return row?.grade && adminstrativeLevelValues[row?.grade];
        },
      },
      {
        title: ' 起点',
        dataIndex: 'startPoint',
        key: 'startPoint',
        // width: '20.57%',
        // valueEnum: {
        //   0: { text: '非紧急' },
        //   1: { text: '紧急' },
        // },
      },
      {
        title: '终点',
        dataIndex: 'endPoint',
        key: 'endPoint',
        // width: '19.58%',
        ellipsis: true,
        // render: (text: any, recode: any) => {
        //   return `${recode.longitude}, ${recode.latitude}`;
        // },
      },
      {
        title: '操作',
        key: 'action',
        // fixed: 'right',
        width: 280,
        render: (text: any) => {
          return (
            <Space size="middle">
              {access['hiddenDangerCheck/CheckList/index:btn_son_detail'] && (
                <a
                  className="ahover"
                  onClick={() => {
                    handleGoDetailPage(text);
                  }}
                >
                  详情
                </a>
              )}
              {access['hiddenDangerCheck/CheckList/index:btn_son_edit'] && (
                <a
                  className={`ahover ${text?.checkStatus === 1 ? 'disableCss' : ''}`}
                  onClick={
                    text?.checkStatus === 1
                      ? () => {}
                      : () => {
                          handleRoadEdit('roadEdit', text);
                        }
                  }
                >
                  编辑
                </a>
              )}
              {access['hiddenDangerCheck/CheckList/index:btn_son_delete'] && (
                <a
                  className={`ahover ${data?.length <= 1 ? 'disableCss' : ''}`}
                  onClick={
                    data?.length <= 1
                      ? () => {}
                      : () => {
                          handleDel('road', text);
                        }
                  }
                >
                  删除
                </a>
              )}
              {access['hiddenDangerCheck/CheckList/index:btn__export'] && (
                <a className={`ahover`} onClick={() => handleGenerateReport(text)}>
                  报告生成
                </a>
              )}
            </Space>
          );
        },
      },
    ];
    return (
      <ProTable
        // className={styles['expand-check-son-table']}
        actionRef={actionSonRef}
        tableClassName={'expand-table-class'}
        loading={isLoading[record.id] && !data}
        columns={columnSon}
        headerTitle={false}
        search={false}
        options={false}
        dataSource={data}
        pagination={false}
        rowClassName="expand-table_row"
      />
    );
  };

  // 嵌套表格展开 关闭
  const handlerExpand = (expanded: any, record: any) => {
    setIsLoading({
      [record.id]: true,
    });
    if (expanded) {
      setExpandedRowKeys([record?.id]);
      // setProjId(record?.id);
      getData(record?.id);
    } else {
      setExpandedRowKeys([]);
    }
  };
  const refreshPage = (id: any) => {
    getData(id);
  };

  return (
    <div className={`${styles.baseListWrapper} page-list-common page-normal baseLineWrapper`}>
      <div className={` ${styles.topSelect}`}>
        <div className={`${styles.rowClass}`}>
          <span className={styles.inpBox}>
            综合搜索
            <Input
              className={styles.comClass}
              autoComplete="off"
              maxLength={60}
              placeholder="请输入项目名称"
              value={queryKey}
              onChange={(e: any) => debouceSearch(e)}
            />
          </span>
          <span className={styles.inpBox}>
            排查状态
            <Select
              className={styles.comClass}
              allowClear
              placeholder="请选择"
              onChange={changeCode}
              value={checkType}
            >
              <Option value={0}>未完成</Option>
              <Option value={1}>已完成</Option>
            </Select>
          </span>
          <span className={` ${styles.timerBox}`}>
            <span style={{ minWidth: '65px' }}>采集时间</span>
            <div
              onClick={() => setBtnType(0)}
              className={`${styles.dateSel} ${btnType === 0 && styles.btnLight}`}
            >
              今日
            </div>
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
                disabled={btnType === 1 || btnType === 2 || btnType === 0}
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
            <span className={styles.selBtnBox}>
              <Button
                type="primary"
                onClick={() => {
                  onSearch();
                }}
              >
                查询
              </Button>
              <Button
                onClick={() => {
                  resetSearch();
                }}
              >
                清除
              </Button>
            </span>
          </span>
        </div>
      </div>
      <div className={styles.rowButton}>
        {access['hiddenDangerCheck/CheckList/index:btn_add'] && (
          <Button className={'buttonClass'} type="primary" onClick={() => handleAddPro('add')}>
            创建
          </Button>
        )}
        {/* {access['hiddenDangerCheck/CheckList/index:btn_del_batch'] && (
          <Button
            className={'buttonClass'}
            disabled={selectedRowKey.length === 0}
            // className="kong-btn"
            // disabled={selectedRowKey.length === 0}
            onClick={() => handleDel('batch')}
          >
            批量删除
          </Button>
        )} */}
      </div>
      <div
        className={`page-table-one-box expand_table_wrapper check-list-table ${
          isExist() ? null : `page-table-one-box-nobutton`
        }`}
      >
        <ProTable<Member>
          columns={columnParent}
          actionRef={actionRef}
          className={styles['expand-check-table']}
          request={async (params) => {
            const res = await getListInfo(params);
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
            checkStatus: searchKey.checkType,
            projectName: searchKey.queryKey,
          }}
          rowKey="id"
          // rowSelection={{
          //   selectedRowKeys: selectedRowKey,
          //   type: 'checkbox',
          //   onChange: onSelectChange,
          // }}
          // onRow={(record) => {
          //   return {
          //     onClick: (e: any) => {
          //       if (
          //         e?.target &&
          //         (e?.target?.nodeName === 'svg' || e?.target?.nodeName === 'path')
          //       ) {
          //         return;
          //       }
          //       if (
          //         e?.target &&
          //         (e.target?.className.indexOf('ahover') > -1 ||
          //           e.target?.className.indexOf('ant-dropdown-menu-title-content') > -1)
          //       ) {
          //         return;
          //       }
          //       clickRow(record);
          //     }, // 点击行
          //   };
          // }}
          tableAlertRender={false}
          pagination={{
            showQuickJumper: false,
            // defaultPageSize: 20,
            current: searchPage,
            // pageSizeOptions: ['10', '20', '50', '100', '500'],
          }}
          toolBarRender={false}
          search={false}
          scroll={scrollObj || { x: '100%' }}
          onChange={changetabval}
          onLoad={onload}
        />
      </div>

      {isShowRoadModal && (
        <CreateOrEditRoad
          modalShow={isShowRoadModal}
          todo={todo}
          // isCreate={isCreatePro}
          edtInfo={edtInfo}
          onsetkey={refreshPage}
          onCancel={() => handleCloseRoadModal()}
        />
      )}
      {isShowProModal && (
        <CreateProj
          modalShow={isShowProModal}
          todo={todo}
          rowInfo={edtInfo}
          refreshPage={onsetkey}
          onCancel={() => handleCloseProModal()}
        />
      )}
      {visibleReportList && (
        <ReportListModal
          visible={visibleReportList}
          rowInfo={rowInfo}
          onCancel={() => {
            setVisibleReportList(false);
          }}
          onOk={() => {
            setVisibleReportList(false);
          }}
        />
      )}
    </div>
  );
};
