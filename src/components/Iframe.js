import { useEffect, useRef } from 'react';

function Iframe({ content, styles }) {
  const iframeContainer = useRef(null);

  useEffect(() => {
    iframeContainer.current.innerHTML = content;
    if (iframeContainer.current.firstElementChild) {
      iframeContainer.current.firstElementChild.style.height = '100%';
      iframeContainer.current.firstElementChild.style.width = '100%';
    }
  }, [content]);
  return <div ref={iframeContainer} style={styles}></div>;
}

export default Iframe;
