import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.less';
import { Button, Form, message, Row, Col, Space, Modal } from 'antd';
import ProTable from '@ant-design/pro-table';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { dellistinfo, getListInfo } from './service';
import CrtOreditModal from './components/crtOreditModal';
import { useAccess } from 'umi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useDiseaseScrollObj } from 'baseline/src/utils/tableScrollSet';
import type { FormType } from './data.d';
import { checkTypeValues, checkTypeDatas } from './data.d';
import ImportModal from '../components/ImportModal';
import TooltipModal from 'baseline/src/components/TooltipModal';
import { isEqual } from 'lodash';

const { confirm } = Modal;
// type Iprops = {
//   tabValue: string;
// };
const importRequestList = [
  { url: '/traffic-bsl/standardCitation/downLoad', method: 'get', blob: true },
  { url: '/traffic-bsl/standardCitation/importExcel', method: 'post', blob: true },
];

const StandardQuoteList: React.FC = () => {
  const [formModel] = Form.useForm();
  const searchFormList = {
    name: '', // 关键字
    type: undefined,
  };
  const [searchList, setSearchList] = useState<typeof searchFormList>(searchFormList);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(20);
  const [searchPage, setSearchPage] = useState(1);
  const [dataTotal, setDataTotal] = useState<any>();
  const [selectedRowKey, setSelectedRowKey] = useState<(number | string)[]>([]);
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [todo, setTodo] = useState<string>('add');
  const [pickItem, setPickItem] = useState<string>('');
  const [rowInfo, setRowInfo] = useState<any>();
  const [tableData, setTableData] = useState<any>([]);
  const [itemModalShow, setItemModalShow] = useState<boolean>(false);
  const access: any = useAccess();
  const scrollObj = useDiseaseScrollObj(tableData, { x: 1380, y: 'calc(100vh - 376px)' });
  const actionRef = useRef<any>();
  const [newColumn, setNewColumn] = useState<any>([]);
  const [isImportModal, setIsImportModal] = useState<boolean>(false);

  // const pageChange = (page: any) => {
  //   setSearchPage(page);
  //   setTabpage(page);
  //   setSelectedRowKey([]);
  // };

  // 刷新页面
  // 查询页面
  const queryPages = () => {
    setSearchPage(1);
    const formdata = formModel.getFieldsValue(true);
    const formData = {
      ...formdata,
      searPage: 1,
    };
    setSearchList({ ...formData });
    actionRef.current.reload();
  };
  // 重置
  const resetQueryPages = () => {
    formModel.setFieldsValue({ ...searchFormList });
    setSearchList({ ...searchFormList });
    if (!isEqual(searchFormList, searchList)) {
      setSearchPage(1);
    }
  };
  const setRefreshPage = () => {
    actionRef.current.reload();
  };

  const handleModal = async (todoVal: any, row?: any) => {
    setTodo(todoVal);
    if (todoVal === 'edit') {
      setRowInfo(row);
    }
    setModalShow(true);
  };
  const handleViewItem = (txt: string) => {
    setPickItem(txt);
    setItemModalShow(true);
  };
  const refreshTable = () => {
    resetQueryPages();
    setRefreshPage();
  };
  const onDel = (deleteType: string, text?: any) => {
    confirm({
      title: '标准信息将删除，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          const newIds: any = deleteType === 'batch' ? selectedRowKey : text?.id;
          const res = await dellistinfo({ idList: newIds });
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            setSelectedRowKey([]);
            setRefreshPage();
          } else {
            message.error({
              content: res.message,
              key: res.message,
            });
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
      title: '标引名称',
      dataIndex: 'citationName',
      key: 'citationName',
      width: 100,
      ellipsis: true,
    },
    {
      title: '标引条目',
      dataIndex: 'citationEntry',
      key: 'citationEntry',
      width: 100,
      ellipsis: true,
    },
    {
      title: '标准规范名称',
      dataIndex: 'standardSpecificationName',
      key: 'standardSpecificationName',
      width: 250,
      ellipsis: true,
    },
    {
      title: '排查类型',
      dataIndex: 'checkType',
      key: 'checkType',
      width: 250,
      ellipsis: true,
      render: (text: any, record: any) => {
        return (
          <div>
            <span>{checkTypeDatas[record?.checkType] || '-'}</span>
          </div>
        );
      },
    },
    {
      title: '标准内容',
      dataIndex: 'standardContent',
      key: 'standardContent',
      render: (text: any) => (
        <div
          className={styles['item-class']}
          onClick={() => {
            handleViewItem(text);
          }}
        >
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 114,
      render: (text: any, row: any) => (
        <Space size="middle">
          {access['hiddenDangerCheck/StandardQuote/index:btn_edit'] ? (
            <a
              className={`ahover`}
              onClick={() => {
                handleModal('edit', row);
              }}
            >
              编辑
            </a>
          ) : // <a
          //   className={'ahover'}
          //   onClick={() => {
          //     handleModal('edit', row);
          //   }}
          // >
          //   编辑
          // </a>
          null}
          {access['hiddenDangerCheck/StandardQuote/index:btn_del'] ? (
            <a
              className={`ahover`}
              onClick={() => {
                onDel('single', row);
              }}
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

  const handleSubmit = () => {
    const formdata = formModel.getFieldsValue(true);
    setSearchList({ ...formdata });
  };
  useEffect(() => {
    const listener = (event: any) => {
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        event.preventDefault();
        handleSubmit();
      }
    };
    document.addEventListener('keydown', listener);
    if (
      access['hiddenDangerCheck/StandardQuote/index:btn_edit'] ||
      access['hiddenDangerCheck/StandardQuote/index:btn_del']
    ) {
      setNewColumn(column);
    } else {
      column.pop();
      setNewColumn(column);
    }
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, []);
  // const rowSelection = {
  //   getCheckboxProps: (record: any) => ({
  //     disabled: record.flag === true,
  //   }),
  // };

  return (
    <div className={`${styles['container-box']} commonTableClass`}>
      <div className={` ${styles['top-head']} topHead`}>
        <div className={styles['left-row']}>
          <ProForm // 配置按钮的属性
            form={formModel}
            isKeyPressSubmit={true}
            colon={false}
            submitter={{
              // 配置按钮的属性
              resetButtonProps: {
                style: {
                  // 隐藏重置按钮
                  display: 'none',
                },
              },
              submitButtonProps: {
                style: {
                  // 隐藏重置按钮
                  display: 'none',
                },
              },
            }}
            layout="horizontal"
          >
            <Row gutter={10}>
              <Col span={12}>
                <ProFormText name="name" label="标准规范名称" placeholder="请输入标准规范名称" />
              </Col>
              <Col span={12}>
                <ProFormSelect
                  name="type"
                  label="排查类型"
                  fieldProps={{ options: checkTypeValues }}
                  placeholder="请选择"
                />
              </Col>
            </Row>
          </ProForm>
        </div>
        <div className={styles['right-btn-box']}>
          <Button
            type="primary"
            onClick={() => {
              queryPages();
            }}
          >
            查询
          </Button>
          <Button
            onClick={() => {
              resetQueryPages();
            }}
          >
            清除
          </Button>
        </div>
      </div>
      <div className={'buttonRowClass'}>
        {access['hiddenDangerCheck/StandardQuote/index:btn_create'] && (
          <Button
            type="primary"
            className={'buttonClass'}
            onClick={() => {
              handleModal('add');
            }}
          >
            创建
          </Button>
        )}
        {access['hiddenDangerCheck/StandardQuote/index:btn_import'] && (
          <Button className={'buttonClass'} onClick={() => setIsImportModal(true)}>
            批量导入
          </Button>
        )}
        {access['hiddenDangerCheck/StandardQuote/index:btn_batchdel'] && (
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
      <div
        className={`tabBoxCommon ${
          access['hiddenDangerCheck/StandardQuote/index:btn_create'] ||
          access['hiddenDangerCheck/StandardQuote/index:btn_batchdel']
            ? null
            : `tabBoxButton`
        }`}
      >
        <ProTable<FormType>
          actionRef={actionRef}
          columns={newColumn}
          request={async (params) => {
            const res = await getListInfo(params);
            setDataTotal(res.total * 1);
            return res;
          }}
          onLoad={onLoad}
          onChange={changetabval}
          params={searchList}
          pagination={{
            showQuickJumper: false,
            defaultPageSize: 20,
            current: searchPage,
          }}
          rowKey="id"
          toolBarRender={false}
          search={false}
          scroll={scrollObj || { x: '100%' }}
          rowSelection={{
            selectedRowKeys: selectedRowKey,
            type: 'checkbox',
            onChange: onSelectChange,
            // ...rowSelection,
          }}
          onRow={(record) => {
            return {
              onClick: (e: any) => {
                if (record?.flag) return;
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
        <CrtOreditModal
          todo={todo}
          modalShow={modalShow}
          rowInfo={rowInfo}
          onCancel={() => setModalShow(false)}
          refreshPage={setRefreshPage}
        />
      ) : null}
      {itemModalShow ? (
        <TooltipModal
          title={'排查项详细信息'}
          modalShow={itemModalShow}
          nwidth={620}
          onModalCancel={() => setItemModalShow(false)}
        >
          <div>{pickItem}</div>
        </TooltipModal>
      ) : null}
      {isImportModal && (
        <ImportModal
          isImportModal={isImportModal}
          requestList={importRequestList}
          onCancel={() => setIsImportModal(false)}
          onOk={() => {
            setIsImportModal(false);
            refreshTable();
          }}
        />
      )}
    </div>
  );
};
export default StandardQuoteList;
