import React, { useState, useRef } from 'react';
import { Input, message, Space, Button, Modal } from 'antd';
import { getDisListInfo, orderCheck } from './service';
import styles from './styles.less';
import { ReactComponent as ListBack } from 'baseline/src/assets/img/backDisease/back.svg';
import { useHistory } from 'umi';
import ProTable from '@ant-design/pro-table';
import { useDiseaseCardScrollObj } from 'baseline/src/utils/tableScrollSet';
import UploadModal from './UploadModal';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import MapLocation from '../../../components/MapLocation';

export type Member = {
  startTime: string;
  endTime: string;
  checkCode: string;
  disease: string;
};

const { confirm } = Modal;

export default (): React.ReactElement => {
  const [tableData, setTableData] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(20);
  const [isModalshow, setIsModalshow] = useState(false);
  const [rowInfo, setRowInfo] = useState(false);
  const history = useHistory();
  const infoObj: any = sessionStorage.getItem('workInfo');
  const workInfo = JSON.parse(infoObj);
  const actionRef = useRef<any>();
  const basicRef = useRef<any>();

  const scrollObj = useDiseaseCardScrollObj(tableData, { x: 1200, y: 'calc(100vh - 600px)' });

  const onLoad = (dataSource: any) => {
    if (tableData.length !== dataSource.length) {
      setTableData(dataSource);
    }
  };

  // const pageChange = (page: any) => {
  //   setSearchPage(page);
  // };

  const changetabval = (text: any) => {
    if (text?.current !== searchPage) {
      setSearchPage(text?.current as number);
    }
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
  };

  // const reqErr = () => {
  //   message.error({
  //     content: '查询失败!',
  //     key: '查询失败!',
  //   });
  // };

  // 验收
  const check = () => {
    confirm({
      title: '是否完成验收？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const hide = message.loading({
          content: '正在验收',
          key: '正在验收',
        });
        try {
          const res = await orderCheck(workInfo.id);
          hide();
          if (res.status === 0) {
            message.success({
              content: '验收成功',
              key: '验收成功',
            });
            // workInfo.workflowStatusName = '已完成';
            // sessionStorage.setItem('workInfo', JSON.stringify(workInfo));
            history.push('/workordermanage/workorderlist');
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
            content: '验收失败!',
            key: '验收失败!',
          });
          return false;
        }
      },
      onCancel() {},
    });
  };

  const setkeywords = () => {
    actionRef.current.reload();
  };

  const columns: any = [
    {
      title: '序号',
      key: 'nums',
      render: (text: any, record: any, index: any) =>
        `${(searchPage - 1) * tabpagesize + (index + 1)}`,
      width: 80,
    },
    {
      title: '缩略图',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      width: 100,
      valueType: 'image',
    },
    {
      title: '病害编号',
      dataIndex: 'diseaseNo',
      key: 'diseaseNo',
      width: 160,
    },
    {
      title: '病害类型',
      dataIndex: 'diseType',
      // key: 'diseaseNameZh',
      width: 160,
      render: (text: any, recode: any) => {
        return `${recode.diseaseNameZh}`;
      },
    },
    {
      title: ' 紧急程度',
      dataIndex: 'diseaseImp',
      key: 'diseaseImp',
      width: 100,
      valueEnum: {
        0: { text: '非紧急' },
        1: { text: '紧急' },
      },
    },
    {
      title: '所在区域',
      dataIndex: 'address',
      key: 'address',
      width: 280,
      ellipsis: true,
    },
    {
      title: '实际完工时间',
      dataIndex: 'reldoneTime',
      key: 'reldoneTime',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (text: any) => {
        return (
          <Space size="middle">
            <a
              className="ahover"
              onClick={() => {
                setIsModalshow(true);
                setRowInfo(text);
              }}
            >
              上传结果
            </a>
          </Space>
        );
      },
    },
  ];

  return (
    <div className={styles.workDetail}>
      {/* 返回列表 */}
      <div
        className={styles.workBack}
        onClick={() => {
          history.push('/workordermanage/workorderlist');
        }}
      >
        <ListBack />
        <div className={styles.backText}>工单列表</div>
      </div>

      {/* 内容区 */}
      <div className={styles.workMain}>
        {/* 标题 */}
        <div className={styles.workTitle}>工单详情-{workInfo?.orderNum}</div>

        {/* 基本信息 */}
        <div className={`${styles.scrollBox} scrollBox`} ref={basicRef}>
          <div className={styles.workBasicInfo}>
            <div className={styles.basicInfoTitle}>基本信息</div>
            <div className={styles.basicInfoBox}>
              <div className={styles.itemInfo}>
                <div className={styles.itemLabel}>工单编号</div>
                <Input disabled value={workInfo?.orderNum} />
              </div>
              <div className={styles.itemInfo}>
                <div className={styles.itemLabel}>工单名称</div>
                <Input disabled value={workInfo?.orderName} />
              </div>
              <div className={styles.itemInfo}>
                <div className={styles.itemLabel}>工程类型</div>
                <Input disabled value={workInfo?.orderTypeName} />
              </div>
              <div className={styles.itemInfo}>
                <div className={styles.itemLabel}>道路名称</div>
                <Input disabled value={workInfo?.facilitiesName} />
              </div>
            </div>
            <div className={styles.basicInfoBox}>
              <div className={styles.itemInfo}>
                <span className={styles.itemLabel}>养护单位</span>
                <Input disabled value={workInfo?.maintenanceUnit} />
              </div>
              <div className={styles.itemInfo}>
                <span className={styles.itemLabel}>工程状态</span>
                <Input disabled value={workInfo?.workflowStatusName} />
              </div>
              <div className={styles.itemInfo}>
                <span className={styles.itemLabel}>计划完工时间</span>
                <Input disabled value={workInfo?.planTime} />
              </div>
              <div className={styles.itemInfo}>
                <span className={styles.itemLabel}>实际完工时间</span>
                <Input disabled value={workInfo?.reldoneTime} />
              </div>
            </div>
          </div>

          {/* 设施定位 */}
          <div className={styles.workPicLoc}>
            <div className={styles.picLocTitle}>道路定位</div>
            <div className={styles.picLocContent}>
              <MapLocation id={workInfo.id} locationUrl="/traffic-km/order/location" />
            </div>
          </div>

          {/* 病害列表 */}
          <div className={styles.workList}>
            <div className={styles.workListTitle}>病害列表</div>
            <div className={styles.tableBox}>
              <ProTable<Member>
                columns={columns}
                actionRef={actionRef}
                params={{
                  orderId: workInfo?.id,
                  page: searchPage,
                }}
                request={getDisListInfo}
                rowKey="id"
                tableAlertRender={false}
                pagination={{
                  showQuickJumper: false,
                  defaultPageSize: 20,
                  current: searchPage,
                  // onChange: pageChange,
                }}
                onLoad={onLoad}
                toolBarRender={false}
                search={false}
                scroll={scrollObj || { x: '100%' }}
                onChange={changetabval}
                // onRequestError={reqErr}
              />
              <Button
                type="primary"
                className={styles.checkBtn}
                disabled={
                  workInfo.workflowStatusName === '已完成' ||
                  workInfo.workflowStatusName === '已超时'
                }
                onClick={() => {
                  check();
                }}
              >
                {workInfo.workflowStatusName === '已完成' ? '已验收' : '验收'}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {isModalshow ? (
        <UploadModal
          onsetkey={setkeywords}
          rowInfo={rowInfo}
          isModalshow={isModalshow}
          onCancel={() => {
            setIsModalshow(false);
          }}
        />
      ) : null}
    </div>
  );
};
