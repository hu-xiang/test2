import React, { useState, useEffect, useRef } from 'react';
import { Button, Input } from 'antd';
import { isExist, commonDel } from '../../../../utils/commonMethod';
import CommonTable from '../../../../components/CommonTable';
import DicDetailModal from './DicDetailModal';
import { useHistory } from 'umi';
import styles from '../styles.less';
import { ReactComponent as ListBack } from '../../../../assets/img/backDisease/back.svg';
import { isEqual } from 'lodash';

const requestList = [
  { url: '/admin/dict/list', method: 'get' },
  { url: '/admin/dict/deleteDict', method: 'DELETE' },
];
const defalutSearchKey = {
  dictName: undefined,
  dictCode: undefined,
};
export default (): React.ReactElement => {
  const ChildRef = useRef<any>();
  const history = useHistory();
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [dictName, setDictName] = useState<any>();
  const [dictCode, setDictCode] = useState<any>();
  const [isShow, setIsShow] = useState<boolean>(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editInfo, setEditInfo] = useState<any>();
  useEffect(() => {}, []);

  const getSelectedRows = (rows: any) => {
    setSelectedRows(rows);
  };

  const setkeywords = () => {
    ChildRef.current.onSet();
  };

  const del = async (text: any, isBatch: boolean) => {
    const formData = new FormData();
    if (isBatch) {
      formData.append('idList', selectedRows);
    } else {
      formData.append('id', text.id);
    }

    const res: any = await commonDel(
      <>
        <p>字典将删除，是否继续？</p>
        <p style={{ color: 'red', fontSize: '12px', position: 'absolute', left: '20px' }}>
          注意：字典一旦删除，可能会影响到系统整体功能，请谨慎操作!
        </p>
        <br />
      </>,
      isBatch
        ? {
            ...requestList[1],
            params: formData,
          }
        : {
            ...requestList[1],
            params: formData,
          },
    );
    if (res) setkeywords();
  };

  // 点击查询
  const onSearch = () => {
    setkeywords();
  };

  useEffect(() => {
    const listener = (event: any) => {
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        event.preventDefault();
        onSearch();
      }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [dictName, dictCode]);

  // 清除
  const onSelNull = () => {
    setDictName(undefined);
    setDictCode(undefined);
    const searchKey = {
      dictName,
      dictCode,
    };
    if (!isEqual(defalutSearchKey, searchKey)) {
      ChildRef?.current?.onSet('1');
    }
  };

  const rowMethods = async (row: any, type: string) => {
    switch (type) {
      case 'detail':
        /* eslint  no-case-declarations: 0 */
        let parentCodes: any = sessionStorage?.getItem('dict-parentCodes');
        if (parentCodes && typeof parentCodes === 'string') {
          parentCodes = JSON.parse(parentCodes);
        } else {
          parentCodes = [];
        }
        parentCodes?.push(row?.parentCode);
        sessionStorage?.setItem('dict-parentCodes', JSON.stringify(parentCodes));
        sessionStorage?.setItem('dict-parentCode', row?.dictCode);
        setkeywords();
        break;
      case 'edit':
        setEditInfo(row);
        setIsEdit(true);
        setIsShow(true);
        break;
      case 'del':
        del(row, false);
        break;
      default:
        break;
    }
  };

  const prePage = async () => {
    let parentCodes: any = sessionStorage?.getItem('dict-parentCodes');
    if (parentCodes && typeof parentCodes === 'string') {
      parentCodes = JSON.parse(parentCodes);
    } else {
      parentCodes = [];
    }
    if (parentCodes?.length) {
      sessionStorage?.setItem('dict-parentCode', parentCodes[parentCodes?.length - 1]);
      parentCodes?.pop();
      sessionStorage?.setItem('dict-parentCodes', JSON.stringify(parentCodes));
      setkeywords();
    } else {
      sessionStorage?.removeItem('dict-parentCodes');
      sessionStorage?.removeItem('dict-parentCode');
      history?.go(-1);
    }
  };

  const columns: any = [
    { title: '字典编号', key: 'id', width: 80, type: 'sort' },
    { title: '字典名称', key: 'dictName', width: 200 },
    { title: '字典类型', key: 'dictCode', width: 200 },
    { title: '字典键值', key: 'dictKey', width: 120 },
    { title: '字典排序', key: 'sort', width: 100 },
    { title: '备注', key: 'remark', width: 200 },
    { title: '所属租户', key: 'tenantName', width: 200 },
    { title: '创建日期', key: 'crtTime', width: 160 },
    {
      title: '操作',
      key: 'option',
      width: 140,
      type: 'operate',
      operateList: [
        {
          access: ['dataDictionary/index:view'],
          more: false,
          name: '详情',
          type: 'detail',
        },
        {
          access: ['dataDictionary/index:btn_edit'],
          more: false,
          name: '编辑',
          type: 'edit',
        },
        {
          access: ['dataDictionary/index:btn_del'],
          more: false,
          name: '删除',
          type: 'del',
        },
      ],
    },
  ];

  return (
    <div id={styles.dictionarySystem} className="page-list-common page-normal">
      <div className={styles.dicBack} onClick={prePage}>
        <ListBack />
        <div className={styles.backText}>返回上一级</div>
      </div>
      <div className={` ${styles.topSelect} ${styles.dictDetail} head-one-box`}>
        <div className={`${styles.rowClass}`}>
          <span className={styles.inpBox}>
            <div className={styles.rowLabel}>字典名称</div>
            <Input
              className={styles.comClass}
              autoComplete="off"
              maxLength={60}
              placeholder="请输入字典名称"
              value={dictName}
              onChange={(e: any) => setDictName(e.target.value)}
            />
          </span>
          <span className={styles.inpBox}>
            <div className={styles.rowLabel}>字典类型</div>
            <Input
              className={styles.comClass}
              autoComplete="off"
              maxLength={60}
              placeholder="请输入字典类型"
              value={dictCode}
              onChange={(e: any) => setDictCode(e.target.value)}
            />
          </span>

          <div className={styles.selBtnBox}>
            <Button
              type="primary"
              onClick={() => {
                onSearch();
              }}
            >
              查询
            </Button>
            <Button
              onClick={() => {
                onSelNull();
              }}
            >
              清除
            </Button>
          </div>
        </div>
      </div>
      <div className={'row-button'}>
        {isExist(['dataDictionary/index:btn_add']) && (
          <Button
            type="primary"
            onClick={() => {
              setIsEdit(false);
              setIsShow(true);
            }}
          >
            创建
          </Button>
        )}
        {/* {isExist(['dataDictionary/index:btn_export']) && (
          <Button onClick={() => {}}>批量导出</Button>
        )}
        {isExist(['dataDictionary/index:btn_batchDel']) && (
          <Button disabled={!selectedRows?.length} onClick={() => del({}, true)}>
            批量删除
          </Button>
        )} */}
      </div>
      <div
        className={`page-table-one-back-box ${
          isExist([
            'dataDictionary/index:btn_add',
            'dataDictionary/index:btn_export',
            'dataDictionary/index:btn_batchDel',
          ])
            ? null
            : `page-table-one-back-box-nobutton`
        }`}
      >
        <CommonTable
          scroll={{ x: 950, y: 'calc(100vh - 305px)' }}
          columns={columns}
          searchKey={{
            dictName,
            dictCode,
            parentCode: sessionStorage?.getItem('dict-parentCode'),
            tenantId: sessionStorage?.getItem('dict-tenantId'),
          }}
          onRef={ChildRef}
          rowMethods={rowMethods}
          url="/admin/dict/list"
          getSelectedRows={getSelectedRows}
        />
      </div>
      {isShow ? (
        <DicDetailModal
          isModalshow={isShow}
          editInfo={editInfo}
          isEdit={isEdit}
          parentCode={sessionStorage?.getItem('dict-parentCode')}
          tenantId={sessionStorage?.getItem('dict-tenantId')}
          onCancel={() => setIsShow(false)}
          onOk={() => {
            setIsShow(false);
            setkeywords();
          }}
        />
      ) : null}
    </div>
  );
};
