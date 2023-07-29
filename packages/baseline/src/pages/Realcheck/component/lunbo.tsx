import React, { useRef, useEffect, useState } from 'react';
import styles from '../styles.less';
import pic1 from './picture/pic1';
import pic2 from './picture/pic2';
import pic3 from './picture/pic3';
import pic4 from './picture/pic4';

type Iprops = {
  pegval: any;
  flag: boolean;
  onRun: Function;
};

const Lunbo: React.FC<Iprops> = (props) => {
  const Roadimg1 = () => {
    const arr1: any[] = [];
    Object.values(pic1).forEach((item, i) => {
      if (i === 2) {
        arr1.push(<img className={styles.img} src={item} title={'true'} key={i} alt="" />);
      } else if (i === 5) {
        arr1.push(<img className={styles.img} src={item} title={'true'} key={i} alt="" />);
      } else if (i === 8) {
        arr1.push(<img className={styles.img} src={item} title={'true'} key={i} alt="" />);
      } else {
        arr1.push(<img className={styles.img} src={item} key={i} alt="" />);
      }
    });
    return arr1;
  };

  const Roadimg2 = () => {
    const arr2: any[] = [];
    Object.values(pic2).forEach((item, i) => {
      arr2.push(<img className={styles.img} src={item} key={i} alt="" />);
    });
    return arr2;
  };

  const Roadimg3 = () => {
    const arr3: any[] = [];
    Object.values(pic3).forEach((item, i) => {
      arr3.push(<img className={styles.img} src={item} key={i} alt="" />);
    });
    return arr3;
  };

  const Roadimg4 = () => {
    const arr4: any[] = [];
    Object.values(pic4).forEach((item, i) => {
      arr4.push(<img className={styles.img} src={item} key={i} alt="" />);
    });
    return arr4;
  };

  const swper = useRef<any>(null);
  const [count, setCount] = useState<any>(0);
  const [huaval, setHuaval] = useState(0);

  const run = () => {
    clearInterval(window.timer);
    // 开启定时器
    window.timer = setInterval(() => {
      swper.current.style.top = `${swper.current.style.top.replace('px', '') - 5}px`;
      const top = swper.current.style.top.replace('px', '');
      const height = swper.current.clientHeight - 600;
      const peg = (-top / height).toFixed(2);
      setCount(peg);
      props.onRun(count);

      if (swper.current.offsetTop <= -height) {
        clearInterval(window.timer);
        swper.current.style.top = `${-height}px`;
      }
    }, 100);
  };

  if (!props.flag && swper.current) {
    clearInterval(window.timer);
  }

  if (props.flag) {
    run();
  }

  useEffect(() => {
    const height = swper.current.clientHeight - 600;
    const pegvals = props.pegval / 100;
    swper.current.style.top = `${-pegvals * height}px`;
    setHuaval(pegvals);
    setCount(pegvals);
    props.onRun(count);
  }, [props.pegval, huaval]);

  useEffect(() => {
    return () => {
      clearInterval(window.timer);
    };
  }, []);

  return (
    <div className={styles.swper} ref={swper}>
      <div className={styles.imgbox}>{Roadimg1()}</div>
      <div className={styles.imgbox}>{Roadimg2()}</div>
      <div className={styles.imgbox}>{Roadimg3()}</div>
      <div className={styles.imgbox}>{Roadimg4()}</div>
    </div>
  );
};

export default Lunbo;
