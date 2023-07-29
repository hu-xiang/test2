import { Modal, Space, Image, message, Input } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { ProTable } from '@ant-design/pro-table';
import { getImgList, delImage } from '../serves';
import { useAccess } from 'umi';
import { ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons';
import styles from './styles.less';

type Iprops = {
  isDetailModalShow: boolean;
  onCancel: Function;
  onSet: Function;
  id: string | number;
  laneId: string | number;
  projectName: string;
};

const { confirm } = Modal;

const PictureDetail: React.FC<Iprops> = (props) => {
  const picRef: any = useRef();
  const access: any = useAccess();
  const [keyword, setKeyword] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState<any>(0);
  const [tableData, setTableData] = useState<any>([]);
  const [tabpagesize, setTabpagesize] = useState<number>(20);

  useEffect(() => {}, []);

  const onLoad = (dataSource: any) => {
    if (!dataSource?.length) {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        setCurrentPage(1);
      }
    } else if (tableData.length !== dataSource.length) {
      setTableData(dataSource);
    }
  };

  // 查询重置
  const onSet = () => {
    picRef.current.reload();
  };

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   // setKeyword(e.target.value);
  //   keyword = e.target.value
  // };

  const handleInputConfirm = (e: any) => {
    setCurrentPage(1);
    setKeyword(e.target.value);
    // picRef.current.reload();
  };

  const changetabval = (text: any) => {
    if (text?.current !== currentPage) setCurrentPage(text?.current as number);
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
  };

  // 删除
  const delRowImg = (id: any) => {
    confirm({
      title: '图片将删除，是否继续？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        const formData = new FormData();
        formData.append('id ', id);
        const hide = message.loading({
          content: '正在删除',
          key: '正在删除',
        });
        try {
          const res = await delImage(formData);
          hide();
          if (res.status === 0) {
            message.success({
              content: '删除成功',
              key: '删除成功',
            });
            setKeyword('');
            onSet();
          } else {
            message.error({
              content: res.message,
              key: res.message,
            });
          }
        } catch (error) {
          hide();
          message.error({
            content: '删除失败!',
            key: '删除失败!',
          });
        }
      },
      onCancel() {},
    });
  };

  const columns: any = [
    {
      title: '序号',
      key: 'id',
      render: (text: any, record: any, index: any) =>
        `${(currentPage - 1) * tabpagesize + (index + 1)}`,
      width: 60,
    },
    {
      title: '缩略图',
      dataIndex: 'imgUrl',
      key: 'imgUrl',
      width: 80,
      render: (text: any) => {
        return <Image src={text} style={{ width: 58, height: 46 }} placeholder={true} />;
      },
    },
    {
      title: '图片名称',
      dataIndex: 'imgName',
      key: 'imgName',
      width: 160,
      ellipsis: true,
    },
    {
      title: '上传时间',
      dataIndex: 'crtTime',
      key: 'crtTime',
      width: 160,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'option',
      width: 60,
      fixed: 'right',
      valueType: 'option',
      render: (text: any, recode: any) => (
        <Space size="middle">
          {access['regularInspection/projectList/index:btn_picDel'] && (
            <a
              className="ahover"
              onClick={() => {
                delRowImg(recode.id);
              }}
            >
              删除
            </a>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Modal
      title="图片详情"
      open={props.isDetailModalShow}
      onCancel={() => {
        props.onCancel();
      }}
      width={714}
      footer={null}
      maskClosable={false}
      className="commomModalClass ant-modal-image-common"
    >
      <div className={styles.searchBox}>
        <div className={styles.searchLeft}>
          <div className={styles.labelTitle}>项目名称</div>
          <Input autoComplete="off" disabled value={props.projectName} />
        </div>
        <div className={styles.searchRight}>
          <Input
            className={styles.inputSearch}
            suffix={<SearchOutlined className="input-search" />}
            allowClear
            placeholder="请输入图片名称的关键字"
            type="text"
            size="small"
            autoFocus
            defaultValue={keyword}
            // onChange={handleInputChange}
            onBlur={handleInputConfirm}
            onPressEnter={(e) => handleInputConfirm(e)}
          />
        </div>
      </div>
      <div className={`${total === '0' ? styles.tableContent : null}`}>
        <ProTable
          columns={columns}
          onLoad={onLoad}
          params={{
            projectId: props.id,
            laneId: props.laneId,
            keyword,
          }}
          request={async (params) => {
            const res = await getImgList(params);
            setTotal(res?.total);
            return res;
          }}
          rowKey="id"
          pagination={{
            showQuickJumper: false,
            showSizeChanger: false,
            defaultPageSize: 5,
            current: currentPage,
          }}
          scroll={{ x: '100%' }}
          tableAlertRender={false}
          toolBarRender={false}
          search={false}
          actionRef={picRef}
          onChange={changetabval}
        />
      </div>
    </Modal>
  );
};
export default PictureDetail;
