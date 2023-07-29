/*
 * @Author: wf
 * @Date: 2022-12-12 16:27:46
 * @Last Modified by: wf
 * @Last Modified time: 2023-03-01 16:37:02
 * @Description:接收参数形如{
    left:{
    facilitiesName: {label:'设施名称',value:'测试'},
    },
    right:{
      roadType: {label:'道路等级',value:'1'},
    }
 */

import React, { useState, Fragment, useEffect, memo } from 'react';
import EmptyPage from 'baseline/src/components/EmptyPage';
// import EllipsisTooltip from 'baseline/src/components/EllipsisTooltip';
import styles from './styles.less';
// import { roadType, roadLevelType } from '../../data';

type Iprop = {
  dataInfos: any;
};
// const { Option } = Select;
const DetailRoad: React.FC<Iprop> = memo((props: any) => {
  const { dataInfos } = props;
  const [projInfo, setProjInfo] = useState<any>({});

  useEffect(() => {
    // console.log('projInfo', projInfo);
    setProjInfo(dataInfos);
  }, [dataInfos]);

  return (
    <div className={styles['card-facility-info']}>
      <div className={styles['facility-info-content']}>
        {Object.keys(projInfo)?.length ? (
          Object.keys(projInfo)?.map((itr: any) => {
            return (
              <Fragment key={itr}>
                <div
                  className={`${
                    itr === 'left'
                      ? styles['pro-column-card-left']
                      : styles['pro-column-card-right']
                  }`}
                >
                  {Object.keys(projInfo[itr])?.length &&
                    Object.keys(projInfo[itr])?.map((it: any) => {
                      return (
                        <Fragment key={projInfo[itr][it]?.label}>
                          <div
                            className={`${styles['pro-item-key']}`}
                            title={projInfo[itr][it]?.value || 0}
                          >
                            <span>{projInfo[itr][it]?.label}：</span>
                            <span>{projInfo[itr][it]?.value || 0}</span>
                            {projInfo[itr][it]?.key === 6 &&
                              (projInfo[itr][it]?.value || projInfo[itr][it]?.value === 0) && (
                                <span> m</span>
                              )}
                          </div>
                        </Fragment>
                      );
                    })}
                </div>
              </Fragment>
            );
          })
        ) : (
          <EmptyPage content={'暂无数据'} customEmptyChartClass={styles['info-empty']} />
        )}
      </div>
    </div>
  );
});
export default DetailRoad;
