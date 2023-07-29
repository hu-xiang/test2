import React, { useState, useEffect, useImperativeHandle } from 'react';
import { Image } from 'antd';
import styles from './styles.less';
import Draggable from 'react-draggable';
// import DrawCanvas from '../PreviewModal';
interface Iprops {
  isModalVisible?: boolean;
  markerInfo: any;
  mapMarkerData: any;
  onRef: any;
  hideModal: () => void;
  style: { x: number; y: number };
}

const DraggerModal: React.FC<Iprops> = (props: Iprops) => {
  const { markerInfo, isModalVisible, mapMarkerData } = props;
  const [disabled, setDisabled] = useState<any>(true);
  const [visibleFlag, setVisibleFlag] = useState<any>(false);
  const [imgFlagLeft, setImgFlagLeft] = useState<any>(false);
  const [imgFlagCenter, setImgFlagCenter] = useState<any>(false);
  const [imgFlagRight, setImgFlagRight] = useState<any>(false);
  const [imgUrlLeft, setImgUrlLeft] = useState<any>();
  const [imgUrlCenter, setImgUrlCenter] = useState<any>();
  const [imgUrlRight, setImgUrlRight] = useState<any>();
  const [questionList, setQuestionList] = useState<any>([]);

  useEffect(() => {
    setVisibleFlag(isModalVisible);
  }, [isModalVisible]);

  useEffect(() => {
    if (markerInfo?.imgList) {
      markerInfo?.imgList?.forEach((item: any) => {
        if (item?.imgPosition === 0) {
          setImgUrlLeft(item?.imgBaseUrl || item?.imgUrl);
        } else if (item?.imgPosition === 2) {
          setImgUrlCenter(item?.imgBaseUrl || item?.imgUrl);
        } else if (item?.imgPosition === 1) {
          setImgUrlRight(item?.imgBaseUrl || item?.imgUrl);
        }
      });
    }
  }, [markerInfo]);

  useEffect(() => {
    let list: any = [];
    if (mapMarkerData?.trackList?.length) {
      mapMarkerData?.trackList?.forEach((item: any) => {
        if (item?.questionList && item?.questionList?.length) {
          list = [...list, ...item?.questionList];
        }
      });
      setQuestionList(list);
    }
  }, [mapMarkerData?.id]);

  const restImg = () => {};
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
        <Draggable disabled={disabled} bounds="parent" defaultPosition={{ x: 50, y: -160 }}>
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
                <div>隐患信息</div>
              </div>
              <div className={`${styles.rightContent} ${styles.rightButton}`}>
                <span onClick={clickClose} className={styles.closeModalInfoClass}></span>
              </div>
            </div>
            <div className={`${styles.diseaseRowCommon} ${styles.dragRowInfo}`}>
              <div className={`map-pop-content ${styles.diseaseRightInfo}`}>
                <div className={styles['scene-info-class']}>
                  <span className={styles['scene-info-name']}>{mapMarkerData?.name}</span>
                </div>
                <div className={styles['scene-info-panel']}>
                  <div className={styles.diseaseTypeClass}>
                    <span className={styles['title-class']}>隐患</span>
                    {questionList?.length > 0 ? (
                      questionList?.map((it: any, index: number) => {
                        return (
                          <React.Fragment key={it?.id}>
                            <div
                              title={`${index + 1}、${it?.fkCheckName} ${it?.resultName}`}
                              className={styles['bottom-item-class']}
                            >
                              {index + 1}、{it?.fkCheckName} {it?.resultName}
                            </div>
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <div>暂无描述信息</div>
                    )}
                  </div>
                  <div className={styles['remark-info']}>
                    <span className={styles['title-class']}>场景备注</span>
                    <span className={styles['remark-content-class']}>
                      {mapMarkerData?.remark || '无'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Draggable>
      ) : null}

      {visibleFlag && (
        <div className={`${styles['modal-bottom-img']}`}>
          <div className={`${styles['modal-bottom-img-left']}`}>
            <Image
              width={'100%'}
              height={224}
              src={imgUrlLeft || 'error'}
              preview={{
                visible: imgFlagLeft,
                src: imgUrlLeft || 'error',
                onVisibleChange: (value) => {
                  setImgFlagLeft(value);
                  if (!value) {
                    restImg();
                  }
                },
              }}
              placeholder={true}
            />
            <div className={`${styles['modal-bottom-img-icon']}`}>左</div>
          </div>
          <div className={`${styles['modal-bottom-img-center']}`}>
            <Image
              width={'100%'}
              height={224}
              src={imgUrlCenter || 'error'}
              preview={{
                visible: imgFlagCenter,
                src: imgUrlCenter || 'error',
                onVisibleChange: (value) => {
                  setImgFlagCenter(value);
                  if (!value) {
                    restImg();
                  }
                },
              }}
              placeholder={true}
            />
            <div className={`${styles['modal-bottom-img-icon']}`}>中</div>
          </div>
          <div className={`${styles['modal-bottom-img-right']}`}>
            <Image
              width={'100%'}
              height={224}
              src={imgUrlRight || 'error'}
              preview={{
                visible: imgFlagRight,
                src: imgUrlRight || 'error',
                onVisibleChange: (value) => {
                  setImgFlagRight(value);
                  if (!value) {
                    restImg();
                  }
                },
              }}
              placeholder={true}
            />
            <div className={`${styles['modal-bottom-img-icon']}`}>右</div>
          </div>
        </div>
      )}
    </>
  );
};

export default DraggerModal;
