import { Row, Col } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './styles.less';
import EllipsisTooltip from 'baseline/src/components/EllipsisTooltip';

type Iprops = {
  fullScreenFlag: boolean;
  diseaNums: any[];
  iconArr: any[];
  rateArr: any[];
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
        <Col span={8} className={styles.colLengend}>
          <div>
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
        <Col span={8} className={styles.colLengend}>
          <div>
            {iconArrs.map((it: any) => (
              <React.Fragment key={it?.value}>
                <div className={styles.numNum}>
                  <EllipsisTooltip title={it?.name}>
                    <img src={it?.src} width={it?.width} height={it?.height} /> {it?.name}
                  </EllipsisTooltip>
                </div>
              </React.Fragment>
            ))}
          </div>
        </Col>
        <Col span={8} className={styles.colLengend}>
          <div>
            {rateArrs.map((it: any) => (
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
      </Row>
    </div>
  );
};

export default Legend;
