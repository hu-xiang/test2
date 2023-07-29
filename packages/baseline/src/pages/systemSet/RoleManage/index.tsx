import React, { useState, useRef } from 'react';
import styles from './styles.less';
import { Input, Button, Space, message, Modal } from 'antd';
import { rolelist, delrole } from './service';
import ProTable from '@ant-design/pro-table';
import CrtRole from './component/crtrole';
import EditRole from './component/edirole';
import CutRole from './component/cutrole';
import { useAccess } from 'umi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useScrollObj } from '../../../utils/tableScrollSet';

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
  const [roleTypeToName] = useState({
    0: '系统管理员',
    1: '业务管理员',
  });

  const [crtusershow, setCrtusershow] = useState(false);
  const [editusershow, setEditusershow] = useState(false);
  const [names, setNames] = useState<any>(null);
  const [editid, setEditid] = useState(0);
  const [ecutroleid, setCutRoleid] = useState(0);
  const [showcut, setShowcut] = useState(false);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(20);
  const [tableData, setTableData] = useState([]);
  const access: any = useAccess();
  const actionRef = useRef<any>();
  const [searchPage, setSearchPage] = useState(1);

  const scrollObj = useScrollObj(tableData, { x: 1200, y: 'calc(100vh - 218px)' });

  const Searchs = (e: any) => {
    setNames(e.trim());
    setSearchPage(1);
    actionRef.current.reload();
  };

  const setkeywords = () => {
    actionRef.current.reload();
  };

  const delUser = async (text: any) => {
    confirm({
      title: '角色将删除，是否继续?',
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
          const res = await delrole(text.id);
          hide();
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
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

  const editshow = (text: any) => {
    setEditid(text.id);
    setEditusershow(true);
  };

  const formatDate = (now: any) => {
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const second = now.getSeconds();
    return `${year}-${month}-${date} ${hour}:${minute}:${second}`;
  };

  const powercut = (text: any) => {
    setCutRoleid(text.id);
    setShowcut(true);
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
      title: '姓名',
      dataIndex: 'roleName',
      key: 'roleName',
      ellipsis: true,
      width: 200,
    },
    {
      title: '类型',
      dataIndex: 'roleType',
      key: 'roleType',
      width: 140,
      render: (text: any) => roleTypeToName[text],
    },
    {
      title: '最后时间',
      dataIndex: 'updTime',
      key: 'updTime',
      width: 180,
      render: (text: any) => {
        const d = new Date(text);
        if (text !== '-') {
          return formatDate(d);
        }
        return '-';
      },
    },
    {
      title: '最新更新人',
      dataIndex: 'updName',
      key: 'updName',
      ellipsis: true,
      width: 200,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      ellipsis: true,
      width: 200,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 220,
      render: (text: any) => (
        <Space size="middle">
          {access['roleManager/index:btn_resourceManager'] ? (
            <a className="ahover" onClick={() => powercut(text)}>
              分配权限
            </a>
          ) : null}
          {access['roleManager/index:btn_edit'] ? (
            <a className="ahover" onClick={() => editshow(text)}>
              编辑
            </a>
          ) : null}
          {access['roleManager/index:btn_del'] && text.roleName !== '超级系统管理员' ? (
            <a className="ahover" onClick={() => delUser(text)}>
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
            placeholder="请输入姓名关键词"
            allowClear
            maxLength={50}
            onSearch={(e) => Searchs(e)}
            style={{
              width: 270,
              height: 40,
              verticalAlign: 'top',
            }}
            enterButton
            className="h40-search-input"
          />
          {access['roleManager/index:btn_add'] ? (
            <Button className="usertopadd" type="primary" onClick={() => setCrtusershow(true)}>
              新增角色
            </Button>
          ) : null}
        </div>
      </div>
      <div className="usertable">
        <ProTable<Member>
          columns={column}
          request={rolelist}
          params={{
            rolenames: names,
            // current: searchPage,
          }}
          onLoad={onLoad}
          rowKey="id"
          pagination={{
            showQuickJumper: false,
            // defaultPageSize: 10,
            current: searchPage,
            // onChange: pageChange,
          }}
          toolBarRender={false}
          search={false}
          scroll={scrollObj || { x: '100%' }}
          // onRequestError={reqErr}
          onChange={changetabval}
          actionRef={actionRef}
        />
      </div>
      {crtusershow ? (
        <CrtRole
          onsetkey={setkeywords}
          crtusershow={crtusershow}
          onCancel={() => setCrtusershow(false)}
        />
      ) : null}
      {editusershow ? (
        <EditRole
          onsetkey={setkeywords}
          editid={editid}
          editusershow={editusershow}
          onCancel={() => setEditusershow(false)}
        />
      ) : null}
      {showcut ? (
        <CutRole showcut={showcut} onCancel={() => setShowcut(false)} ecutroleid={ecutroleid} />
      ) : null}
    </div>
  );
};
