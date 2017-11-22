import * as React from 'react';

export
  interface IServerInfoProps {
  version: ServerInfo.IVersion
};

export
  interface IServerInfoState {
  version: ServerInfo.IVersion
}

export class ServerInfo extends React.Component<IServerInfoProps, IServerInfoState> {
  constructor(props: IServerInfoProps) {
    super(props);

    this.state = {
      version: props.version
    };
  }

  render() {
    // let serverInfo: React.ReactElement<any> = this._serverInformation.version ? (
    return this.state.version !== undefined ? (
      <div className="jp-SAGE2-versionInfo">
        Version:
          <span>
          {this.state.version.base}
        </span>
        <span>
          {this.state.version.branch}
        </span>
        <span>
          {this.state.version.commit}
        </span>
        <span>
          {this.state.version.date}
        </span>
      </div>
    ) : (
        <div className="jp-SAGE2-versionInfo">
          No Version Info Found
      </div>
      );
  }

}

export
namespace ServerInfo {
  export
    interface IVersion {
    base: string,
    branch: string,
    commit: string,
    date: string
  };
}