import { Modal, Radio, Image } from 'antd';
import type { RadioChangeEvent } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './styles.less';
import { ReactComponent as LeftCircleOutlined } from '../../../../../assets/img/leftAndRight/leftImg.svg';
import { ReactComponent as RightCircleOutlined } from '../../../../../assets/img/leftAndRight/rightImg.svg';
import { commonRequest } from '../../../../../utils/commonMethod';
import ImgCanvas from './ImgCanvas';

type Iprops = {
  isShow: boolean;
  rowInfo: any;
  tableData: any;
  onCancel: Function;
  nextPage: Function;
  prePage: Function;
  total?: any;
  page?: any;
  pageSize?: any;
};

const options = [
  { label: '全部', value: '0' },
  { label: '检测结果', value: '1' },
  { label: '标注结果', value: '2' },
  { label: '原图', value: '3' },
];

const ImgCanvasModal: React.FC<Iprops> = (props) => {
  const { isShow, rowInfo, tableData, onCancel, nextPage, prePage, total, page, pageSize } = props;
  const [imgInfo, setImgInfo] = useState<any>(null);
  const [imgUrl, setImgUrl] = useState<string>('');
  const [radioType, setRadioType] = useState<string>('0');
  const [currentIndex, setCurrentIndex] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const getImgInfo = async (id: any) => {
    const res = await commonRequest({
      url: `/traffic/algorithmVerifyDisease/${id}`,
      method: 'get',
    });
    setImgInfo(res?.data);
    setLoading(false);
  };

  const onChange = ({ target: { value } }: RadioChangeEvent) => {
    setRadioType(value);
  };

  useEffect(() => {
    getImgInfo(rowInfo?.verifyDiseaseId);
    return () => {};
  }, []);

  useEffect(() => {
    if (imgInfo) {
      const index = tableData?.findIndex(
        (item: any) => item?.verifyDiseaseId === imgInfo?.verifyDiseaseId,
      );
      const index1: any = (page - 1) * pageSize + index + 1;
      setCurrentIndex(index1);
    }
  }, [imgInfo]);

  useEffect(() => {
    if (tableData?.length && (currentIndex - 1) % pageSize === 0 && currentIndex !== 1) {
      getImgInfo(tableData[tableData?.length - 1]?.verifyDiseaseId);
    }
    if (tableData?.length && currentIndex % pageSize === 0 && currentIndex !== total * 1) {
      getImgInfo(tableData[0]?.verifyDiseaseId);
    }
  }, [tableData]);

  const preImg = () => {
    if (currentIndex === 1 || loading) return;
    setLoading(true);
    if ((currentIndex - 1) % pageSize === 0) {
      prePage();
    } else {
      getImgInfo(tableData[((currentIndex - 1) % pageSize) - 1]?.verifyDiseaseId);
    }
  };

  const nextImg = () => {
    if (currentIndex === total * 1 || loading) return;
    setLoading(true);
    if (currentIndex % pageSize === 0) {
      nextPage();
    } else {
      getImgInfo(tableData[currentIndex % pageSize]?.verifyDiseaseId);
    }
  };

  return (
    <div style={{ userSelect: 'none' }}>
      <Modal
        title={''}
        open={isShow}
        maskClosable={false}
        onCancel={() => {
          onCancel();
        }}
        width={1131}
        bodyStyle={{
          height: '90vh',
        }}
        style={{ top: '5%', userSelect: 'none' }}
        footer={false}
        className={styles.ImgCanvasModal}
      >
        <Radio.Group
          options={options}
          onChange={onChange}
          value={radioType}
          optionType="button"
          className={styles.ImgRadio}
        />
        <div className={styles.ImgCanvasContent}>
          <div className={styles.leftRightIcon}>
            <LeftCircleOutlined
              className={currentIndex === 1 ? styles.iconNone : styles.leftIcon}
              onClick={preImg}
            />
          </div>
          <div className={styles.ImgContent}>
            <Image
              src={imgUrl}
              // preview={{
              //   visible,
              //   src: imgUrl,
              //   onVisibleChange: (value) => {
              //     setVisible(value);
              //   },
              // }}
              preview={false}
              width={'100%'}
              height={'calc(90vh - 96px)'}
              placeholder={true}
            />
            {imgInfo ? (
              <ImgCanvas
                setImgUrl={(val: any) => setImgUrl(val)}
                data={imgInfo}
                radioType={radioType}
              />
            ) : (
              ''
            )}
          </div>
          <div className={styles.leftRightIcon}>
            <RightCircleOutlined
              onClick={nextImg}
              className={currentIndex === total * 1 ? styles.iconNone : styles.rightIcon}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ImgCanvasModal;
