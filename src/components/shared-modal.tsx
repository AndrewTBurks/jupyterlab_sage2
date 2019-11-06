import * as React from 'react';

import { useSpring, animated } from 'react-spring';

export default
function SharedModal(props: any) {
  let {
    modalContent,
    setModalContent
  } = props;

  let modalStyle = useSpring({
    opacity: modalContent ? 1 : 0
  });

  return <animated.div className="jp-SAGE2-sharedContentModal"
    style={{
      pointerEvents: modalContent ? "all" : "none",
      ...modalStyle
    }}
  >
    <div className="jp-SAGE2-modalOverlay" onClick={() => setModalContent(null)}>

      <div className="jp-SAGE2-modalContent" onClick={(evt) => evt.stopPropagation()}>
        Modal Content Test
        <div>
          {modalContent && modalContent.name || "?"}
        </div>
        <div>
          {modalContent && modalContent.url || "?"}
        </div>
      </div>
    </div>
  </animated.div>;
}