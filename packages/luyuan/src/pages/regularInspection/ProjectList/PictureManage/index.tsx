import { Modal, Space, Upload, message } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { ProTable } from '@ant-design/pro-table';
import { getProjectLane, uploadImg } from '../serves';
import { useAccess, useModel } from 'umi';
import PictureDetail from '../PictureDetail';
// import Uploading from '../Uploading';
// import { ExclamationCircleOutlined } from '@ant-design/icons';
import styles from './styles.less';

type Iprops = {
  isPicModalShow: boolean;
  onCancel: Function;
  onSet: Function;
  id: any;
  projectName: string;
};

// let newList: any = [];

// const { confirm } = Modal;

const PictureManage: React.FC<Iprops> = (props) => {
  const { initialState, setInitialState } = useModel<any>('@@initialState');
  const ref: any = useRef();
  const access: any = useAccess();
  const [isDetailModalShow, setIsDetailModalShow] = useState(false);
  const [laneId, setLaneId] = useState<any>('');
  // const { fileList, setFileList, setFileNum } = useModel<any>('regularInspection');
  // let { fileNum } = useModel<any>('regularInspection');
  // const [isUploadingShow, setIsUploadingShow] = useState(false);
  // const [isUpload, setIsUpload] = useState(false);
  const [isFirst, setIsFirst] = useState(false);
  const [imgfileStatusList, setImgfileStatusList] = useState<any>([]);

  useEffect(() => {}, []);

  const onLoad = () => {};

  const onSet = () => {};

  // 文件上传完毕后自动刷新页面
  useEffect(() => {
    if (initialState?.refreshUploadPage) {
      setInitialState({ ...initialState, refreshUploadPage: false });
    }
  }, [initialState?.refreshUploadPage]);

  useEffect(() => {
    if (isFirst) {
      setInitialState({
        ...initialState,
        uploadFun: uploadImg,
        uploadModal: true,
        fileStatusList: imgfileStatusList,
        refreshUploadPage: false,
      });
    }
  }, [isFirst]);
  const beforeUpload = (file: any) => {
    if (!isFirst) {
      setIsFirst(true);
    }
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      setIsFirst(false);
      message.error({
        content: '只能上传JPG或PNG文件!',
        key: '只能上传JPG或PNG文件!',
      });
      return false;
    }
    const isLt2M = file.size / 1024 / 1024 < 10;
    if (!isLt2M) {
      setIsFirst(false);
      message.error({
        content: '图片大小需小于10MB!',
        key: '图片大小需小于10MB!',
      });
      return false;
    }
    setImgfileStatusList((e: any) => {
      const newfile = { file, status: 'uploading', url: '' };
      return [...e, newfile];
    });
    return false;
  };

  const addpic = async (text: any) => {
    setIsFirst(false);
    setImgfileStatusList([]);
    setInitialState({
      ...initialState,
      uploadFun: uploadImg,
      uploadModal: false,
      fileStatusList: [],
      refreshUploadPage: false,
      otherParams: {
        laneId: text?.id,
        projectId: props.id,
      },
    });
  };

  const handleSubmit = () => {};
  // useEffect(() => {
  //   if (isUpload) {
  //     setFileNum(0);
  //     setIsUpload(false);
  //     setFileList([...newList]);
  //     setIsUploadingShow(true);
  //     newList.forEach(async (item: any, index: any) => {
  //       item.status = '正在上传';
  //       setFileList([...newList]);
  //       const formData = new FormData();
  //       formData.append('file', item);
  //       formData.append('laneId', laneId);
  //       formData.append('projectId', props.id);
  //       try {
  //         const res = await uploadImg(formData);
  //         item.status = res.status === 0 ? '完成上传' : '重新上传';
  //         item.filePath = res?.data;
  //         if (res.status === 0) {
  //           fileNum += 1;
  //           setFileNum(fileNum);
  //         }
  //         setFileList([...newList]);
  //         if (fileNum === newList.length) {
  //           setFileList([]);
  //           setFileNum(0);
  //           setIsUploadingShow(false);
  //           message.success({
  //             content: '上传成功',
  //             key: '上传成功',
  //           });
  //         }
  //       } catch (error) {
  //         item.status = '重新上传';
  //         setFileList([...newList]);
  //       }
  //       setTimeout(() => {
  //         if (index === newList.length - 1) {
  //           newList = [];
  //         }
  //       }, 100);
  //     });
  //   }
  // }, [isUpload]);

  const onCancel = () => {
    // if (fileNum !== fileList.length) {
    //   confirm({
    //     title: '取消上传？',
    //     icon: <ExclamationCircleOutlined />,
    //     content: `当前仍有${fileList.length - fileNum}个文件未上传，关闭窗口后文件上传将被取消！`,
    //     okText: '继续上传',
    //     okType: 'danger',
    //     cancelText: '取消上传',
    //     async onOk() { },
    //     onCancel() {
    //       setFileList([]);
    //       setFileNum(0);
    //       props.onCancel();
    //     },
    //   });
    // } else {
    //   setFileList([]);
    //   setFileNum(0);
    //   props.onCancel();
    // }
    props.onCancel();
  };

  // const beforeUpload = (info: any, fileArr: any) => {
  //   newList.push(info);
  //   setIsUpload(newList.length === fileArr.length);
  //   return false;
  // };

  const columns: any = [
    {
      title: '序号',
      dataIndex: 'index',
      valueType: 'index',
      width: 60,
    },
    {
      title: '车道名称',
      dataIndex: 'lane',
      key: 'lane',
      width: 200,
      ellipsis: true,
      render: (text: any, recode: any) => (
        <span>
          {recode.direction === 1 ? '下行' : '上行'}
          {recode.lane}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'option',
      // width: 180,
      fixed: 'right',
      valueType: 'option',
      render: (text: any, recode: any) => (
        <Space size="middle">
          {access['regularInspection/projectList/index:btn_uploadPic'] && (
            // <Upload
            //   multiple
            //   showUploadList={false}
            //   beforeUpload={beforeUpload}
            //   accept=".jpg, .jpeg, .png"
            // >
            //   <a
            //     className="ahover"
            //     onClick={() => {
            //       setLaneId(recode.id);
            //     }}
            //   >
            //     上传图片
            //   </a>
            // </Upload>

            <Upload
              multiple
              disabled={initialState?.uploadModal}
              maxCount={1000}
              showUploadList={false}
              fileList={initialState?.fileStatusList}
              beforeUpload={beforeUpload}
            >
              <a
                className={`ahover ${initialState?.uploadModal ? 'uploadingClass' : null}`}
                onClick={initialState?.uploadModal ? () => {} : () => addpic(recode)}
              >
                上传图片
              </a>
            </Upload>
          )}
          {access['regularInspection/projectList/index:btn_picDetail'] && (
            <a
              className="ahover"
              onClick={() => {
                setLaneId(recode.id);
                setIsDetailModalShow(true);
              }}
            >
              图片详情
            </a>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Modal
        title="图片管理"
        open={props.isPicModalShow}
        maskClosable={false}
        className="commomModalClass"
        onCancel={onCancel}
        footer={null}
        onOk={() => handleSubmit()}
        okText="提交"
      >
        <div className={styles.tableClass}>
          <ProTable
            columns={columns}
            onLoad={onLoad}
            request={async () => {
              const res = await getProjectLane(props.id);
              return res;
            }}
            rowKey="id"
            tableAlertRender={false}
            toolBarRender={false}
            search={false}
            actionRef={ref}
            pagination={false}
          />
        </div>
      </Modal>
      {isDetailModalShow ? (
        <PictureDetail
          id={props.id}
          isDetailModalShow={isDetailModalShow}
          laneId={laneId}
          projectName={props.projectName}
          onCancel={() => {
            setIsDetailModalShow(false);
          }}
          onSet={onSet}
        />
      ) : null}
      {/* {isUploadingShow ? (
        <Uploading
          isUploadingShow={isUploadingShow}
          laneId={laneId}
          projectId={props.id}
          onCancel={() => {
            setFileList([]);
            setIsUploadingShow(false);
          }}
          onSet={onSet}
        />
      ) : null} */}
    </div>
  );
};
export default PictureManage;
