import React, { useState, useRef, useEffect } from 'react';
import styles from './styles.less';
import { Button, message, Input, Space, Modal } from 'antd';
import ProTable from '@ant-design/pro-table';
import { delScenelistinfo, getSceneListInfo } from './service';
import SceneTypeModal from './components/sceneTypeModal';
import { useAccess } from 'umi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useScrollObj } from 'baseline/src/utils/tableScrollSet';
// import { exportCom } from '../../../utils/exportCom';
// import type { tableType } from './data';

const { confirm } = Modal;
const { Search } = Input;
type Iprops = {
  tabValue: string;
};

const SceneTypeIndex: React.FC<Iprops> = (props) => {
  // const [formModel] = Form.useForm();
  const { tabValue } = props;
  const searchFormList: { sceneName: string } = {
    sceneName: '', // 关键字
  };
  const pageSize = 20;
  // const totalLimit: number = 10000;
  const [searchList, setSearchList] = useState<{ sceneName: string }>(searchFormList);
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
  const scrollObj = useScrollObj(tableData, { x: 1400, y: 'calc(100vh - 306px)' });
  const actionRef = useRef<any>();
  const [newColumn, setNewColumn] = useState<any>([]);
  // const [sceneList, setSceneList] = useState<any>([]);

  // 刷新页面
  // 查询页面
  const queryPages = (e: any) => {
    setSearchPage(1);
    const formData = {
      sceneName: e,
      searPage: 1,
    };
    setSearchList({ ...formData });
    actionRef.current.reload();
  };

  const setRefreshPage = () => {
    actionRef.current.reload();
  };
  useEffect(() => {
    if (tabValue === '1') {
      setRefreshPage();
    }
  }, [tabValue]);

  const popModal = async (todoVal: any, row?: any) => {
    if (todoVal === 'edit') {
      setRowInfo(row);
    }
    setTodo(todoVal);
    setModalShow(true);
  };
  // const getCheckTypeList = async () => {
  //   const res = await getSceneTreeList();
  //   if (res.status === 0) {
  //     setSceneList(res?.data);
  //   }
  // };

  // useEffect(() => {
  //   getCheckTypeList();
  // }, []);

  const rowSelection = {
    getCheckboxProps: (record: any) => ({
      disabled: record.flag === true,
    }),
  };
  const onDel = (deleteType: any, text?: any) => {
    confirm({
      title: '场景类型信息将删除，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          const newIds: any = deleteType === 'batch' ? selectedRowKey : text?.id;
          const res = await delScenelistinfo({ idList: newIds });
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
      title: '场景类型',
      dataIndex: 'sceneName',
      key: 'sceneName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '场景编号',
      dataIndex: 'sceneNo',
      key: 'sceneNo',
      width: 200,
      ellipsis: true,
    },
    {
      title: '排查项 ',
      dataIndex: 'checkItemNameList',
      key: 'checkItemNameList',
      // width: 310,
      ellipsis: true,
      render: (text: any, row: any) => {
        const newTxt =
          row?.checkItemNameList && row?.checkItemNameList?.length
            ? row?.checkItemNameList?.join('，')
            : '-';
        return <span>{newTxt || '-'}</span>;
      },
    },
    {
      title: '新增时间',
      dataIndex: 'crtTime',
      key: 'crtTime',
      width: 200,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 114,
      render: (text: any, row: any) => (
        <Space size="middle">
          {access['hiddenDangerCheck/SceneTypeList/scene_edit'] ? (
            <a
              className={`ahover`}
              onClick={() => {
                popModal('edit', row);
              }}
            >
              编辑
            </a>
          ) : null}
          {access['hiddenDangerCheck/SceneTypeList/scene_del'] ? (
            <a
              className={`${row.flag ? 'disableCss' : ''} ahover`}
              onClick={
                row.flag
                  ? () => {}
                  : () => {
                      onDel('single', row);
                    }
              }
            >
              删除
            </a>
          ) : // <a
          //   className={`ahover`}
          //   onClick={() => {
          //     onDel('single', row);
          //   }}
          // >
          //   删除
          // </a>
          null}
        </Space>
      ),
    },
  ];
  useEffect(() => {
    if (
      access['hiddenDangerCheck/SceneTypeList/scene_edit'] ||
      access['hiddenDangerCheck/SceneTypeList/scene_del']
    ) {
      setNewColumn(column);
    } else {
      column.pop();
      setNewColumn(column);
    }
  }, []);

  const changetabval = (text: any) => {
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

  return (
    <div className={`${styles['page-container']} commonTableClass`}>
      <div className={`row-class ${styles['row-top']}`}>
        <div className="left-box">
          {access['hiddenDangerCheck/SceneTypeList/index:scene_create'] && (
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
          {access['hiddenDangerCheck/SceneTypeList/scene_batchdel'] && (
            <Button
              className={'buttonClass'}
              disabled={dataTotal === 0 || selectedRowKey?.length === 0}
              onClick={() => {
                onDel('batch');
              }}
            >
              批量删除
            </Button>
          )}
        </div>
        <div className="right-search">
          <Search
            placeholder="请输入场景类型名称关键字 "
            allowClear
            onSearch={(e) => queryPages(e)}
            maxLength={50}
            enterButton
          />
        </div>
      </div>
      <div className={`table-box-normal ${styles['table-scene']}`}>
        <ProTable
          actionRef={actionRef}
          columns={newColumn}
          request={async (params: any) => {
            const res = await getSceneListInfo(params);
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
          toolBarRender={false}
          search={false}
          scroll={scrollObj || { x: '100%' }}
          rowSelection={{
            selectedRowKeys: selectedRowKey,
            type: 'checkbox',
            onChange: onSelectChange,
            ...rowSelection,
          }}
          onRow={(record) => {
            return {
              onClick: (e: any) => {
                if (record.flag) return;
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
                if (e?.target && excludeClassNames.includes(e.target?.className.trim())) {
                  return;
                }
                clickRow(record);
              }, // 点击行
            };
          }}
          tableAlertRender={false}
        />
      </div>
      {modalShow ? (
        <SceneTypeModal
          todo={todo}
          // multiTreeList={sceneList}
          modalShow={modalShow}
          rowInfo={rowInfo}
          onCancel={() => setModalShow(false)}
          refreshPage={setRefreshPage}
        />
      ) : null}
    </div>
  );
};
export default SceneTypeIndex;
