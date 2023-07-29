import React, { useState, useRef } from 'react';
import { Input, Button, Dropdown, Space, message, Modal, Tooltip, Upload } from 'antd';
import { getListInfo, delModOne, delModlist, putModel, verifyfile } from './service';
import ProTable from '@ant-design/pro-table';
import CreateEditModel from './components/createEditModel';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useScrollObjSta } from '../../../utils/tableScrollSet';
import { useAccess } from 'umi';
import { getMenuItem } from '../../../utils/commonMethod';

const { confirm } = Modal;
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

export default (): React.ReactElement => {
  const [crtusershow, setCrtusershow] = useState(false);
  const [names, setNames] = useState<any>();
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(20);
  const [tableData, setTableData] = useState([]);
  const scrollObj = useScrollObjSta(tableData, { x: 1000, y: 'calc(100vh - 215px)' });
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);
  const [edtShow, setEdtShow] = useState(false);
  const [edtInfo, setEdtInfo] = useState<any>();
  const [searchPage, setSearchPage] = useState(1);

  const access: any = useAccess();
  const ref = useRef<any>();
  const Searchs = (e: any) => {
    setNames(e.trim());
    setSearchPage(1);
    setSelectedRowKey([]);
    ref.current.reload();
  };

  const setkeywords = () => {
    ref.current.reload();
  };

  const delUser = async (text: any) => {
    confirm({
      title: '算法模型将删除，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        // const formData = new FormData();
        // formData.append('id', text.id);

        const obj = {
          id: text.id,
        };
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          const res = await delModOne(obj);
          hide();
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            setkeywords();
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
  const delList = async () => {
    confirm({
      title: '算法模型将删除，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const formData = new FormData();
        formData.append('ids', selectedRowKey);
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          const res = await delModlist(formData);
          hide();
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            setSelectedRowKey([]);
            setkeywords();
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
  // const verify = (recode: any)=>{

  // }
  const handleSelect = (e: any, currentItem: any) => {
    if (e?.key === 'verify' && currentItem.deployStatus !== 3) {
      // verify('verify', currentItem);
    } else if (e?.key === 'delete') {
      delUser(currentItem);
    }
  };

  const beforeUpload = (fileinfos: any, text: any) => {
    // setFilenum(1)
    const reader = new FileReader();
    reader.readAsDataURL(fileinfos);
    reader.onload = async () => {
      const formData = new FormData();
      formData.append('file', fileinfos);
      formData.append('useModelFileId', text.useModelFileId);
      try {
        const res = await verifyfile(formData);
        if (res.status === 0) {
          if (res.data) {
            message.error({
              content: res.message,
              key: res.message,
            });
          } else {
            message.success({
              content: '验证成功',
              key: '验证成功',
            });
          }
        }
        // else {
        //   message.error({
        //     content: res.message,
        //     key: res.message,
        //   });
        // }
        setkeywords();
        return false;
      } catch (error) {
        message.error({
          content: '验证失败',
          key: '验证失败',
        });
        return false;
      }
    };
    return false;
  };

  const column: any = [
    {
      title: '序号',
      key: 'id',
      render: (text: any, record: any, index: any) =>
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
      // `${(tabpage - 1) * tabpagesize + (index + 1)}`,
      width: 80,
    },
    {
      title: '模型名称',
      dataIndex: 'modelName',
      key: 'modelName',
      width: 190,
      ellipsis: true,
    },
    {
      title: '模型类型',
      dataIndex: 'modelType',
      key: 'modelType',
      width: 180,
      valueEnum: {
        0: { text: '沥青路面目标检测（大模型）' },
        // 1: { text: '沥青路面图像分割' },
        2: { text: '沥青路面目标检测（小模型）' },
        3: { text: '附属设施识别算法模型' },
        4: { text: '农村公路单车道定检模型' },
      },
      ellipsis: true,
    },
    {
      title: '当前版本',
      dataIndex: 'modelVersion',
      key: 'modelVersion',
      width: 200,
      ellipsis: true,
    },
    {
      title: '发布状态',
      dataIndex: 'deployStatus',
      key: 'deployStatus',
      valueEnum: {
        1: { text: '待上架', status: 'Default' },
        2: { text: '上架中', status: 'Processing' },
        3: { text: '已上架', status: 'Success' },
        4: { text: '上架失败', status: 'Error' },
      },
      width: 100,
    },
    {
      title: '验证状态',
      dataIndex: 'checkStatus',
      key: 'checkStatus',
      valueEnum: {
        1: { text: '待验证', status: 'Default' },
        2: { text: '已验证', status: 'Success' },
        3: { text: '验证失败', status: 'Error' },
      },
      width: 100,
    },
    {
      title: '应用场景',
      dataIndex: 'useScene',
      key: 'useScene',
      width: 120,
      ellipsis: true,
      render: (text: any, recode: any) => {
        if (!recode.useScene) return '-';
        return (
          <Tooltip
            title={recode.useScene
              .replace('[', '')
              .replace(']', '')
              .replace(/ /g, '')
              .split(',')
              .join()}
          >
            <span>
              {recode.useScene
                .replace('[', '')
                .replace(']', '')
                .replace(/ /g, '')
                .split(',')
                .join()}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: '描述',
      dataIndex: 'remark',
      key: 'remark',
      width: 120,
      ellipsis: true,
    },
    {
      title: '创建时间',
      dataIndex: 'crtTime',
      key: 'crtTime',
      width: 160,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (text: any, recode: any) => {
        const menulist: any = [];
        if (access['modelmanage/modellist/index:btn_check']) {
          menulist.push({ key: 'verify', name: '验证' });
        }
        if (access['modelmanage/modellist/index:btn_del']) {
          menulist.push({ key: 'delete', name: '删除' });
        }
        const menuItems = menulist.map((it: any) => {
          if (it?.key === 'verify') {
            const labelName =
              text.deployStatus === 3 ? (
                <Upload
                  accept=".png,.jpg,.bmp,.gif,.svg,.jpeg"
                  multiple={false}
                  maxCount={1}
                  showUploadList={false}
                  beforeUpload={(e) => beforeUpload(e, text)}
                >
                  {it?.name}
                </Upload>
              ) : (
                it?.name
              );
            return getMenuItem(labelName, it?.key, text.deployStatus !== 3);
          }
          return getMenuItem(it?.name, it?.key);
        });
        // const menuItems = menulist.map((it: any) => {
        //   return (
        //     <Menu.Item
        //       className={`${text.deployStatus !== 3 && it?.key === 'verify' && 'disableCss'}`}
        //       key={it?.key}
        //     >
        //       {text.deployStatus === 3 && it?.key === 'verify' ? (
        //         <Upload
        //           accept=".png,.jpg,.bmp,.gif,.svg,.jpeg"
        //           multiple={false}
        //           maxCount={1}
        //           showUploadList={false}
        //           beforeUpload={(e) => beforeUpload(e, text)}
        //         >
        //           {it?.name}
        //         </Upload>
        //       ) : (
        //         it?.name
        //       )}
        //     </Menu.Item>
        //   );
        // });
        return (
          <Space size="middle">
            {/* {roleManager_index_btn_del ? ( */}
            {access['modelmanage/modellist/index:btn_edt'] && (
              <a
                className={`ahover ${
                  text.deployStatus * 1 !== 1 && text.deployStatus !== 4 && 'disableCss'
                }`}
                onClick={() => {
                  if (text.deployStatus * 1 !== 1 && text.deployStatus !== 4) return;
                  setEdtInfo(recode);
                  setEdtShow(true);
                  setCrtusershow(true);
                }}
              >
                编辑
              </a>
            )}
            {access['modelmanage/modellist/index:btn_push'] && (
              <a
                className={`ahover ${
                  !text.deployStatus || text.deployStatus === 2 ? 'disableCss' : ''
                }`}
                onClick={() => {
                  if (!text.deployStatus || text.deployStatus === 2) return;
                  confirm({
                    title:
                      text.deployStatus * 1 === 1 || text.deployStatus * 1 === 4
                        ? '算法模型将发布上架，是否继续？'
                        : '算法模型已发布上架，是否需要下架？',
                    icon: <ExclamationCircleOutlined />,
                    okText: '确定',
                    okType: 'danger',
                    cancelText: '取消',
                    async onOk() {
                      const formData = new FormData();
                      formData.append('useModelFileId', text.useModelFileId);
                      formData.append(
                        'type',
                        text.deployStatus * 1 === 1 || text.deployStatus * 1 === 4 ? '1' : '2',
                      );
                      const hide = message.loading({
                        content: '正在发布',
                        key: '正在发布',
                      });
                      try {
                        const res = await putModel(formData);
                        hide();
                        if (res.status === 0) {
                          if (text.deployStatus * 1 === 1 || text.deployStatus * 1 === 4) {
                            if (res.data) {
                              message.error({
                                content: res.message,
                                key: res.message,
                              });
                            } else {
                              message.success({
                                content: '发布成功',
                                key: '发布成功',
                              });
                            }
                          } else if (res.data) {
                            message.error({
                              content: res.message,
                              key: res.message,
                            });
                          } else {
                            message.success({
                              content: '下架成功',
                              key: '下架成功',
                            });
                          }
                        }
                        // else {
                        //   message.error({
                        //     content: res.message,
                        //     key: res.message,
                        //   });
                        // }
                        setkeywords();
                        return true;
                      } catch (error) {
                        hide();
                        message.error({
                          content: '发布失败!',
                          key: '发布失败!',
                        });
                        return false;
                      }
                    },
                    onCancel() {},
                  });
                }}
              >
                {text.deployStatus * 1 === 3 ? '下架' : '发布'}
              </a>
            )}
            <Dropdown
              menu={{ items: menuItems, onClick: (key: any) => handleSelect(key, text) }}
              // overlay={() => {
              //   return (
              //     <Menu onClick={(key: any) => handleSelect(key, text)} items={menuItems}></Menu>
              //   );
              // }}
            >
              <span className="dropDownNameClass ahover">
                更多<span className="dropDownIcon"></span>
              </span>
            </Dropdown>
          </Space>
        );
      },
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
    if (tableData.length !== dataSource.length) {
      setTableData(dataSource);
    }
  };
  // 选中当前行
  const onSelectChange = (selectedRowKeys: any) => {
    // setSelectedRow(selectedRows[0]);
    setSelectedRowKey(selectedRowKeys);
  };

  const clickRow = (record: any) => {
    const arr = selectedRowKey.filter((i: any) => i !== record.id);
    if (selectedRowKey.includes(record.id)) setSelectedRowKey(arr);
    else setSelectedRowKey([...arr, record.id]);
    // setSelectedRow(record);
    // setSelectedRowKey([record.id]); // 单选
  };

  // const pageChange = (page: any) => {
  //   setSearchPage(page);
  //   setTabpage(page);
  //   setSelectedRowKey([]);
  //   // setTabpagesize(pageSize);
  // };
  return (
    <div className={'commonTableClass'}>
      <div className={'row-class'}>
        <div className="left-box">
          {access['modelmanage/modellist/index:btn_add'] && (
            <Button
              className={'buttonClass'}
              type="primary"
              onClick={() => {
                setCrtusershow(true);
              }}
            >
              创建
            </Button>
          )}
          {access['modelmanage/modellist/index:btn_delList'] && (
            <Button
              className={'buttonClass'}
              disabled={selectedRowKey.length === 0}
              onClick={delList}
            >
              批量删除
            </Button>
          )}
        </div>
        <div className="right-search">
          <Search
            placeholder="请输入模型名称关键字"
            allowClear
            onSearch={(e) => Searchs(e)}
            maxLength={50}
            style={{
              width: 270,
              height: 40,
              verticalAlign: 'top',
              float: 'right',
            }}
            enterButton
            className="facilitysel"
          />
        </div>
      </div>
      <div className="table-box-normal">
        <ProTable<Member>
          columns={column}
          request={getListInfo}
          onLoad={onLoad}
          params={{
            keyword: names,
            // current: searchPage,
          }}
          rowKey="id"
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
          pagination={{
            showQuickJumper: false,
            current: searchPage,
            // onChange: pageChange,
            // defaultPageSize: 10,
          }}
          // polling={60000}
          tableAlertRender={false}
          toolBarRender={false}
          search={false}
          actionRef={ref}
          scroll={scrollObj || { x: '100%' }}
          // onRequestError={reqErr}
          onChange={changetabval}
        />
      </div>
      {crtusershow ? (
        <CreateEditModel
          onsetkey={setkeywords}
          edtShow={edtShow}
          crtusershow={crtusershow}
          edtInfo={edtInfo}
          onCancel={() => {
            setEdtShow(false);
            setCrtusershow(false);
          }}
        />
      ) : null}
    </div>
  );
};
