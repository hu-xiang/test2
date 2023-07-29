import MapLeft from './components/mapLeft';
import { useModel } from 'umi';
import TopHeadSearch from './components/HeadSearch';
import MapRight from './components/mapRight';
import RightBoard from './components/rightBoard';
import React, { useEffect, useState } from 'react';
import styles from './styles.less';

export default (): React.ReactElement => {
  const [isMapShow, setIsMapShow] = useState<boolean>(false);
  const { fkId, setFkId } = useModel<any>('trend');

  useEffect(() => {
    if (fkId) {
      setIsMapShow(true);
    } else {
      setIsMapShow(false);
    }
  }, [fkId]);
  useEffect(() => {
    return () => {
      setFkId('');
    };
  }, []);
  return (
    <div className={styles['trend-box']}>
      <div className={styles['top-box']}>
        <TopHeadSearch />
      </div>
      <div className={styles['main-box']}>
        <div className={styles['main-box-container']}>
          <div className={styles['left-main-box']}>
            <MapLeft />
          </div>
          <div className={styles['right-main-box']}>
            {isMapShow ? <MapRight /> : <RightBoard />}
          </div>
        </div>
      </div>
    </div>
  );
};
