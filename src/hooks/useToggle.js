import { useState } from 'react';

function useToggle(defaultState = false) {
  const [state, setState] = useState(defaultState);

  function open(e) {
    e?.stopPropagation();
    setState(true);
  }

  function close(e) {
    e?.stopPropagation();
    setState(false);
  }

  return { state, open, close };
}

export default useToggle;
