import { Input, Modal, Row, Col, Tree, Table, message, Tooltip } from 'antd';
import React, { useState, useEffect, Fragment, useRef } from 'react';
import styles from '../styles.less';
import {
  getseledtree,
  getbtnlist,
  getbtnseledlist,
  putbtnid,
  delbtnid,
  savepower,
  getTenantBtnlist,
} from '../service';
import { getAdminRole, getTenantRole } from '../../../../services/commonApi';
import { useHistory } from 'umi';
import { SearchOutlined } from '@ant-design/icons';

type Iprops = {
  ecutroleid: any;
  showcut: boolean;
  onCancel: Function;
};

const CutRole: React.FC<Iprops> = (props) => {
  const [roletree, setRoletree] = useState<any>([]);
  const [roleseledidlist, setRoleseledidlist] = useState([]);
  const [submitTreeSelected, setSubmitTreeSelected] = useState([]);
  const [btnlist, setBtnlist] = useState([]);
  const [btnseledlist, setBtnseledlist] = useState<any>([]);
  const [treeid, setTreeid] = useState<any>(0);
  const [dataLists, setDataLists] = useState([]);
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [seledid, setSeledid] = useState<any>([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [childNum, setChildNum] = useState({}); // 保存树的子节点的个数

  const ref = useRef<any>();
  const history = useHistory();

  const gettree = async () => {
    const isTenant = localStorage.getItem('isTenant');
    let res: any;
    if (isTenant === '2') {
      res = await getAdminRole();
    } else {
      res = await getTenantRole();
    }
    const dataList: any = [];
    const tempChildNum = {};
    const generateList = (data: any) => {
      for (let i = 0; i < data.length; i += 1) {
        const node = data[i];
        const titles = node.title;
        const { id } = node;
        dataList.push({ key: id, title: titles });
        if (node.children.length) {
          tempChildNum[id] = node.children.length;
          generateList(node.children);
        }
      }
      setDataLists(dataList);
    };
    if (res.length !== 0) {
      generateList(res);
    }
    setChildNum(tempChildNum);
    setRoletree(res);
  };

  const getseledlist = async () => {
    const res = await getseledtree(props.ecutroleid);
    const list: any = [];
    const tempIdObj = {}; // 存放计算出的父元素孩子的个数
    res.data.map((item: any) => {
      if (!tempIdObj[item.parentId]) {
        tempIdObj[item.parentId] = 1;
      } else {
        tempIdObj[item.parentId] += 1;
      }
      list.push(item.id.toString());
      // console.log('getseledlist',list)
      return list;
    });
    // 默认提交数据,防止直接提交报错
    setSubmitTreeSelected(list.concat());
    // 判断是否所有的子节点都选中，未全选时清掉父元素
    Object.keys(tempIdObj).forEach((key) => {
      if (childNum[key] && tempIdObj[key] !== childNum[key]) {
        list.splice(list.indexOf(key.toString()), 1);
      }
    });
    setTimeout(() => {
      setRoleseledidlist(list);
    }, 0);
  };

  useEffect(() => {
    gettree();
  }, []);
  useEffect(() => {
    if (roletree.length) {
      getseledlist();
    }
  }, [roletree]);

  const onSelect = async (selectedKeys: any) => {
    if (selectedKeys?.length > 0) {
      const [id] = selectedKeys;
      setTreeid(selectedKeys);
      const params = {
        menuId: id,
      };
      const isTenant = ['0', '1'].includes(localStorage.getItem('isTenant') || '');
      let res: any = '';
      if (!isTenant) {
        res = await getbtnlist(params);
      } else {
        res = await getTenantBtnlist(params);
      }
      setBtnlist(res.data.rows);
      setTimeout(async () => {
        const selres = await getbtnseledlist(props.ecutroleid);
        setBtnseledlist(selres.data);
      }, 0);
    }
  };

  const onCheck = (checkedKeys: any, e: { halfCheckedKeys?: any }) => {
    setRoleseledidlist(checkedKeys);
    setSubmitTreeSelected(checkedKeys.concat(e.halfCheckedKeys));
  };

  const rowkey = (record: any) => {
    return record.id;
  };

  const column = [
    {
      title: '资源编码',
      dataIndex: 'code',
      key: 'code',
      width: 200,
      ellipsis: true,
    },
    {
      title: '资源类型',
      dataIndex: 'type',
      key: 'type',
      width: 70,
    },
    {
      title: '资源名称',
      dataIndex: 'name',
      key: 'name',
      width: 100,
      render: (text: any) => {
        return <Tooltip title={text}>{text}</Tooltip>;
      },
      ellipsis: true,
    },
    {
      title: '资源地址',
      dataIndex: 'uri',
      key: 'uri',
      width: 110,
      ellipsis: true,
    },
    {
      title: '资源请求类型',
      dataIndex: 'method',
      key: 'method',
      width: 100,
    },
  ];

  const onSelectChange = async (selectedid: any, flag: any) => {
    const [id] = treeid;
    const code = {
      menuId: id,
      elementId: selectedid.id,
    };
    if (!flag) {
      await delbtnid(props.ecutroleid, code);
    } else {
      await putbtnid(props.ecutroleid, code);
    }
  };
  // const clickRow = (record: any) => {
  //   // setSelectedRow(record);
  //   // setSelectedRowKey([record.id]); // 单选
  //   const arr = btnseledlist.filter((i: any) => i !== record.id);
  //   if (btnseledlist.includes(record.id)){
  //     onSelectChange(record,false)
  //     setBtnseledlist(arr);
  //   }else{
  //     onSelectChange(record,true)
  //     setBtnseledlist([...arr, record.id]);
  //   }
  // };

  const changeidlist = (selectedid: any) => {
    const list: any = [...selectedid];
    Array.from(new Set(list));
    setBtnseledlist(list);
  };

  const saverole = async () => {
    const code = {
      menuTrees: submitTreeSelected,
    };
    if (!submitTreeSelected?.length) {
      message.error({
        content: '请选择资源',
        key: '请选择资源',
      });
      return false;
    }
    try {
      const res = await savepower(props.ecutroleid, code);
      if (res.status === 0) {
        message.success({
          content: '保存成功',
          key: '保存成功',
        });
        history.go(0);
        props.onCancel();
      } else {
        // message.error({
        //   content: res.message,
        //   key: res.message,
        // });
      }
      return true;
    } catch (error) {
      message.error({
        content: '保存失败!',
        key: '保存失败!',
      });
      return false;
    }
  };

  const selall = async (flag: any, selectedRows: any, changeRows: any) => {
    if (!flag) {
      changeRows.map(async (item: any) => {
        const [id] = treeid;
        const code = {
          menuId: id,
          elementId: item.id,
        };
        await delbtnid(props.ecutroleid, code);
        return false;
      });
    } else {
      changeRows.map(async (item: any) => {
        const [id] = treeid;
        const code = {
          menuId: id,
          elementId: item.id,
        };
        await putbtnid(props.ecutroleid, code);
        return false;
      });
    }
  };

  const getParentKey = (key: any, tree: any) => {
    let parentKey: any;
    for (let i = 0; i < tree.length; i += 1) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some((item: any) => item.id === key)) {
          parentKey = node.id;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };

  const loop = (data: any) =>
    data.map((item: any) => {
      const index = item.title.indexOf(searchValue);
      const beforeStr = item.title.substr(0, index);
      const afterStr = item.title.substr(index + searchValue.length);
      const title =
        index > -1 ? (
          <span>
            {beforeStr}
            <span className="site-tree-search-value">{searchValue}</span>
            {afterStr}
          </span>
        ) : (
          <span>{item.title}</span>
        );
      if (item.children) {
        return { title, key: item.id, children: loop(item.children) };
      }
      return {
        title,
        key: item.id,
      };
    });

  const changevla = (e: any) => {
    const { value } = e.target;
    if (dataLists.length !== 0) {
      const expandedKey: any = dataLists
        .map((item: any) => {
          if (item.title.indexOf(value) > -1) {
            setSeledid([item.key]);
            return getParentKey(item.key, roletree);
          }
          return null;
        })
        .filter((item: any, i: any, self: any) => item && self.indexOf(item) === i);
      setExpandedKeys(expandedKey);
      setAutoExpandParent(true);
      setSearchValue(value);
    }
  };

  const onExpand = (exKeys: any) => {
    setExpandedKeys(exKeys);
    setAutoExpandParent(false);
  };

  const outcli = (e: any) => {
    if (e.target.contains(ref.current)) {
      setTreeid(null);
      setBtnlist([]);
    }
  };

  return (
    <Modal
      title="关联资源"
      open={props.showcut}
      cancelButtonProps={{ disabled: false }}
      onCancel={() => props.onCancel()}
      onOk={() => saverole()}
      okText="保存"
      className={`cutroleipt ${styles.cutroleipt}`}
      // maskClosable={false}
    >
      <Row>
        <Col span={5}>
          <div className="treetop" onClick={(e) => outcli(e)} style={{ height: '100%' }}>
            <Input
              style={{ borderRadius: 4, marginBottom: 10 }}
              onChange={(e) => changevla(e)}
              placeholder="输入关键词进行过滤"
              suffix={<SearchOutlined className="input-search" />}
            />
            {/* <div ref={ref}> */}
            <Fragment>
              <Tree
                treeData={loop(roletree)}
                checkable
                checkedKeys={roleseledidlist}
                // defaultCheckedKeys={roleseledidlist}
                onSelect={onSelect}
                onCheck={(checked, e) => onCheck(checked, e)}
                blockNode={true}
                autoExpandParent={autoExpandParent}
                expandedKeys={expandedKeys}
                onExpand={onExpand}
                defaultSelectedKeys={seledid}
                selectedKeys={treeid}
              />
            </Fragment>
            {/* </div> */}
          </div>
        </Col>
        <Col span={18} offset={1}>
          <Table
            columns={column}
            className="cutrole-table"
            dataSource={btnlist}
            pagination={false}
            scroll={{ y: 392 }}
            rowKey={rowkey}
            // onRow={(record) => {
            //   return {
            //     onClick: (e: any) => {
            //       if (
            //         e?.target &&
            //         (e?.target?.nodeName === 'svg' || e?.target?.nodeName === 'path')
            //       ) {
            //         return;
            //       }
            //       if (
            //         e?.target &&
            //         (e.target?.className.indexOf('ahover') > -1 ||
            //           e.target?.className.indexOf('ant-dropdown-menu-title-content') > -1)
            //       ) {
            //         return;
            //       }
            //       clickRow(record);
            //     }, // 点击行
            //   };
            // }}
            rowSelection={{
              type: 'checkbox',
              onSelect: onSelectChange,
              onChange: changeidlist,
              selectedRowKeys: btnseledlist,
              onSelectAll: selall,
            }}
          />
        </Col>
      </Row>
    </Modal>
  );
};
export default CutRole;
