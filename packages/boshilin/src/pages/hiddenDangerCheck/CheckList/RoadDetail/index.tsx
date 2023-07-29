import { Tabs, Select } from 'antd';
import React, { useEffect, useState } from 'react';
import BasicInfo from './components/BasicInfo';
import TroubleCheck from './components/TroubleCheck';
import AccidentInfo from './components/AccidentInfo';
import SublineInfo from './components/sublineInfo/SublineInfo';
import SceneInfo from './components/sceneInfo/SceneInfo';
import { ReactComponent as ListBack } from 'baseline/src/assets/img/backDisease/back.svg';
import { useHistory } from 'umi';
import styles from './styles.less';
import { commonRequest } from 'baseline/src/utils/commonMethod';
import { useKeepAlive } from 'baseline/src/components/ReactKeepAlive';

const requestList = [{ url: '/traffic-bsl/project/roadSelect', method: 'get' }];

const { Option } = Select;

export default (): React.ReactElement => {
  useKeepAlive('tabs');
  const history = useHistory();
  const [projectId, setProject] = useState<any>();
  const [roadList, setRoadList] = useState<any>([]);
  const [roadId, setRoadId] = useState<any>();
  const [fkFacId, setFkFacId] = useState<any>();
  const tabDatas = [
    {
      key: '1',
      label: '基本信息',
      children: (
        <div className={styles.tabContent}>
          <BasicInfo id={roadId} />
        </div>
      ),
    },
    {
      key: '2',
      label: '子线信息',
      children: (
        <div className={`${styles.tabContent}`}>
          <SublineInfo id={roadId} fkFacId={fkFacId} />
        </div>
      ),
    },
    {
      key: '3',
      label: '场景信息',
      children: (
        <div className={`${styles.tabContent} ${styles.sceneContentTab}`}>
          <SceneInfo id={roadId} fkFacId={fkFacId} />
        </div>
      ),
    },
    {
      key: '4',
      label: '隐患排查',
      children: <TroubleCheck id={roadId} projectId={projectId} />,
    },
    {
      key: '5',
      label: '事故信息',
      children: (
        <div className={styles.tabContent}>
          <AccidentInfo id={roadId} projectId={projectId} fkFacId={fkFacId} />
        </div>
      ),
    },
  ];

  const getRoadList = async (id: any) => {
    const res = await commonRequest({ ...requestList[0], params: { projectId: id } });
    setRoadList(res?.data);
    setFkFacId(
      res?.data?.filter((item: any) => item?.id === sessionStorage.getItem('checkList_roadId'))[0]
        ?.fkFacId,
    );
  };

  useEffect(() => {
    setRoadId(sessionStorage.getItem('checkList_roadId'));
    setProject(sessionStorage.getItem('checkList_proId'));
    getRoadList(sessionStorage.getItem('checkList_proId'));
  }, []);

  const onChange = (newValue: string) => {
    if (newValue === undefined) {
      setRoadId('');
    } else {
      setRoadId(newValue);
    }
    setFkFacId(roadList?.filter((item: any) => item?.id === newValue)[0]?.fkFacId);
  };

  return (
    <div className={styles.detailHeader}>
      <div className={styles.headerRow}>
        <div
          className={styles.headerBack}
          onClick={() => {
            history.push('/hiddenDangerCheck/CheckList');
          }}
        >
          <ListBack />
          <div className={styles.backText}>道路详情</div>
        </div>

        <Select value={roadId} style={{ color: '#0013C1' }} onChange={onChange}>
          {roadList?.map((item: any) => (
            <Option key={item.id} value={item.id}>
              {item.fkFacName}
            </Option>
          ))}
        </Select>
      </div>
      <div className={styles.headerTabs}>
        <Tabs defaultActiveKey="1" destroyInactiveTabPane={true} items={tabDatas}>
          {/* <Tabs.TabPane tab="基本信息" key="1">
            <div className={styles.tabContent}>
              <BasicInfo id={roadId} />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="子线信息" key="2">
            <div className={`${styles.tabContent}`}>
              <SublineInfo id={roadId} fkFacId={fkFacId} />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="场景信息" key="3">
            <div className={`${styles.tabContent} ${styles.sceneContentTab}`}>
              <SceneInfo id={roadId} fkFacId={fkFacId} />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="隐患排查" key="4">
            <TroubleCheck id={roadId} projectId={projectId} />
          </Tabs.TabPane>
          <Tabs.TabPane tab="事故信息" key="5">
            <div className={styles.tabContent}>
              <AccidentInfo id={roadId} projectId={projectId} fkFacId={fkFacId} />
            </div>
          </Tabs.TabPane> */}
        </Tabs>
      </div>
    </div>
  );
};
