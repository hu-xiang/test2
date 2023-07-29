import React, { useState, useRef, useEffect } from 'react';
import { Input, message, Space, Button, Modal, Image, Popconfirm } from 'antd';
import { getDisListInfo, orderCheck, orderLocation, orderButton, delImage } from './service';
import styles from './styles.less';
import { ReactComponent as ListBack } from 'baseline/src/assets/img/backDisease/back.svg';
import { useHistory, useModel, useAccess } from 'umi';
import ProTable from '@ant-design/pro-table';
import { useDiseaseCardScrollObj } from 'baseline/src/utils/tableScrollSet';
import UploadModal from './UploadModal';
import { ExclamationCircleOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import MapLocation from 'baseline/src/components/MapLocation';
import moment from 'moment';

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
  const [workflowStatus, setWorkflowStatus] = useState<any>(Number);
  const [visible, setVisible] = useState(false);
  const [rowInfo, setRowInfo] = useState(false);
  const history = useHistory();
  const infoObj: any = sessionStorage.getItem('workInfo');
  const workInfo = JSON.parse(infoObj);
  const actionRef = useRef<any>();
  const basicRef = useRef<any>();
  const { setLnglatArr } = useModel<any>('facility');
  const [isShowBtn, setIsShowBtn] = useState(false);

  const access: any = useAccess();

  const scrollObj = useDiseaseCardScrollObj(tableData, { x: 1200, y: 'calc(100vh - 600px)' });

  const onLoad = (dataSource: any) => {
    if (tableData.length !== dataSource.length) {
      setTableData(dataSource);
    }
  };

  const getLocation = async () => {
    const res = await orderLocation(workInfo.id);
    const list: any = [[]];
    if (res.data instanceof Array) {
      if (res?.data?.length) {
        res.data.forEach((item: any) => {
          list.push([item.longitude, item.latitude]);
        });
      }
      setLnglatArr(list);
    } else if (res.data instanceof Object) {
      list.push([res.data.longitude, res.data.latitude]);
      setLnglatArr(list);
    }
  };

  useEffect(() => {
    getLocation();
    setWorkflowStatus(workInfo.workflowStatus);
  }, []);

  // 表格变化
  const changetabval = (text: any) => {
    if (text?.current !== searchPage) {
      setSearchPage(text?.current as number);
    }
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
  };

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

  const setkeywords = async () => {
    actionRef.current.reload();
    const res: any = await orderButton(workInfo?.id);
    workInfo.workflowStatus = res.data?.WorkStatus;
    sessionStorage.setItem('workInfo', JSON.stringify(workInfo));
    setWorkflowStatus(res.data?.WorkStatus);
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
      render: (text: any) => {
        return <Image src={text} style={{ width: 58, height: 46 }} placeholder={true} />;
      },
    },
    {
      title: '病害编号',
      dataIndex: 'diseaseNo',
      key: 'diseaseNo',
      width: 160,
      ellipsis: true,
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
      title: '维修结果',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (text: any, recode: any) => {
        return (
          <span>
            {!text.fileUrl ? (
              <Space size="middle">
                <a
                  className="ahover"
                  onClick={() => {
                    text.realTime = text.reldoneTime ? moment(text.reldoneTime) : null;
                    setIsModalshow(true);
                    setRowInfo(text);
                  }}
                >
                  上传结果
                </a>
              </Space>
            ) : (
              <span>
                {workInfo.workflowStatus !== 2 &&
                  !(workInfo.workflowStatus === 3 && workInfo.reldoneTime) && (
                    <>
                      {recode.isShowBtn && (
                        <div
                          style={{
                            zIndex: '99',
                            position: 'absolute',
                            top: '10px',
                            left: '8px',
                            width: '59px',
                            height: '48px',
                            background: '#000',
                            opacity: '0.6',
                          }}
                        ></div>
                      )}
                      <div
                        style={{
                          zIndex: '990',
                          position: 'absolute',
                          top: '10px',
                          left: '8px',
                          width: '60px',
                          height: '48px',
                        }}
                        onMouseOver={() => {
                          if (recode.isShowBtn) return;
                          recode.isShowBtn = true;
                          setIsShowBtn(true);
                        }}
                        onMouseLeave={() => {
                          if (!recode.isShowBtn) return;
                          recode.isShowBtn = false;
                          setIsShowBtn(false);
                        }}
                      >
                        {recode.isShowBtn && isShowBtn && (
                          <>
                            <EyeOutlined
                              style={{
                                position: 'absolute',
                                top: '18px',
                                left: '12px',
                                zIndex: '9999',
                                color: '#FFF',
                                cursor: 'pointer',
                              }}
                              onClick={() => {
                                recode.visible = true;
                                setVisible(true);
                              }}
                            />
                            <Popconfirm
                              placement="top"
                              title={'确定要删除吗？'}
                              onConfirm={async () => {
                                const formData = new FormData();
                                formData.append('path', text.fileUrl);
                                formData.append('id', text.id);
                                const res = await delImage(formData);
                                if (res.status === 0) message.info('删除成功');
                                actionRef.current?.reloadAndRest?.();
                                const resStatus: any = await orderButton(workInfo?.id);
                                workInfo.workflowStatus = resStatus.data?.WorkStatus;
                                setWorkflowStatus(resStatus.data?.WorkStatus);
                              }}
                              okText="确定"
                              cancelText="取消"
                            >
                              <DeleteOutlined
                                style={{
                                  position: 'absolute',
                                  top: '18px',
                                  left: '32px',
                                  zIndex: '9999',
                                  color: '#FFF',
                                }}
                              />
                            </Popconfirm>
                          </>
                        )}
                      </div>
                    </>
                  )}
                <Image
                  src={text.fileUrl}
                  style={{ width: 58, height: 46 }}
                  preview={{
                    visible: recode.visible && visible,
                    src: text.fileUrl,
                    onVisibleChange: (value) => {
                      setVisible(value);
                      recode.visible = value;
                    },
                  }}
                />
              </span>
            )}
          </span>
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
                <div className={`${styles.itemLabel} ${styles.labelWidth}`}>工程类型</div>
                <Input disabled value={workInfo?.orderTypeName} />
              </div>
              <div className={styles.itemInfo}>
                <div className={`${styles.itemLabel} ${styles.labelWidth}`}>道路名称</div>
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
                <span className={`${styles.itemLabel} ${styles.labelWidth}`}>计划完工时间</span>
                <Input disabled value={workInfo?.planTime} />
              </div>
              <div className={styles.itemInfo}>
                <span className={`${styles.itemLabel} ${styles.labelWidth}`}>实际完工时间</span>
                <Input disabled value={workInfo?.reldoneTime} />
              </div>
            </div>
          </div>

          {/* 设施定位 */}
          <div className={styles.workPicLoc}>
            <div className={styles.picLocTitle}>道路定位</div>
            <div className={styles.picLocContent}>
              <MapLocation />
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
                }}
                request={getDisListInfo}
                rowKey="id"
                tableAlertRender={false}
                pagination={{
                  showQuickJumper: false,
                  defaultPageSize: 20,
                  current: searchPage,
                }}
                className={'ant-modal-image-common'}
                onLoad={onLoad}
                toolBarRender={false}
                search={false}
                scroll={scrollObj || { x: '100%' }}
                onChange={changetabval}
              />
              {access['workordermanage/workorder/index:btn_check'] && (
                <Button
                  type="primary"
                  className={styles.checkBtn}
                  style={tableData.length ? { marginTop: '' } : { marginTop: '20px' }}
                  disabled={workflowStatus !== 1 || !tableData.length}
                  onClick={() => {
                    check();
                  }}
                >
                  {workflowStatus === 2 ? '已验收' : '验收'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {isModalshow ? (
        <UploadModal
          onsetkey={setkeywords}
          rowInfo={rowInfo}
          isModalshow={isModalshow}
          crtTime={workInfo.crtTime}
          onCancel={() => {
            setIsModalshow(false);
          }}
        />
      ) : null}
    </div>
  );
};
