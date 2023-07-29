import React, { useState, useRef } from 'react';
import styles from './styles.less';
import { Button, message, Input, Space, Modal } from 'antd';
import ProTable from '@ant-design/pro-table';
import { delInfo, getListInfo, downloadExcel, stopPlan } from './service';
import ImportModal from './components/AddorEditModal';
import { useAccess } from 'umi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useScrollObj } from '../../../utils/tableScrollSet';
import { exportCom } from '../../../utils/exportCom';
// import type { tableType } from './data';

const { confirm } = Modal;
const { Search } = Input;

type Iprops = {
  importColumns?: any;
};

const InspectPlan: React.FC<Iprops> = (props) => {
  // const [formModel] = Form.useForm();
  const searchFormList: { keyword: string } = {
    keyword: '', // 关键字
  };
  const pageSize = 20;
  const totalLimit: number = 10000;
  const [searchList, setSearchList] = useState<{ keyword: string }>(searchFormList);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(20);
  const [searchPage, setSearchPage] = useState(1);
  const [dataTotal, setDataTotal] = useState<any>();
  const [selectedRowKey, setSelectedRowKey] = useState<(number | string)[]>([]);
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [todo, setTodo] = useState<string>('add');
  const [rowInfo, setRowInfo] = useState<any>();
  const [tableData, setTableData] = useState<any>([]);
  const access: any = useAccess();
  const scrollObj = useScrollObj(tableData, { x: 1400, y: 'calc(100vh - 220px)' });
  const actionRef = useRef<any>();

  // const pageChange = (page: any) => {
  //   setSearchPage(page);
  //   setTabpage(page);
  //   setSelectedRowKey([]);
  // };

  // 刷新页面
  // 查询页面
  const queryPages = (e: any) => {
    setSearchPage(1);
    setSelectedRowKey([]);
    const formData = {
      keyword: e,
      searPage: 1,
    };
    setSearchList({ ...formData });
    actionRef.current.reload();
  };

  const setRefreshPage = () => {
    setSelectedRowKey([]);
    actionRef.current.reload();
  };

  const popModal = async (todoVal: any, row?: any) => {
    if (todoVal === 'edit') {
      setRowInfo(row);
    }
    setTodo(todoVal);
    setModalShow(true);
  };
  // const divStyle: any ={
  //   width: "571px"
  // }
  const onAbort = (row: any) => {
    Modal.confirm({
      title: '提前中止巡检计划，未完成巡检任务将自动取消，是否继续？',
      icon: <ExclamationCircleOutlined />,
      className: 'confirm-class',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          const res: any = await stopPlan(row?.id);
          if (res?.status === 0) {
            message.success({
              content: '修改成功',
              key: '修改成功',
            });
            setSelectedRowKey([]);
            setRefreshPage();
          }
        } catch (error) {
          message.error({
            content: '修改失败!',
            key: '修改失败!',
          });
        }
      },
      onCancel() {},
    });
  };
  const onDel = (deleteType: any, text?: any) => {
    confirm({
      title: '巡检计划信息将删除，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          const newIds: any = deleteType === 'batch' ? selectedRowKey : text?.id;
          const res = await delInfo({ id: newIds });
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            setRefreshPage();
          }
        } catch (error) {
          message.error({
            content: '删除失败!',
            key: '删除失败!',
          });
        }
      },
      onCancel() {},
    });
  };

  const column: any = [
    {
      title: '序号',
      key: 'nums',
      render: (text: any, record: any, index: any) =>
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
      width: 80,
    },
    {
      title: '道路名称',
      dataIndex: 'facilitiesName',
      key: 'facilitiesName',
      width: 100,
      ellipsis: true,
    },
    {
      title: '道路编码',
      dataIndex: 'roadSection',
      key: 'roadSection',
      width: 150,
      ellipsis: true,
    },
    // {
    //   title: '道路类型',
    //   dataIndex: 'facilitiesType',
    //   key: 'facilitiesType',
    //   width: 100,
    //   ellipsis: true,
    // },
    props?.importColumns
      ? props?.importColumns
      : {
          title: '道路里程（m）',
          dataIndex: 'roadNum',
          key: 'roadNum',
          width: 150,
          ellipsis: true,
        },
    {
      title: '起点',
      dataIndex: 'startPoint',
      key: 'startPoint',
      width: 150,
      ellipsis: true,
    },
    {
      title: '终点',
      dataIndex: 'endPoint',
      key: 'endPoint',
      ellipsis: true,
      width: 150,
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
      dataIndex: 'deviceNo',
      key: 'deviceNo',
      ellipsis: true,
      width: 150,
    },
    {
      title: '巡检频率',
      dataIndex: 'inspectionFrequency',
      key: 'inspectionFrequency',
      width: 100,
      render: (text: any) => {
        return <span>{text !== '-' ? `${text} 天/次` : '-'}</span>;
      },
    },
    {
      title: '开始日期',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 100,
      ellipsis: true,
    },
    {
      title: '结束日期',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 100,
      ellipsis: true,
    },
    {
      title: '计划状态',
      dataIndex: 'taskStatusName',
      key: 'taskStatusName',
      width: 100,
      valueEnum: {
        已生效: { text: '已生效', status: 'Success' },
        已失效: { text: '已失效', status: 'Default' },
      },
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (text: any, row: any) => (
        <Space size="middle">
          {/* {access['inspectManage/InspectPlan/index:btn_edit'] ? (
            <a
              className="ahover"
              onClick={() => {
                popModal('edit', row);
              }}
            >
              编辑
            </a>
          ) : null} */}
          {access['inspectManage/InspectPlan/index:btn_abort'] ? (
            <a
              className={`ahover ${row.taskStatusName === '已生效' ? '' : 'disableCss'}`}
              onClick={
                row.taskStatusName === '已失效'
                  ? () => {}
                  : () => {
                      onAbort(row);
                    }
              }
            >
              中止计划
            </a>
          ) : null}
          {access['inspectManage/InspectPlan/index:btn_delete'] ? (
            <a
              className={`ahover ${row.taskStatusName === '已生效' ? 'disableCss' : ''}`}
              onClick={
                row.taskStatusName === '已生效'
                  ? () => {}
                  : () => {
                      onDel('single', row);
                    }
              }
            >
              删除
            </a>
          ) : null}
        </Space>
      ),
    },
  ];

  // const reqErr = () => {
  //   message.error({
  //     content: '查询失败!',
  //     key: '查询失败!',
  //   });
  // };

  const changetabval = (text: any) => {
    // setSearchPage(text.current);
    // setTabpage(text.current);
    // setTabpagesize(text.pageSize);
    if (text?.current !== searchPage) {
      setSearchPage(text?.current as number);
      setTabpage(text?.current as number);
    }
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
    setSelectedRowKey([]);
  };

  const onLoad = (dataSource: any) => {
    if (!dataSource?.length) {
      if (searchPage > 1) {
        setSearchPage(searchPage - 1);
      } else {
        setSearchPage(1);
      }
    }
    setTableData(dataSource);
  };
  // 选中当前行
  const onSelectChange = (selectedRowKeys: any) => {
    setSelectedRowKey(selectedRowKeys);
  };
  const clickRow = (record: any) => {
    const arr = selectedRowKey.filter((i) => i !== record.id);
    if (selectedRowKey.includes(record.id)) setSelectedRowKey(arr);
    else setSelectedRowKey([...arr, record.id]);
  };

  const downExcel = () => {
    const params = {
      idList: selectedRowKey?.length === 0 ? [] : selectedRowKey,
      keyword: searchList?.keyword,
      page: searchPage,
      pageSize,
    };
    const edu = async () => {
      const hide = message.loading({
        content: '正在导出',
        key: '正在导出',
      });
      try {
        const res: any = await downloadExcel(params);
        hide();
        exportCom(res);
        message.success({
          content: '导出成功',
          key: '导出成功',
        });
        return true;
      } catch (error) {
        message.error({
          content: '导出失败!',
          key: '导出失败!',
        });
        return false;
      }
    };
    if (selectedRowKey.length === 0) {
      if (dataTotal > totalLimit) {
        message.error({
          content: `超过数据上限，最多可导出${totalLimit}条数据!`,
          key: `超过数据上限，最多可导出${totalLimit}条数据!`,
        });
        return;
      }
      confirm({
        title: '是否导出所有数据?',
        icon: <ExclamationCircleOutlined />,
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          edu();
        },
        onCancel() {},
      });
    } else {
      edu();
    }
  };

  return (
    <div className={`${styles['page-container']} commonTableClass`}>
      <div className={'row-class'}>
        <div className="left-box">
          {access['inspectManage/InspectPlan/index:btn_create'] && (
            <Button
              type="primary"
              className={'buttonClass'}
              onClick={() => {
                popModal('add');
              }}
            >
              创建
            </Button>
          )}
          {access['inspectManage/InspectPlan/index:btn_batch_export'] && (
            <Button
              className={'buttonClass'}
              disabled={dataTotal === 0}
              onClick={() => {
                downExcel();
              }}
            >
              批量导出
            </Button>
          )}
          {/* {access['inspectManage/InspectPlan/index:btn_batch_delete'] && (
            <Button
              className={'buttonClass'}
              disabled={dataTotal === 0 || selectedRowKey?.length === 0}
              onClick={() => {
                onDel('batch');
              }}
            >
              批量删除
            </Button>
          )} */}
        </div>
        <div className="right-search">
          <Search
            placeholder="请输入道路名称关键字 "
            allowClear
            onSearch={(e) => queryPages(e)}
            maxLength={50}
            enterButton
          />
        </div>
      </div>
      <div className={`table-box-normal`}>
        <ProTable
          actionRef={actionRef}
          columns={column}
          request={async (params: any) => {
            const res = await getListInfo(params);
            setDataTotal(res.total * 1);
            return res;
          }}
          // onRequestError={reqErr}
          onLoad={onLoad}
          onChange={changetabval}
          params={searchList}
          pagination={{
            showQuickJumper: false,
            defaultPageSize: pageSize,
            current: searchPage,
            // onChange: pageChange,
          }}
          rowKey="id"
          tableAlertRender={false}
          toolBarRender={false}
          search={false}
          scroll={scrollObj || { x: '100%' }}
          rowSelection={{
            selectedRowKeys: selectedRowKey,
            type: 'checkbox',
            onChange: onSelectChange,
          }}
          onRow={(record) => {
            return {
              onClick: (e: any) => {
                const excludeClassNames = [
                  'ahover',
                  'ant-dropdown-menu-title-content',
                  'ant-switch-inner',
                ];
                if (
                  e?.target &&
                  (e?.target?.nodeName === 'svg' || e?.target?.nodeName === 'path')
                ) {
                  return;
                }
                if (e?.target && excludeClassNames.includes(e.target?.className)) {
                  return;
                }
                clickRow(record);
              }, // 点击行
            };
          }}
        />
      </div>
      {modalShow ? (
        <ImportModal
          todo={todo}
          modalShow={modalShow}
          rowInfo={rowInfo}
          onCancel={() => setModalShow(false)}
          refreshPage={setRefreshPage}
        />
      ) : null}
    </div>
  );
};
export default InspectPlan;
