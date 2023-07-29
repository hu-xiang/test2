import { Modal, Button, Input, message, Upload } from 'antd';
import styles from '../styles.less';
import { useState, useEffect, useRef, useCallback } from 'react';
// import { isExist } from '../../../../utils/commonMethod';
import { UploadOutlined, SearchOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { roadLibUpload, roadLibBatchDel } from '../service';
import React from 'react';
import delIcon from '../../../../assets/icon/del.svg';
import delDisabled from '../../../../assets/icon/delDisabled.svg';
import CommonTable from '../../../../components/CommonTable';
import debounce from 'lodash/debounce';
import { useModel } from 'umi';
// import { exportCom } from '../../../../utils/exportCom';

type Iprops = {
  visible?: boolean;
  onCancel: Function;
  onOk: Function;
  rowInfo: any;
  title?: string;
  URL?: string;
};
const { confirm } = Modal;

const RoadLib: React.FC<Iprops> = (props) => {
  const { initialState, setInitialState } = useModel<any>('@@initialState');
  const [keyword, setKeyword] = useState<any>('');
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [uploadFileStatusList, setUploadFileStatusList] = useState<any>([]);
  const [isFirst, setIsFirst] = useState(false);
  const ChildRef = useRef<any>();

  const columns: any = [
    { title: '序号', key: 'id', width: 68, type: 'sort' },
    {
      title: '文件名称',
      key: 'fileName',
      // width: 392,
    },
    {
      title: '操作',
      key: 'action',
      width: 156,
      type: 'operate',
      operateList: [
        {
          access: [],
          more: false,
          name: '下载',
          type: 'download',
        },
        {
          access: [],
          more: false,
          name: '预览',
          type: 'preview',
        },
        {
          access: [],
          more: false,
          name: '删除',
          type: 'del',
        },
      ],
    },
  ];

  const getIds = (type: any, id?: any) => {
    let ids: any = [];
    if (type === 'batch') {
      ids = selectedRows?.length === 0 ? [] : selectedRows;
    } else {
      ids = [id];
    }
    return ids;
  };
  const handleDel = (row: any, type: string) => {
    const params = {
      ids: getIds(type, row?.id),
    };
    confirm({
      title: '所选文件删除后将无法恢复，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        try {
          const res = await roadLibBatchDel(params);
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            setSelectedRows([]);
            ChildRef.current.onSet();
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

  const handlePreviewPdf = (row: any) => {
    window.open(row?.url ? `${row?.url}?response-content-type=application/pdf` : '');
  };

  const handleDownloadPdf = (row: any) => {
    if (!row?.url) return;
    const link = document.createElement('a');
    link.target = '_blank';
    link.href = row.url;
    link.setAttribute('download', row.fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const rowMethods = async (row: any, type: string) => {
    switch (type) {
      case 'del':
        handleDel(row, '');
        break;
      case 'preview':
        handlePreviewPdf(row);
        break;
      case 'download':
        handleDownloadPdf(row);
        break;
      default:
        break;
    }
  };
  const debouceSearch = useCallback(
    debounce((e: any) => {
      setKeyword(e.target.value.trim());
    }, 500),
    [],
  );
  const getSelectedRows = (rows: any) => {
    setSelectedRows(rows);
  };

  const voidFn = () => {};

  useEffect(() => {
    if (isFirst) {
      setInitialState({
        ...initialState,
        uploadFun: roadLibUpload,
        uploadModal: true,
        fileStatusList: uploadFileStatusList,
        refreshUploadPage: false,
      });
    }
  }, [isFirst]);

  useEffect(() => {
    if (initialState?.refreshUploadPage) {
      ChildRef.current.onSet();
    }
  }, [initialState?.refreshUploadPage]);

  const beforeUpload = (file: any) => {
    if (!isFirst) {
      setIsFirst(true);
    }
    const isPdf = file.type === 'application/pdf';
    if (!isPdf) {
      message.error({
        content: '只能上传pdf文件!',
        key: '只能上传pdf文件!',
      });
      return false;
    }
    const limitSize = file.size / 1024 / 1024 < 100;
    if (!limitSize) {
      message.error({
        content: '文件大小需小于100MB!',
        key: '文件大小需小于100MB!',
      });
      return false;
    }
    setUploadFileStatusList((e: any) => {
      const newfile = { file, status: 'uploading', url: '' };
      return [...e, newfile];
    });
    return false;
  };

  const uploadPdf = () => {
    setIsFirst(false);
    setUploadFileStatusList([]);
    setInitialState({
      ...initialState,
      uploadFun: roadLibUpload,
      uploadModal: false,
      fileStatusList: [],
      refreshUploadPage: false,
      otherParams: {
        facilityId: props.rowInfo?.id,
      },
    });
  };
  return (
    <Modal
      title={props.title}
      open={props.visible}
      maskClosable={false}
      width={window.innerWidth * (720 / 1920) < 720 ? 720 : window.innerWidth * (720 / 1920)}
      onCancel={() => {
        props.onCancel();
      }}
      onOk={() => props.onOk()}
      className="common-modal"
      footer={null}
    >
      <div className={styles.titleArea}>
        <div className={styles.btnGroup}>
          <Upload
            multiple={true}
            disabled={initialState?.uploadModal}
            maxCount={2000}
            showUploadList={false}
            fileList={initialState?.fileStatusList}
            beforeUpload={beforeUpload}
          >
            <Button
              icon={<UploadOutlined />}
              type="primary"
              onClick={initialState?.uploadModal ? voidFn : uploadPdf}
            >
              上传
            </Button>
          </Upload>
          <Button
            className={selectedRows?.length === 0 ? 'disabledBtn' : `delBtn`}
            disabled={selectedRows?.length === 0}
            icon={<img src={selectedRows?.length === 0 ? delDisabled : delIcon} />}
            onClick={() => {
              if (!selectedRows?.length) return;
              handleDel({}, 'batch');
            }}
          >
            删除
          </Button>
        </div>
        <div className={styles.search}>
          <Input
            placeholder="请输入文件名称关键词搜索"
            allowClear
            onChange={(e) => {
              debouceSearch(e);
            }}
            style={{
              width: `${
                window.innerWidth * (320 / 1920) < 320 ? 320 : window.innerWidth * (320 / 1920)
              }px`,
              height: 32,
              borderRadius: 4,
              float: 'right',
            }}
            suffix={<SearchOutlined className="input-search" />}
            className="usersel"
          />
        </div>
      </div>
      <div>
        <CommonTable
          // scroll={{ x: '100%', y: 'calc(80vh - 400px)' }}
          scroll={{ x: '100%', y: 'calc(95vh - 400px)' }}
          columns={columns}
          onRef={ChildRef}
          isScroll={true}
          isRefresh={true}
          searchKey={{ keyword, facilityId: props.rowInfo?.id }}
          rowMethods={rowMethods}
          getSelectedRows={getSelectedRows}
          url={props.URL}
        />
      </div>
    </Modal>
  );
};

export default RoadLib;
