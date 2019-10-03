import * as React from 'react';

import { FaServer, FaAngleDoubleLeft, FaAngleDoubleRight } from 'react-icons/fa';

export
  interface ILogEntryProps {
  item: Array<String>
};

export function LogEntry(props: ILogEntryProps) {
  return (
    <div className="jp-SAGE2-socketLogItem">
      {/* <div> */}
      <span className="jp-SAGE2-socketLogItemDir">
        <FaServer />{props.item[0] === "Send" ? <FaAngleDoubleRight color={"#fc8d62"} /> : <FaAngleDoubleLeft color={"#8da0cb"}/>}
      </span> {props.item[1]}
      {/* </div> */}
    </div>
  );

}