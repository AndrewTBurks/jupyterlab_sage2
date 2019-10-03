import * as React from 'react';

import { FaStream } from 'react-icons/fa';
import { LogEntry } from './log-entry';

import { animated, useSpring } from 'react-spring';

const {
  useState
} = React;

export
interface ILogProps {
  items: Array<Array<String>>
};

export function Log(props: ILogProps) {
  let [isOpen, setOpen] = useState(false);

  let listStyle = useSpring({
    maxHeight: isOpen ? "150px" : "0px"
  });

  let badgeStyle = useSpring({
    borderColor: props.items.length ? "#66c2a5" : "#b3e2cd",
    color: props.items.length ? "#f0f0f0" : "#aaa",
    backgroundColor: props.items.length ? "#1b9e77" : "#333"
    // maxHeight: isOpen ? "150px" : "0px"
  });

  return <div className={`jp-SAGE2-socketLog ${isOpen ? "open" : ""}`}>
    <div 
      className="jp-SAGE2-socketLogTitle" 
      onClick={() => setOpen(o => !o)}
    ><FaStream className="jp-SAGE2-streamIcon"/> Communication Log
      <animated.span className="jp-SAGE2-logCount" style={badgeStyle}>{props.items.length}</animated.span>
    </div>
    <animated.div className="jp-SAGE2-socketLogList" style={listStyle}>
      {props.items.map((item: Array<String>, i) => (
        <LogEntry key={i} item={item}></LogEntry>
      ))}
    </animated.div>
  </div>;
}