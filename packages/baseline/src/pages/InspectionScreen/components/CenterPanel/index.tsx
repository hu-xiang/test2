import React, { useState, useEffect } from 'react';
import styles from './styles.less';
import { getFacStaticesData } from '../../service';

type Iprop = {
  todayInfo: any;
};

const CenterPanel: React.FC<Iprop> = (props: any) => {
  const [disCardList, setDisCardList] = useState<any>([
    { key: '1', name: '新增病害数(个)', num: 0 },
    { key: '2', name: '巡检公里数(公里)', num: 0 },
    { key: '3', name: '设备在线率(%)', num: 100 },
  ]);
  const [disCardTypeList, setDisCardTypeList] = useState<any>([
    { key: '1', name: '管养总里程', num: '0', unit: '公里', img: '../../../assets/licheng.svg' },
    { key: '2', name: '管养桥梁', num: '0', unit: '座', img: '../../../assets/qiaoliang.svg' },
    { key: '3', name: '管养隧道', num: '0', unit: '座', img: '../../../assets/suidao.svg' },
  ]);

  useEffect(() => {
    const newlist = disCardList.map((it: any, index: any) => {
      /* eslint-disable */
      if (index === 0) {
        return { ...it, num: props.todayInfo?.diseaseCount };
      } else if (index === 1) {
        return { ...it, num: props.todayInfo?.todayMile };
      } else if (index === 2) {
        return { ...it, num: props.todayInfo?.online };
      } else {
        return { ...it };
      }
    });
    setDisCardList(newlist);
  }, [props.todayInfo]);

  // 管养总览数据
  const getFacStaticesDatas = async () => {
    let res: any = {};
    try {
      res = await getFacStaticesData();
      if (res.status === 0) {
        const newlist = disCardTypeList.map((it: any) => {
          if (Object.keys(res.data).includes(it.name)) {
            if (it?.name === '管养总里程') {
              const xx = res.data[it.name] && parseFloat(res.data[it.name]);
              if (xx > 100000) {
                return { ...it, unit: '万公里', num: (res.data[it.name] / 10000).toFixed(2) };
              }
            }
            return { ...it, num: res.data[it.name] };
          }
          return it;
        });
        setDisCardTypeList(newlist);
      }
    } catch (error) {
      // message.error('获取libraryId失败');
    }
  };

  useEffect(() => {
    getFacStaticesDatas();
  }, []);

  return (
    <>
      <div className={`${styles.centerCard}`}>
        <div className={styles.centerCardTitle}>
          <span className={styles.titleImg}></span>
          <span className={styles.titleTxt}>今日概况</span>
          <div className={styles.highlight}></div>
        </div>
        <div className={styles.rowPanelClass}>
          {disCardList.map((it: any) => (
            <React.Fragment key={it?.name}>
              <div className={styles.rowItemClass}>
                <div className={styles.centerItemClass}>
                  <span className={styles.centerItemNameClass}>{it?.name}</span>
                  <span
                    className={`${styles.centerItemNumClass} ${
                      it?.key === '1' ? `${styles.FirstNumClass}` : null
                    }`}
                  >
                    {it?.num || 0}
                  </span>
                </div>
                {it?.key !== '3' ? <div className={styles.dividerClass}></div> : null}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className={`${styles.centerCard} ${styles.centerRightCard}`}>
        <div className={styles.centerCardTitle}>
          <span className={styles.titleImg}></span>
          <span className={styles.titleTxt}>管养总览</span>
          <div className={styles.highlight}></div>
        </div>
        <div className={styles.rowPanelClass}>
          {disCardTypeList.map((it: any) => (
            <React.Fragment key={it?.name}>
              <div className={styles.rowItemClass}>
                <div className={`${styles.centerItemClass} ${styles.itemClass}`}>
                  <span className={styles.centerItemNameClass}>
                    {it?.name}
                    {it?.key === '1' ? `(${it.unit})` : `(${it.unit})`}
                  </span>
                  <span className={styles.centerItemNumClass}>{it?.num}</span>
                </div>
                {it?.key !== '3' ? <div className={styles.dividerClass}></div> : null}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};

export default CenterPanel;
