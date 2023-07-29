import React, { useState, useRef } from 'react';
import styles from './styles.less';
import { Input, Button, Space, message, Modal } from 'antd';
import { userlist, deluser, resetPwd, frozenAccount } from './service';
import ProTable from '@ant-design/pro-table';
import CrtUser from './component/crtuser';
import EditUser from './component/edituser';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useAccess, useModel } from 'umi';
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
  const { initialState }: any = useModel('@@initialState');
  const [crtusershow, setCrtusershow] = useState(false);
  const [editusershow, setEditusershow] = useState(false);
  const [names, setNames] = useState<any>(null);
  const [editid, setEditid] = useState(0);
  const [editinfo, setEditinfo] = useState({});
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(10);
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
      title: '将进行删除操作，是否继续?',
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
          const res = await deluser(text.userId);
          setkeywords();
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

  const resetpassword = (text: any) => {
    confirm({
      title: '密码将重置，是否继续?',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const hide = message.loading({
          content: '正在重置',
          key: '正在重置',
        });
        try {
          const res = await resetPwd(text.userId);
          setkeywords();
          hide();
          if (res.status === 0) {
            message.success({
              content: '重置成功',
              key: '重置成功',
            });
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
            content: '重置失败!',
            key: '重置失败!',
          });
          return false;
        }
      },
      onCancel() {},
    });
  };

  const editshow = (text: any) => {
    setEditid(text.userId);
    setEditinfo({ ...text });
    setEditusershow(true);
  };

  const freezeuser = async (text: any) => {
    confirm({
      title: `是否要${text.freezeStatus ? '解冻' : '冻结'}账户?`,
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        await frozenAccount(text.userId, text.freezeStatus ? 0 : 1);
        setkeywords();
      },
      onCancel() {},
    });
  };

  const column: any = [
    {
      title: '序号',
      key: 'userId',
      render: (text: any, record: any, index: any) =>
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
      // `${(tabpage - 1) * tabpagesize + (index + 1)}`,
      width: 60,
    },
    {
      title: '账户名称',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '角色',
      dataIndex: 'roleName',
      key: 'roleName',
    },
    {
      title: '组织机构',
      dataIndex: 'deptName',
      key: 'deptName',
      ellipsis: true,
      width: 200,
    },
    {
      title: '创建人',
      dataIndex: 'crtName',
      key: 'crtName',
    },
    {
      title: '冻结状态',
      key: 'freezeStatus',
      render: (text: any) => <span>{text.freezeStatus ? '已冻结' : '正常'}</span>,
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 240,
      render: (text: any) => {
        return (
          <Space size="middle">
            {access['userManager/index:btn_edit'] ? (
              <a className="ahover" onClick={() => editshow(text)}>
                编辑
              </a>
            ) : null}
            {access['userManager/resetPwd'] ? (
              <a className="ahover" onClick={() => resetpassword(text)}>
                重置密码
              </a>
            ) : null}
            {text.username === 'admin' ? null : (
              <a className="ahover" onClick={() => freezeuser(text)}>
                {text.freezeStatus ? '解冻' : '冻结'}
              </a>
            )}
            {text.username === 'admin' ||
            !access['userManager/index:btn_del'] ||
            initialState?.currentUser?.id === text?.userId ? null : (
              <a className="ahover" onClick={() => delUser(text)}>
                删除
              </a>
            )}
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
            placeholder="请输入账户名称或姓名的关键词"
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
          {access['userManager/index:btn_add'] ? (
            <Button className="usertopadd" type="primary" onClick={() => setCrtusershow(true)}>
              新增用户
            </Button>
          ) : null}
        </div>
      </div>
      <div className="usertable">
        <ProTable<Member>
          columns={column}
          request={userlist}
          onLoad={onLoad}
          params={{
            name: names,
            // current: searchPage,
          }}
          rowKey="userId"
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
        <CrtUser
          onsetkey={setkeywords}
          crtusershow={crtusershow}
          onCancel={() => setCrtusershow(false)}
        />
      ) : null}
      {editusershow ? (
        <EditUser
          onsetkey={setkeywords}
          editinfo={editinfo}
          editid={editid}
          editusershow={editusershow}
          onCancel={() => setEditusershow(false)}
        />
      ) : null}
    </div>
  );
};
