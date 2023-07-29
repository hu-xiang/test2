import React, { useState, useRef, useEffect } from 'react';
import styles from './styles.less';
import moment from 'moment';
import { ProTable } from '@ant-design/pro-table';
import { Input, Select, Button, Space, message, Modal, DatePicker, Badge } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useAccess, useHistory } from 'umi';
import { useScrollObjSta } from '@/utils/tableScrollSet';
import { useLocalStorageState } from 'ahooks';
import { getListInfo, delOrder } from './service';
import WorkOrderAddOrEdit from '../WorkOrderAddOrEdit';

const { confirm } = Modal;
const { Option } = Select;
const { RangePicker } = DatePicker;
export type TableListItem = {
  id: number;
  orderNum: string | number;
  orderName: string;
  orderType: string | number;
  maintenanceUnit: string;
  facilitiesType: string | number;
  workflowStatusName: string | number;
  workflowStatus: string | number;
  crtTime: string;
  planTime: string;
  reldoneTime: string;
};

export default (): React.ReactElement => {
  // 表格数据
  const [tableData, setTableData] = useState([]);
  // 表格选中行
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);
  // 当前页
  const [searchPage, setSearchPage] = useState(1);
  // 表格每页数量
  const [tabpagesize, setTabpagesize] = useState(20);
  const [workOrderAddOrEditVisible, setWorkOrderAddOrEditVisible] = useState(false);
  // const [isEdit, setIsEdit] = useState(false);
  const [editInfo, setEditInfo] = useState<any>();
  // 综合查询
  const [keyword, setKeyword] = useState();
  // 工单类型
  const [orderType, setOrderType] = useState();
  // 养护单位
  const [maintenanceUnit, setMaintenanceUnit] = useState();
  // 设施类型
  const [facilitiesType, setFacilitiesType] = useState();
  // 状态
  const [workflowStatus, setWorkflowStatus] = useState();
  // 采集时间的按钮类型
  const [btnType, setBtnType] = useState(3);
  //
  const [timerDate, setTimerDate] = useState<any>([undefined, undefined]);
  const [pickTime, setPickTime] = useState<any>({ startTime: undefined, endTime: undefined });
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
    // startTime: pickTime.startTime,
    // endTime: pickTime.endTime,
    orderType,
    maintenanceUnit,
    keyword,
    facilitiesType,
    workflowStatus,
  });
  const scrollObj = useScrollObjSta(tableData, { x: 1200, y: 'calc(100vh - 297px)' });
  const ref = useRef<any>();
  const history = useHistory();
  const orderTypeEnum = {
    0: '小修保养',
    1: '中修工程',
    2: '大修工程',
    3: '改建工程',
  };

  // const facilitiesTypeEnum = {
  //   0: '路基路面',
  //   1: '隧道',
  //   2: '桥梁',
  //   3: '涵洞',
  //   4: '人行道',
  //   5: '边坡',
  // };
  const statusEnum = {
    0: '待处理',
    1: '待验收',
    2: '已完成',
    3: '已超时',
  };

  const colorStatus = {
    0: '#FAB32A',
    1: '#00A3FF',
    2: '#54A325',
    3: '#FF0000',
  };

  useEffect(() => {
    if (btnType === 1) {
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
    }
  }, [btnType]);

  const onLoad = (dataSource: any) => {
    if (!dataSource?.length) {
      if (searchPage > 1) {
        setSearchPage(searchPage - 1);
      } else {
        setSearchPage(1);
      }
    }
    if (tableData.length !== dataSource.length) {
      setTableData(dataSource);
    }
  };
  const access: any = useAccess();

  const setkeywords = () => {
    ref.current.reload();
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
    if (text?.current !== searchPage) {
      setSearchPage(text?.current as number);
    }
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
    setSelectedRowKey([]);
  };

  // 删除
  const delRow = (text: any, isBatch: boolean) => {
    confirm({
      title: '是否删除该工单记录？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const formData = new FormData();
        if (isBatch) formData.append('ids', selectedRowKey);
        else formData.append('ids', text.props.text.id);
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          const res = await delOrder(formData);
          hide();
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            if (isBatch) setSelectedRowKey([]);
            setkeywords();
          } else {
            // message.error({
            //   content: res.message,
            //   key: res.message,
            // });
          }
          return true;
        } catch (error) {
          hide();
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

  // 禁用今天后的日期
  const disabledDate = (current: any) => {
    return current && current > moment().endOf('day');
  };

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

  // 点击查询
  const onSearch = () => {
    setSearchKey({
      startTime: pickTime.startTime,
      endTime: pickTime.endTime,
      orderType,
      maintenanceUnit,
      keyword,
      facilitiesType,
      workflowStatus,
    });
    setSearchPage(1);
    ref.current.reload();
  };

  // 清除
  const onSelNull = () => {
    setBtnType(3);
    setTimerDate([undefined, undefined]);
    setPickTime({ startTime: undefined, endTime: undefined });
    setOrderType(undefined);
    setMaintenanceUnit(undefined);
    setFacilitiesType(undefined);
    setKeyword(undefined);
    setWorkflowStatus(undefined);
    if (btnType === 3) setTimerDate([undefined, undefined]);
    setTimerDateCopy([undefined, undefined]);
  };

  // 判断是否有表格上面操作按钮权限，给特定样式
  const isExist = () => {
    const arrlist = [
      'workordermanage/workorderlist/index:btn_add',
      'workordermanage/workorder/index:btn_delList',
    ];
    const rec = arrlist.some((it: string) => {
      if (access[it]) {
        return true;
      }
      return false;
    });
    return rec;
  };

  // 跳到详情
  const goDetail = (text: any) => {
    const workInfo = {
      ...text.props.text,
    };
    sessionStorage.setItem('workInfo', JSON.stringify(workInfo));
    history.push('/workordermanage/workorderdetail');
  };

  const columns: any = [
    // {
    //   title: '序号',
    //   dataIndex: 'index',
    //   valueType: 'index',
    //   width: 100,
    // },
    {
      title: '序号',
      key: 'id',
      render: (text: any, record: any, index: any) =>
        `${(searchPage - 1) * tabpagesize + (index + 1)}`,
      width: 50,
    },
    {
      title: '工单编号',
      dataIndex: 'orderNum',
      key: 'orderNum',
      width: 160,
      ellipsis: true,
    },
    {
      title: '工单名称',
      dataIndex: 'orderName',
      key: 'orderName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '工单类型',
      dataIndex: 'orderType',
      key: 'orderType',
      width: 100,
      valueEnum: orderTypeEnum,
    },
    {
      title: '养护单位',
      dataIndex: 'maintenanceUnit',
      key: 'maintenanceUnit',
      width: 200,
      ellipsis: true,
    },
    // {
    //   title: '设施类型',
    //   dataIndex: 'facilitiesType',
    //   key: 'facilitiesType',
    //   width: 100,
    // },
    {
      title: '状态',
      dataIndex: 'workflowStatusName',
      key: 'workflowStatusName',
      width: 100,
      ellipsis: true,
      render: (_: any, item: any) => {
        return <Badge color={colorStatus[item.workflowStatus]} text={item.workflowStatusName} />;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'crtTime',
      key: 'crtTime',
      width: 160,
    },
    {
      title: '计划完成时间',
      dataIndex: 'planTime',
      key: 'planTime',
      width: 160,
    },
    {
      title: '实际完成时间',
      dataIndex: 'reldoneTime',
      key: 'reldoneTime',
      width: 160,
    },
    {
      title: '操作',
      key: 'option',
      width: 160,
      fixed: 'right',
      valueType: 'option',
      render: (text: any, record: any) => (
        <Space size="middle">
          {access['workordermanage/workorder/index:btn_detail'] && (
            <a className="ahover" onClick={() => goDetail(text)}>
              详情
            </a>
          )}
          {access['workordermanage/workorder/index:btn_edit'] && (
            <a
              className={`ahover ${record.workflowStatus === 0 ? '' : styles.disableCss}`}
              onClick={() => {
                if (record.workflowStatus !== 0) return;
                setEditInfo(record);
                // setIsEdit(true);
                setWorkOrderAddOrEditVisible(true);
              }}
            >
              编辑
            </a>
          )}
          {access['workordermanage/workorder/index:btn_del'] && (
            <a className="ahover" onClick={() => delRow(text, false)}>
              删除
            </a>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div id={styles.workOrderContainer} className="page-list-common page-normal">
      <div className={` ${styles.topSelect} head-two-box`}>
        <div className={`${styles.rowClass}`}>
          <span className={styles.inpBox}>
            综合搜索
            <Input
              className={styles.comClass}
              autoComplete="off"
              maxLength={60}
              placeholder="请输入工单编号、工单名称等关键字"
              value={keyword}
              onChange={(e: any) => setKeyword(e.target.value)}
            />
          </span>
          <span className={styles.inpBox}>
            工单类型
            <Select
              allowClear
              placeholder="请选择"
              onChange={(e) => setOrderType(e)}
              value={orderType}
            >
              {Object.keys(orderTypeEnum).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {orderTypeEnum[item]}
                </Option>
              ))}
            </Select>
          </span>
          <span className={styles.inpBox}>
            养护单位
            <Input
              className={styles.comClass}
              autoComplete="off"
              maxLength={60}
              placeholder="请输入养护单位"
              value={maintenanceUnit}
              onChange={(e: any) => setMaintenanceUnit(e.target.value)}
            />
          </span>
          <span className={styles.inpBox}>
            状态
            <Select
              allowClear
              placeholder="请选择"
              style={{ marginRight: 0 }}
              onChange={(e) => setWorkflowStatus(e)}
              value={workflowStatus}
            >
              {Object.keys(statusEnum).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {statusEnum[item]}
                </Option>
              ))}
            </Select>
          </span>
          {/* <span className={styles.inpBox}>
            设施类型
            <Select
              allowClear
              placeholder="请选择"
              style={{ marginRight: 0 }}
              onChange={(e) => setFacilitiesType(e)}
              value={facilitiesType}
            >
              {Object.keys(facilitiesTypeEnum).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {facilitiesTypeEnum[item]}
                </Option>
              ))}
            </Select>
          </span> */}
        </div>
        <div className={`${styles.rowClass} `}>
          {/* <span className={styles.inpBox}>
            <span className={styles.colLabel}>状态</span>
            <Select
              allowClear
              placeholder="请选择"
              style={{ marginRight: 0 }}
              onChange={(e) => setWorkflowStatus(e)}
              value={workflowStatus}
            >
              {Object.keys(statusEnum).map((item: any) => (
                <Option key={item} value={item * 1}>
                  {statusEnum[item]}
                </Option>
              ))}
            </Select>
          </span> */}
          <span className={styles.timerBox}>
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
                showTime
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
        {access['workordermanage/workorderlist/index:btn_add'] && (
          <Button
            className={'buttonClass'}
            type="primary"
            onClick={() => setWorkOrderAddOrEditVisible(true)}
          >
            新增
          </Button>
        )}
        {access['workordermanage/workorder/index:btn_delList'] && (
          <Button
            className={'buttonClass'}
            disabled={selectedRowKey.length === 0}
            onClick={() => delRow({}, true)}
          >
            批量删除
          </Button>
        )}
      </div>
      <div className={`page-table-two-box ${isExist() ? null : `page-table-two-box-nobutton`}`}>
        <ProTable<TableListItem>
          columns={columns}
          onLoad={onLoad}
          params={{
            ...searchKey,
          }}
          request={async (params) => {
            const res = await getListInfo(params);
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
            current: searchPage,
          }}
          tableAlertRender={false}
          toolBarRender={false}
          search={false}
          actionRef={ref}
          scroll={scrollObj || { x: '100%' }}
          onChange={changetabval}
        />
      </div>
      {workOrderAddOrEditVisible && (
        <WorkOrderAddOrEdit
          listItem={editInfo}
          onOk={() => {
            setEditInfo(null);
            ref.current.reloadAndRest();
            setWorkOrderAddOrEditVisible(false);
          }}
          onCancel={() => {
            setEditInfo(null);
            setWorkOrderAddOrEditVisible(false);
          }}
        />
      )}
    </div>
  );
};
