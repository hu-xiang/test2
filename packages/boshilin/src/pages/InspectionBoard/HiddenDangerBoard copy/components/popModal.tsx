import React, { useState } from 'react';
import styles from '../styles.less';
import Draggable from 'react-draggable';

type Iprops = {
  modalShow: boolean;
  detailDatas: string[] | undefined;
  onModalCancel: () => void;
};

const PopModal: React.FC<Iprops> = (props) => {
  const { modalShow, detailDatas } = props;
  const [disabled, setDisabled] = useState<any>(true);

  return (
    <>
      {modalShow ? (
        <Draggable disabled={disabled} bounds="parent">
          <div
            className={styles['pop-modal-content']}
            onMouseOver={(evt: any) => {
              if (disabled) {
                setDisabled(false);
              }
              evt?.stopPropagation();
            }}
            onMouseOut={(e: any) => {
              setDisabled(true);
              e?.stopPropagation();
            }}
          >
            <div className={styles['pop-modal-title']}>
              <span className={styles['title-img']}></span>
              <span>隐患信息</span>
            </div>
            <div className={styles['pop-content-box']}>
              {detailDatas?.map((it: any) => {
                return (
                  <React.Fragment key={it}>
                    <div title={it} className={styles['pop-item-class']}>
                      {it}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </Draggable>
      ) : null}
    </>
  );
};

export default PopModal;
