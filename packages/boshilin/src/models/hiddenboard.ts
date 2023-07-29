import { useState } from 'react';

export default () => {
  const [nodeType, setNodeType] = useState<string>('road');
  return { nodeType, setNodeType };
};
