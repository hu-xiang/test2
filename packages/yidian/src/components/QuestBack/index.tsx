import queimg from '../../assets/img/quest/bg-question.svg';
import styles from './styles.less';
import { useState } from 'react';
import { addFeedback } from '../../services/ant-design-pro/api';
import { Rate, Modal, Input, Select, Button, message } from 'antd';
import heartimg from '../../assets/img/quest/Vector.svg';
import { useEffect } from 'react';

const { TextArea } = Input;
interface Iprops {
  info: any;
}
const { Option } = Select;

const QuestBack: React.FC<Iprops> = (props: any) => {
  const [queshow, setQueshow] = useState(false);
  const [rateval, setRateval] = useState<any>(0);
  const [textval, setTextval] = useState('');
  const [inpval, setInpval] = useState('');
  const [flag, setFlag] = useState(true);
  const [second, setSecond] = useState(10);
  const [interval, set_interval] = useState<any>(null);

  const sty: any = {
    left: 49,
  };
  const changeRate = (val: any) => {
    setRateval(val);
  };
  const changetext = (e: any) => {
    setTextval(e.target.value?.trim());
  };
  const changeinp = (val: any) => {
    setInpval(val);
  };
  const subquest = async () => {
    if (textval === '' && inpval === '') {
      message.error({
        content: '请完善信息！',
        key: '请完善信息！',
      });
      return false;
    }
    try {
      const res: any = await addFeedback(textval, rateval, inpval);
      if (res.status === 0) {
        message.success({
          content: '发布成功',
          key: '发布成功',
        });
        setTextval('');
        setInpval('');
        setRateval(0);
        setFlag(false);
        let num = second;
        set_interval(
          setInterval(() => {
            num -= 1;
            setSecond(num);
          }, 1000),
        );
      } else {
        // message.error({
        //   content: res.message,
        //   key: res.message,
        // });
      }
      return true;
    } catch (error) {
      message.error({
        content: '发布失败!',
        key: '发布失败!',
      });
      return false;
    }
  };
  useEffect(() => {
    if (second === 0) {
      setSecond(10);
      clearInterval(interval);
      setQueshow(false);
      setFlag(true);
    }
  }, [second]);
  const proceed = () => {
    setSecond(10);
    clearInterval(interval);
    setFlag(true);
  };
  const queCancel = () => {
    clearInterval(interval);
    setQueshow(false);
    setSecond(10);
    setQueshow(false);
    setFlag(true);
  };

  return (
    <div className={styles.quebox}>
      <span className={styles.quetextbox} onClick={() => setQueshow(true)}>
        <img src={queimg} alt="" style={{ height: 20, marginRight: 8 }} />
        {!props.info?.collapsed && <span>问题反馈</span>}
      </span>
      <Modal
        title="问题反馈"
        destroyOnClose
        open={queshow}
        onCancel={queCancel}
        mask={false}
        // maskClosable={false}
        className={`quesMod ${styles.quesModbox}`}
        style={props.info?.collapsed && sty}
        okText="发布"
        onOk={subquest}
        footer={
          flag ? (
            <Button type="primary" onClick={subquest}>
              发布
            </Button>
          ) : null
        }
      >
        {flag ? (
          <div>
            <div className={styles.quetetbox}>
              <span style={{ marginRight: 10 }}>评分鼓励</span>
              <span>
                <Rate
                  // allowHalf={true}
                  // value={rateval}
                  onChange={changeRate}
                />
              </span>
            </div>
            <div className={styles.quetetbox}>
              <div style={{ marginBottom: 10 }}>问题类型</div>
              <Select
                // value={inpval}
                style={{ height: 40, width: '100%' }}
                placeholder="请选择问题类型"
                onChange={changeinp}
              >
                <Option value="系统缺陷 ">系统缺陷</Option>
                <Option value="改进建议">改进建议</Option>
              </Select>
              {/* <Input onChange={changeinp} style={{ height: 40 }} /> */}
            </div>
            <div className={styles.quetetbox}>
              <div style={{ marginBottom: 10 }}>问题描述</div>
              <TextArea
                placeholder="请留下您宝贵的意见"
                style={{ height: 229 }}
                className={styles.txtresize}
                onChange={changetext}
              ></TextArea>
            </div>
          </div>
        ) : (
          <div className={styles.endquebox}>
            <div style={{ marginTop: 42 }}>
              <img src={heartimg} alt="" />
            </div>
            <div className={styles.endtextbox}>感谢您的反馈，我们会尽快处理</div>
            <div className={styles.endtextbox}>
              退出倒计时 <span className={styles.spanbox1}>{second}</span> 秒
            </div>
            <div className={styles.endtextbox}>
              <span className={styles.spanbox2} onClick={proceed}>
                继续反馈
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuestBack;
