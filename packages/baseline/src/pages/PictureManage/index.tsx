import React, { useState, useEffect, useRef } from 'react';
// import styles from './styles.less';
import { Button, Dropdown, Upload, Input, message, Modal, Space } from 'antd';
import { useModel } from 'umi';
import PicCreate from './component/picCreate';
import UploadModal from './component/uploadModal';
import Details from './component/details';
import { getpk, libList, libdel, matchStation, uploadimg } from './service';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import ProTable from '@ant-design/pro-table';
import { useAccess } from 'umi';
import { useScrollObj } from '../../utils/tableScrollSet';
import { getMenuItem } from '../../utils/commonMethod';

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
  const { initialState, setInitialState } = useModel<any>('@@initialState');
  const actionRef = useRef<any>();
  const [visib, setVisib] = useState(false);
  const [uploadLngFlag, setUploadLngFlag] = useState(false);
  const [isFirst, setIsFirst] = useState(false);
  const [visibdetails, setVisibdetails] = useState(false);
  const [rowInfo, setRowInfo] = useState({});
  const [rowname, setRowname] = useState<any>(null);
  const [libraryId2, setLibraryId2] = useState<any>(0);
  const [pkid, setPkid] = useState('');
  const [keyword, setKeyword] = useState<any>('');
  const [searchPage, setSearchPage] = useState(1);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(10);
  const [rowinfo, setRowinfo] = useState('');
  const [todo, setTodo] = useState('add');
  const [tableData, setTableData] = useState([]);
  const [imgfileStatusList, setImgfileStatusList] = useState<any>([]);

  const scrollObj = useScrollObj(tableData, { x: 1400, y: 'calc(100vh - 220px)' });
  const [selectedRowKey, setSelectedRowKey] = useState<(number | string)[]>([]);
  const access: any = useAccess();

  const refreshPage = () => {
    actionRef.current.reload();
  };

  // 文件上传完毕后自动刷新页面
  useEffect(() => {
    if (initialState?.refreshUploadPage) {
      setInitialState({ ...initialState, refreshUploadPage: false });
      refreshPage();
    }
  }, [initialState?.refreshUploadPage]);

  useEffect(() => {
    if (isFirst) {
      setInitialState({
        ...initialState,
        uploadFun: uploadimg,
        uploadModal: true,
        fileStatusList: imgfileStatusList,
        refreshUploadPage: false,
      });
    }
  }, [isFirst]);
  const beforeUpload = (file: any) => {
    if (!isFirst) {
      setIsFirst(true);
    }
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      setIsFirst(false);
      message.error({
        content: '只能上传JPG或PNG文件!',
        key: '只能上传JPG或PNG文件!',
      });
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 10;
    if (!isLt2M) {
      setIsFirst(false);
      message.error({
        content: '图片大小需小于10MB!',
        key: '图片大小需小于10MB!',
      });
      return false;
    }
    setImgfileStatusList((e: any) => {
      const newfile = { file, status: 'uploading', url: '' };
      return [...e, newfile];
    });
    return false;
  };

  const showdetails = (text: any) => {
    setRowinfo(text);
    setPkid(text.id);
    setVisibdetails(true);
    setRowname(text.libraryName);
  };

  const addpic = async (text: any) => {
    setIsFirst(false);
    setImgfileStatusList([]);
    setInitialState({
      ...initialState,
      uploadFun: uploadimg,
      uploadModal: false,
      fileStatusList: [],
      refreshUploadPage: false,
      otherParams: {
        libraryId: text?.id,
      },
    });
  };

  const showEdit = async (todoinfo: any, rowdata?: any) => {
    if (rowdata) {
      setRowInfo(rowdata);
    }
    setTodo(todoinfo);
    if (todoinfo === 'add') {
      let res: any = {};
      try {
        res = await getpk();
        setLibraryId2(res?.data);
        setVisib(true);
      } catch (error) {
        message.error({
          content: '获取libraryId失败',
          key: '获取libraryId失败',
        });
      }
    } else {
      setLibraryId2(rowdata?.id);
      setVisib(true);
    }
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
      title: '是否删除该图片库/图片?',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const formData = new FormData();
        formData.append('libraryId', params?.ids);
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          const res = await libdel(formData);
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

  const stationBind = async (row: any) => {
    try {
      const { status } = await matchStation({
        facilitiesId: row?.fkFacilitiesId,
        libraryId: row?.id,
      });
      if (status === 0) {
        message.success({
          content: '操作成功！',
          key: '操作成功！',
        });
      }
    } catch (error) {
      message.error({
        content: '获取桩号绑定接口报错',
        key: '获取桩号绑定接口报错',
      });
    }
  };

  const uploadLng = async (row: any) => {
    try {
      setRowInfo(row);
      setUploadLngFlag(true);
    } catch (error) {
      message.error({
        content: '获取libraryId失败',
        key: '获取libraryId失败',
      });
    }
  };

  const handleSelect = (e: any, currentItem: any) => {
    if (e?.key === 'edit') {
      showEdit('edit', currentItem);
    } else if (e?.key === 'delete') {
      delpk('single', currentItem);
    } else if (e?.key === 'station') {
      stationBind(currentItem);
    } else if (e?.key === 'upload') {
      uploadLng(currentItem);
    }
  };

  const columns: any = [
    {
      title: '序号',
      key: 'num',
      width: 50,
      fixed: 'left',
      render: (text: any, record: any, index: any) =>
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
    },
    {
      title: '图片库名称',
      dataIndex: 'libraryName',
      key: 'libraryName',
      width: 150,
      ellipsis: true,
      fixed: 'left',
    },
    {
      title: '图片数量（张）',
      dataIndex: 'imgNums',
      key: 'imgNums',
      width: 120,
    },
    {
      title: '道路名称',
      dataIndex: 'fkFacilitiesName',
      key: 'fkFacilitiesName',
      width: 120,
      ellipsis: true,
    },
    {
      title: '起点',
      dataIndex: 'startPoint',
      key: 'startPoint',
      width: 180,
      ellipsis: true,
    },
    {
      title: '终点',
      dataIndex: 'endPoint',
      key: 'endPoint',
      width: 180,
      ellipsis: true,
    },
    {
      title: '创建人',
      dataIndex: 'crtName',
      width: 100,
      key: 'crtName',
    },
    {
      title: '创建日期',
      dataIndex: 'crtTime',
      width: 150,
      key: 'crtTime',
      textWrap: 'noWrap',
      ellipsis: true,
    },
    {
      title: '操作',
      width: 160,
      key: 'action',
      fixed: 'right',
      render: (text: any, record: any) => {
        const menulist: any = [];
        if (access['libraryManager/index:btn_edit']) {
          menulist.push({ key: 'edit', name: '编辑' });
        }
        if (record?.fkFacilitiesName) {
          menulist.push({ key: 'station', name: '桩号匹配' });
        }
        if (access['libraryManager/index:btn_uploadLng']) {
          menulist.push({ key: 'upload', name: '上传图片信息' });
        }
        if (access['libraryManager/index:btn_singeDel']) {
          menulist.push({ key: 'delete', name: '删除' });
        }
        const menuItems = menulist.map((it: any) => {
          return getMenuItem(it?.name, it?.key);
        });
        // const menuItems = menulist.map((it: any) => {
        //   return <Menu.Item key={it?.key}>{it?.name}</Menu.Item>;
        // });

        return (
          <Space size="middle">
            {access['libraryManager/index:btn_addimg'] ? (
              <Upload
                multiple={true}
                disabled={initialState?.uploadModal}
                maxCount={2000}
                showUploadList={false}
                fileList={initialState?.fileStatusList}
                beforeUpload={beforeUpload}
              >
                <a
                  className={`ahover ${initialState?.uploadModal ? 'uploadingClass' : null}`}
                  onClick={initialState?.uploadModal ? () => {} : () => addpic(text)}
                >
                  上传图片
                </a>
              </Upload>
            ) : null}
            {access['libraryManager/index:btn_details'] ? (
              <a className="ahover" onClick={() => showdetails(text)}>
                详情
              </a>
            ) : null}
            {menulist?.length > 0 ? (
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
            ) : null}
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

  const crtCancel = () => {
    setVisib(false);
  };

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
  // const pageChange = (page: any) => {
  //   setSearchPage(page);
  //   setTabpage(page);
  //   setSelectedRowKey([]);
  // };
  return (
    <div className={'commonTableClass'}>
      {/* 顶部按钮 */}
      <div className={'row-class'}>
        <div className="left-box">
          {access['libraryManager/index:btn_add'] ? (
            <Button type="primary" className={'buttonClass'} onClick={() => showEdit('add')}>
              创建
            </Button>
          ) : null}
          {access['libraryManager/index:btn_del'] && (
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
            placeholder="请输入图片库名称关键字"
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
          request={libList}
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
          // onRequestError={reqErr}
          onChange={changetabval}
        />
      </div>
      {visibdetails && (
        <Details
          visibdetails={visibdetails}
          onCancel={() => {
            setVisibdetails(false);
            refreshPage();
          }}
          rowname={rowname}
          pkid={pkid}
          rowinfo={rowinfo}
        />
      )}
      {uploadLngFlag && (
        <UploadModal
          uploadLngFlag={uploadLngFlag}
          onCancel={() => {
            setUploadLngFlag(false);
          }}
          refreshPage={refreshPage}
          // pkid={libraryIdUpload}
          rowinfo={rowInfo}
        />
      )}
      {visib && (
        <PicCreate
          libraryId={libraryId2}
          visib={visib}
          rowInfo={rowInfo}
          todo={todo}
          noCancel={() => crtCancel()}
          createSuccess={() => refreshPage()}
        />
      )}
    </div>
  );
};
