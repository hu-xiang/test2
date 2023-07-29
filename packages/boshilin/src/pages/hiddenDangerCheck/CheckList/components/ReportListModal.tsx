import { Modal, message } from 'antd';
// import { divide } from 'lodash';
import React, { useRef } from 'react';
import styles from '../styles.less';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import CommonTable from 'baseline/src/components/CommonTable';
import { delReport } from '../service';

type Iprops = {
  visible: boolean;
  onCancel: () => void;
  onOk: () => void;
  rowInfo?: any;
};
const { confirm } = Modal;

const EdtMod: React.FC<Iprops> = (props) => {
  const ChildRef = useRef<any>();
  const columns: any = [
    // { title: '编号', key: 'id', width: 60, type: 'sort' },
    {
      title: '报告名称',
      dataIndex: 'reportName',
      key: 'reportName',
      width: 129,
      ellipsis: true,
    },
    {
      title: '生成时间',
      dataIndex: 'crtTime',
      key: 'crtTime',
      width: 135,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
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
          name: '删除',
          type: 'del',
        },
      ],
    },
  ];

  const handleDownload = (row: any) => {
    if (!row?.reportUrl) return;
    const link = document.createElement('a');
    link.target = '_blank';
    link.href = row.reportUrl;
    link.setAttribute('download', row.reportName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const refreshTable = () => {
    ChildRef.current.onSet();
  };
  const removeFile = async (fileinfo: any) => {
    const { id } = fileinfo;
    const formData = new FormData();
    formData.append('reportId ', id);
    const hide = message.loading({
      content: '正在删除',
      key: '正在删除',
    });
    try {
      const res = await delReport(formData);
      hide();
      if (res.status === 0) {
        message.success({
          content: '删除成功',
          key: '删除成功',
        });
        refreshTable();
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
  };
  const submit = () => {};
  const handleDel = (row: any) => {
    confirm({
      title: '报告信息将删除，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        removeFile(row);
      },
      onCancel() {},
    });
  };
  const rowMethods = async (row: any, type: string) => {
    switch (type) {
      case 'download':
        handleDownload(row);
        break;
      case 'del':
        handleDel(row);
        break;
      default:
        break;
    }
  };
  return (
    <Modal
      title={`报告列表`}
      open={props.visible}
      onCancel={() => props.onCancel()}
      onOk={() => submit()}
      className={`crtedtDev ${styles.crtedtDev}`}
      destroyOnClose
      okText={'提交'}
    >
      <div>
        <CommonTable
          scroll={{ x: '100%', y: 'calc(80vh - 400px)' }}
          columns={columns}
          onRef={ChildRef}
          isScroll={true}
          isRefresh={true}
          searchKey={{ projectId: props.rowInfo?.id }}
          rowMethods={rowMethods}
          getSelectedRows={() => {}}
          url="/traffic-bsl/project/reportPage"
          rowSelection={false}
          diseImgPreview={true}
          arrowShow={false}
        />
      </div>
    </Modal>
  );
};

export default EdtMod;
