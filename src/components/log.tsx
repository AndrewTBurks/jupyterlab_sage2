import * as React from 'react';

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
    let log: React.ReactElement<any>[] = this.state.items.map((item: Array<String>) => {
      return (
        <div className="jp-SAGE2-socketLogItem">
          <p>
            {item[0]}> {item[1]}
          </p>
        </div>
      );
    });

    return (
      <div className="jp-SAGE2-socketLog">
        {log}
      </div>
    );
  }
}