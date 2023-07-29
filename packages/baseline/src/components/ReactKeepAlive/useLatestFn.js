import { useEffect, useRef } from 'react';

function useLatestFn(fn) {
  const fnRef = useRef(null);
  useEffect(() => {
    fnRef.current = fn;
  });
  return fnRef;
}

export default useLatestFn;
