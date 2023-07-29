import React, { useState, useRef } from 'react';
import { Button, Input, message, Modal, Space } from 'antd';
import { imgLibDel } from '../service';
import { ExclamationCircleOutlined } from '@ant-design/icons';
// import ProTable from '@ant-design/pro-table';
import CommonTable from '../../../../components/CommonTable';
// import { useScrollObj } from '@/utils/tableScrollSet';
import { useAccess } from 'umi';
// import placeholdSvg from '../../../../../public/images/placeholder.svg';
import styles from '../styles.less';

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
type Iprops = {
  isShow: boolean;
  // isCreate: boolean;
  onCancel: Function;
  onsetkey: Function;
  editInfo: any;
};

const { confirm } = Modal;
const ImgLib: React.FC<Iprops> = (props) => {
  const actionRef = useRef<any>();

  const [keyword, setKeyword] = useState<any>('');
  const [searchPage, setSearchPage] = useState(1);
  const [tabpage] = useState(1);
  const [tabpagesize] = useState(10);
  // const [tableData, setTableData] = useState([]);

  // const scrollObj = useScrollObj(
  //   tableData,
  //   {
  //     x: `calc(${window.innerWidth * 0.4817} - 40px)`,
  //     // y: 'calc(100vh - 220px)',
  //     y: '405px',
  //   },
  //   '.imgLib-tab',
  // );
  const [selectedRowKey, setSelectedRowKey] = useState<(number | string)[]>([]);

  const access: any = useAccess();

  const refreshPage = () => {
    actionRef.current.reload();
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
      ids: getIds(deleteType, text?.imgId),
    };
    confirm({
      title: '图片将删除，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const formData = new FormData();
        if (deleteType === 'batch') {
          formData.append('idList', params?.ids);
        } else {
          formData.append('idList', params?.ids);
        }
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          // const checkRes = await versionCheck({ idList: params?.ids });
          // if (checkRes.status === 0) {
          let res: any = null;
          res = await imgLibDel(formData);
          hide();
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            refreshPage();
            setSelectedRowKey([]);
          }
          return true;
          // }
          // return false;
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

  const columns: any = [
    {
      title: '编号',
      key: 'num',
      width: 71,
      ellipsis: true,
      fixed: 'left',
      render: (text: any, record: any, index: any) =>
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
    },
    {
      title: '缩略图',
      dataIndex: 'imgUrl',
      key: 'imgUrl',
      width: 101,
      type: 'previewImage',
    },
    {
      title: '图片名称',
      dataIndex: 'imgName',
      key: 'imgName',
      width: 214,
      ellipsis: true,
    },
    {
      title: '标注结果',
      dataIndex: 'labelDiseaseTypes',
      key: 'labelDiseaseTypes',
      width: 334,
      ellipsis: true,
    },

    {
      title: '操作',
      width: 111,
      key: 'action',
      fixed: 'right',
      render: (text: any) => {
        return (
          <Space size="middle">
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
          </Space>
        );
      },
    },
  ];

  const onSearch = (e: any) => {
    setKeyword(e.trim());
    setSearchPage(1);
    actionRef.current.reload();
  };

  return (
    <Modal
      title={'图片库详情'}
      open={props.isShow}
      onCancel={() => props.onCancel()}
      className={`crtedtDev ${styles.crtedtDev}`}
      destroyOnClose
      footer={null}
      width={window.innerWidth * 0.4818}
    >
      <div className={styles.headerInfo}>
        <span>图片库详情</span>
        <span
          className={styles.closeIcon}
          onClick={() => {
            props.onCancel();
          }}
        >
          close
        </span>
      </div>
      <div className={`commonTableClass ${styles.imgLibWrapper}`}>
        {/* 顶部按钮 */}
        <div className={'row-class'}>
          <div className="left-box">
            {access['DeviceManage/VersionList/index:btn_add'] && (
              <Button type="primary" className={'buttonClass'} onClick={() => handleDel('batch')}>
                批量删除
              </Button>
            )}
          </div>
          <div className="right-search">
            <Search
              placeholder="请输入图片名称的关键字"
              allowClear
              onSearch={(e) => onSearch(e)}
              maxLength={50}
              enterButton
            />
          </div>
        </div>
        {/* 表格 */}
        {/* 
        <div className={`table-box-normal2`}>
          <ProTable<Member>
            columns={columns}
            actionRef={actionRef}
            request={getImgLibList}
            params={{
              keyword,
              taskId: props.editInfo?.verifyTaskId,
            }}
            onLoad={onLoad}
            rowKey="imgId"
            scroll={scrollObj || { x: '100%' }}
            tableClassName="imgLib-tab"
            rowSelection={{
              selectedRowKeys: selectedRowKey,
              type: 'checkbox',
              onChange: onSelectChange,
            }}
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
              defaultPageSize: 10,
              current: searchPage,
            }}
            toolBarRender={false}
            search={false}
            onChange={changetabval}
          />
        </div> */}

        <CommonTable
          scroll={{ x: 950, y: 'calc(100vh - 287px)' }}
          columns={columns}
          searchKey={{ imgName: keyword, taskId: props.editInfo?.verifyTaskId }}
          rowKey={'imgId'}
          rowMethods={() => {}}
          url="/traffic/algorithmVerifyVerifyImage/"
          getSelectedRows={() => {}}
          rowSelection={false}
          isRefresh={true}
          pageName={'algValiTool-imgLib-page'}
          // updateCurPreviewInfo={(row: any) => updateCurPreviewInfo(row)}
          // updatePreviewInfo={(params: any, res: any) =>
          //   handleUpdatePreviewInfo(params, res, 'pendingReview-repeat-page')
          // }
        />
      </div>
    </Modal>
  );
};
export default ImgLib;
