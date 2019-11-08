import * as React from "react";

import { useSpring, animated } from "react-spring";

import { FaListUl, FaTimes, FaMarkdown, FaCode } from "react-icons/fa";

import { groupBy } from "lodash";

let { useState, useEffect } = React;

function SharedModal(props: any) {
  let { modalContent, setModalContent } = props;
  let [ selected, setSelected ] = useState(null);

  let modalStyle = useSpring({
    opacity: modalContent ? 1 : 0,
    from: {
      opacity: 0
    }
  });

  let notebooks =
    (modalContent &&
      modalContent._registeredCells &&
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
    null;

    useEffect(() => {
      if (notebooks && selected && !notebooks[selected]) {
        setSelected(null);
      }
    }, [notebooks]);

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
            <div style={{ alignSelf: "center" }}>
              {"Shared to "}
              <span
                style={{
                  fontStyle: "normal",
                  fontWeight: "bold",
                  color: "#fff"
                }}
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
            </div>
            <button
              className="close"
              style={{ marginLeft: "auto" }}
              onClick={() => setModalContent(null)}
            >
              <FaTimes />
            </button>
          </div>
          {(modalContent && Object.keys(notebooks).length && (
            <div className="heading">Notebooks</div>
          )) || <div className="heading">No Shared Content</div>}
          <div className="notebooks">
            {modalContent &&
              Object.keys(notebooks).length &&
              Object.keys(notebooks).map(path => (
                <NotebookThumbnail
                  key={path}
                  path={path}
                  notebook={notebooks[path]}
                  selected={selected === path}
                  onSelect={() =>
                    setSelected((s: string) => (s === path ? null : path))
                  }
                  onUnshare={() => {
                    console.log("Remove All", notebooks[path]);
                    modalContent.stopSharingNotebookCells(notebooks[path]);
                  }}
                />
              )) || null}
          </div>
          {(modalContent && Object.keys(notebooks).length && selected && (
            <>
              <div className="heading">
                Cells in <span className="notebook-name">{selected}</span>
              </div>
              <div className="cells">
                {notebooks[selected] && notebooks[selected].map(c => (
                  <CellThumbnail
                    key={c.key}
                    cell={c}
                    onUnshare={() => {
                      console.log("Unshare Cell", c);
                      modalContent.stopSharingNotebookCells([c]);
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
  let { count } = useSpring({
    // @ts-ignore
    count: notebook.length,
    from: {
      count: 0
    }
  });

  return (
    <animated.div
      className={`notebook-thumbnail ${selected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <div className="notebook-title">{path}</div>
      <div className="notebook-actions">
        <div className="notebook-cell-count">
          <animated.span style={{ marginRight: 4 }}>
            {count.interpolate((c: number) => c.toFixed())}
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
          Remove All {notebook.length}
        </button>
      </div>
    </animated.div>
  );
}

function CellThumbnail(props: any) {
  let { cell, onUnshare } = props;

  return (
    <div className="cell-thumbnail">
      <div
        className="cell-info"
        style={{ whiteSpace: "nowrap", cursor: "help" }}
        title={`Cell Number ${cell.ind + 1}, ${cell.info.cell_type}`}
      >
        <span className="cell-index">[{cell.ind}]</span>
        <span className="cell-type">
          {cell.info.cell_type === "code" ? <FaCode /> : <FaMarkdown />}
        </span>
      </div>

      <div className="cell-actions" style={{ textAlign: "center" }}>
        <button className="unshare-button" onClick={onUnshare}>
          Remove
        </button>
      </div>
    </div>
  );
}

export default SharedModal;
