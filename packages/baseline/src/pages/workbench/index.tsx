import React, { useEffect, useState } from 'react';
import styles from './styles.less';
import { Row, Col, Card, message } from 'antd';
import { getbenchimginfo, getline1info, getline2info } from './service';
import numlogo1 from '../../assets/img/workBenchIcon/imagesNums.svg';
import numlogo2 from '../../assets/img/workBenchIcon/taskNums.svg';
import numlogo3 from '../../assets/img/workBenchIcon/checkNums.svg';
import numlogo4 from '../../assets/img/workBenchIcon/reCheckNums.svg';
import UploadImgLine from './component/uploadImgLine';

export default (): React.ReactElement => {
  const [imginfos, setImginfos] = useState<any>([]);
  const [line1infos, setLine1infos] = useState<any>([]);
  const [line2infos, setLine2infos] = useState<any>([]);

  let timer1: any;
  let timer2: any;
  const imginfo = () => {
    const fn1 = async () => {
      try {
        const res = await getbenchimginfo();
        if (res.status === 0) {
          setImginfos(res.data);
        } else {
          // message.error({
          //   content: res.message,
          //   key: res.message,
          // });
        }
        return true;
      } catch (error) {
        message.error({
          content: '查询失败!',
          key: '查询失败!',
        });
        return false;
      }
    };
    fn1();
    timer1 = setInterval(() => {
      fn1();
    }, 60000);
    const fn2 = async () => {
      try {
        const line1Res = await getline1info();
        if (line1Res.status === 0) {
          setLine1infos(line1Res.data);
        }
        const line2Res = await getline2info();
        if (line2Res.status === 0) {
          setLine2infos(line2Res.data);
        }
        if (line1Res.status !== 0 || line2Res.status !== 0) {
          message.error({
            content: line1Res.message,
            key: line1Res.message,
          });
        }
        return true;
      } catch (error) {
        message.error({
          content: '查询失败!',
          key: '查询失败!',
        });
        return false;
      }
    };
    fn2();
    timer2 = setInterval(() => {
      fn2();
    }, 3600000);
  };

  const toThousands = (num: any) => {
    let result = '';
    let counter = 0;
    const nums = (num || 0).toString();
    for (let i = nums.length - 1; i >= 0; i -= 1) {
      counter += 1;
      result = nums.charAt(i) + result;
      if (!(counter % 3) && i !== 0) {
        result = `,${result}`;
      }
    }
    return result;
  };

  useEffect(() => {
    imginfo();
    return () => {
      clearInterval(timer1);
      clearInterval(timer2);
    };
  }, []);
  return (
    <div id={styles.container}>
      <Row gutter={[16, 24]} className={styles.imglookbox}>
        <Col className={styles.colCss} span={6}>
          <Card title="上传病害图片数量" bordered={false}>
            <div className={styles.uplimg}>
              <span className={styles.imgnum1}>{toThousands(imginfos?.imagesNums)}</span>
              <span className={styles.imgnum2}>张</span>
            </div>
            <div className={styles.rightpic}>
              <img src={numlogo1} alt="" />
            </div>
          </Card>
        </Col>
        <Col className={styles.colCss} span={6}>
          <Card title="AI检测图片数量" bordered={false}>
            <div className={styles.uplimg}>
              <span className={styles.imgnum1}>{toThousands(imginfos?.checkNums)}</span>
              <span className={styles.imgnum2}>张</span>
            </div>
            <div className={styles.rightpic}>
              <img src={numlogo2} alt="" />
            </div>
          </Card>
        </Col>
        <Col className={styles.colCss} span={6}>
          <Card title="病害检出数量" bordered={false}>
            <div className={styles.uplimg}>
              <span className={styles.imgnum1}>{toThousands(imginfos?.checkOutNums)}</span>
              <span className={styles.imgnum2}>项</span>
            </div>
            <div className={styles.rightpic}>
              <img src={numlogo3} alt="" />
            </div>
          </Card>
        </Col>
        {/* initialState.currentUser.username === 'admin' */}
        <Col className={styles.colCss} span={6}>
          <Card className={styles.colCss} title="人工复核次数" bordered={false}>
            <div className={styles.uplimg}>
              <span className={styles.imgnum1}>{toThousands(imginfos?.reviewNums)}</span>
              <span className={styles.imgnum2}>次</span>
            </div>
            <div className={styles.rightpic}>
              <img src={numlogo4} alt="" />
            </div>
          </Card>
        </Col>
      </Row>
      <div className={styles.botbox}>
        <div className={styles.botcard1}>
          <div className={styles.topTitle}>今日上传图片变化趋势 </div>
          <div style={{ margin: '20px 0 0 10px', color: '#666' }}>
            单位：张
            <UploadImgLine info={line1infos} />
          </div>
        </div>
        <div className={styles.botcard2}>
          <div className={styles.topTitle}>今日AI检测图片数量变化趋势 </div>
          <div style={{ margin: '20px 0 0 10px', color: '#666' }}>
            单位：张
            <UploadImgLine info={line2infos} />
          </div>
        </div>
      </div>
    </div>
  );
};
