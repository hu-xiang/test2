import React, { useState, useRef, useEffect } from 'react';
import { ProTable } from '@ant-design/pro-table';
import { Input, Button, Space, Modal, message, Dropdown } from 'antd';
import { ExclamationCircleOutlined, DownOutlined } from '@ant-design/icons';
import AddOrEditModal from './AddOrEditModal';
import { getListInfo, exportProject, batchdelProject } from './serves';
import { useAccess, useHistory } from 'umi';
import { exportCom } from 'baseline/src/utils/exportCom';
import PictureManage from './PictureManage';
import { useScrollObjSta } from '@/utils/tableScrollSet';
import { getMenuItem } from 'baseline/src/utils/commonMethod';

export default (): React.ReactElement => {
  const access: any = useAccess();
  const ref: any = useRef();
  const history: any = useHistory();
  const { confirm } = Modal;
  const { Search } = Input;
  const [tableData, setTableData] = useState([]);
  const [data, setData] = useState<any>({
    isModalShow: false,
    isEdit: false,
    selectedList: [],
    currentPage: 1,
    keyword: '',
    projectId: null,
    isPicModalShow: false,
    projectName: '',
    tabpagesize: 20,
  });
  const initData = { ...data };
  const scrollObj = useScrollObjSta(tableData, { x: 1200, y: 'calc(100vh - 215px)' });

  useEffect(() => {}, []);

  const onSet = () => {
    ref.current.reload();
  };

  const onLoad = (dataSource: any) => {
    if (!dataSource?.length) {
      if (data.currentPage > 1) {
        initData.currentPage = data.currentPage - 1;
        setData(initData);
      } else {
        initData.currentPage = 1;
        setData(initData);
      }
    } else if (tableData.length !== dataSource.length) {
      setTableData(dataSource);
    }
  };

  // 点击创建
  const addClick = () => {
    initData.isModalShow = true;
    setData(initData);
  };

  // 导出
  const downloadflie = async () => {
    const formData = new FormData();
    formData.append('projectIds', data.selectedList);
    formData.append('keyword', data.keyword);
    const hide = message.loading({
      content: '正在导出',
      key: '正在导出',
    });
    try {
      const res: any = await exportProject(formData);
      hide();
      exportCom(res);
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

  // 删除
  const delRow = (item: any, isBatch: boolean) => {
    confirm({
      title: '项目信息将删除，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const formData = new FormData();
        if (isBatch) formData.append('projectIds', data.selectedList);
        else formData.append('projectIds', item.id);
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          const res = await batchdelProject(formData);
          hide();
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            if (isBatch) {
              initData.selectedList = [];
              setData(initData);
            }
            onSet();
          } else {
            message.error({
              content: res.message,
              key: res.message,
            });
          }
        } catch (error) {
          hide();
          message.error({
            content: '删除失败!',
            key: '删除失败!',
          });
        }
      },
      onCancel() {},
    });
  };

  // 搜索
  const inputSearch = (e: any) => {
    initData.keyword = e.trim();
    initData.currentPage = 1;
    setData(initData);
    ref.current.reload();
  };

  // 详情
  const goDetail = (item: any) => {
    sessionStorage.setItem('projectId', item.id);
    history.push('/regularInspection/projectDetail');
  };

  // 点击行
  const clickRow = (row: any) => {
    const arr = data.selectedList.filter((i: any) => i !== row.id);
    if (data.selectedList.includes(row.id)) {
      initData.selectedList = arr;
    } else {
      initData.selectedList = [...arr, row.id];
    }
    setData(initData);
  };

  const changetabval = (text: any) => {
    if (text?.current !== initData.currentPage) initData.currentPage = text.current;
    if (text?.pageSize !== initData.tabpagesize) initData.tabpagesize = text?.pageSize;
    initData.selectedList = [];
    setData(initData);
  };
  const handleSelect = (e: any, currentItem: any) => {
    if (e?.key === 'detail') {
      goDetail(currentItem);
    } else if (e?.key === 'del') {
      delRow(currentItem, false);
    }
  };

  const columns: any = [
    {
      title: '序号',
      key: 'id',
      render: (text: any, record: any, index: any) =>
        `${(data.currentPage - 1) * data.tabpagesize + (index + 1)}`,
      // `${(tabpage - 1) * tabpagesize + (index + 1)}`,
      width: 60,
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '项目编号',
      dataIndex: 'projectNo',
      key: 'projectNo',
      width: 200,
      ellipsis: true,
    },
    {
      title: '道路名称',
      dataIndex: 'facilitiesName',
      key: 'facilitiesName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '路面类型',
      dataIndex: 'roadTypeStr',
      key: 'roadTypeStr',
      width: 120,
      ellipsis: true,
    },
    {
      title: '道路等级',
      dataIndex: 'roadLevelStr',
      key: 'roadLevelStr',
      width: 100,
      ellipsis: true,
    },
    {
      title: '道路里程(m)',
      dataIndex: 'roadLength',
      key: 'roadLength',
      width: 100,
      ellipsis: true,
    },
    {
      title: '合格率',
      dataIndex: 'qualifyRate',
      key: 'qualifyRate',
      width: 100,
      ellipsis: true,
      render: (text: any, recode: any) => `${recode.qualifyRate}%`,
    },
    {
      title: '完好率',
      dataIndex: 'intactRate',
      key: 'intactRate',
      width: 100,
      ellipsis: true,
      render: (text: any, recode: any) => `${recode.intactRate}%`,
    },
    {
      title: '负责人',
      dataIndex: 'liablePerson',
      key: 'liablePerson',
      width: 120,
      ellipsis: true,
    },
    {
      title: '检测时间',
      dataIndex: 'detectTime',
      key: 'detectTime',
      width: 160,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right',
      // valueType: 'option',
      render: (text: any, recode: any) => {
        const menulist: any = [];
        if (access['regularInspection/projectList/index:btn_detail']) {
          menulist.push({ key: 'detail', name: '详情' });
        }
        if (access['regularInspection/projectList/index:btn_del']) {
          menulist.push({ key: 'del', name: '删除' });
        }
        const menuItems = menulist.map((it: any) => {
          return getMenuItem(it?.name, it?.key);
        });
        return (
          <Space size="middle">
            {access['regularInspection/projectList/index:btn_edit'] && (
              <a
                className="ahover"
                onClick={() => {
                  initData.isEdit = true;
                  initData.isModalShow = true;
                  initData.projectId = recode.id;
                  setData(initData);
                }}
              >
                编辑
              </a>
            )}
            {access['regularInspection/projectList/index:btn_picture'] && (
              <a
                className="ahover"
                onClick={() => {
                  initData.isPicModalShow = true;
                  initData.projectId = recode.id;
                  initData.projectName = recode.projectName;
                  setData(initData);
                }}
              >
                图片管理
              </a>
            )}
            {(access['regularInspection/projectList/index:btn_detail'] ||
              access['regularInspection/projectList/index:btn_del']) && (
              <Dropdown
                menu={{ items: menuItems, onClick: (key: any) => handleSelect(key, recode) }}
                // overlay={() => {
                //   return (
                //     <Menu
                //       onClick={(key: any) => handleSelect(key, recode)}
                //       items={menuItems}
                //     ></Menu>
                //   );
                // }}
              >
                <a className="ahover">
                  更多 <DownOutlined />
                </a>
              </Dropdown>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className={'commonTableClass'}>
      <div className={'row-class'}>
        <div className="left-box">
          {access['regularInspection/projectList/index:btn_add'] && (
            <Button className={'buttonClass'} type="primary" onClick={() => addClick()}>
              创建
            </Button>
          )}
          {access['regularInspection/projectList/index:btn_export'] && (
            <Button
              className={'buttonClass'}
              onClick={() => {
                if (data.selectedList.length === 0) {
                  confirm({
                    title: '是否导出查询列表所有数据？',
                    icon: <ExclamationCircleOutlined />,
                    okText: '确定',
                    okType: 'danger',
                    cancelText: '取消',
                    async onOk() {
                      return downloadflie();
                    },
                    onCancel() {},
                  });
                } else {
                  downloadflie();
                }
              }}
            >
              批量导出
            </Button>
          )}
          {access['regularInspection/projectList/index:btn_batchDel'] && (
            <Button
              className={'buttonClass'}
              disabled={data.selectedList.length === 0}
              onClick={() => delRow({}, true)}
            >
              批量删除
            </Button>
          )}
        </div>
        <div className="right-search">
          <Search
            placeholder="请输入项目名称关键字"
            allowClear
            onSearch={(e) => inputSearch(e)}
            maxLength={50}
            enterButton
          />
        </div>
      </div>
      <div className="table-box-normal">
        <ProTable
          columns={columns}
          onLoad={onLoad}
          params={{
            keyword: data.keyword,
          }}
          request={async (params) => {
            const res = await getListInfo(params);
            // 表单搜索项会从 params 传入，传递给后端接口。
            return res;
          }}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: data.selectedList,
            type: 'checkbox',
            onChange: (list) => {
              initData.selectedList = list;
              setData(initData);
            },
          }}
          onRow={(record: any) => {
            return {
              onClick: (e: any) => {
                if (e?.target?.nodeName === 'svg') return;
                if (
                  e?.target &&
                  (e?.target?.className?.indexOf('ahover') > -1 ||
                    e?.target?.className?.indexOf('ant-dropdown-menu-title-content') > -1)
                ) {
                  return;
                }
                clickRow(record);
              }, // 点击行
            };
          }}
          pagination={{
            showQuickJumper: false,
            current: data.currentPage,
          }}
          scroll={scrollObj || { x: '100%' }}
          tableAlertRender={false}
          toolBarRender={false}
          search={false}
          actionRef={ref}
          onChange={changetabval}
        />
      </div>
      {data.isModalShow ? (
        <AddOrEditModal
          onSet={onSet}
          isEdit={data.isEdit}
          isModalShow={data.isModalShow}
          id={data.projectId}
          onCancel={() => {
            initData.isEdit = false;
            initData.isModalShow = false;
            setData(initData);
          }}
        />
      ) : null}
      {data.isPicModalShow ? (
        <PictureManage
          onSet={onSet}
          isPicModalShow={data.isPicModalShow}
          id={data.projectId}
          projectName={data.projectName}
          onCancel={() => {
            initData.isPicModalShow = false;
            setData(initData);
          }}
        />
      ) : null}
    </div>
  );
};
