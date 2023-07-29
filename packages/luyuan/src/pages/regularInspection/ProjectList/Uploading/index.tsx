import { Modal, Image } from 'antd';
import React, { useEffect, useState } from 'react';
import { useModel } from 'umi';
import styles from './styles.less';
// import { fileStatus } from '../dicEnum';
import { uploadImg } from '../serves';
import { ExclamationCircleOutlined, MinusOutlined, BorderOutlined } from '@ant-design/icons';

type Iprops = {
  isUploadingShow: boolean;
  onCancel: Function;
  onSet: Function;
  laneId: string;
  projectId: string;
};

const { confirm } = Modal;

const PictureManage: React.FC<Iprops> = (props) => {
  const [isSmall, setIsSmall] = useState<boolean>(false);
  const { fileList, setFileList, setFileNum } = useModel<any>('regularInspection');
  let { fileNum } = useModel<any>('regularInspection');

  useEffect(() => {}, []);

  const uploadAgain = async (item: any, index: any) => {
    if (item.status !== '重新上传') return;
    const formData = new FormData();
    formData.append('file', item);
    formData.append('laneId', props.laneId);
    formData.append('projectId', props.projectId);
    const list = [...fileList];
    try {
      const res = await uploadImg(formData);
      list[index].status = res.status === 0 ? '完成上传' : '重新上传';
      list[index].filePath = res?.data;
      if (res.status === 0) {
        fileNum += 1;
        setFileNum(fileNum);
      }
      setFileList([...list]);
      if (fileNum === list.length) {
        setFileList([]);
        setFileNum(0);
        props.onCancel();
      }
    } catch (error) {
      list[index].status = '重新上传';
      setFileList([...list]);
    }
  };

  const onCancel = () => {
    if (fileNum !== fileList.length) {
      confirm({
        title: '取消上传？',
        icon: <ExclamationCircleOutlined />,
        content: `当前仍有${fileList.length - fileNum}个文件未上传，关闭窗口后文件上传将被取消！`,
        okText: '继续上传',
        okType: 'danger',
        cancelText: '取消上传',
        async onOk() {},
        onCancel() {
          setFileList([]);
          setFileNum(0);
          props.onCancel();
        },
      });
    } else {
      setFileList([]);
      setFileNum(0);
      props.onCancel();
    }
  };

  return (
    <div className={styles.uploadingModal}>
      <div className={`${isSmall ? styles.isSmall : styles.isNotSmall}`}>
        <span>{`文件上传中（${fileNum}/${fileList.length}）`}</span>
        <BorderOutlined onClick={() => setIsSmall(false)} title="放大" />
      </div>
      <div className={`${isSmall ? styles.isOutSmall : styles.isNotOutSmall}`}>
        <Modal
          title={`文件上传中（${fileNum}/${fileList.length}）`}
          open={props.isUploadingShow}
          maskClosable={false}
          wrapClassName={`${isSmall ? styles.isOutSmall : styles.isNotOutSmall}`}
          mask={!isSmall}
          className="commomModalClass"
          onCancel={onCancel}
          footer={null}
        >
          <MinusOutlined
            style={{ position: 'absolute', top: '21px', left: '450px' }}
            onClick={() => setIsSmall(true)}
          />
          <div className={styles.uploadingBox}>
            {fileList?.map((item: any, index: number) => {
              return (
                <div
                  className={styles.itemPic}
                  key={item.uid}
                  style={index % 2 === 0 ? { background: '#FAFAFA' } : { display: '#FFF' }}
                >
                  <div className={styles.leftPic}>
                    <Image width={58} height={46} src={item.filePath} placeholder={true} />
                    <div className={styles.fileName}>{item.name}</div>
                  </div>
                  <div
                    className={`${styles.itemStatus} ${
                      item.status === '重新上传' ? styles.isAgainUpload : null
                    }`}
                    onClick={() => uploadAgain(item, index)}
                  >
                    {/* {fileStatus[item?.status] || '等待上传'} */}
                    {item.status || '等待上传'}
                  </div>
                </div>
              );
            })}
          </div>
        </Modal>
      </div>
    </div>
  );
};
export default PictureManage;
