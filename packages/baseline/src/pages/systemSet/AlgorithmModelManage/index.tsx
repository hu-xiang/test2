import React, { useState, useRef } from 'react';
import styles from './styles.less';
import { Input, Button, Space, message, Modal } from 'antd';
import { modellist, delmodel, educeMod, modpub } from './service';
import ProTable from '@ant-design/pro-table';
import CrtModel from './component/crtmodel';
// import { useModel } from 'umi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useScrollObj } from '@/utils/tableScrollSet';
import { exportCom } from '../../../utils/exportCom';

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
  const [names, setNames] = useState<any>(null);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(20);
  const [tableData, setTableData] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const scrollObj = useScrollObj(tableData, { x: 1500, y: 'calc(100vh - 215px)' });

  const ref = useRef<any>();
  const Searchs = (e: any) => {
    setNames(e.trim());
    setSearchPage(1);
    ref.current.reload();
  };

  const setkeywords = () => {
    ref.current.reload();
  };

  const delUser = async (text: any) => {
    confirm({
      title: '文件模型将删除，是否继续?',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const formData = new FormData();
        formData.append('id', text.id);
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          const res = await delmodel(formData);
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

  const downloadflie = async (text: any) => {
    const hide = message.loading({
      content: '正在导出',
      key: '正在导出',
    });
    try {
      const res: any = await educeMod(text.id);
      hide();
      exportCom(res, `${text.fileName}`);
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
      width: 60,
    },
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      width: 200,
    },
    {
      title: '模型版本',
      dataIndex: 'modelVersion',
      key: 'modelVersion',
      width: 200,
    },
    {
      title: '文件md5',
      dataIndex: 'md5',
      key: 'md5',
      width: 280,
    },
    {
      title: '数据状态',
      dataIndex: 'dataStatus',
      key: 'dataStatus',
      valueEnum: {
        0: { text: '无效', status: 'Default' },
        2: { text: '已部署', status: 'Success' },
        // 1: { text: '排队中', status: 'Processing' },
        1: { text: '有效', status: 'Processing' },
        // 99: { text: '异常', status: 'Error' },
      },
      width: 130,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 200,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 160,
      render: (text: any) => (
        <Space size="middle">
          {/* {roleManager_index_btn_del ? ( */}
          <a
            className="ahover"
            onClick={async () => {
              const formData = new FormData();

              formData.append('id', text.id);
              const res = await modpub(formData);
              if (res.status === 0) {
                message.success({
                  content: '发布成功',
                  key: '发布成功',
                });
                setkeywords();
              }
              // else {
              //   message.error({
              //     content: res.message,
              //     key: res.message,
              //   });
              // }
            }}
          >
            动态发布
          </a>
          {/* ) : null} */}
          {/* {roleManager_index_btn_del ? ( */}
          <a className="ahover" onClick={() => delUser(text)}>
            删除
          </a>
          {/* ) : null} */}
          {/* {roleManager_index_btn_edit ? ( */}
          <a className="ahover" onClick={() => downloadflie(text)}>
            下载
          </a>
          {/* ) : null} */}
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
    // setSelectedRowKey([]);
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
  //   // setTabpagesize(pageSize);
  // };
  return (
    <div id={styles.container}>
      <div className={styles.usertop}>
        <div className={styles.usertopsel}>
          <Search
            placeholder="请输入文件名关键词"
            allowClear
            maxLength={50}
            onSearch={(e) => Searchs(e)}
            style={{
              width: 270,
              height: 40,
              verticalAlign: 'top',
            }}
            enterButton
            className="usersel"
          />
          <Button className="usertopadd" type="primary" onClick={() => setCrtusershow(true)}>
            新增文件
          </Button>
        </div>
      </div>
      <div className="usertable">
        <ProTable<Member>
          columns={column}
          request={modellist}
          onLoad={onLoad}
          params={{
            // current: searchPage,
            rolenames: names,
          }}
          rowKey="id"
          pagination={{
            showQuickJumper: false,
            // defaultPageSize: 10,
            current: searchPage,
            // onChange: pageChange,
          }}
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
          onCancel={() => setCrtusershow(false)}
        />
      ) : null}
    </div>
  );
};
