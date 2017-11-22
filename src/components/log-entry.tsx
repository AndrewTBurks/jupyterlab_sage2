import * as React from 'react';

export
  interface ILogEntryProps {
  item: Array<String>
};

export
  interface ILogEntryState {
  item: Array<String>
}

export class LogEntry extends React.Component<ILogEntryProps, ILogEntryState> {
  constructor(props: ILogEntryProps) {
    super(props);

    this.state = {
      item: props.item
    };
  }

  render() {
    return (
      <div className="jp-SAGE2-socketLogItem">
        <p>
          {this.state.item[0]}> {this.state.item[1]}
        </p>
      </div>
    );
  }
}