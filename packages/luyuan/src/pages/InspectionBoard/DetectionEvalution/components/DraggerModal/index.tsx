import React, { useState, useEffect, useImperativeHandle, useRef } from 'react';
import { Image } from 'antd';
import styles from './styles.less';
import Draggable from 'react-draggable';

interface lsType {
  imgName: string;
  collectTime: string;
  diseaseName: string;
  area: string;
  length: string;
  deepth: string;
  facilityName: string;
  projectName: string;
  stationNo: string;
  imgList: string[];
  id: any;
  direction: string;
  laneName: string;
}
interface Iprops {
  isModalVisible?: boolean;
  imgInfo: lsType;
  address: string;
  onRef: any;
  hideModal: () => void;
  style: { x: number; y: number };
}

const ls: lsType = {
  imgName: '',
  collectTime: '',
  diseaseName: '',
  area: '',
  length: '',
  deepth: '',
  id: '',
  imgList: [],
  facilityName: '',
  projectName: '',
  stationNo: '',
  direction: '',
  laneName: '',
};

const DraggerModal: React.FC<Iprops> = (props: Iprops) => {
  const [data, setData] = useState<lsType>(ls);
  const childRef: any = useRef();
  const [disabled, setDisabled] = useState<any>(true);
  const [visibleFlag, setVisibleFlag] = useState<any>(false);
  const [imgFlag, setImgFlag] = useState<any>(false);
  const [imgUrl, setImgUrl] = useState<any>('error');
  const { imgInfo, address } = props;
  useEffect(() => {
    setVisibleFlag(props.isModalVisible);
  }, [props.isModalVisible]);

  const mergeImgs = (list: any[], cwidth: number, cheight: number) => {
    return new Promise((resolve) => {
      const baseList: any[] = [];

      // 创建 canvas 节点并初始化
      const canvas = document.createElement('canvas');
      canvas.width = cwidth * list?.length;
      canvas.height = cheight;
      const context = canvas.getContext('2d');
      list.forEach((item: any, index: number) => {
        const img = new (Image as any)();
        img.setAttribute('crossOrigin', 'Anonymous');
        img.src = item;
        // 跨域
        img.onload = () => {
          context!.drawImage(img, cwidth * index, 0, cwidth, cheight);
          const base64 = canvas.toDataURL('image/png');
          baseList.push(base64);
          if (baseList[list.length - 1]) {
            // 返回新的图片
            resolve(baseList[list.length - 1]);
          }
        };
      });
    });
  };

  useEffect(() => {
    if (imgInfo?.id) {
      setData({ ...imgInfo });
      if (imgInfo?.imgList?.length > 0) {
        mergeImgs(imgInfo?.imgList.slice(0, 2), 115, 171).then((base64: any) => {
          setImgUrl(base64);
        });
      }
    }
    if (childRef && childRef.current) {
      childRef.current?.resetPlayButton();
    }
  }, [imgInfo?.id]);
  useEffect(() => {
    if (imgFlag) {
      if (imgInfo?.imgList?.length > 0) {
        mergeImgs(
          imgInfo?.imgList.slice(0, 2),
          imgInfo?.imgList?.length === 1 ? 800 : 700,
          800,
        ).then((base64: any) => {
          setImgUrl(base64);
        });
      }
    }
  }, [imgFlag]);
  const clickClose = () => {
    props.hideModal();
  };

  const resetMaskClosableFlag = (prop: any) => {
    setVisibleFlag(prop);
  };
  useImperativeHandle(props.onRef, () => ({
    // 暴露给父组件的方法
    resetMaskClosableFlag,
  }));

  const style = {
    bgd: {
      background: 'rgba(147, 151, 174, 0.3)',
      boxShadow: ' 0px 6px 8px rgba(0, 0, 0, 0.6)',
      backgroundSize: '100%,100%',
      borderRadius: '18px',
      backdropFilter: 'blur(15px)',
    },
  };

  return (
    <>
      {visibleFlag ? (
        <Draggable disabled={disabled} bounds="parent" defaultPosition={{ x: -258, y: -169 }}>
          <div
            className={`${styles['map-dis-pop-modal']} ${styles.draggerModalClass}`}
            style={style.bgd}
          >
            <div
              className={`${styles.modalRowTitle} ${styles.dragHeadTitle}`}
              onMouseOver={() => {
                if (disabled) {
                  setDisabled(false);
                }
              }}
              onMouseOut={() => {
                setDisabled(true);
              }}
            >
              <div className={styles.leftContent}>
                <span className={styles.modalTitleImg}></span>
                <div>病害信息</div>
              </div>
              <div className={`${styles.rightContent} ${styles.rightButton}`}>
                <span onClick={clickClose} className={styles.closeModalInfoClass}></span>
              </div>
            </div>
            <div className={`${styles.diseaseRowCommon} ${styles.dragRowInfo}`}>
              <div className={styles.diseaseLeftInfo}>
                <div className={styles.diseaseLeftTopInfo}>
                  <Image
                    className="map-pop-img"
                    width={230}
                    height={172}
                    src={imgUrl}
                    preview={{
                      visible: imgFlag,
                      src: imgUrl,
                      onVisibleChange: (value) => {
                        setImgFlag(value);
                      },
                    }}
                    placeholder={true}
                  />
                </div>
              </div>
              <div className={`map-pop-content ${styles.diseaseRightInfo}`}>
                <div className={styles.diseaseNoInfoClass}>
                  <span className={styles.diseaseNoClass} title={data?.imgName}>
                    {data?.imgName || '暂无'}
                  </span>
                  <span>{data?.collectTime}</span>
                </div>
                <div className={styles.diseaseTypeClass}>{data?.diseaseName}</div>
                <div>
                  面积：
                  {data?.area ? `${data?.area}m²` : '-'}
                </div>
                <div>
                  长度：
                  {data?.length ? `${data?.length}m` : '-'}
                </div>
                <div>
                  深度：
                  {`${data?.deepth}m` || '-'}
                </div>
                <div className={styles['address-class']} title={address}>
                  位置：{address || '-'}
                </div>
              </div>
            </div>
            <div className={styles['bottom-class']}>
              <div title={data?.projectName} className={styles['bottom-item-class']}>
                项目名称：{data?.projectName || '-'}
              </div>
              <div title={data?.stationNo} className={styles['bottom-item-class']}>
                桩号：{data?.stationNo || '-'},{data?.direction}
              </div>
              <div title={data?.facilityName} className={styles['bottom-item-class']}>
                道路名称：{data?.facilityName || '-'}
              </div>
              <div title={data?.laneName} className={styles['bottom-item-class']}>
                车道：{data?.laneName || '-'}
              </div>
            </div>
          </div>
        </Draggable>
      ) : null}
    </>
  );
};

export default DraggerModal;
