import React, { useState, useRef } from 'react';
import { Button, Input, message, Modal, Space } from 'antd';
import { versionList, versionDel, versionCheck } from './service';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { useScrollObj } from '../../../utils/tableScrollSet';
import CrtEdtDevice from './components/crtEdtDevice';
import {} from '../../../assets/img/listMoreIcon/todown.svg';
import { useAccess } from 'umi';

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

  const [rowInfo, setRowInfo] = useState({});
  const [keyword, setKeyword] = useState<any>('');
  const [searchPage, setSearchPage] = useState(1);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(10);
  const [tableData, setTableData] = useState([]);

  const scrollObj = useScrollObj(tableData, { x: 1400, y: 'calc(100vh - 220px)' });
  const [selectedRowKey, setSelectedRowKey] = useState<(number | string)[]>([]);
  const [crtShow, setCrtShow] = useState(false);

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

  // const deviceEnumType = {
  //   0: '正常',
  //   1: '异常',
  // };
  const showEdit = async (todoinfo: any) => {
    setRowInfo(todoinfo);
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
        if (deleteType === 'batch') {
          formData.append('idList', params?.ids);
        } else {
          formData.append('idList', params?.ids);
        }
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          const checkRes = await versionCheck({ idList: params?.ids });
          if (checkRes.status === 0) {
            let res: any = null;
            res = await versionDel(formData);
            hide();
            if (res.status === 0) {
              message.success({
                content: '删除成功',
                key: '删除成功',
              });
              refreshPage();
              setSelectedRowKey([]);
            }
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
    const checkRes = await versionCheck({ idList: [text?.id] });
    if (checkRes.status === 0) {
      showEdit(text);
      setIsCreate(false);
      setCrtShow(true);
    }
  };
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
      dataIndex: 'sysVersion',
      key: 'sysVersion',
      width: 80,
      valueEnum: {
        0: { text: '1.0' },
      },
    },
    {
      title: '模型版本',
      dataIndex: 'modelVersion',
      key: 'modelVersion',
      width: 136,
      ellipsis: true,
    },
    {
      title: '配置文件版本',
      dataIndex: 'configVersion',
      key: 'configVersion',
      width: 136,
      ellipsis: true,
    },
    {
      title: '功能描述',
      dataIndex: 'des',
      key: 'des',
      ellipsis: true,
      width: 80,
    },
    {
      title: '修复BUG',
      dataIndex: 'repairBug',
      key: 'repairBug',
      ellipsis: true,
      width: 100,
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
      width: 120,
      key: 'action',
      fixed: 'right',
      render: (text: any) => {
        return (
          <Space size="middle">
            {access['DeviceManage/VersionList/index:btn_edt'] && (
              <a
                className="ahover"
                onClick={() => {
                  handleEdit(text);
                }}
              >
                编辑
              </a>
            )}
            {access['DeviceManage/VersionList/index:btn_del'] && (
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
  return (
    <div className={'commonTableClass'}>
      {/* 顶部按钮 */}
      <div className={'row-class'}>
        <div className="left-box">
          {access['DeviceManage/VersionList/index:btn_add'] && (
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

          {access['DeviceManage/VersionList/index:btn_delList'] && (
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
            placeholder="请输入版本的关键字"
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
          request={versionList}
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
            defaultPageSize: 10,
            current: searchPage,
          }}
          toolBarRender={false}
          search={false}
          onChange={changetabval}
        />
      </div>

      {crtShow ? (
        <CrtEdtDevice
          onsetkey={() => actionRef.current.reload()}
          edtShow={crtShow}
          edtInfo={rowInfo}
          isCreate={isCreate}
          onCancel={() => {
            setCrtShow(false);
          }}
        />
      ) : null}
    </div>
  );
};
