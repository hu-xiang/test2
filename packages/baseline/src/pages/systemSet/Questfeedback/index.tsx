import React, { useState, useRef } from 'react';
import styles from '../Questfeedback/styles.less';
import { Input, Space, message, Modal, Rate } from 'antd';
import { queList, questdel, questedit } from './service';
import ProTable from '@ant-design/pro-table';
import { useAccess } from 'umi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useScrollQueObj } from '@/utils/tableScrollSet';

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
  const [names, setNames] = useState<any>(null);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(10);
  const [tableData, setTableData] = useState([]);
  const scrollObj = useScrollQueObj(tableData, { x: 1200, y: 'calc(100vh - 220px)' });
  const access: any = useAccess();
  const [searchPage, setSearchPage] = useState(1);

  const ref = useRef<any>();
  const Searchs = (e: any) => {
    setNames(e.trim());
    setSearchPage(1);
    ref.current.reload();
  };

  const setkeywords = () => {
    ref.current.reload();
  };

  const delquest = async (text: any) => {
    confirm({
      title: '该问题反馈将删除，是否继续?',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        const formData = new FormData();
        formData.append('id', text.id);
        try {
          const res = await questdel(formData);
          setkeywords();
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

  const editque = async (text: any) => {
    const status = 1;
    try {
      const res: any = await questedit(text.id, status);
      if (res.status === 0) {
        message.success({
          content: '处理成功',
          key: '处理成功',
        });
        setkeywords();
      } else {
        // message.error({
        //   content: res.message,
        //   key: res.message,
        // });
      }
      return true;
    } catch (error) {
      message.error({
        content: '处理失败!',
        key: '处理失败!',
      });
      return false;
    }
  };

  const column: any = [
    {
      title: '序号',
      key: 'id',
      render: (text: any, record: any, index: any) =>
        // `${(tabpage - 1) * tabpagesize + (index + 1)}`,
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
      width: 60,
    },
    {
      title: '问题描述',
      dataIndex: 'message',
      key: 'message',
      width: '20%',
      ellipsis: true,
    },
    {
      title: '问题类型',
      dataIndex: 'questionType',
      key: 'questionType',
    },
    {
      title: '评分',
      dataIndex: 'score',
      key: 'score',
      width: '13%',
      render: (text: any) => <Rate value={text} disabled />,
    },
    {
      title: '提交人',
      dataIndex: 'crtName',
      key: 'crtName',
    },
    {
      title: '提交日期',
      dataIndex: 'crtTime',
      key: 'crtTime',
      width: '15%',
    },
    {
      title: '处理状态',
      dataIndex: 'dataStatus',
      key: 'dataStatus',
      valueEnum: {
        0: { text: '未处理', status: 'Default' },
        1: { text: '已处理', status: 'Success' },
        // 1: { text: '排队中', status: 'Processing' },
        // 2: { text: '执行中', status: 'Processing' },
        // 99: { text: '异常', status: 'Error' },
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 130,
      render: (text: any) => (
        <Space size="middle">
          {access['questfeedback/index:btn_dealt'] ? (
            <a className="ahover" onClick={() => editque(text)}>
              处理
            </a>
          ) : null}
          {access['questfeedback/index:btn_del'] ? (
            <a className="ahover" onClick={() => delquest(text)}>
              删除
            </a>
          ) : null}
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
            placeholder="请输入问题描述的关键词"
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
        </div>
      </div>
      <div className="usertable">
        <ProTable<Member>
          columns={column}
          request={queList}
          onLoad={onLoad}
          params={{
            keyword: names,
            // current: searchPage,
          }}
          rowKey="id"
          pagination={{
            showQuickJumper: false,
            // defaultPageSize: 10,
            current: searchPage,
            // onChange: pageChange,
          }}
          toolBarRender={false}
          actionRef={ref}
          search={false}
          scroll={scrollObj || { x: '100%' }}
          // onRequestError={reqErr}
          onChange={changetabval}
        />
      </div>
    </div>
  );
};
