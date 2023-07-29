import facility from 'baseline/src/models/facility';
import { useState } from 'react';

export default () => {
  const [resetColorFlag, setResetColorFlag] = useState<boolean>(false);
  return { ...facility(), resetColorFlag, setResetColorFlag };
};
