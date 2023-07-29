import { Input, Modal, message } from 'antd';
import React, { useState, useCallback, useRef } from 'react';
import styles from '../styles.less';
import { delimg } from '../service';
import { SearchOutlined } from '@ant-design/icons';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import debounce from 'lodash/debounce';
import CommonTable from '../../../components/CommonTable';
import { ReactComponent as LeftImg } from '../../../assets/img/leftAndRight/leftImg.svg';
import { ReactComponent as RightImg } from '../../../assets/img/leftAndRight/rightImg.svg';
import { useModel } from 'umi';

type Iprops = {
  pkid: any;
  visibdetails: boolean;
  onCancel: Function;
  rowname: string;
  rowinfo: any;
};
export type Member = {
  diseaseNameZh: string;
};

const { confirm } = Modal;

const Details: React.FC<Iprops> = (props) => {
  const [keyword, setKeyword] = useState<any>('');

  const ChildRef = useRef<any>();
  const { arrowVisible, arrowDisabled, setToLeftOrRight } = useModel<any>('dataReport'); // arrowVisible, arrowDisabled,setToLeftOrRight与业务相关

  const updatakeyword = () => {
    ChildRef.current.onSet();
  };

  const removeFile = async (fileinfo: any) => {
    const imageUrl = fileinfo.imgurl;
    const { id } = fileinfo;
    const formData = new FormData();
    formData.append('id', id);
    formData.append('imageUrl', imageUrl);
    const hide = message.loading({
      content: '正在删除',
      key: '正在删除',
    });
    try {
      const res = await delimg(formData);
      hide();
      if (res.status === 0) {
        message.success({
          content: '删除成功',
          key: '删除成功',
        });
        updatakeyword();
      }
      return true;
    } catch (error) {
      hide();
      message.error({
        content: '删除失败!',
        key: '删除失败!',
      });
      return false;
    }
  };

  const columns3: any = [
    { title: '编号', key: 'id', width: 60, type: 'sort' },
    {
      title: '缩略图',
      key: 'imageUrl',
      width: 101,
      type: 'previewImage',
    },
    {
      title: '图片名称',
      dataIndex: 'imgName',
      key: 'imgName',
      width: 129,
      ellipsis: true,
    },
    {
      title: '桩号',
      key: 'imgNo',
      width: 153,
      render: (text: any, recode: any) => {
        let routeMode: any;
        if (recode?.routeMode === 0) {
          routeMode = '上行';
        }
        if (recode?.routeMode === 1) {
          routeMode = '下行';
        }
        return `${recode.imgNo ? recode.imgNo : '-'}${
          recode.imgNo && routeMode ? ` ${routeMode}` : ''
        }`;
      },
      ellipsis: true,
    },
    {
      title: '经度',
      dataIndex: 'longitude',
      key: 'longitude',
      width: 135,
      ellipsis: true,
    },
    {
      title: '纬度',
      dataIndex: 'latitude',
      key: 'latitude',
      width: 135,
      ellipsis: true,
    },
    {
      title: '采集时间',
      dataIndex: 'collectTime',
      key: 'collectTime',
      width: 153,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      type: 'operate',
      operateList: [
        {
          access: [],
          more: false,
          name: '删除',
          type: 'del',
        },
      ],
    },
  ];

  const debouceSearch = useCallback(
    debounce((e: any) => {
      setKeyword(e.target.value.trim());
    }, 500),
    [],
  );

  const handleDel = (row: any) => {
    confirm({
      title: '你确定要删除这张图片吗？',
      icon: <ExclamationCircleOutlined />,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      async onOk() {
        removeFile(row);
      },
      onCancel() {},
    });
  };
  const rowMethods = async (row: any, type: string) => {
    switch (type) {
      case 'del':
        handleDel(row);
        break;
      default:
        break;
    }
  };
  const handleToDirection = (value: string) => {
    setToLeftOrRight(value);
  };
  return (
    <>
      <Modal
        title={`图片库-${props.rowname}`}
        open={props.visibdetails}
        onCancel={() => props.onCancel()}
        footer={false}
        className="picLibModal"
        width={window.innerWidth * 0.65}
      >
        {props.rowinfo?.fkFacilitiesName || props.rowinfo?.startPoint || props.rowinfo?.endPoint ? (
          <div className={styles.toptxtbox}>
            <div className={styles.toptext}>
              <span className={styles.textbox1}>道路名称 : </span>
              <Input
                value={props.rowinfo.fkFacilitiesName}
                className={styles.picaddinp}
                disabled
                style={{ color: '#000' }}
              />
            </div>
            <div className={styles.toptext}>
              <span className={styles.textbox1}>起点 : </span>
              <Input
                value={props.rowinfo?.startPoint}
                className={styles.picaddinp}
                disabled
                style={{ color: '#000', width: '83%' }}
              />
            </div>
            <div className={styles.toptext}>
              <span className={styles.textbox1}>终点 : </span>
              <Input
                value={props.rowinfo?.endPoint}
                className={styles.picaddinp}
                disabled
                style={{ color: '#000', width: '83%' }}
              />
            </div>
          </div>
        ) : null}

        <div className={styles.delailselbox}>
          <span>
            <Input
              placeholder="输入图片名称的关键字"
              allowClear
              onChange={(e) => debouceSearch(e)}
              style={{
                width: 357,
                height: 40,
                borderRadius: 4,
                float: 'right',
              }}
              suffix={<SearchOutlined className="input-search" />}
              className="usersel"
            />
          </span>
        </div>
        <div>
          <CommonTable
            scroll={{ x: '100%', y: 'calc(80vh - 400px)' }}
            columns={columns3}
            onRef={ChildRef}
            isScroll={true}
            isRefresh={true}
            searchKey={{ libraryId: props.pkid, keyword }}
            rowMethods={rowMethods}
            getSelectedRows={() => {}}
            url="/traffic/img/list"
            rowSelection={false}
            pageName={'picture-manage-detail'}
            diseImgPreview={true}
            arrowShow={false}
          />
        </div>
      </Modal>

      {arrowVisible ? (
        <>
          <LeftImg
            className={`${styles.arrLeftIcon} ${styles.toggleIcon}
          ${arrowDisabled === 'left' ? styles.arrIconDisabled : ''}
          `}
            onClick={arrowDisabled === 'left' ? undefined : () => handleToDirection('left')}
          />

          <RightImg
            onClick={arrowDisabled === 'right' ? undefined : () => handleToDirection('right')}
            className={`${styles.arrRightIcon} ${styles.toggleIcon} ${
              arrowDisabled === 'right' ? styles.arrIconDisabled : ''
            }`}
          />
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default Details;
