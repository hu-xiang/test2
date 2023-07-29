import { Button, Space, Image, Modal, message } from 'antd';
import React, { useRef, useState } from 'react';
import styles from '../styles.less';
import ProTable from '@ant-design/pro-table';
import { useHistory } from 'umi';

import { getCheckListInfo, sceneListDel, doneCheck } from '../service';
import { useDiseaseScrollObj } from 'baseline/src/utils/tableScrollSet';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import SceneCrop from './SceneCrop';
import DataCrop from './DataCrop';
import SpotCheck from './SpotCheck';
import CreateScene from './CreateScene';

export type Member = {
  // startTime: string;
  // endTime: string;
  // checkType: string;
  // querykey: string;
};
type Iprops = {
  a?: string;
};

const EdtMod: React.FC<Iprops> = () => {
  // const { edtInfo } = props;
  // const [dataTotal, setDataTotal] = useState<any>();
  // const access: any = useAccess();
  const history = useHistory();
  const { confirm } = Modal;
  const actionRef = useRef<any>();
  const [tableData, setTableData] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(20);
  const scrollObj = useDiseaseScrollObj(tableData, { x: 1200, y: 'calc(100vh - 287px)' });
  const [selectedRowKey, setSelectedRowKey] = useState<string[]>([]);

  const [showSceneCropModal, setShowSceneCropModal] = useState<boolean>(false);
  const [showDataCropModal, setShowDataCropModal] = useState<boolean>(false);
  const [showSpotCheck, setShowSpotCheck] = useState<boolean>(false);
  const [showSceneCreate, setShowSceneCreate] = useState<boolean>(false);
  const [sceneData, setSceneData] = useState<any>();
  const [curPreviewRowId, setCurPreviewRowId] = useState<string>('');
  const [cropImgUrl, setCropImgUrl] = useState<string>('');

  const fallback = 'images/placeholder.svg';

  // const urlParams: any = useParams();
  // const projectId = urlParams?.id;
  const projectId = sessionStorage.getItem('checkList_proId');

  const changetabval = (text: any) => {
    if (text?.current !== searchPage) {
      setSearchPage(text?.current as number);
      setTabpage(text?.current as number);
    }
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
    setSelectedRowKey([]);
  };
  const onload = (dataSource: any) => {
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
  // const onSelectChange = (selectedRowKeys: any) => {
  //   setSelectedRowKey(selectedRowKeys);
  // };
  const clickRow = (record: any) => {
    const arr = selectedRowKey.filter((i) => i !== record.id);
    if (selectedRowKey.includes(record.id)) setSelectedRowKey(arr);
    else setSelectedRowKey([...arr, record.id]);
  };

  // 场景裁剪
  const handleSceneCrop = (row: any) => {
    setShowSceneCropModal(true);
    setSceneData(row);
  };

  const handleCloseSceneCropModal = () => {
    setShowSceneCropModal(false);
    setCropImgUrl('');
  };
  const handleDoneSceneCrop = () => {
    setShowSceneCropModal(false);
    setCropImgUrl('');
    actionRef.current.reload();
  };

  // 位置裁剪
  const handleCloseDataCropModal = () => {
    setShowDataCropModal(false);
  };
  const handleOpenDataCropMoadal = () => {
    setShowDataCropModal(true);
  };

  // 点位排查
  const handleCloseSpotCheckModal = () => {
    setShowSpotCheck(false);
  };
  // 点位排查
  const handleCloseSceneCreateModal = () => {
    setShowSceneCreate(false);
  };

  const handleGoBack = () => {
    history.go(-1);
  };

  const getIds = (type: any, id?: any) => {
    let ids: any = [];
    if (type === 'batch') {
      ids = selectedRowKey?.length === 0 ? [] : selectedRowKey;
    } else {
      ids = [id];
    }
    return ids;
  };
  const handleDel = (deleteType: any, text?: any) => {
    const params = {
      ids: getIds(deleteType, text?.id),
    };
    confirm({
      title: '是否删除该病害记录？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          const formData = new FormData();
          formData.append('id', params?.ids);
          const res = await sceneListDel(formData);
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            setSelectedRowKey([]);
            actionRef.current.reload();
          }
          return true;
        } catch (error) {
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

  const handleSceneCheck = () => {
    // sessionStorage.setItem('checkItem_sceneId', row?.fkKeySceneId);
    history.push(`/hiddenDangerCheck/CheckList/sceneCheck`);
  };
  const handerImgClick = (e: any) => {
    e.stopPropagation();
  };

  const columns: any = [
    {
      title: '序号',
      key: 'nums',
      render: (text: any, record: any, index: any) =>
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
      width: 80,
      ellipsis: true,
    },
    {
      title: '位置截图',
      dataIndex: 'sceneImgUrl',
      key: 'sceneImgUrl',
      width: 131,
      ellipsis: true,
      render: (text: any, recode: any) => {
        return (
          <>
            <Image
              src={recode.sceneImgUrl || ''}
              style={{ width: 58, height: 46 }}
              placeholder={true}
              fallback={fallback}
              onClick={(e: any) => handerImgClick(e)}
              preview={{
                visible: curPreviewRowId === recode.id,
                src: recode.sceneImgUrl,
                onVisibleChange: (value) => {
                  setCurPreviewRowId(recode.id);
                  if (!value) {
                    setCurPreviewRowId('');
                  }
                },
              }}
            />
          </>
        );
      },
    },
    {
      title: '场景名称',
      dataIndex: 'fkKeySceneName',
      key: 'fkKeySceneName',
      width: 222,
    },
    {
      title: '场景类型',
      dataIndex: 'fkSceneTypeName',
      key: 'fkSceneTypeName',
      width: 228,
      ellipsis: true,
    },
    {
      title: '上行起点',
      dataIndex: 'upStartPoint',
      key: 'upStartPoint',
      width: 193,
      ellipsis: true,
    },
    {
      title: '上行终点',
      dataIndex: 'upEndPoint',
      key: 'upEndPoint',
      width: 193,
    },
    {
      title: '下行起点',
      dataIndex: 'downStartPoint',
      key: 'downStartPoint',
      width: 193,
      ellipsis: true,
    },
    {
      title: ' 下行终点',
      dataIndex: 'downEndPoint',
      key: 'downEndPoint',
      width: 193,
    },

    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      render: (text: any) => {
        return (
          <Space size="middle">
            {
              <a
                className="ahover"
                onClick={() => {
                  handleSceneCrop(text);
                }}
              >
                场景裁剪
              </a>
            }
            {
              <a
                className="ahover"
                onClick={() => {
                  handleDel('single', text);
                }}
              >
                删除
              </a>
            }
            {/* {
              <a
                className={`ahover ${text.checkStatus === 0 && styles.tabOpsDisabled}`}
                onClick={() => {
                  if (text.checkStatus === 0) return;
                  handleSceneCheck();
                }}
              >
                隐患排查
              </a>
            } */}
          </Space>
        );
      },
    },
  ];

  const handleDoneCheck = async () => {
    const params = { projectId };
    const res = await doneCheck(params);
    if (res.status === 0) {
      message.success({
        content: '提交成功',
        key: '提交成功',
      });
    }
  };

  const handleReloadTab = () => {
    actionRef.current.reload();
  };

  const handleDataCropOk = (cropImgUrlRes: string) => {
    setShowDataCropModal(false);
    setCropImgUrl(cropImgUrlRes);
  };

  return (
    <div className={`${styles.hiddenScenarioWrapper} page-list-common hiddenScenarioWrapper`}>
      <div className={styles.backList} onClick={() => handleGoBack()}>
        <Image src={'images/back.svg'} preview={false} /> <span>项目列表</span>
      </div>
      <div className={styles.handleBtns}>
        <Button
          type="primary"
          onClick={() => {
            setShowSceneCreate(true);
          }}
        >
          添加场景
        </Button>
        <Button
          onClick={() => {
            handleDoneCheck();
          }}
        >
          完成排查
        </Button>
        <Button
          onClick={() => {
            handleSceneCheck();
          }}
        >
          隐患排查
        </Button>
      </div>
      <div className={`page-table-one-box`}>
        <ProTable<Member>
          columns={columns}
          actionRef={actionRef}
          request={async (params) => {
            const res = await getCheckListInfo(params);
            // 表单搜索项会从 params 传入，传递给后端接口。
            return res;
          }}
          params={{
            projectId,
          }}
          rowKey="id"
          // rowSelection={{
          //   selectedRowKeys: selectedRowKey,
          //   type: 'checkbox',
          //   onChange: onSelectChange,
          // }}
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
          tableAlertRender={false}
          pagination={{
            showQuickJumper: false,
            defaultPageSize: 20,
            current: searchPage,
            pageSizeOptions: ['10', '20', '50', '100', '500'],
          }}
          toolBarRender={false}
          search={false}
          scroll={scrollObj || { x: '100%' }}
          onChange={changetabval}
          onLoad={onload}
        />
      </div>
      {/* 场景裁剪 */}
      {showSceneCropModal && (
        <SceneCrop
          handleDataCrop={handleOpenDataCropMoadal}
          isShow={showSceneCropModal}
          onCancel={() => handleCloseSceneCropModal()}
          onOk={() => handleDoneSceneCrop()}
          sceneData={sceneData}
          cropImgUrl={cropImgUrl}
        ></SceneCrop>
      )}
      {/* 数据裁剪 */}
      {showDataCropModal && (
        <DataCrop
          isShow={showDataCropModal}
          onOk={(cropImgUrlRes: string) => handleDataCropOk(cropImgUrlRes)}
          onCancel={() => handleCloseDataCropModal()}
          sceneData={sceneData}
        ></DataCrop>
      )}

      {/* 点位排查 */}
      {showSpotCheck && (
        <SpotCheck isShow={showSpotCheck} onCancel={() => handleCloseSpotCheckModal()} />
      )}

      {/* 创建场景 */}
      {showSceneCreate && (
        <CreateScene
          isShow={showSceneCreate}
          onCancel={() => handleCloseSceneCreateModal()}
          onOk={() => handleReloadTab()}
        />
      )}
    </div>
  );
};

export default EdtMod;
