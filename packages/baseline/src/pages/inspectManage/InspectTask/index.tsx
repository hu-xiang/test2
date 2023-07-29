import React, { useState, useEffect, useRef } from 'react';
import { Input, Select, Button, Space, DatePicker, message, Badge } from 'antd';
import { taskStatusEnum, colorStatusEnum } from './enum';
import styles from './styles.less';
import { useAccess, useHistory } from 'umi';
import { ProTable } from '@ant-design/pro-table';
import { getListInfo, exportTasks } from './serves';
import { useLocalStorageState } from 'ahooks';
import { exportCom } from '../../../utils/exportCom';
import { useScrollObjSta } from '../../../utils/tableScrollSet';
import { useKeepAlive } from '../../../components/ReactKeepAlive';
// import { useActivate } from 'react-activation';
import { isEqual } from 'lodash';
import moment from 'moment';

const { Option } = Select;
const { RangePicker } = DatePicker;
type Iprops = {
  importColumns?: any;
};
// let timer: any = null;
const InspectTask: React.FC<Iprops> = (props) => {
  useKeepAlive();
  const access: any = useAccess();
  const history: any = useHistory();
  const ref: any = useRef();
  const [flag, setFlag] = useState<boolean>(false);
  const [keyword, setKeyword] = useState<any>('');
  const [taskStatus, setTaskStatus] = useState<any>(null);
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);
  const [currentPage, setCurrentPage] = useState<any>(1);
  // 表格每页数量
  const [tabpagesize, setTabpagesize] = useState<any>(20);
  const [btnType, setBtnType] = useState(3);
  const [tableData, setTableData] = useState<any>([]);
  const scrollObj = useScrollObjSta(tableData, { x: 1400, y: 'calc(100vh - 220px)' });
  const [timerDate, setTimerDate] = useState<any>([undefined, undefined]);
  const [pickTime, setPickTime] = useState<any>({
    startTime: moment().startOf('month').format('YYYY-MM-DD HH:mm:ss'),
    endTime: moment().endOf('month').format('YYYY-MM-DD HH:mm:ss'),
  });
  const [timerDateCopy, setTimerDateCopy] = useLocalStorageState<any>('timerDateCopy', {
    timerDateCopy: [undefined, undefined],
  });
  const [searchKey, setSearchKey] = useState<any>({
    startTime:
      (timerDateCopy[0] && moment(timerDateCopy[0]).format('YYYY-MM-DD HH:mm:ss')) ||
      pickTime.startTime,
    endTime:
      (timerDateCopy[1] && moment(timerDateCopy[1]).format('YYYY-MM-DD HH:mm:ss')) ||
      pickTime.endTime,
    keyword,
    taskStatus,
  });
  const defalutSearchKey = {
    startTime: undefined,
    endTime: undefined,
    keyword: undefined,
    taskStatus: undefined,
  };
  // 点击查询
  const onSearch = (type: boolean) => {
    if (!type) setCurrentPage(1);
    ref.current.reload();
    if (flag) {
      setSelectedRowKey([]);
      setFlag(false);
    }
  };

  useEffect(() => {
    setFlag(true);
    setSearchKey({
      startTime: pickTime.startTime,
      endTime: pickTime.endTime,
      keyword,
      taskStatus,
    });
    const listener = (event: any) => {
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        event.preventDefault();
        onSearch(false);
      }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [pickTime, keyword, taskStatus]);

  // useActivate(() => {
  //   timer = setInterval(() => {
  //     onSearch(true);
  //   }, 5000);
  // });

  useEffect(() => {
    // timer = setInterval(() => {
    //   onSearch(true);
    // }, 5000);
    return () => {
      // clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (btnType === 0) {
      setTimerDate([moment().startOf('day'), moment().endOf('day')]);
      setPickTime({
        startTime: moment().startOf('day').format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment().endOf('day').format('YYYY-MM-DD HH:mm:ss'),
      });
    } else if (btnType === 1) {
      setTimerDate([moment().startOf('week'), moment().endOf('week')]);
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

  // 查询自定义日期设置
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

  const onLoad = (dataSource: any) => {
    if (!dataSource?.length) {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        setCurrentPage(1);
      }
    }
    if (tableData.length !== dataSource.length) {
      setTableData(dataSource);
    }
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
  const clearPage = () => {
    if (!isEqual(defalutSearchKey, searchKey)) {
      setCurrentPage(1);
      setSearchKey({ ...defalutSearchKey });
      ref.current.reload();
    }
  };
  // 清除
  const onSelNull = () => {
    setBtnType(3);
    setTimerDate([undefined, undefined]);
    setPickTime({ startTime: undefined, endTime: undefined });
    setKeyword(undefined);
    setTaskStatus(undefined);
    if (btnType === 3) setTimerDate([undefined, undefined]);
    setTimerDateCopy([undefined, undefined]);
    clearPage();
    setSelectedRowKey([]);
  };

  const batchExport = async () => {
    const formData: any = {
      ids: selectedRowKey,
      keyword,
      taskStatus,
      startTime: btnType === 3 ? '' : pickTime.startTime,
      endTime: btnType === 3 ? '' : pickTime.endTime,
    };

    const hide = message.loading({
      content: '正在导出',
      key: '正在导出',
    });
    try {
      const res: any = await exportTasks(formData);
      hide();
      exportCom(res);
      message.success({
        content: '导出成功',
        key: '导出成功',
      });
      return true;
    } catch (error) {
      hide();
      message.error({
        content: '导出失败!',
        key: '导出失败!',
      });
      return false;
    }
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

  const goDetail = (record: any) => {
    sessionStorage.setItem('taskInfo', JSON.stringify(record));
    // clearInterval(timer);
    history.push('/InspectManage/TaskDetail');
  };

  const columns: any = props?.importColumns?.length
    ? [
        {
          title: '序号',
          key: 'id',
          render: (text: any, record: any, index: any) =>
            `${(currentPage - 1) * tabpagesize + (index + 1)}`,
          width: 60,
        },
        ...props?.importColumns,
        {
          title: '操作',
          key: 'option',
          width: 80,
          fixed: 'right',
          valueType: 'option',
          render: (text: any, record: any) => (
            <Space size="middle">
              {access['InspectManage/InspectTask:btn_detail'] && (
                <a
                  className={`ahover ${
                    [0, 1].includes(record.taskStatus) ? styles.disableCss : ''
                  }`}
                  onClick={() => {
                    if ([0, 1].includes(record.taskStatus)) return;
                    goDetail(record);
                  }}
                >
                  详情
                </a>
              )}
            </Space>
          ),
        },
      ]
    : [
        {
          title: '序号',
          key: 'id',
          render: (text: any, record: any, index: any) =>
            `${(currentPage - 1) * tabpagesize + (index + 1)}`,
          width: 60,
        },
        {
          title: '道路名称',
          dataIndex: 'facilitiesName',
          key: 'facilitiesName',
          width: 160,
          ellipsis: true,
        },
        {
          title: '道路编码',
          dataIndex: 'roadSection',
          key: 'roadSection',
          width: 160,
          ellipsis: true,
        },
        // {
        //   title: '道路类型',
        //   dataIndex: 'facilitiesTypeName',
        //   key: 'facilitiesTypeName',
        //   width: 80,
        //   ellipsis: true,
        // },
        {
          title: '道路里程（m）',
          dataIndex: 'roadNum',
          key: 'roadNum',
          width: 120,
          ellipsis: true,
        },
        {
          title: '管养单位',
          dataIndex: 'managementUnit',
          key: 'managementUnit',
          ellipsis: true,
          width: 150,
        },
        {
          title: '巡检设备',
          dataIndex: 'deviceName',
          key: 'deviceName',
          width: 100,
          ellipsis: true,
        },
        {
          title: '巡检员',
          dataIndex: 'inspectorName',
          key: 'inspectorName',
          width: 100,
          ellipsis: true,
        },
        {
          title: '任务状态',
          dataIndex: 'taskStatusName',
          key: 'taskStatusName',
          width: 100,
          ellipsis: true,
          render: (text: any, item: any) => {
            return <Badge color={colorStatusEnum[item.taskStatus]} text={item.taskStatusName} />;
          },
        },
        {
          title: '完成度',
          dataIndex: 'completionDegree',
          key: 'completionDegree',
          width: 80,
          ellipsis: true,
        },
        {
          title: '任务开始日期',
          dataIndex: 'startTime',
          key: 'startTime',
          width: 160,
        },
        {
          title: '任务期限',
          dataIndex: 'endTime',
          key: 'endTime',
          width: 160,
        },
        {
          title: '巡检完成时间',
          dataIndex: 'completeTime',
          key: 'completeTime',
          width: 160,
        },
        {
          title: '操作',
          key: 'option',
          width: 80,
          fixed: 'right',
          valueType: 'option',
          render: (text: any, record: any) => (
            <Space size="middle">
              {access['InspectManage/InspectTask:btn_detail'] && (
                <a
                  className={`ahover ${
                    [0, 1].includes(record.taskStatus) ? styles.disableCss : ''
                  }`}
                  onClick={() => {
                    if ([0, 1].includes(record.taskStatus)) return;
                    goDetail(record);
                  }}
                >
                  详情
                </a>
              )}
            </Space>
          ),
        },
      ];

  return (
    <div id={styles.inspectTask} className="page-list-common page-normal">
      <div className={` ${styles.topSelect} head-one-box`}>
        <div className={`${styles.rowClass}`}>
          <span className={styles.inpBox}>
            综合搜索
            <Input
              className={styles.comClass}
              autoComplete="off"
              maxLength={60}
              placeholder="请输入道路名称、巡检设备、巡检员"
              value={keyword}
              onChange={(e: any) => setKeyword(e.target.value)}
            />
          </span>
          <span className={styles.inpBox}>
            任务状态
            <Select
              allowClear
              placeholder="请选择"
              onChange={(e) => setTaskStatus(e)}
              value={taskStatus}
            >
              {Object.keys(taskStatusEnum).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {taskStatusEnum[item]}
                </Option>
              ))}
            </Select>
          </span>
          <span className={styles.timerBox}>
            <span style={{ minWidth: '65px' }}>任务期限</span>
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
                disabled={btnType !== 3}
                inputReadOnly
                format="YYYY-MM-DD HH:mm:ss"
                // disabledDate={disabledDate}
                showTime={{
                  defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                }}
                onChange={timeRangeSelect}
                value={timerDate}
              />
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
          </span>
        </div>
      </div>
      <div className={'row-button'}>
        {access['InspectManage/InspectTask:btn_export'] && (
          <Button className={'buttonClass'} onClick={batchExport} type="primary">
            批量导出
          </Button>
        )}
      </div>
      <div className={`page-table-one-box ${isExist() ? null : `page-table-one-box-nobutton`}`}>
        <ProTable
          columns={columns}
          onLoad={onLoad}
          params={
            {
              // ...searchKey,
              // startTime: pickTime.startTime,
              // endTime: pickTime.endTime,
              // keyword,
              // taskStatus,
            }
          }
          request={async (params) => {
            const obj: any = {
              ...searchKey,
              ...params,
            };

            const res = await getListInfo(obj);
            // 表单搜索项会从 params 传入，传递给后端接口。
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
  );
};
export default InspectTask;
