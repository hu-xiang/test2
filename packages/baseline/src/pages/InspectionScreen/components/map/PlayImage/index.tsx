import React, { useState, useEffect, useImperativeHandle } from 'react';
import styles from './styles.less';

type Iprops = {
  imageTotal: number;
  currentImage: number;
  customClass?: string;
  onRef: any;
  isBlack?: boolean;
  isClickDisease?: boolean;
  switchDisease: (current: number) => void;
  cyclePlay: (current: boolean) => void;
};
const PlayImage: React.FC<Iprops> = (props) => {
  const { imageTotal, isClickDisease = false, isBlack = true } = props;
  const [isPlayer, setIsPlayer] = useState<boolean>(true);
  const [isFirstPage, setIsFirstPage] = useState<boolean>(true);
  const [isEndPage, setIsEndPage] = useState<boolean>(false);
  const handlePlay = () => {
    props?.cyclePlay(!isPlayer);
    setIsPlayer(!isPlayer);
  };
  const handleFlag = (val: boolean) => {
    setIsPlayer(val);
  };
  useEffect(() => {
    if (imageTotal === 1) {
      setIsPlayer(false);
    } else if (isClickDisease) {
      setIsPlayer(false);
    } else {
      setIsPlayer(true);
    }
  }, [imageTotal]);
  const resetPlayButton = () => {
    setIsPlayer(false);
    props?.cyclePlay(false);
    props.switchDisease(0);
  };
  useImperativeHandle(props.onRef, () => ({
    // 暴露给父组件的方法
    resetPlayButton,
    handleFlag,
  }));
  const handlePrevPic = () => {
    if (props?.imageTotal > 0) {
      if (props.currentImage > 0) {
        if (props.currentImage - 1 === 0) {
          setIsFirstPage(true);
        }
        props.switchDisease(props.currentImage - 1);
      }
    } else {
      setIsFirstPage(true);
    }
  };
  const handleNextPic = () => {
    if (props?.imageTotal > 0) {
      if (props.currentImage + 1 === props?.imageTotal) {
        if (props?.imageTotal !== 1) {
          setIsFirstPage(false);
        } else {
          setIsFirstPage(true);
        }
        setIsEndPage(true);
      }
      props.switchDisease(props.currentImage + 1);
    } else {
      setIsEndPage(true);
    }
  };

  useEffect(() => {
    if (props?.imageTotal > 0) {
      if (props?.currentImage + 1 === props?.imageTotal) {
        setIsEndPage(true);
      } else {
        setIsEndPage(false);
      }
      if (props?.currentImage === 0) {
        setIsFirstPage(true);
      } else {
        setIsFirstPage(false);
      }
    } else {
      setIsFirstPage(true);
      setIsEndPage(true);
    }
  }, [props.currentImage, props?.imageTotal]);

  return (
    <div
      className={`${styles.playImageBox} ${props.customClass} ${
        isBlack ? '' : `${styles['white-bg']}`
      }`}
    >
      <div className={styles.leftPlayer}>
        <span
          className={`${styles.playLeftImg} ${styles.playImg} ${isFirstPage ? 'greySvg' : null}`}
          onClick={!isFirstPage ? handlePrevPic : () => {}}
        ></span>
        <span
          className={`${isPlayer ? `${styles.playMiddleImg}` : `${styles.stopMiddleImg}`} ${
            isClickDisease ? `${styles['disable-play-class']}` : null
          }`}
          onClick={isClickDisease ? () => {} : handlePlay}
        ></span>
        <span
          className={`${styles.playRightImg} ${styles.playImg}  ${isEndPage ? 'greySvg' : null}`}
          onClick={!isEndPage ? handleNextPic : () => {}}
        ></span>
      </div>
      <div className={styles.totalDis}>
        {props?.currentImage + 1}/{props?.imageTotal}
      </div>
    </div>
  );
};

export default PlayImage;
