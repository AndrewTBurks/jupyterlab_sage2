import * as React from 'react';

import { LogEntry } from './log-entry'

export
interface ILogProps {
  items: Array<Array<String>>
};

export
interface ILogState {
  items: Array<Array<String>>
}

export class Log extends React.Component<ILogProps, ILogState> {
  constructor(props: any) {
    super(props);
    this.state = {
      items: props.items
    };
  }

  render() : React.ReactElement<any> {
    let entries: React.ReactElement<any>[] = this.state.items.map((item: Array<String>) => (
        <LogEntry item={item}></LogEntry>
      ));

    return (
      <div className="jp-SAGE2-socketLog">
        {entries}
      </div>
    );
  }
}