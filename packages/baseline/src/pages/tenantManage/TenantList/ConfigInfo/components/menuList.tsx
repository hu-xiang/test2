// import { SearchOutlined } from '@ant-design/icons';
import { Col, message, Row, Table, Tooltip, Tree } from 'antd';
import React, { useEffect, useRef, useState, useImperativeHandle } from 'react';
import {
  delbtnid,
  getbtnlist,
  getbtnseledlist,
  getseledtree,
  putbtnid,
  savepower,
} from '../../../../systemSet/RoleManage/service';
import styles from '../styles.less';
import { useCommonScrollObj } from '../../../../../utils/tableScrollSet';
import { getAdminRole, getTenantRole } from '../../../../../services/commonApi';

type Iprops = {
  roleID: any;
  onRef: any;
};

const MenuList: React.FC<Iprops> = (props) => {
  const [roletree, setRoletree] = useState<any>([]);
  const [roleseledidlist, setRoleseledidlist] = useState<any>([]);
  const [submitTreeSelected, setSubmitTreeSelected] = useState<any>([]);
  const [btnlist, setBtnlist] = useState([]);
  const [btnseledlist, setBtnseledlist] = useState<any>([]);
  const [treeid, setTreeid] = useState<any>(0);
  const [cloneSele, setCloneSele] = useState<any>([]);
  const [cloneRoleIds, setCloneRoleIds] = useState<any>([]);
  const [expandedKeys, setExpandedKeys] = useState([]);
  const [autoExpandParent, setAutoExpandParent] = useState(true);
  const [childNum, setChildNum] = useState({}); // 保存树的子节点的个数
  const scrollObj = useCommonScrollObj(40, '.tabClass1', btnlist, {
    x: 750,
    y: 'calc(100vh - 326px)',
  });
  const ref = useRef<any>();

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
    };
    if (res.length !== 0) {
      generateList(res);
    }
    setChildNum(tempChildNum);
    setRoletree(res);
  };

  const getseledlist = async () => {
    const res = await getseledtree(props?.roleID);
    const list: any = [];
    const tempIdObj = {}; // 存放计算出的父元素孩子的个数
    res.data.map((item: any) => {
      if (!tempIdObj[item.parentId]) {
        tempIdObj[item.parentId] = 1;
      } else {
        tempIdObj[item.parentId] += 1;
      }
      list.push(item.id);
      return list;
    });
    // 默认提交数据,防止直接提交报错
    setSubmitTreeSelected(list.concat());
    // 备份
    setCloneRoleIds([...list]);
    // 判断是否所有的子节点都选中，未全选时清掉父元素
    Object.keys(tempIdObj).forEach((key) => {
      if (childNum[key] && tempIdObj[key] !== childNum[key]) {
        list.splice(list.indexOf(key), 1);
      }
    });

    setTimeout(() => {
      setCloneSele([...list]);
      setRoleseledidlist(list);
    }, 0);
  };

  useEffect(() => {
    gettree();
  }, []);
  useEffect(() => {
    if (roletree.length && props?.roleID) {
      getseledlist();
    }
  }, [roletree, props?.roleID]);

  const onSelect = async (selectedKeys: any) => {
    if (selectedKeys?.length > 0) {
      const [id] = selectedKeys;
      setTreeid(selectedKeys);
      const params = {
        menuId: id,
      };
      const res = await getbtnlist(params);
      setBtnlist(res.data.rows);
      setTimeout(async () => {
        const selres = await getbtnseledlist(props.roleID);
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
      width: 100,
      ellipsis: true,
    },
    {
      title: '资源名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: any) => {
        return <Tooltip title={text}>{text}</Tooltip>;
      },
      ellipsis: true,
    },
    {
      title: '资源地址',
      dataIndex: 'uri',
      key: 'uri',
      ellipsis: true,
      width: 150,
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
      await delbtnid(props.roleID, code);
    } else {
      await putbtnid(props.roleID, code);
    }
  };

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
        content: '请选择左侧菜单节点',
        key: '请选择左侧菜单节点',
      });
      return false;
    }
    const hide = message.loading({
      content: '正在保存',
      key: '正在保存',
    });
    try {
      const res = await savepower(props.roleID, code);
      hide();
      if (res.status === 0) {
        message.success({
          content: '保存成功',
          key: '保存成功',
        });
      } else {
        // message.error({
        //   content: res.message,
        //   key: res.message,
        // });
      }
      return true;
    } catch (error) {
      hide();
      message.error({
        content: '保存失败!',
        key: '保存失败!',
      });
      return false;
    }
  };
  const reset = () => {
    setRoleseledidlist([...cloneSele]);
    setSubmitTreeSelected([...cloneRoleIds]);
    setTreeid(0);
    setBtnlist([]);
  };
  useImperativeHandle(props.onRef, () => ({
    // 暴露给父组件的方法
    saverole,
    reset,
  }));
  const selall = async (flag: any, selectedRows: any, changeRows: any) => {
    if (!flag) {
      changeRows.map(async (item: any) => {
        const [id] = treeid;
        const code = {
          menuId: id,
          elementId: item.id,
        };
        await delbtnid(props.roleID, code);
        return false;
      });
    } else {
      changeRows.map(async (item: any) => {
        const [id] = treeid;
        const code = {
          menuId: id,
          elementId: item.id,
        };
        await putbtnid(props.roleID, code);
        return false;
      });
    }
  };

  const loop = (data: any) =>
    data.map((item: any) => {
      const title = <span>{item.title}</span>;
      if (item.children) {
        return { title, key: item.id, children: loop(item.children) };
      }
      return {
        title,
        key: item.id,
      };
    });

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
    <Row className="menuRow">
      <Col span={5}>
        <div className={`treetop ${styles.treeTenant}`} onClick={(e) => outcli(e)}>
          <div ref={ref}>
            <Tree
              treeData={loop(roletree)}
              checkable
              checkedKeys={roleseledidlist}
              onSelect={onSelect}
              onCheck={(checked, e) => onCheck(checked, e)}
              blockNode={true}
              autoExpandParent={autoExpandParent}
              expandedKeys={expandedKeys}
              onExpand={onExpand}
              selectedKeys={treeid}
            />
          </div>
        </div>
      </Col>
      <Col span={19}>
        <Table
          columns={column}
          className="tenant-menu-table"
          dataSource={btnlist}
          pagination={false}
          scroll={scrollObj || { x: '100%' }}
          rowKey={rowkey}
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
  );
};
export default MenuList;
