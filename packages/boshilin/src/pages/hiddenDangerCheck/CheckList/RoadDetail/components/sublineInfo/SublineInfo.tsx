import React, { useState, useRef } from 'react';
import { Button, message, Modal, Space } from 'antd';
import { sublineList, sublineDel } from '../../service';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { useScrollObjSta } from 'baseline/src/utils/tableScrollSet';
import CreatOrEditSubline from './CreatOrEditSubline';
// import { useAccess } from 'umi';
import styles from './styles.less';

export type Member = {};

const { confirm } = Modal;
type Iprops = {
  fkFacId: string;
  id: string;
};
const EdtMod: React.FC<Iprops> = (props) => {
  const actionRef = useRef<any>();

  const [rowInfo, setRowInfo] = useState({});
  const [searchPage, setSearchPage] = useState(1);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(10);
  const [tableData, setTableData] = useState([]);

  const scrollObj = useScrollObjSta(tableData, { x: 1400, y: 'calc(100vh - 278px)' }, false);
  const [selectedRowKey, setSelectedRowKey] = useState<(number | string)[]>([]);
  const [sublineDialogShow, setSublineDialogShow] = useState(false);

  const [isCreate, setIsCreate] = useState(false);
  // const access: any = useAccess();

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

  const showEdit = async (todoinfo: any) => {
    setRowInfo(todoinfo);
  };
  const handleDel = (deleteType: any, text?: any) => {
    const params = {
      ids: getIds(deleteType, text?.id),
    };
    confirm({
      title: '子线信息将删除，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          const res = await sublineDel({ idList: params?.ids });
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
    // const checkRes = await versionCheck({ idList: [text?.id] });
    // if (checkRes.status === 0) {
    showEdit(text);
    setIsCreate(false);
    setSublineDialogShow(true);
    // }
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
      title: '子线名称',
      dataIndex: 'subName',
      key: 'subName',
      width: 284,
      ellipsis: true,
    },
    {
      title: '上行起点',
      dataIndex: 'upStartPoint',
      key: 'upStartPoint',
      width: 189,
    },
    {
      title: '上行终点',
      dataIndex: 'upEndPoint',
      key: 'upEndPoint',
      width: 191,
      ellipsis: true,
    },
    {
      title: '下行起点',
      dataIndex: 'downStartPoint',
      key: 'downStartPoint',
      width: 189,
    },
    {
      title: '下行终点',
      dataIndex: 'downEndPoint',
      key: 'downEndPoint',
      width: 191,
      ellipsis: true,
    },
    {
      title: '组织架构',
      dataIndex: 'fkDeptName',
      key: 'fkDeptName',
      width: 217,
      ellipsis: true,
    },

    {
      title: '操作',
      width: 205,
      key: 'action',
      fixed: 'right',
      render: (text: any) => {
        return (
          <Space size="middle">
            <a
              className="ahover"
              onClick={() => {
                handleEdit(text);
              }}
            >
              编辑
            </a>
            <a
              className="ahover"
              onClick={() => {
                handleDel('single', text);
              }}
            >
              删除
            </a>
          </Space>
        );
      },
    },
  ];

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
    <div className={`commonTableClass ${styles.sublinesInfo}`}>
      <Button
        type="primary"
        className={'buttonClass'}
        onClick={() => {
          setIsCreate(true);
          setSublineDialogShow(true);
        }}
        style={{ marginLeft: '0px' }}
      >
        创建
      </Button>

      <Button
        className={'buttonClass'}
        disabled={selectedRowKey?.length === 0}
        onClick={() => handleDel('batch')}
      >
        批量删除
      </Button>
      <div className={styles.sublinesInfoTable}>
        <ProTable<Member>
          columns={columns}
          actionRef={actionRef}
          request={async (params: any) => {
            const res = await sublineList(params);
            return res;
          }}
          params={{
            proFacId: props.id,
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

      {sublineDialogShow ? (
        <CreatOrEditSubline
          onsetkey={() => actionRef.current.reload()}
          isShow={sublineDialogShow}
          editInfo={rowInfo}
          isCreate={isCreate}
          onCancel={() => {
            setSublineDialogShow(false);
            refreshPage();
          }}
          onContinue={() => {
            refreshPage();
          }}
          fkFacId={props.fkFacId}
          id={props.id}
        />
      ) : null}
    </div>
  );
};
export default EdtMod;
