import React, { useState, useRef } from 'react';
import { Button, Input, message, Modal, Space, Dropdown } from 'antd';
// import PicCreate from './component/picCreate';
import { devList, downlodExcel, devdel, devlistdel, downlodFile, cancelUpgrade } from './service';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import StatusDetail from './component/StatusDetail';
import { useScrollObj } from '../../../utils/tableScrollSet';
import CrtEdtDevice from './component/crtEdtDevice';
import DemarcateSet from './component/demarcateSet';
import Update from './component/update';
import {} from '../../../assets/img/listMoreIcon/todown.svg';
import { useAccess } from 'umi';
import { exportCom } from '../../../utils/exportCom';
import { getMenuItem } from '../../../utils/commonMethod';

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
  const [visibStatus, setVisibStatus] = useState(false);

  const [rowInfo, setRowInfo] = useState({});
  const [keyword, setKeyword] = useState<any>('');
  const [searchPage, setSearchPage] = useState(1);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(10);
  const [tableData, setTableData] = useState([]);

  const scrollObj = useScrollObj(tableData, { x: 1400, y: 'calc(100vh - 320px)' });
  const [selectedRowKey, setSelectedRowKey] = useState<(number | string)[]>([]);
  const [crtShow, setCrtShow] = useState(false);
  const [demarcateShow, setDemarcateShow] = useState(false);
  const [demarcateInfo, setDemarcateInfo] = useState<any>();
  const [edtOrCrt, setEdtOrCrt] = useState(false);
  const access: any = useAccess();

  const [showUpdateWin, setShowUpdateWin] = useState(false);
  const [updateItem, setUpdateItem] = useState<any>(null);
  const [updateDevList, setUpdateDevList] = useState<any>([]);
  const [isUpdateBatch, setIsUpdateBatch] = useState<boolean>(false);

  const refreshPage = () => {
    actionRef.current.reload();
  };

  const showStatus = async (rowdata?: any) => {
    if (rowdata) {
      setRowInfo(rowdata);
    }
    setVisibStatus(true);
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
  const delpk = (deleteType: any, text?: any) => {
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
        if (deleteType === 'batch') {
          formData.append('ids', params?.ids);
        } else {
          formData.append('id', params?.ids);
        }
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          let res: any;
          if (deleteType === 'batch') {
            res = await devlistdel(formData);
          } else {
            res = await devdel(formData);
          }
          hide();
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            refreshPage();
            setSelectedRowKey([]);
          }
          // else {
          //   message.error({
          //     content: res.message,
          //     key: res.message,
          //   });
          // }
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

  const deviceEnumType = {
    0: '正常',
    1: '异常',
  };
  const showEdit = async (todoinfo: any) => {
    setRowInfo(todoinfo);
  };
  const demarcateSet = async (todoinfo: any, rowdata?: any) => {
    if (rowdata) {
      setDemarcateShow(true);
      setDemarcateInfo(rowdata);
    }
  };
  const downlodSaveFile = async (id: any) => {
    const hide = message.loading({
      content: '正在下载',
      key: '正在下载',
    });
    try {
      const res: any = await downlodFile({ id });
      hide();
      exportCom(res);
      return true;
    } catch (error) {
      hide();
      message.error({
        content: '下载失败!',
        key: '下载失败!',
      });
      return false;
    }
  };
  // 升级
  const handleUpdate = (item: any) => {
    setIsUpdateBatch(false);
    setUpdateItem(item);
    setShowUpdateWin(true);
  };
  const handleCancelUpdate = (item: any) => {
    confirm({
      title: '升级将取消，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        // todo
        const res = await cancelUpgrade({ deviceId: item.deviceId });
        if (res.status === 0) {
          message.success({
            content: '取消升级成功',
            key: '取消升级成功',
          });
          refreshPage();
        }
      },
      onCancel() {},
    });
  };
  const handleSelect = (e: any, currentItem: any) => {
    if (e?.key === 'set') {
      demarcateSet('set', currentItem);
    } else if (e?.key === 'delete') {
      delpk('single', currentItem);
    } else if (e?.key === 'safeFile') {
      downlodSaveFile(currentItem.id);
    } else if (e?.key === 'update') {
      handleUpdate(currentItem);
    } else if (e?.key === 'cancelUpdate') {
      handleCancelUpdate(currentItem);
    }
  };
  // let columns: any
  const columns: any = [
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
      title: '当前版本',
      dataIndex: 'systemVersion',
      key: 'systemVersion',
      ellipsis: true,
      width: 80,
      valueEnum: {
        0: { text: '1.0' },
      },
    },
    {
      title: '升级版本',
      dataIndex: 'upVersion',
      key: 'upVersion',
      ellipsis: true,
      width: 80,
      valueEnum: {
        0: { text: '1.0' },
      },
    },
    {
      title: '所属租户',
      dataIndex: 'tenantName',
      key: 'tenantName',
      width: 136,
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
        const statusname = deviceStatus !== undefined ? deviceEnumType[record?.deviceStatus] : '-';
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
      width: 140,
      key: 'crtTime',
      textWrap: 'noWrap',
      ellipsis: true,
    },
    {
      title: '操作',
      width: 180,
      key: 'action',
      fixed: 'right',
      render: (text: any) => {
        const menulist: any = [];
        // if (access['DeviceManage/DeviceList/index:btn_set']) {
        //   menulist.push({ key: 'set', name: '标定配置' });
        // }
        if (access['DeviceManage/DeviceList/index:btn_safeBook']) {
          menulist.push({ key: 'safeFile', name: '安全证书' });
        }
        if (access['DeviceManage/DeviceList/index:btn_update']) {
          menulist.push({ key: 'update', name: '升级' });
        }
        if (access['DeviceManage/DeviceList/index:btn_update']) {
          menulist.push({
            key: 'cancelUpdate',
            name: '取消升级',
            disabled: text.upVersion === '-',
          });
        }
        if (access['DeviceManage/DeviceList/index:btn_del']) {
          menulist.push({ key: 'delete', name: '删除' });
        }
        const menuItems = menulist.map((it: any) => {
          return getMenuItem(it?.name, it?.key, it?.disabled);
        });
        return (
          <Space size="middle">
            {access['DeviceManage/DeviceList/index:btn_edt'] && (
              <a
                onClick={() => (text.status === 0 ? showStatus(text) : {})}
                className={`ahover ${text.status === 0 ? '' : 'disableCss'}`}
              >
                状态
              </a>
            )}
            {access['DeviceManage/DeviceList/index:btn_edt'] && (
              <a
                // className={`ahover ${text.status === 0 ? '' : 'disableCss'}`}
                className="ahover"
                onClick={() => {
                  showEdit(text);
                  setEdtOrCrt(true);
                  setCrtShow(true);
                }}
              >
                编辑
              </a>
            )}
            {/* {text.status === 0 ? (
              <Dropdown
                menu={{ items: menuItems, onClick: (key: any) => handleSelect(key, text) }}
                // overlay={() => {
                //   return (
                //     <Menu onClick={(key: any) => handleSelect(key, text)} items={menuItems}></Menu>
                //   );
                // }}
              >
                <span
                  className={`dropDownNameClass ahover ${text.status === 0 ? '' : 'disableCss'}`}
                >
                  更多<span className="dropDownIcon"></span>
                </span>
              </Dropdown>
            ) : (
              <span className={`dropDownNameClass ahover ${text.status === 0 ? '' : 'disableCss'}`}>
                更多<span className="dropDownIcon"></span>
              </span>
            )} */}
            <Dropdown menu={{ items: menuItems, onClick: (key: any) => handleSelect(key, text) }}>
              <span className={`dropDownNameClass ahover`}>
                更多<span className="dropDownIcon"></span>
              </span>
            </Dropdown>
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
      message.success('导出成功');
      // return true;
    } catch (error) {
      hide();
      message.error('导出失败!');
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
    // console.log(selectedRowKeys);
    setSelectedRowKey(selectedRowKeys);
    if (tableData.length) {
      const updateDevArr: any = [];
      tableData.forEach((item: any) => {
        if (selectedRowKeys.includes(item?.id)) {
          updateDevArr.push(item?.deviceId);
        }
      });
      setUpdateDevList(updateDevArr);
    }
  };

  const clickRow = (record: any) => {
    const arr = selectedRowKey.filter((i) => i !== record.id);
    if (selectedRowKey.includes(record.id)) {
      setSelectedRowKey(arr);
      onSelectChange(arr);
    } else {
      setSelectedRowKey([...arr, record.id]);
      onSelectChange([...arr, record.id]);
    }
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

  // 批量升级
  const updateBatch = () => {
    setIsUpdateBatch(true);
    setShowUpdateWin(true);
    setUpdateItem({});
  };
  return (
    <div className={'commonTableClass'}>
      {/* 顶部按钮 */}
      <div className={'row-class'}>
        <div className="left-box">
          {access['DeviceManage/DeviceList/index:btn_add'] && (
            <Button
              type="primary"
              className={'buttonClass'}
              onClick={() => {
                setEdtOrCrt(false);
                setCrtShow(true);
              }}
            >
              创建
            </Button>
          )}

          {access['DeviceManage/DeviceList/index:btn_export'] && (
            <Button
              className={'buttonClass'}
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
          {access['DeviceManage/DeviceList/index:btn_updateBatch'] && (
            <Button
              className={`buttonClass`}
              disabled={selectedRowKey?.length === 0}
              onClick={() => {
                if (selectedRowKey.length !== 0) {
                  updateBatch();
                }
              }}
            >
              批量升级
            </Button>
          )}
          {access['DeviceManage/DeviceList/index:btn_delList'] && (
            <Button
              className={'buttonClass'}
              disabled={selectedRowKey?.length === 0}
              onClick={() => delpk('batch')}
            >
              批量删除
            </Button>
          )}
        </div>
        <div className="right-search">
          <Search
            placeholder="请输入设备编号关键字"
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
          request={async (params: any) => {
            const res = await devList(params);
            return res;
          }}
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
        <CrtEdtDevice
          onsetkey={() => actionRef.current.reload()}
          edtShow={crtShow}
          edtInfo={rowInfo}
          edtOrCrt={edtOrCrt}
          onCancel={() => {
            setCrtShow(false);
          }}
        />
      ) : null}
      {demarcateShow ? (
        <DemarcateSet
          onsetkey={() => {
            setDemarcateShow(false);
            actionRef.current.reload();
          }}
          edtShow={demarcateShow}
          demarcateInfo={demarcateInfo}
          onCancel={() => {
            setDemarcateShow(false);
          }}
        />
      ) : null}

      {showUpdateWin && (
        <Update
          onsetkey={() => actionRef.current.reload()}
          visible={showUpdateWin}
          onCancel={() => {
            setShowUpdateWin(false);
            setIsUpdateBatch(false);
            // setUpdateDevList([]);
          }}
          rowItem={updateItem}
          updateDevList={updateDevList}
          isUpdateBatch={isUpdateBatch}
        />
      )}
    </div>
  );
};
