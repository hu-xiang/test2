import React, { useState, useRef } from 'react';
import styles from '../styles.less';
import { Space, message, Modal } from 'antd';
import { resetPwd, frozenAccount } from '../../../../../services/commonApi';
import { getSuperNumData } from '../../service';
import ProTable from '@ant-design/pro-table';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useAccess } from 'umi';
import { useCommonScrollObj } from '../../../../../utils/tableScrollSet';

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
type Iprops = {
  tenantId: any;
};

const TetantUserList: React.FC<Iprops> = (props) => {
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(10);
  const [tableData, setTableData] = useState([]);
  const access: any = useAccess();
  const actionRef = useRef<any>();
  const [searchPage, setSearchPage] = useState(1);

  const scrollObj = useCommonScrollObj(40, '.tabClass3', tableData, {
    x: 930,
    y: 'calc(100vh - 364px)',
  });

  const setkeywords = () => {
    actionRef.current.reload();
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
      width: 80,
    },
    {
      title: '超管账号',
      dataIndex: 'administration',
      key: 'administration',
      width: 150,
    },
    {
      title: '超管名称',
      dataIndex: 'administrationName',
      key: 'administrationName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '手机号',
      dataIndex: 'administrationTel',
      key: 'administrationTel',
      width: 150,
    },
    {
      title: '顶级部门名称',
      dataIndex: 'administrationDeptName',
      key: 'administrationDeptName',
      ellipsis: true,
      width: 200,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (text: any) => (
        <Space size="middle">
          {text.username === 'admin' ? null : (
            <a className="ahover" onClick={() => freezeuser(text)}>
              {text.freezeStatus ? '解冻' : '冻结'}
            </a>
          )}
          {access['userManager/resetPwd'] ? (
            <a className="ahover" onClick={() => resetpassword(text)}>
              重置密码
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
    setSearchPage(text.current);
    setTabpage(text.current);
    setTabpagesize(text.pageSize);
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

  return (
    <div id={styles.container}>
      <div className="usertable tenantUserTable">
        <ProTable<Member>
          columns={column}
          request={async () => {
            const res = await getSuperNumData({ tenantId: props?.tenantId });
            return { data: [res?.data], success: true, total: res?.data ? 1 : 0 };
          }}
          onLoad={onLoad}
          rowKey="userId"
          pagination={false}
          toolBarRender={false}
          search={false}
          scroll={scrollObj || { x: '100%' }}
          // onRequestError={reqErr}
          onChange={changetabval}
          actionRef={actionRef}
        />
      </div>
    </div>
  );
};
export default TetantUserList;
