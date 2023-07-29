import React, { useRef, useEffect } from 'react';
import styles from '../styles.less';

type Iprops = {
  flag: any;
  pegval: any;
};

const Linenum: React.FC<Iprops> = (props) => {
  const lineNum = () => {
    const linenum: any[] = [];
    for (let i = 0; i <= 10; i += 1) {
      linenum.push(
        <div key={i} className={styles.lineNum}>
          {i * 2}
        </div>,
      );
    }
    return linenum;
  };

  const linenums = useRef<any>(null);

  const run = () => {
    clearInterval(window.timer2);

    // 开启定时器
    window.timer2 = setInterval(() => {
      linenums.current.style.top = `${linenums.current.style.top.replace('px', '') - 5}px`;
      const height = linenums.current.clientHeight - 600;
      if (linenums.current.offsetTop <= -height + 30) {
        clearInterval(window.timer2);
        linenums.current.style.top = `${-height + 28}px`;
      }
    }, 100);
  };

  if (!props.flag && linenums.current) {
    clearInterval(window.timer2);
  }

  if (props.flag) {
    run();
  }

  useEffect(() => {
    const height = linenums.current.clientHeight - 600;
    const pegvals = props.pegval / 100;
    linenums.current.style.top = `${-pegvals * height + 28}px`;
  }, [props.pegval]);

  useEffect(() => {
    return () => {
      clearInterval(window.timer2);
    };
  }, []);

  return (
    <div ref={linenums} className={styles.roadlinenum}>
      {lineNum()}
    </div>
  );
};

export default Linenum;
