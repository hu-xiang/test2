import styles from '../styles.less';
import { Image } from 'antd';
import React, { useState, useEffect, useRef } from 'react';
import PopModal from './popModal';
import MapLocation from 'baseline/src/components/MarkMapPro';
// import DrawCanvas from './PreviewModal';
import TabButtonContainer from './DraggerModal/ulButtonIndex';
import PauseButton from '../../../../assets/img/InspectionBoard/hiddenDanger/pauseButton.svg';
import { useModel } from 'umi';

type Iprops = {
  // modalShow: boolean;
  imgInd: number;
  imgInfo: any;
  // firstImgUrl: any;
  handleView: (val: string) => void;
};

const ViewIndex: React.FC<Iprops> = (props) => {
  const { imgInfo, handleView, imgInd } = props;
  const { resetColorFlag, setResetColorFlag } = useModel<any>('facility');
  // const [indexVal, setIndexVal] = useState<number>(0);
  // const [buttonVal, setButtonVal] = useState<number>(2);
  const [imgUrl, setImgUrl] = useState<any>();

  const [declist, setDeclist] = useState<any[]>([]);
  const [dangerFlag, setDangerFlag] = useState<boolean>(false);
  const [playFlag, setPlayFlag] = useState<boolean>(true);
  const clickRef = useRef<any>(true);
  useEffect(() => {
    if (imgInfo?.questionList?.length > 0) {
      setDangerFlag(true);
      const newDecList: string[] = [];
      imgInfo?.questionList.forEach((it: any, index: number) => {
        newDecList.push(`${index + 1}、${it?.fkCheckName} ${it?.resultName}`);
      });
      setDeclist(newDecList);
    }
    const item = imgInfo?.imgList.find((itm: any) => itm.imgPosition === 2);
    setImgUrl(item?.imgBaseUrl || item?.imgUrl);
  }, [imgInfo?.id]);

  useEffect(() => {
    if (dangerFlag) {
      // 弹出隐患说明
      handleView('pause');
      setPlayFlag(false);
      clickRef.current = false;
    }
  }, [dangerFlag]);
  const handleButton = (val: number) => {
    // console.log('ButtonVal',val,imgInfo?.imgList[val - 1]?.imgUrl);
    // setButtonVal(val);
    const itemPos = imgInfo?.imgList.find((itm: any) => itm.imgPosition === val);
    setImgUrl(itemPos?.imgBaseUrl || itemPos?.imgUrl);
  };
  const handleQuit = () => {
    handleView('quit');
  };
  const handleVal = (flag: boolean) => {
    setPlayFlag(flag);
    if (flag) {
      setDangerFlag(false);
      handleView('restart');
    } else {
      handleView('pause');
    }
  };
  const handleToggle = () => {
    // console.log('handletoggle',playFlag);
    const nowFlag = !playFlag;
    handleVal(nowFlag);
  };
  const handleKeyDownToggle = () => {
    clickRef.current = !clickRef.current;
    const flag = clickRef.current;
    handleVal(flag);
  };
  useEffect(() => {
    if (resetColorFlag) {
      handleToggle();
      setResetColorFlag(false);
      clickRef.current = false;
    }
  }, [resetColorFlag]);
  useEffect(() => {
    const listener = (event: any) => {
      if (event.code === 'Enter' || event.code === 'Space') {
        handleKeyDownToggle();
        event.preventDefault();
      }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, []);
  // useImperativeHandle(props.onRef, () => ({
  //   // 暴露给父组件的方法
  //   handleToggle,
  // }));

  return (
    <>
      <div className={styles['view-box']}>
        <Image
          className="view-img"
          src={imgUrl || 'error'}
          rootClassName={styles['image-view-class']}
          preview={false}
          fallback="data:image/png;base64,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"
          onClick={handleToggle}
          placeholder={false}
        />
        {/* <img
          className="view-img"
          src={imgUrl || 'error'}
          onClick={handleToggle}
        /> */}
        {/* {imgInfo?.imgList[buttonVal - 1]?.imgUrl ? (
          <DrawCanvas
            btnActIndex={buttonVal}
            imgList={imgInfo?.imgList}
            setImgUrl={(url: any) => {
              setImgUrl(url||'error');
            }}
            // data={data}
          />
        ) : (
          ''
        )} */}
        {!playFlag ? (
          <div className={`${styles['button-view-container']}`}>
            <TabButtonContainer handleButton={handleButton} customClassName={styles['top-mag']} />
          </div>
        ) : null}
        <div className={`${styles['map-box-container']}`}>
          <MapLocation imgIndex={imgInd} />
        </div>
        <div className={`${styles['button-right-class']}`} onClick={handleQuit}>
          <span>退出浏览模式</span>
        </div>
        {!playFlag ? (
          <div className={styles['pause-button-class']} onClick={handleToggle}>
            <img src={PauseButton}></img>
          </div>
        ) : null}
        {dangerFlag ? (
          <PopModal
            modalShow={dangerFlag}
            detailDatas={declist}
            onModalCancel={() => {
              setDangerFlag(false);
            }}
          />
        ) : null}
      </div>
    </>
  );
};

export default ViewIndex;
