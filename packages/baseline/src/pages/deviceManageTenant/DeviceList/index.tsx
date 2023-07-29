import React, { useState, useRef } from 'react';
// import styles from './styles.less';
import { Button, Input, message, Modal, Space } from 'antd';
// import PicCreate from './component/picCreate';
import { devList, downlodExcel } from './service';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import StatusDetail from './component/StatusDetail';
import { useScrollObj } from '../../../utils/tableScrollSet';
import EdtLessee from './component/edtLessee';
import {} from '../../../assets/img/listMoreIcon/todown.svg';
import { useAccess } from 'umi';
import { exportCom } from '../../../utils/exportCom';
import VideoView from './component/VideoView';

const { Search } = Input;
export type Member = {
  avatar: string;
  realName: string;
  nickName: string;
  email: string;
  outUserNo: string;
  phone: string;
  permission?: string[];
};
type Iprops = {
  importColumns?: any;
};

const { confirm } = Modal;
const DeviceList: React.FC<Iprops> = (props) => {
  const actionRef = useRef<any>();
  const [isVideoShow, setIsVideoShow] = useState(false);
  const [visibStatus, setVisibStatus] = useState(false);
  const [rowInfo, setRowInfo] = useState({});
  const [keyword, setKeyword] = useState<any>('');
  const [searchPage, setSearchPage] = useState(1);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(10);
  const [tableData, setTableData] = useState([]);

  const scrollObj = useScrollObj(tableData, { x: 1400, y: 'calc(100vh - 220px)' });
  const [selectedRowKey, setSelectedRowKey] = useState<(number | string)[]>([]);
  const [crtShow, setCrtShow] = useState(false);
  const access: any = useAccess();

  const showStatus = async (rowdata?: any) => {
    if (rowdata) {
      setRowInfo(rowdata);
    }
    setVisibStatus(true);
  };

  const deviceEnumType = {
    0: '正常',
    1: '异常',
  };
  const showEdit = async (todoinfo: any) => {
    setRowInfo(todoinfo);
  };
  const handlePreview = (text: any) => {
    setRowInfo(text);
    setIsVideoShow(true);
  };
  // let columns: any
  const columns: any = props?.importColumns?.length
    ? [
        {
          title: '序号',
          key: 'num',
          width: 50,
          ellipsis: true,
          fixed: 'left',
          render: (text: any, record: any, index: any) =>
            // `${(tabpage - 1) * tabpagesize + (index + 1)}`,
            `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
        },
        ...props?.importColumns,
        {
          title: '操作',
          width: 120,
          key: 'action',
          fixed: 'right',
          render: (text: any) => {
            return (
              <Space size="middle">
                <a
                  onClick={() => (text.status === 0 ? showStatus(text) : {})}
                  className={`ahover ${text.status === 0 ? '' : 'disableCss'}`}
                >
                  状态
                </a>
                {access['DeviceManageLessee/DeviceList/index:btn_edt'] && (
                  <a
                    className="ahover"
                    onClick={() => {
                      showEdit(text);
                      setCrtShow(true);
                    }}
                  >
                    编辑
                  </a>
                )}
              </Space>
            );
          },
        },
      ]
    : [
        {
          title: '序号',
          key: 'num',
          width: 50,
          ellipsis: true,
          fixed: 'left',
          render: (text: any, record: any, index: any) =>
            // `${(tabpage - 1) * tabpagesize + (index + 1)}`,
            `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
        },
        {
          title: '设备编号',
          dataIndex: 'deviceId',
          key: 'deviceId',
          width: 160,
          ellipsis: true,
          fixed: 'left',
        },
        {
          title: '设备类型',
          dataIndex: 'deviceType',
          key: 'deviceType',
          width: 160,
          ellipsis: true,
          valueEnum: {
            0: { text: '轻量化车载设备V1.0' },
          },
        },
        {
          title: '系统版本',
          dataIndex: 'systemVersion',
          key: 'systemVersion',
          width: 80,
          ellipsis: true,
          valueEnum: {
            0: { text: '1.0' },
          },
        },
        {
          title: '设备名称',
          dataIndex: 'deviceName',
          key: 'deviceName',
          width: 120,
          ellipsis: true,
        },
        {
          title: '组织架构',
          dataIndex: 'deptName',
          key: 'deptName',
          width: 160,
          ellipsis: true,
        },
        {
          title: '巡检员姓名',
          dataIndex: 'inspectorName',
          key: 'inspectorName',
          width: 160,
          ellipsis: true,
        },
        {
          title: '联系方式',
          dataIndex: 'inspectorTel',
          key: 'inspectorTel',
          width: 160,
          ellipsis: true,
        },
        {
          title: '在线状态',
          dataIndex: 'status',
          key: 'status',
          width: 80,
          valueEnum: {
            0: { text: '在线', status: 'Success' },
            1: { text: '离线', status: 'Default' },
            2: { text: '离线', status: 'Default' },
          },
        },
        {
          title: '设备状态',
          dataIndex: 'deviceStatus',
          key: 'deviceStatus',
          width: 100,
          render: (deviceStatus: any, record: any) => {
            if (record.status !== 0) {
              return '-';
            }
            const statusname =
              deviceStatus !== undefined ? deviceEnumType[record?.deviceStatus] : '-';
            let color = '';
            if (deviceStatus !== '-') {
              color = deviceStatus === '0' ? 'rgba(68, 142, 73, 1)' : 'rgba(220, 45, 45, 1)';
            } else {
              color = 'rgba(0, 0, 0, 0.85)';
            }

            return <span style={{ color }}>{statusname || '-'}</span>;
          },
        },
        {
          title: '创建时间',
          dataIndex: 'crtTime',
          width: 160,
          key: 'crtTime',
          textWrap: 'noWrap',
          ellipsis: true,
        },
        {
          title: '操作',
          width: 150,
          key: 'action',
          fixed: 'right',
          render: (text: any) => {
            return (
              <Space size="middle">
                {access['DeviceManage/DeviceList/camera_index:btn_preview'] && (
                  <a
                    className={`ahover ${text?.status !== 0 ? 'disableCss' : ''}`}
                    onClick={() => {
                      if (text?.status !== 0) return;
                      handlePreview(text);
                    }}
                  >
                    预览
                  </a>
                )}
                <a
                  onClick={() => (text.status === 0 ? showStatus(text) : {})}
                  className={`ahover ${text.status === 0 ? '' : 'disableCss'}`}
                >
                  状态
                </a>
                {access['DeviceManageLessee/DeviceList/index:btn_edt'] && (
                  <a
                    className="ahover"
                    onClick={() => {
                      showEdit(text);
                      setCrtShow(true);
                    }}
                  >
                    编辑
                  </a>
                )}
              </Space>
            );
          },
        },
      ];
  const onSearch = (e: any) => {
    setKeyword(e.trim());
    setSearchPage(1);
    setSelectedRowKey([]);
    actionRef.current.reload();
  };

  // const crtCancel = () => {
  //   setVisib(false);
  // };
  const exportBatch = async () => {
    const hide = message.loading({
      content: '正在导出',
      key: '正在导出',
    });
    const obj = {
      ids: selectedRowKey?.length === 0 ? '' : selectedRowKey,
      keyword,
    };
    try {
      const res: any = await downlodExcel(obj);
      hide();
      exportCom(res);
      message.success({
        content: '导出成功',
        key: '导出成功',
      });
      // return true;
    } catch (error) {
      hide();
      message.error({
        content: '导出失败!',
        key: '导出失败!',
      });
      // return false;
    }
  };

  const changetabval = (text: any) => {
    if (text?.current !== searchPage) {
      setSearchPage(text?.current as number);
      setTabpage(text?.current as number);
    }
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
    setSelectedRowKey([]);
  };

  // 选中当前行
  const onSelectChange = (selectedRowKeys: any) => {
    // setSelectedRow(selectedRows[0]);
    setSelectedRowKey(selectedRowKeys);
  };

  const clickRow = (record: any) => {
    const arr = selectedRowKey.filter((i) => i !== record.id);
    if (selectedRowKey.includes(record.id)) setSelectedRowKey(arr);
    else setSelectedRowKey([...arr, record.id]);
  };
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
  // const pageChange = (page: any) => {
  //   setSearchPage(page);
  //   setTabpage(page);
  //   setSelectedRowKey([]);
  //   // setTabpagesize(pageSize);
  // };
  return (
    <div className={'commonTableClass'}>
      {/* 顶部按钮 */}
      <div className={'row-class'}>
        <div className="left-box">
          {access['DeviceManageLessee/DeviceList/index:btn_export'] && (
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
                      return exportBatch();
                    },
                    onCancel() {},
                  });
                } else {
                  exportBatch();
                }
              }}
            >
              批量导出
            </Button>
          )}
        </div>
        <div className="right-search">
          <Search
            placeholder="请输入设备名称或设备编号关键字"
            allowClear
            onSearch={(e) => onSearch(e)}
            maxLength={50}
            enterButton
          />
        </div>
      </div>
      {/* 表格 */}
      <div className={`table-box-normal`}>
        <ProTable<Member>
          columns={columns}
          actionRef={actionRef}
          request={devList}
          params={{
            keyword,
            // current: searchPage,
          }}
          onLoad={onLoad}
          rowKey="id"
          scroll={scrollObj || { x: '100%' }}
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
          tableAlertRender={false}
          pagination={{
            showQuickJumper: false,
            defaultPageSize: 20,
            current: searchPage,
            // onChange: pageChange,
          }}
          toolBarRender={false}
          search={false}
          onChange={changetabval}
        />
      </div>
      {visibStatus && (
        <StatusDetail
          visibStatus={visibStatus}
          onCancel={() => {
            setVisibStatus(false);
          }}
          rowinfo={rowInfo}
        />
      )}
      {crtShow ? (
        <EdtLessee
          onsetkey={() => actionRef.current.reload()}
          edtShow={crtShow}
          edtInfo={rowInfo}
          onCancel={() => {
            setCrtShow(false);
          }}
        />
      ) : null}
      {/* 预览 */}
      {isVideoShow ? (
        <VideoView
          isVideoShow={isVideoShow}
          rowInfo={rowInfo}
          onCancel={() => {
            setIsVideoShow(false);
          }}
        />
      ) : null}
    </div>
  );
};

export default DeviceList;
