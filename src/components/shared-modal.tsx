import * as React from 'react';

import { useSpring, animated } from 'react-spring';

export default
function SharedModal(props: any) {
  let {
    modalContent,
    setModalContent
  } = props;

  let modalStyle = useSpring({
    opacity: modalContent ? 1 : 0,
    from: {
      opacity: 0
    }
  });

  console.log(modalContent);

  return <animated.div className="jp-SAGE2-sharedContentModal"
    style={{
      pointerEvents: modalContent ? "all" : "none",
      ...modalStyle
    }}
  >
    <div className="jp-SAGE2-modalOverlay" onClick={() => setModalContent(null)}>

      <div className="jp-SAGE2-modalContent" onClick={(evt) => evt.stopPropagation()}>
        <div className="titlebar">
          {"Shared to "}
          <span style={{ fontStyle: "normal", fontWeight: "bold", color: "#fff" }}>
            {modalContent && modalContent.name || "?"}
          </span>
          {" at "}
          <a style={{ fontStyle: "normal", fontWeight: "bold", color: "#90caf9" }}>
            {modalContent && modalContent.url || "?"}
          </a>
        </div>
      </div>
    </div>
  </animated.div>;
}