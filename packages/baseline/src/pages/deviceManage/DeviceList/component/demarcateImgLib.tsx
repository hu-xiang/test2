import { Input, Modal, message, Form, Space, Image } from 'antd';
import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles.less';
import ProTable from '@ant-design/pro-table';
import DemarcateParameter from './demarcateParameter';
import { imgList, downlodlibExcel } from '../service';
import { exportCom } from '../../../../utils/exportCom';

type Iprops = {
  imgLibShow: boolean;
  onCancel: Function;
  deviceId: any;
  channelNo: any;
  channelid: any;
};
export type Member = {
  diseaseNameZh: string;
};

const DemarcateImgLib: React.FC<Iprops> = (props) => {
  const { deviceId, channelNo, imgLibShow, channelid } = props;
  const [searchPage, setSearchPage] = useState(1);
  const [tabpage, setTabpage] = useState(1);
  const [tabpagesize, setTabpagesize] = useState(20);
  const [parameterShow, setParameterShow] = useState(false);
  const [imgInfo, setImgInfo] = useState();

  const actionRef = useRef<any>();
  //   const updatakeyword = () => {
  //     actionRef.current.reload();
  //   };
  const changetabval = (text: any) => {
    if (text?.current !== searchPage) {
      setSearchPage(text?.current as number);
      setTabpage(text?.current as number);
    }
    if (text?.pageSize !== tabpagesize) setTabpagesize(text?.pageSize as number);
    // setSelectedRowKey([]);
  };
  // const pageChange = (page: any) => {
  //   setSearchPage(page);
  //   setTabpage(page);
  //   // setTabpagesize(pageSize);
  // };
  const exportBatch = async (id: any) => {
    const hide = message.loading({
      content: '正在导出',
      key: '正在导出',
    });
    const obj = {
      id,
    };
    try {
      const res: any = await downlodlibExcel(obj);
      hide();
      exportCom(res);
      message.success({
        content: '导出成功',
        key: '导出成功',
      });
      return true;
    } catch (error) {
      hide();
      message.error({
        content: '导出失败!',
        key: '导出失败!',
      });
      return false;
    }
  };
  const columns3 = [
    {
      title: '编号',
      key: 'num',
      width: 60,
      render: (text: any, record: any, index: any) =>
        `${((searchPage || tabpage) - 1) * tabpagesize + (index + 1)}`,
    },
    {
      title: '缩略图',
      key: 'imgUrl',
      dataIndex: 'imgUrl',
      width: 100,
      render: (text: any) => {
        return <Image style={{ height: 50 }} src={text} />;
      },
    },
    {
      title: '标定图片ID',
      key: 'imgId',
      dataIndex: 'imgId',
      width: 120,
      ellipsis: true,
    },
    {
      title: '抓拍时间',
      key: 'collectTime',
      dataIndex: 'collectTime',
      width: 140,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (recode: any) => (
        <Space size="middle" className={styles.detailOperate}>
          <a
            className="ahover"
            onClick={() => {
              setParameterShow(true);
              setImgInfo(recode);
            }}
          >
            配置
          </a>
          <a className="ahover" onClick={() => exportBatch(recode.id)}>
            下载
          </a>
        </Space>
      ),
    },
  ];

  const formref = useRef<any>();

  useEffect(() => {
    formref.current.setFieldsValue({
      deviceId,
      channelNo,
    });
  }, []);
  const onload = (dataSource: any) => {
    if (!dataSource?.length) {
      if (searchPage > 1) {
        setSearchPage(searchPage - 1);
      } else {
        setSearchPage(1);
      }
    }
  };

  return (
    <Modal
      title={`标定图片库`}
      open={imgLibShow}
      onCancel={() => props.onCancel()}
      // footer={false}
      onOk={() => props.onCancel()}
      width={575}
      okText={'确定'}
      className="DemarcateImgLib DemarcateImgLib2"
    >
      <Form labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} ref={formref}>
        <Form.Item label="设备编号" name="deviceId">
          <Input autoComplete="off" placeholder="请输入设备编号" disabled />
        </Form.Item>
        <Form.Item label="通道号" name="channelNo">
          <Input autoComplete="off" placeholder="请输入通道号" disabled />
        </Form.Item>
      </Form>
      <div className={styles.statusDetailBox}>
        <ProTable<Member>
          columns={columns3}
          request={imgList}
          pagination={{
            showQuickJumper: false,
            defaultPageSize: 20,
            current: searchPage,
            // onChange: pageChange,
          }}
          onChange={changetabval}
          scroll={{ y: 235 }}
          actionRef={actionRef}
          params={{
            // current: searchPage,
            deviceId,
            channelId: channelid + 1,
          }}
          rowKey="id"
          toolBarRender={false}
          search={false}
          onLoad={onload}
        />
      </div>
      {parameterShow ? (
        <DemarcateParameter
          parameterShow={parameterShow}
          imgInfo={imgInfo}
          onsetkey={() => {
            setParameterShow(false);
            actionRef.current.reload();
          }}
          onCancel={() => {
            setParameterShow(false);
          }}
        />
      ) : null}
    </Modal>
  );
};

export default DemarcateImgLib;
