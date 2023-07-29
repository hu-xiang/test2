import React from 'react';
import { Radio, Row, Col, Table, Slider, Modal, Button } from 'antd';
import styles from '../styles.less';
import Lunbo from './lunbo';
import {
  StepBackwardOutlined,
  PlayCircleOutlined,
  StepForwardOutlined,
  PauseOutlined,
} from '@ant-design/icons';
import { useState, useRef } from 'react';
import Linenum from './Linenum';
import img1 from '../../../assets/img/road1/img1/1.jpg';
import { history } from 'umi';

const Context: React.FC = () => {
  const columns = [
    {
      title: '编号',
      dataIndex: 'num',
      key: 'num',
    },
    {
      title: 'ID名称',
      dataIndex: 'idname',
      key: 'idname',
      render: (text: any) => <a>{text}</a>,
    },
    {
      title: '病害类别',
      dataIndex: 'kind',
      key: 'kind',
    },
    {
      title: '长度面积',
      dataIndex: 'area',
      key: 'area',
    },
  ];

  const data = [
    {
      key: '1',
      num: '1',
      idname: '2.jpj',
      kind: '龟裂',
      area: '0.024279^2',
    },
    {
      key: '2',
      num: '2',
      idname: '6.jpg',
      kind: '条状修补，块状修补，纵向裂缝',
      area: '0.258652m',
    },
  ];

  const iconStyle = {
    color: '#8897AB',
    fontSize: '18px',
  };

  const [peg, setPeg] = useState(0);
  const [testimg, setTestimg] = useState(false);
  const [testimg2, setTestimg2] = useState(false);
  const [testimg3, setTestimg3] = useState(false);
  const [pegval, setPegval] = useState(0);
  const Locatline = useRef<any>(null);
  const roadimgs = useRef<any>(null);
  const [flag, setFlag] = useState<any>(false);
  const run = () => {
    setFlag(true);
  };
  const stopRun = () => {
    setFlag(false);
  };
  const huachange = (_: any) => {
    const pegs = _ * 100;
    setPeg(pegs);
  };

  const changePeg = (value: any) => {
    setPegval(value);
  };

  const onShowTestimg = () => {
    setTestimg(true);
  };
  const onShowTestimg2 = () => {
    setTestimg2(true);
  };
  const onShowTestimg3 = () => {
    setTestimg3(true);
  };

  const Locatlinechange = (e: any) => {
    const scrolltop =
      document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset;
    Locatline.current.style.top = `${e.clientY + scrolltop - 244}px`;
  };

  const handleCancel = () => {
    setTestimg(false);
  };
  const handleCancel2 = () => {
    setTestimg2(false);
  };
  const handleCancel3 = () => {
    setTestimg3(false);
  };

  const changeprebingtu = () => {
    setFlag(false);
    const bingtuTop: any[] = [];
    const roadimgsbox = roadimgs.current.childNodes[0].childNodes;
    for (let i = 0; i < roadimgsbox.length; i += 1) {
      const roadimgslie = roadimgsbox[i].childNodes;
      for (let j = 0; j < roadimgslie.length; j += 1) {
        if (roadimgslie[j].title) {
          bingtuTop.push(roadimgslie[j]);
        }
      }
    }
    bingtuTop.map((item) => {
      const num1 = -roadimgs.current.childNodes[0].offsetTop + 200;

      if (item.offsetTop < num1) {
        const stance: any =
          (item.offsetTop - 200) / (roadimgs.current.childNodes[0].clientHeight - 600);
        const pegstance = stance.toFixed(2) * 100;
        setPegval(pegstance);
      }
      return false;
    });
  };

  const changepnextbingtu = () => {
    setFlag(false);
    const bingtuTop: any[] = [];
    const roadimgsbox = roadimgs.current.childNodes[0].childNodes;
    for (let i = 0; i < roadimgsbox.length; i += 1) {
      const roadimgslie = roadimgsbox[i].childNodes;
      for (let j = 0; j < roadimgslie.length; j += 1) {
        if (roadimgslie[j].title) {
          bingtuTop.push(roadimgslie[j]);
        }
      }
    }

    const num2 = 250 - roadimgs.current.childNodes[0].offsetTop;
    let bol = false;

    bingtuTop.map((item) => {
      if (item.offsetTop >= num2 && !bol) {
        const stance: any =
          (item.offsetTop - 200) / (roadimgs.current.childNodes[0].clientHeight - 600);
        const pegstance = stance.toFixed(2) * 100;
        setPegval(pegstance);
        bol = true;
      }
      return false;
    });
  };

  const analysisPath = '/analysis';
  const toanalysispath = () => {
    history.push(analysisPath);
  };

  return (
    <div className={`${styles.bgwhite} ${styles.border}`}>
      {/* 头部文字 */}
      <div className={styles.topflex}>
        <span className={styles.textsite}>道路路面实景展示</span>
        <Radio.Group className={styles.btnsite}>
          <Radio.Button className={styles.btnright} value="large" onClick={() => onShowTestimg()}>
            检测图
          </Radio.Button>
          <Modal
            className="testtubox1"
            title="检测图"
            open={testimg}
            onCancel={handleCancel}
            footer={null}
          >
            <img src={img1} style={{ width: '600px', height: '600px' }} alt="" />
            <Button type="primary" onClick={() => toanalysispath()}>
              人工修订
            </Button>
          </Modal>

          <Radio.Button
            className={styles.btnright}
            onClick={() => onShowTestimg2()}
            value="default"
          >
            原图
          </Radio.Button>
          <Modal
            className="testtubox2"
            title="原图"
            open={testimg2}
            onCancel={handleCancel2}
            footer={null}
          >
            <img src={img1} style={{ width: '600px', height: '600px' }} alt="" />
            <Button type="primary" onClick={() => toanalysispath()}>
              人工修订
            </Button>
          </Modal>
          <Radio.Button onClick={() => onShowTestimg3()} value="small">
            修复图
          </Radio.Button>
          <Modal
            title="原图与修复图对比"
            open={testimg3}
            onCancel={handleCancel3}
            footer={null}
            className="rengongtu"
          >
            <div className={styles.rengongtu1}>
              <img
                src={img1}
                style={{ width: '600px', height: '600px', display: 'inline-block' }}
                alt=""
              />
              <Button type="dashed" className={styles.yuantubtn}>
                原图
              </Button>
            </div>
            <div className={styles.rengongtu2}>
              <img
                src={img1}
                style={{ width: '600px', height: '600px', display: 'inline-block' }}
                alt=""
              />
              <Button type="text" className={styles.xiubtn}>
                修复图
              </Button>
            </div>
          </Modal>
        </Radio.Group>
      </div>
      {/* 中间滚动图 */}
      <div>
        <div className={styles.contop}>
          <span className={styles.text1}>桩号</span> :
          <span className={styles.text2}> K260+200</span>
        </div>
        <Row className={styles.huaimgbox}>
          {/* 竖线 */}
          <Col className={styles.roadlinebox}>
            <div className={styles.roadline} />
            <Linenum flag={flag} pegval={pegval} />
          </Col>
          {/* 图片部分 */}
          <Col className={styles.roadbox}>
            {/* 车道文字 */}
            <div className={styles.roadtext}>
              <div className={styles.roadtext1}>1车道</div>
              <div className={styles.roadtext2}>2车道</div>
            </div>
            {/* 车道图片 */}
            <div className={styles.roadimg} onClick={Locatlinechange}>
              {/* 定位线 */}
              <div className={styles.locatline} ref={Locatline} />
              {/* 轮播图片 */}
              <div className={styles.lunbobox} ref={roadimgs}>
                <Lunbo
                  flag={flag}
                  onRun={(_: any) => huachange(_)}
                  pegval={pegval}
                  // onend={() => endrun()}
                />
              </div>
            </div>
          </Col>
        </Row>
        {/* 表格 */}
        <Table columns={columns} dataSource={data} pagination={false} className={styles.table} />
        <div className={styles.sliderbox}>
          {/* 滑动条 */}
          <Slider
            defaultValue={30}
            disabled={false}
            className={styles.slider}
            value={peg}
            onChange={(value) => changePeg(value)}
          />
          {/* 操作 */}
          <div className={styles.done}>
            <span className={styles.slidertext} onClick={() => changeprebingtu()}>
              上一个病害
            </span>
            <div>
              <StepBackwardOutlined className={styles.icon} style={iconStyle} />
              {flag ? (
                <PauseOutlined
                  className={styles.icon}
                  style={iconStyle}
                  onClick={() => stopRun()}
                />
              ) : (
                <PlayCircleOutlined
                  className={styles.icon}
                  style={iconStyle}
                  onClick={() => run()}
                />
              )}

              <StepForwardOutlined className={styles.icon} style={iconStyle} />
            </div>
            <span className={styles.slidertext} onClick={() => changepnextbingtu()}>
              下一个病害
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Context;
