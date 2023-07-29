import React, { useState, useEffect, useImperativeHandle } from 'react';
import { Image } from 'antd';
import styles from './styles.less';
import { getSCeneMapDatas } from '../../service';
import Draggable from 'react-draggable';
import TabButtonContainer from './ulButtonIndex';
// import DrawCanvas from '../PreviewModal';

interface lsType {
  imgName: string;
  id: string;
  imgUrl: string;
  imgList: any[];
  sceneRemark: string; // 场景标注
  itemRemark: string; // 点位标注
  name: string;
  description: string[];
}
interface Iprops {
  isModalVisible?: boolean;
  clickInfo: any;
  address: string;
  onRef: any;
  hideModal: () => void;
  style: { x: number; y: number };
}

const ls: lsType = {
  imgName: '',
  id: '',
  imgUrl: '',
  imgList: [],
  sceneRemark: '',
  itemRemark: '',
  name: '',
  description: [],
};

const DraggerModal: React.FC<Iprops> = (props: Iprops) => {
  const { clickInfo } = props;
  const [data, setData] = useState<any>(ls);
  const [distressIndex, setDistressIndex] = useState(0);
  const [isFirstPage, setIsFirstPage] = useState<boolean>(true);
  const [isEndPage, setIsEndPage] = useState<boolean>(false);
  // const [buttonVal, setButtonVal] = useState<number>(2);
  const [disabled, setDisabled] = useState<any>(true);
  const [visibleFlag, setVisibleFlag] = useState<any>(false);
  const [imgFlag, setImgFlag] = useState<any>(false);
  const [imgUrl, setImgUrl] = useState<any>();
  // const [descList, setDescList] = useState<string[]>();

  useEffect(() => {
    setVisibleFlag(props.isModalVisible);
  }, [props.isModalVisible]);

  useEffect(() => {
    // console.log('clickInfo',clickInfo )
    setDistressIndex(0);
    async function fetchData() {
      const res = await getSCeneMapDatas({
        keySceneId: clickInfo?.sceneId,
        proFacId: clickInfo?.facId,
      });
      let recData: any[] = [];
      if (res?.data && res?.data[0]?.trackList?.length > 0) {
        recData = res?.data[0]?.trackList.map((it: any, ind: number) => {
          if (ind === 0) {
            if (it?.imgList?.length > 1) {
              const itemPos = it?.imgList.find((itm: any) => itm.imgPosition === 2);
              // console.log('初始图片',itemPos?.imgBaseUrl || itemPos?.imgUrl);
              setImgUrl(itemPos?.imgBaseUrl || itemPos?.imgUrl);
            }
          }
          const newDecList: string[] = [];
          if (it?.questionList?.length) {
            it?.questionList.forEach((itr: any, index: number) => {
              newDecList.push(`${index + 1}、${itr?.fkCheckName} ${itr?.resultName}`);
            });
            // item.description=newDecList;
          }
          return {
            ...it,
            name: res?.data[0]?.name,
            description: newDecList,
            itemRemark: it?.remark,
            sceneRemark: res?.data[0]?.remark,
          };
        });
      }
      setData(recData);
      // const newDecList: string[] = [];
      // res?.data?.questionList.forEach((it: any, index: number) => {
      //   newDecList.push(`${index + 1}、${it?.fkCheckName} ${it?.resultName}`);
      // });
      // setDescList(newDecList);
      // if (res?.data?.imgList?.length > 1) {
      //   const itemPos = res?.data?.imgList.find((itm: any) => itm.imgPosition === 2);
      //   // console.log('初始图片',res?.data?.imgList[1]?.imgUrl);
      //   setImgUrl(itemPos?.imgBaseUrl || itemPos?.imgUrl);
      // }
    }
    if (Object.keys(clickInfo)?.length && clickInfo?.facId && clickInfo?.sceneId) {
      fetchData();
    }
  }, [clickInfo]);
  useEffect(() => {
    if (data?.length > 0) {
      if (distressIndex + 1 === data?.length) {
        setIsEndPage(true);
      } else {
        setIsEndPage(false);
      }
      if (distressIndex === 0) {
        setIsFirstPage(true);
      } else {
        setIsFirstPage(false);
      }
      if (data[distressIndex]?.imgList?.length > 1) {
        const itemPos = data[distressIndex]?.imgList.find((itm: any) => itm.imgPosition === 2);
        setImgUrl(itemPos?.imgBaseUrl || itemPos?.imgUrl);
      }
    } else {
      setIsFirstPage(true);
      setIsEndPage(true);
    }
  }, [distressIndex, data]);
  const handleButton = (val: number) => {
    // setButtonVal(val);
    const itemPos = data?.[distressIndex]?.imgList.find((itm: any) => itm.imgPosition === val);
    setImgUrl(itemPos?.imgBaseUrl || itemPos?.imgUrl);
  };
  const restImg = () => {
    const item = data?.[distressIndex]?.imgList.find((itm: any) => itm.imgPosition === 2);
    // console.log('mmmmm',data?.imgList[1]?.imgBaseUrl || data?.imgList[1]?.imgUrl);
    setImgUrl(item?.imgBaseUrl || item?.imgUrl);
  };
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
  const handlePrevPic = () => {
    if (data?.length > 0) {
      if (distressIndex > 0) {
        if (distressIndex - 1 === 0) {
          setIsFirstPage(true);
        }
        setDistressIndex(distressIndex - 1);
      }
    } else {
      setIsFirstPage(true);
    }
  };
  const handleNextPic = () => {
    if (data?.length > 0) {
      if (distressIndex + 1 === data?.length) {
        if (data?.length !== 1) {
          setIsFirstPage(false);
        } else {
          setIsFirstPage(true);
        }
        setIsEndPage(true);
      }
      setDistressIndex(distressIndex + 1);
    } else {
      setIsEndPage(true);
    }
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
                <div>隐患信息</div>
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
                    width={290}
                    height={217}
                    src={imgUrl || 'error'}
                    rootClassName={styles['image-root-class']}
                    preview={{
                      visible: imgFlag,
                      src: imgUrl || 'error',
                      onVisibleChange: (value) => {
                        setImgFlag(value);
                        if (!value) {
                          restImg();
                        }
                      },
                    }}
                    placeholder={true}
                  />
                  <div
                    className={`${styles.leftButtonImg} ${isFirstPage ? 'greySvg' : null}`}
                    onClick={!isFirstPage ? handlePrevPic : () => {}}
                  ></div>
                  <div
                    className={`${styles.rightButtonImg} ${isEndPage ? 'greySvg' : null}`}
                    onClick={!isEndPage ? handleNextPic : () => {}}
                  ></div>
                  {/* {imgUrl ? (
                    <DrawCanvas
                      btnActIndex={buttonVal}
                      imgList={data?.imgList}
                      setImgUrl={previewImg}
                      // data={data}
                    />
                  ) : (
                    ''
                  )} */}
                </div>
              </div>
              <div className={`map-pop-content ${styles.diseaseRightInfo}`}>
                <div className={styles['scene-info-class']}>
                  <span className={styles['scene-info-name']}>
                    {data?.length && data[distressIndex]?.name}
                  </span>
                </div>
                <div className={styles['scene-info-panel']}>
                  <div className={styles.diseaseTypeClass}>
                    <span className={styles['title-class']}>隐患</span>
                    {data?.[distressIndex]?.description &&
                    data?.[distressIndex]?.description?.length > 0 ? (
                      data?.[distressIndex]?.description?.map((it: any) => {
                        return (
                          <React.Fragment key={it}>
                            <div title={it} className={styles['bottom-item-class']}>
                              {it}
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
                      {data?.[distressIndex]?.sceneRemark || '无'}
                    </span>
                  </div>
                  <div className={styles['remark-info']}>
                    <span className={styles['title-class']}>特殊情况说明</span>
                    <span className={styles['remark-content-class']}>
                      {data?.[distressIndex]?.itemRemark || '无'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Draggable>
      ) : null}
      {imgFlag ? (
        <div className={`${styles['button-container']}`}>
          <TabButtonContainer handleButton={handleButton} />
        </div>
      ) : null}
    </>
  );
};

export default DraggerModal;
