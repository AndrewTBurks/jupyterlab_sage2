import * as React from 'react';

export
  interface IServerInfoProps {
  version: ServerInfo.IVersion
};

export function ServerInfo(props : IServerInfoProps) {
  return props.version !== undefined ? (
    <div className="jp-SAGE2-versionInfo">
      <span>
        Version: <span className="value">{props.version.base}</span>
      </span>
      {
        props.version.branch ? (
          <span>
            Branch: <span className="value">{props.version.branch}</span>
          </span>
        ) : ""
      }
      {/* <span>
        {props.version.commit}
      </span> */}
      <span>
        <span className="value">
          {props.version.date}
        </span>
      </span>
    </div>
  ) : (
      <div className="jp-SAGE2-versionInfo SAGE2-error-font">
        No Version Info Found
    </div>
    );

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