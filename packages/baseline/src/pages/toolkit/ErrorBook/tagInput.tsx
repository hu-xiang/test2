import { Input } from 'antd';
import { useState } from 'react';
import React from 'react';

type Iprops = {
  value: any;
  onChange: (val: any) => void;
};
const TagInput: React.FC<Iprops> = (props: any) => {
  // const ref = useRef<HTMLInputElement | null>(null);
  const [inputValue, setInputValue] = useState<any>(props.value);
  // const [statusValue, setStatusValue] = useState<any>('');
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    // const pattern = /^[\u4E00-\u9FA5A-Za-z0-9,_-]+$/;
    // if (!pattern.test(inputValue)) {
    //   message.error('由中文、英文字母、数字、下划线和中划线、逗号组成');
    //   setStatusValue('error');
    //   return;
    // }
    props.onChange(inputValue);
    setInputValue('');
  };
  return (
    <Input
      // ref={ref}
      type="text"
      size="small"
      // status={statusValue}
      autoFocus
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleInputConfirm}
      onPressEnter={handleInputConfirm}
    />
  );
};

export default TagInput;
