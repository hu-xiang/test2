import React, { useState, useRef } from 'react';
import styles from './styles.less';
import { Button, Space, message, Modal } from 'antd';
import { getStatInfo, delstack, delstacklist, educestacklist } from './service';
import ProTable from '@ant-design/pro-table';
import CrtModel from './component/uploadFile';
import EdtMod from './component/edtMod';
import { useHistory } from 'umi';
// import { isExist } from '@/utils/commonMethod';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useScrollObjSta } from '../../../../utils/tableScrollSet';
import { exportCom } from '../../../../utils/exportCom';
import { ReactComponent as ListBack } from '../../../../assets/img/backDisease/back.svg';

const { confirm } = Modal;

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
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(20);
  const [tableData, setTableData] = useState([]);
  const scrollObj = useScrollObjSta(tableData, { x: 1200, y: 'calc(100vh - 225px)' });
  const [selectedRowKey, setSelectedRowKey] = useState<any>([]);
  const [edtShow, setEdtShow] = useState(false);
  const [edtInfo, setEdtInfo] = useState<any>();
  const [searchPage, setSearchPage] = useState(1);
  const facilityID: any = sessionStorage.getItem('facilityID');

  const ref = useRef<any>();
  const history = useHistory();
  // const Searchs = (e: any) => {
  //   setNames(e.trim());
  //   setSearchPage(1);
  //   ref.current.reload();
  // };

  const setkeywords = () => {
    ref.current.reload();
  };

  const delUser = async (id: any) => {
    confirm({
      title: '数据将删除，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const formData = new FormData();
        formData.append('id', id);
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          const res = await delstack(formData);
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
      title: '数据将删除，是否继续？',
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
          const res = await delstacklist(formData);
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
  const downloadflie = async () => {
    const formData = new FormData();
    formData.append('ids', selectedRowKey);
    formData.append('id', facilityID);
    formData.append('keyword', '');
    const hide = message.loading({
      content: '正在导出',
      key: '正在导出',
    });
    try {
      const res: any = await educestacklist(formData);
      hide();
      exportCom(res);
      message.success({
        content: '导出成功',
        key: '导出成功',
      });
      return true;
    } catch (error) {
      hide();
      message.error({
        content: '导出失败!',
        key: '导出失败!',
      });
      return false;
    }
  };

  const column: any = [
    {
      title: '序号',
      key: 'id',
      render: (text: any, record: any, index: any) =>
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
      // `${(tabpage - 1) * tabpagesize + (index + 1)}`,
      width: 100,
    },
    {
      title: '道路名称',
      dataIndex: 'facilitiesName',
      key: 'facilitiesName',
      width: 200,
      ellipsis: true,
    },
    {
      title: '道路编码',
      dataIndex: 'roadSection',
      key: 'roadSection',
      width: 200,
      ellipsis: true,
    },
    {
      title: '经度',
      dataIndex: 'longitude',
      key: 'longitude',
      width: 120,
    },
    {
      title: '纬度',
      dataIndex: 'latitude',
      key: 'latitude',
      width: 120,
    },
    {
      title: '桩号',
      dataIndex: 'stakeNum',
      key: 'stakeNum',
      width: 120,
    },
    {
      title: '路线方向',
      dataIndex: 'routeMode',
      key: 'routeMode',
      valueEnum: {
        0: '上行',
        1: '下行',
      },
      width: 120,
    },
    {
      title: '坐标系类型',
      dataIndex: 'coordinateSystemType',
      key: 'coordinateSystemType',
      width: 120,
      valueEnum: {
        0: 'WGS84',
        2: 'GCJ02',
        3: 'BD09',
      },
      ellipsis: true,
    },
    {
      title: '上传日期',
      dataIndex: 'crtTime',
      key: 'crtTime',
      width: 160,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (text: any) => (
        <Space size="middle">
          <a
            className="ahover"
            onClick={() => {
              setEdtInfo(text);
              setEdtShow(true);
            }}
          >
            编辑
          </a>
          <a className="ahover" onClick={() => delUser(text.id)}>
            删除
          </a>
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
    <div id={styles.container} className={'commonTableClass'}>
      <div
        className={styles.taskBack}
        onClick={() => {
          history.push('/facilitymanage/facilitylist');
        }}
      >
        <ListBack />
        <div className={styles.backText}>道路列表</div>
      </div>
      <div className={'row-class'} style={{ marginTop: '0px' }}>
        <div className="left-box">
          {/* <Search
            placeholder="请输入设施名称关键字"
            allowClear
            onSearch={(e) => Searchs(e)}
            style={{
              width: 270,
              height: 40,
              verticalAlign: 'top',
              float: 'right',
            }}
            enterButton
            className="Stationsel"
          /> */}
          <Button type="primary" className={'buttonClass'} onClick={() => setCrtusershow(true)}>
            批量导入
          </Button>
          <Button
            className={'buttonClass'}
            onClick={() => {
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
            }}
          >
            批量导出
          </Button>
          <Button
            className={'buttonClass'}
            disabled={selectedRowKey.length === 0}
            onClick={delList}
          >
            批量删除
          </Button>
        </div>
      </div>
      {/* <div className={`table-box-tabs ${isExist() ? null : `table-box-tabs-nobutton`}`}> */}
      <div className="table-box-tabs">
        <ProTable<Member>
          columns={column}
          request={getStatInfo}
          onLoad={onLoad}
          params={{
            id: facilityID,
            keyword: '',
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
        <CrtModel
          onsetkey={setkeywords}
          crtusershow={crtusershow}
          edtId={facilityID}
          onCancel={() => setCrtusershow(false)}
        />
      ) : null}
      {edtShow ? (
        <EdtMod
          onsetkey={setkeywords}
          edtShow={edtShow}
          edtInfo={edtInfo}
          edtId={facilityID}
          onCancel={() => {
            setEdtShow(false);
          }}
        />
      ) : null}
    </div>
  );
};
