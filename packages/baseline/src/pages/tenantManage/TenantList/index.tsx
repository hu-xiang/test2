import React, { useState, useEffect, useRef } from 'react';
import styles from './styles.less';
import { Button, Switch, Form, message, Row, Col, Space, Modal } from 'antd';
import ProTable from '@ant-design/pro-table';
import ProForm, { ProFormSelect, ProFormText } from '@ant-design/pro-form';
import { getListInfo, generateNum, editTenantStatus, downloadExcel } from './service';
import ImportModal from './components/AddorEditModal';
import { useAccess, useHistory } from 'umi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useScrollQueObj } from '../../../utils/tableScrollSet';
import { exportCom } from '../../../utils/exportCom';
import type { FormType } from './data';
import { isEqual } from 'lodash';

const { confirm } = Modal;
// type Iprops = {
//   tabValue: string;
// };
const TenantList: React.FC = () => {
  const [formModel] = Form.useForm();
  const searchFormList: FormType = {
    keyword: '', // 关键字
    tenantType: '',
    serviceStatus: '',
  };
  const history = useHistory();
  const totalLimit: number = 10000;
  const [searchList, setSearchList] = useState<FormType>(searchFormList);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(20);
  const [searchPage, setSearchPage] = useState(1);
  const [dataTotal, setDataTotal] = useState<any>();
  const [selectedRowKey, setSelectedRowKey] = useState<(number | string)[]>([]);
  const [modalShow, setModalShow] = useState<boolean>(false);
  const [todo, setTodo] = useState<string>('add');
  const [rowInfo, setRowInfo] = useState<any>();
  const [tableData, setTableData] = useState<any>([]);
  const [tenantNum, setTenantNum] = useState<string>('');
  const access: any = useAccess();
  const scrollObj = useScrollQueObj(tableData, { x: 1380, y: 'calc(100vh - 376px)' });
  const actionRef = useRef<any>();

  const tenentTypeValues = [
    {
      label: '全部',
      value: '',
    },
    {
      label: '普通',
      value: 0,
    },
    {
      label: '专业',
      value: 1,
    },
    {
      label: '进阶',
      value: 2,
    },
  ];
  const serviceStatusValues: any = [
    {
      label: '全部',
      value: '',
    },
    {
      label: '启动',
      value: true,
    },
    {
      label: '停用',
      value: false,
    },
  ];
  // const pageChange = (page: any) => {
  //   setSearchPage(page);
  //   setTabpage(page);
  //   setSelectedRowKey([]);
  // };

  // 刷新页面
  // 查询页面
  const queryPages = () => {
    setSearchPage(1);
    setSelectedRowKey([]);
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
    setSelectedRowKey([]);
  };
  const setRefreshPage = () => {
    actionRef.current.reload();
  };

  const popModal = async (todoVal: any, row?: any) => {
    setTodo(todoVal);
    if (todoVal === 'add') {
      const res = await generateNum();
      if (res?.status === 0) {
        setTenantNum(res?.data);
        setModalShow(true);
      }
    } else if (todoVal === 'edit') {
      setModalShow(true);
      setRowInfo(row);
    } else if (todoVal === 'set') {
      sessionStorage.setItem('tenantID', row?.id);
      sessionStorage.setItem('userID', row?.userId);
      history.push(`/tenantManage/TenantList/ConfigInfo`);
      setRowInfo(row);
    }
  };
  // const onDel = (text?: any) => {
  //   confirm({
  //     title: '该租户将删除，是否继续？',
  //     icon: <ExclamationCircleOutlined />,
  //     okText: '确定',
  //     okType: 'danger',
  //     cancelText: '取消',
  //     async onOk() {
  //       try {
  //         const res = await delInfo(text?.id);
  //         if (res.status === 0) {
  //           message.success({
  //             content: '删除成功',
  //             key: '删除成功',
  //           });
  //           setSelectedRowKey([]);
  //           actionRef.current.reload();
  //         } else {
  //           message.error({
  //             content: res.message,
  //             key: res.message,
  //           });
  //         }
  //         return true;
  //       } catch (error) {
  //         message.error({
  //           content: '删除失败!',
  //           key: '删除失败!',
  //         });
  //         return false;
  //       }
  //     },
  //     onCancel() {},
  //   });
  // };
  const switchChange = async (text: any, row: any) => {
    try {
      confirm({
        title: text ? '该服务将启动，是否继续？' : '该服务将停用，是否继续？',
        icon: <ExclamationCircleOutlined />,
        okText: '确定',
        okType: 'danger',
        cancelText: '取消',
        async onOk() {
          try {
            const res = await editTenantStatus({ tenantId: row?.id, serviceStatus: text });
            if (res.status === 0) {
              message.success({
                content: '修改成功',
                key: '修改成功',
              });
              setRefreshPage();
            } else {
              // message.error({
              //   content: res.message,
              //   key: res.message,
              // });
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
    } catch (error) {
      // message.error({
      //   content: '操作失败!',
      //   key: '操作失败!',
      // });
    }
  };

  const column: any = [
    {
      title: '序号',
      key: 'nums',
      render: (text: any, record: any, index: any) =>
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
      width: 50,
    },
    {
      title: '租户编号',
      dataIndex: 'tenantNum',
      key: 'tenantNum',
      width: 100,
    },
    {
      title: '租户名称',
      dataIndex: 'tenantName',
      key: 'tenantName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '租户类型',
      dataIndex: 'tenantTypeName',
      key: 'tenantTypeName',
      width: 60,
      ellipsis: true,
    },
    /**
     * v1.0.6增加使用区域
     */
    {
      title: '使用区域',
      dataIndex: 'useArea',
      key: 'useArea',
      width: 150,
      ellipsis: true,
    },
    {
      title: '系统版本',
      dataIndex: 'tenantVersion',
      key: 'tenantVersion',
      width: 80,
      ellipsis: true,
    },
    {
      title: '服务状态',
      dataIndex: 'serviceStatus',
      key: 'serviceStatus',
      width: 60,
      render: (text: any, row: any) => {
        return (
          <Switch
            checkedChildren="启动"
            unCheckedChildren="停用"
            checked={text}
            className="tenantSwitchClass"
            onChange={(evt: any) => {
              switchChange(evt, row);
            }}
          />
        );
      },
    },
    {
      title: '域名子目录',
      dataIndex: 'domainSubdirectory',
      key: 'domainSubdirectory',
      ellipsis: true,
      width: 150,
    },
    {
      title: '创建日期',
      dataIndex: 'crtTime',
      key: 'crtTime',
      width: 150,
      ellipsis: true,
    },
    {
      title: '服务到期日期',
      dataIndex: 'serverExpirationTime',
      key: 'serverExpirationTime',
      width: 120,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 80,
      render: (text: any, row: any) => (
        <Space size="middle">
          {access['tenantManage/TenantList/index:btn_edit'] ? (
            <a
              className="ahover"
              onClick={() => {
                popModal('edit', row);
              }}
            >
              编辑
            </a>
          ) : null}
          {access['tenantManage/TenantList/index:btn_config'] ? (
            <a
              className="ahover"
              onClick={() => {
                popModal('set', row);
              }}
            >
              配置
            </a>
          ) : null}
          {/* {access['tenantManage/TenantList/index:btn_delete'] ? (
            <a
              className="ahover"
              onClick={() => {
                onDel(row);
              }}
            >
              删除
            </a>
          ) : null} */}
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
    if (selectedRowKey?.length > totalLimit) {
      message.error({
        content: `超过数据上限，最多可导出${totalLimit}条数据!`,
        key: `超过数据上限，最多可导出${totalLimit}条数据!`,
      });
      return;
    }
    const dataVal = formModel.getFieldsValue(true);
    const params = {
      ids: selectedRowKey?.length === 0 ? [] : selectedRowKey,
      ...dataVal,
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
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, []);

  return (
    <div className={`${styles.tenantContainer} commonTableClass`}>
      <div className={` ${styles.topHead} topHead`}>
        <div className={styles.leftRow}>
          <ProForm // 配置按钮的属性
            form={formModel}
            isKeyPressSubmit={true}
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
            className={styles.topFormClass}
          >
            <Row gutter={10} className={styles.firstRowClass}>
              <Col span={8}>
                <ProFormText
                  name="keyword"
                  label="综合搜索"
                  placeholder="请输入用户编号、租户名称"
                />
              </Col>
              <Col span={8}>
                <ProFormSelect
                  name="tenantType"
                  label="租户类型"
                  fieldProps={{ options: tenentTypeValues }}
                  placeholder="请选择"
                />
                {/* </Form.Item> */}
              </Col>
              <Col span={8}>
                <ProFormSelect
                  name="serviceStatus"
                  label="服务状态"
                  fieldProps={{ options: serviceStatusValues }}
                  placeholder="请选择"
                />
              </Col>
            </Row>
          </ProForm>
        </div>
        <div className={styles.rightBtnBox}>
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
        {access['tenantManage/TenantList/index:btn_create'] && (
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
        {access['tenantManage/TenantList/index:btn_batchExport_list'] && (
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
      </div>
      <div
        className={`tabBoxCommon ${
          access['tenantManage/TenantList/index:btn_batchExport_list'] ||
          access['tenantManage/TenantList/index:btn_create']
            ? null
            : `tabBoxButton`
        }`}
      >
        <ProTable<FormType>
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
            defaultPageSize: 20,
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
          tableAlertRender={false}
        />
      </div>
      {modalShow ? (
        <ImportModal
          todo={todo}
          modalShow={modalShow}
          tenantNum={tenantNum}
          rowInfo={rowInfo}
          onCancel={() => setModalShow(false)}
          refreshPage={setRefreshPage}
        />
      ) : null}
    </div>
  );
};
export default TenantList;
