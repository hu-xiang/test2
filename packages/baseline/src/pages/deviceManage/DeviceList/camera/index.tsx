import React, { useState, useRef } from 'react';
import { Button, Input, message, Modal, Space } from 'antd';
import { cameraList, deleteCamera, batchDelCamera, exportCamera } from './service';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { useScrollObj } from '../../../../utils/tableScrollSet';
import CrtEdtDevice from './components/CreateOrEdit';
import MarkType from './components/MarkTypeModal';
import MarkInner from './components/MarkInner';
import MarkOuter from './components/MarkOuter';
import VideoView from './components/VideoView';
import {} from '../../../assets/img/listMoreIcon/todown.svg';
import { useAccess } from 'umi';
import { exportCom } from '../../../../utils/exportCom';

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

const { confirm } = Modal;
export default (): React.ReactElement => {
  const actionRef = useRef<any>();
  const [isVideoShow, setIsVideoShow] = useState(false);
  const [rowInfo, setRowInfo] = useState({});
  const [keyword, setKeyword] = useState<any>('');
  const [searchPage, setSearchPage] = useState(1);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(10);
  const [tableData, setTableData] = useState([]);

  const scrollObj = useScrollObj(tableData, { x: 1400, y: 'calc(100vh - 320px)' });
  const [selectedRowKey, setSelectedRowKey] = useState<(number | string)[]>([]);
  const [crtShow, setCrtShow] = useState(false);
  const [markTypeShow, setMarkTypeShow] = useState(false);
  const [markInnerShow, setMarkInnerShow] = useState(false);
  const [markOuterShow, setMarkOuterShow] = useState(false);

  const [isCreate, setIsCreate] = useState(false);
  const access: any = useAccess();

  const refreshPage = () => {
    actionRef.current.reload();
  };

  const getIds = (type: any, id?: any) => {
    let ids: any = [];
    if (type === 'batch') {
      ids = selectedRowKey?.length === 0 ? [] : selectedRowKey;
    } else {
      ids = [id];
    }
    return ids;
  };

  const handleExport = async () => {
    const params = {
      ids: selectedRowKey,
      keyword,
      pageSize: tabpagesize,
      page: tabpage,
    };
    const formData = new FormData();
    for (let i = 0; i < Object.keys(params).length; i++) {
      if (params[Object.keys(params)[i]]) {
        formData.append(Object.keys(params)[i], params[Object.keys(params)[i]]);
      }
    }
    const hide = message.loading({
      content: '正在导出',
      key: '正在导出',
    });
    const res: any = await exportCamera(formData);
    hide();
    exportCom(res, undefined, 'application/octet-stream');
    message.success({
      content: '导出成功',
      key: '导出成功',
    });
  };

  const handleDel = (deleteType: any, text?: any) => {
    const params = {
      ids: getIds(deleteType, text?.id),
    };
    confirm({
      title: '设备信息将删除，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const formData = new FormData();
        formData.append('idList', params?.ids);
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          let res: any = null;
          if (deleteType === 'single') {
            res = await deleteCamera({ id: text.id });
          } else {
            res = await batchDelCamera({ ids: params?.ids });
          }
          if (res.status === 0) {
            hide();
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            refreshPage();
            setSelectedRowKey([]);
            return true;
          }
          return false;
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

  const handleEdit = async (text: any) => {
    setRowInfo(text);
    setIsCreate(false);
    setCrtShow(true);
  };

  const handleMark = (text: any) => {
    setRowInfo(text);
    setMarkTypeShow(true);
  };

  const handlePreview = (text: any) => {
    setRowInfo(text);
    setIsVideoShow(true);
  };

  const columns: any = [
    {
      title: '序号',
      key: 'num',
      width: 68,
      ellipsis: true,
      fixed: 'left',
      render: (text: any, record: any, index: any) =>
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
    },
    {
      title: '设备编号',
      dataIndex: 'cameraId',
      key: 'cameraId',
      width: 212,
      ellipsis: true,
    },
    {
      title: 'Mac地址',
      dataIndex: 'macAddress',
      key: 'macAddress',
      width: 235,
      ellipsis: true,
    },
    {
      title: '国标ID',
      dataIndex: 'cameraUid',
      key: 'cameraUid',
      width: 235,
      ellipsis: true,
    },
    {
      title: '绑定盒子',
      dataIndex: 'deviceId',
      key: 'deviceId',
      width: 233,
      ellipsis: true,
    },
    {
      title: '通道号',
      dataIndex: 'channelId',
      key: 'channelId',
      width: 141,
      ellipsis: true,
    },
    {
      title: '在线状态',
      dataIndex: 'status',
      key: 'status',
      ellipsis: true,
      width: 158,
      valueEnum: {
        0: { text: '在线', status: 'Success' },
        1: { text: '离线', status: 'Default' },
        2: { text: '离线', status: 'Default' },
      },
    },
    // {
    //   title: '设备状态',
    //   dataIndex: 'status',
    //   key: 'status',
    //   ellipsis: true,
    //   width: 141,
    //   render: (deviceStatus: any, record: any) => {
    //     const deviceEnumType = {
    //       0: '正常',
    //       1: '异常',
    //     };
    //     if (record.status !== 0) {
    //       return '-';
    //     }
    //     const statusname = deviceStatus !== undefined ? deviceEnumType[record?.deviceStatus] : '-';
    //     let color = '';
    //     if (deviceStatus !== '-') {
    //       color = deviceStatus === '0' ? 'rgba(68, 142, 73, 1)' : 'rgba(220, 45, 45, 1)';
    //     } else {
    //       color = 'rgba(0, 0, 0, 0.85)';
    //     }

    //     return <span style={{ color }}>{statusname || '-'}</span>;
    //   },
    // },
    {
      title: '创建时间',
      dataIndex: 'crtTime',
      width: 213,
      key: 'crtTime',
      textWrap: 'noWrap',
      ellipsis: true,
    },
    {
      title: '操作',
      width: 181,
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
            {access['DeviceManage/DeviceList/camera_index:btn_attch'] && (
              <a
                className="ahover"
                onClick={() => {
                  handleMark(text);
                }}
              >
                标定
              </a>
            )}
            {access['DeviceManage/DeviceList/camera_index:btn_edit'] && (
              <a
                className="ahover"
                onClick={() => {
                  handleEdit(text);
                }}
              >
                编辑
              </a>
            )}
            {access['DeviceManage/DeviceList/camera_index:btn_del'] && (
              <a
                className="ahover"
                onClick={() => {
                  handleDel('single', text);
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

  const onSearch = (e: any) => {
    setKeyword(e.trim());
    setSearchPage(1);
    setSelectedRowKey([]);
    actionRef.current.reload();
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
  return (
    <div className={'commonTableClass'}>
      {/* 顶部按钮 */}
      <div className={'row-class'}>
        <div className="left-box">
          {access['DeviceManage/DeviceList/camera_index:btn_create'] && (
            <Button
              type="primary"
              className={'buttonClass'}
              onClick={() => {
                setIsCreate(true);
                setCrtShow(true);
              }}
            >
              创建
            </Button>
          )}

          {access['DeviceManage/DeviceList/camera_index:btn_export'] && (
            <Button className={'buttonClass'} onClick={() => handleExport()}>
              批量导出
            </Button>
          )}
          {access['DeviceManage/DeviceList/camera_index:btn_del_batch'] && (
            <Button
              className={'buttonClass'}
              disabled={selectedRowKey?.length === 0}
              onClick={() => handleDel('batch')}
            >
              批量删除
            </Button>
          )}
        </div>
        <div className="right-search">
          <Search
            placeholder="请输入设备编号、绑定盒子的关键字"
            allowClear
            onSearch={(e) => onSearch(e)}
            maxLength={50}
            enterButton
          />
        </div>
      </div>
      {/* 表格 */}
      <div className={`table-box-normal tabs-box-normal`}>
        <ProTable<Member>
          columns={columns}
          actionRef={actionRef}
          request={cameraList}
          params={{
            keyword,
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
          }}
          toolBarRender={false}
          search={false}
          onChange={changetabval}
        />
      </div>

      {crtShow ? (
        <CrtEdtDevice
          onOk={() => actionRef.current.reload()}
          showModal={crtShow}
          editInfo={rowInfo}
          isEdit={!isCreate}
          onCancel={() => {
            setCrtShow(false);
          }}
        />
      ) : null}
      {markTypeShow ? (
        <MarkType
          onOk={(type: number) => {
            if (type === 1) {
              setMarkInnerShow(true);
            } else {
              setMarkOuterShow(true);
            }
          }}
          showModal={markTypeShow}
          editInfo={rowInfo}
          onCancel={() => {
            setMarkTypeShow(false);
          }}
        />
      ) : null}
      {/* 内部标定 */}
      {markInnerShow ? (
        <MarkInner
          onOk={() => actionRef.current.reload()}
          showModal={markInnerShow}
          editInfo={rowInfo}
          onCancel={() => {
            setMarkInnerShow(false);
          }}
        />
      ) : null}
      {/* 外部标定 */}
      {markOuterShow ? (
        <MarkOuter
          onOk={() => actionRef.current.reload()}
          showModal={markOuterShow}
          editInfo={rowInfo}
          onCancel={() => {
            setMarkOuterShow(false);
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
