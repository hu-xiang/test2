import { Row, Col } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './styles.less';
import EllipsisTooltip from '../EllipsisTooltip';

type Iprops = {
  fullScreenFlag: boolean;
  diseaNums: any[];
  iconArr: any[];
  rateArr: any[];
  programName?: string;
};

const Legend: React.FC<Iprops> = (props: any) => {
  const [diseaArrs, setDiseaArrs] = useState<any>([]);
  const [iconArrs, setIconArrs] = useState<any>([]);
  const [rateArrs, setRateArrs] = useState<any>([]);
  useEffect(() => {
    if (props?.diseaNums?.length > 0) {
      setDiseaArrs(props?.diseaNums);
    }
  }, [props?.diseaNums]);
  useEffect(() => {
    if (props?.iconArr?.length > 0) {
      setIconArrs(props?.iconArr);
    }
  }, [props?.iconArr]);
  useEffect(() => {
    if (props?.rateArr?.length > 0) {
      setRateArrs(props?.rateArr);
    }
  }, [props?.rateArr]);
  return (
    <div className={`${styles.numColor}`}>
      <Row gutter={[10, 20]} className={styles.rowLengend}>
        <Col span={rateArrs.length ? 8 : 12} className={styles.colLengend}>
          <div className={`${styles['space-height-left']} ${styles.hasBorder}`}>
            {iconArrs.map((it: any) => (
              <React.Fragment key={it?.value}>
                <div className={styles['num-img-height']}>
                  <EllipsisTooltip title={it?.name}>
                    <img
                      className={styles['img-margin']}
                      src={it?.src}
                      width={it?.width}
                      height={it?.height}
                    />{' '}
                    <span className={styles['img-txt']}>{it?.name}</span>
                  </EllipsisTooltip>
                </div>
              </React.Fragment>
            ))}
          </div>
        </Col>
        <Col
          span={rateArrs.length ? 8 : 12}
          className={styles.colLengend}
          style={rateArrs.length ? {} : { borderRight: 'none !important' }}
        >
          <div
            className={`${styles['space-height-middle']} ${
              rateArrs.length ? styles.hasBorder : styles.noBorder
            }`}
          >
            {diseaArrs.map((it: any) => (
              <React.Fragment key={it?.value}>
                <div className={styles.numNum}>
                  <EllipsisTooltip title={it?.name}>
                    <span className={styles[`${it?.class}`]} /> {it?.name}
                  </EllipsisTooltip>
                </div>
              </React.Fragment>
            ))}
          </div>
        </Col>
        {rateArrs.length ? (
          <Col span={8} className={styles.colLengend}>
            <div className={styles['space-height']}>
              {rateArrs.map((it: any) => (
                <React.Fragment key={it?.value}>
                  <div className={styles.numLineHeight}>
                    <EllipsisTooltip title={it?.name}>
                      <span className={styles[`${it?.class}`]} /> {it?.name}
                    </EllipsisTooltip>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </Col>
        ) : (
          ''
        )}
      </Row>
    </div>
  );
};

export default Legend;
