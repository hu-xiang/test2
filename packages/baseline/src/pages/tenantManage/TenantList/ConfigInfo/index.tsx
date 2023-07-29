import { Button } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import styles from './styles.less';
import { Tabs } from 'antd';
import { useHistory } from 'umi';
import { ReactComponent as ListBack } from '../../../../assets/img/backDisease/back.svg';
import MenuList from './components/menuList';
import SourceList from './components/sourceList';
import TetantUserList from './components/tetantUserList';
import AuditCfg from './components/auditCfg';
import TabContent from './components/tabContent';
import { getDetailData } from '../service';

// const { TabPane } = Tabs;

export default (): React.ReactElement => {
  const menuRef = useRef<any>();
  const sourceRef = useRef<any>();
  const auditRef = useRef<any>();
  const tab5Ref = useRef<any>();
  const [roleID, setRoleID] = useState<any>();
  const [tenantNum, setTenantNum] = useState<any>();
  const [tenantType, setTenantType] = useState<any>();
  const history = useHistory();
  const tenantId = sessionStorage.getItem('tenantID');
  const userID = sessionStorage.getItem('userID');
  const [tabValue, setTabValue] = useState('1');
  const save = () => {
    if (tabValue === '1' && menuRef && menuRef.current) {
      menuRef.current.saverole();
    }
    if (tabValue === '2' && sourceRef && sourceRef.current) {
      sourceRef.current.saveSource();
    }
    if (tabValue === '4' && auditRef?.current) {
      auditRef?.current?.save();
    }
    if (tabValue === '5' && tab5Ref?.current) {
      tab5Ref?.current?.save();
    }
  };
  const resetInfo = () => {
    if (tabValue === '1' && menuRef && menuRef.current) {
      menuRef.current.reset();
    }
    if (tabValue === '2' && sourceRef && sourceRef.current) {
      sourceRef.current.resetSource();
    }
    if (tabValue === '4' && auditRef?.current) {
      auditRef?.current?.cancel();
    }
    if (tabValue === '5' && tab5Ref?.current) {
      tab5Ref?.current?.cancel();
    }
  };
  const getDetailDatas = async () => {
    const res = await getDetailData({ tenantId, userId: userID });
    if (res?.status === 0) {
      setRoleID(res?.data?.roleId);
      setTenantNum(res?.data?.tenantNum);
      setTenantType(res?.data?.tenantType);
    }
  };
  const changeTabs = (val: any) => {
    setTabValue(val);
  };
  useEffect(() => {
    getDetailDatas();
  }, []);
  const tabDatas = [
    {
      key: '1',
      label: '菜单权限',
      children: (
        <div className={'tabClass1'}>
          <MenuList roleID={roleID} onRef={menuRef} />
        </div>
      ),
    },
    {
      key: '2',
      label: '资源配置',
      children: (
        <div className={'tabClass2'}>
          <SourceList onRef={sourceRef} tenantId={tenantId} tenantType={tenantType} />
        </div>
      ),
    },
    {
      key: '4',
      label: '审核配置',
      children: (
        <div className={'tabClass4'}>
          <AuditCfg onRef={auditRef} tenantId={tenantId} />
        </div>
      ),
    },
    {
      key: '5',
      label: '严重程度配置',
      children: (
        <div className={'tabClass5'}>
          <TabContent onRef={tab5Ref} tenantId={tenantId} />
        </div>
      ),
    },
    // {
    //   key: '4',
    //   label: '审核配置',
    //   children: (
    //     <div className={'tabClass4'}>
    //       <SourceList onRef={sourceRef} tenantId={tenantId} tenantType={tenantType} />
    //     </div>
    //   ),
    // },
    {
      key: '3',
      label: '租户超管账号',
      children: (
        <div className={'tabClass3'}>
          <TetantUserList tenantId={tenantId} />
        </div>
      ),
    },
  ];
  const operations = () => {
    return {
      right: (
        <div className={styles.rightContent}>
          {['1', '2', '3'].includes(tabValue) && (
            <Button
              className={`${styles.topbtn} ${styles['btn-grey']}`}
              onClick={() => {
                resetInfo();
              }}
            >
              重置
            </Button>
          )}
          {['4', '5'].includes(tabValue) && (
            <Button
              className={`${styles.topbtn} ${styles['btn-grey']}`}
              onClick={() => {
                resetInfo();
              }}
            >
              取消
            </Button>
          )}
          <Button
            className={`${styles.topbtn} ${styles['btn-blue']}`}
            onClick={() => {
              save();
            }}
          >
            保存
          </Button>
        </div>
      ),
    };
  };

  return (
    <div className={`${styles.tenantList}`}>
      <div className={styles.headContent}>
        <span
          className={styles.headButton}
          onClick={() => {
            history.push('/tenantManage/TenantList');
          }}
        >
          <ListBack className={styles.backButton} />
        </span>
        <div className={`${styles.topTenantText}`}>租户列表</div>{' '}
      </div>
      <div className={styles.contentBox}>
        <div className={styles.headSecondContent}>
          <span className={`${styles.secondTenantText}`}>服务配置- {tenantNum}</span>
        </div>
        <div className={`tabHeadContent`}>
          <Tabs
            defaultActiveKey="1"
            items={tabDatas}
            onChange={changeTabs}
            tabBarExtraContent={tabValue !== '3' ? operations() : null}
          >
            {/* <TabPane tab="菜单权限" key="1">
              <div className={'tabClass1'}>
                <MenuList roleID={roleID} onRef={menuRef} />
              </div>
            </TabPane>
            <TabPane tab="资源配置" key="2">
              <div className={'tabClass2'}>
                <SourceList onRef={sourceRef} tenantId={tenantId} tenantType={tenantType} />
              </div>
            </TabPane>
            <TabPane tab="租户超管账号" key="3">
              <div className={'tabClass3'}>
                <TetantUserList tenantId={tenantId} />
              </div>
            </TabPane> */}
          </Tabs>
        </div>
      </div>
    </div>
  );
};
