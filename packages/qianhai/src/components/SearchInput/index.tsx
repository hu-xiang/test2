import { Input } from 'antd';
import { useState, useRef } from 'react';
import React from 'react';
import { SearchOutlined } from '@ant-design/icons';

type Iprops = {
  onBlur: (val: any) => void;
  classNames: string;
};
const SearchInput: React.FC<Iprops> = (props) => {
  const ref = useRef<any>(null);
  const [inputValue, setInputValue] = useState<string>('');
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    props?.onBlur(inputValue);
    // setInputValue('');
  };
  return (
    <Input
      ref={ref}
      className={props.classNames}
      suffix={<SearchOutlined className="input-search" />}
      style={{
        float: 'right',
        width: 270,
        height: 40,
        marginTop: 10,
        marginRight: 10,
        borderRadius: 4,
      }}
      allowClear
      placeholder="请输入关键词过滤菜单栏"
      type="text"
      size="small"
      autoFocus
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleInputConfirm}
      onPressEnter={handleInputConfirm}
    />
  );
};

export default SearchInput;
