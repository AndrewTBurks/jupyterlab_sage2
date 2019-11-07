import * as React from 'react';

import { useSpring, animated } from 'react-spring';

import { FaListUl, FaTimes } from "react-icons/fa";

import { groupBy } from "lodash";

let {
  useState
} = React;

function SharedModal(props: any) {
  let { modalContent, setModalContent } = props;
  let [selected, setSelected] = useState(null);

  let modalStyle = useSpring({
    opacity: modalContent ? 1 : 0,
    from: {
      opacity: 0
    }
  });

  let notebooks =
    (modalContent && modalContent._registeredCells && 
      groupBy(
        Object.keys(modalContent._registeredCells).map(key => {
          let cell = modalContent._registeredCells[key];

          return {
            key,
            info: cell.info,
            ind: key.split("~")[1]
          };
        }),
        cell => {
          return cell.info.path;
        }
      )) ||
    {};

  return (
    <animated.div
      className="jp-SAGE2-sharedContentModal"
      style={{
        pointerEvents: modalContent ? "all" : "none",
        ...modalStyle
      }}
    >
      <div
        className="jp-SAGE2-modalOverlay"
        onClick={() => setModalContent(null)}
      >
        <div
          className="jp-SAGE2-modalContent"
          onClick={evt => evt.stopPropagation()}
        >
          <div className="titlebar">
            {"Shared to "}
            <span
              style={{ fontStyle: "normal", fontWeight: "bold", color: "#fff" }}
            >
              {(modalContent && modalContent._name) || "?"}
            </span>
            {" at "}
            <a
              style={{
                fontStyle: "normal",
                fontWeight: "bold",
                color: "#90caf9"
              }}
              rel="noopener noreferrer"
              target="_blank"
              href={(modalContent && modalContent._url) || "?"}
            >
              {(modalContent && modalContent._url) || "?"}
            </a>
            <button
              className="close"
              style={{ marginLeft: "auto" }}
              onClick={() => setModalContent(null)}
            >
              <FaTimes />
            </button>
          </div>
          <div className="heading">Notebooks</div>
          <div className="notebooks">
            {Object.keys(notebooks).map(path => (
              <NotebookThumbnail
                key={path}
                path={path}
                notebook={notebooks[path]}
                selected={selected === path}
                onSelect={() => setSelected((s: any) => (s === path ? null : path))}
                onUnshare={() => {
                  console.log("Unshare All", notebooks[path]);
                }}
              />
            ))}
          </div>
          {(modalContent && selected && (
            <>
              <div className="heading">
                Cells in <span className="notebook-name">{selected}</span>
              </div>
              <div className="cells">
                {notebooks[selected].map((c: any) => (
                  <CellThumbnail
                    key={c.key}
                    cell={c}
                    onUnshare={() => {
                      console.log("Unshare Cell", c);
                    }}
                  />
                ))}
              </div>
            </>
          )) ||
            null}
        </div>
      </div>
    </animated.div>
  );
}

function NotebookThumbnail(props: any) {
  let { path, notebook, selected, onSelect, onUnshare } = props;

  // @ts-ignore
  // let { count } = useSpring({
  //   count: notebook.length as number
  // });

  return (
    <animated.div
      className={`notebook-thumbnail ${selected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <div className="notebook-title">{path}</div>
      <div className="notebook-actions">
        <div className="notebook-cell-count">
          <animated.span style={{ marginRight: 4 }}>
            {/* {count.interpolate((c: number) => c.toFixed())} */}
            {notebook.length}
          </animated.span>
          <FaListUl />
        </div>
        <button
          className="unshare-button"
          onClick={e => {
            e.stopPropagation();

            onUnshare();
          }}
        >
          Unshare {notebook.length} Cells
        </button>
      </div>
    </animated.div>
  );
}

function CellThumbnail(props: any) {
  let { cell, onUnshare } = props;

  return (
    <div className="cell-thumbnail">
      <div className="cell-info" style={{ whiteSpace: "nowrap" }}>
        <span className="cell-index">[{cell.ind}]</span>
        <span className="cell-type">{cell.type || "code"}</span>
      </div>

      <div className="cell-actions" style={{ textAlign: "center" }}>
        <button className="unshare-button" onClick={onUnshare}>
          Unshare
        </button>
      </div>
    </div>
  );
}

export default SharedModal;
