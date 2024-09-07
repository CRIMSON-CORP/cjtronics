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

  function toggle(e) {
    e?.stopPropagation();
    setState((prev) => !prev);
  }

  return { state, open, close, toggle };
}

export default useToggle;
