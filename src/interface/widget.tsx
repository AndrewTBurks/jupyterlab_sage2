import {

} from '@phosphor/widgets';

import {
} from '@phosphor/disposable';

import {
  
} from "@jupyterlab/application"

// import * as vdom from '@phosphor/virtualdom';

import * as React from 'react';

import {
  ServerConnection
} from './ui-elements';

import {
  VDomModel, VDomRenderer
} from '@jupyterlab/apputils';

let _SAGE2Instances = 0;

/* tslint:disable */
/**
 * We have configured the TSX transform to look for the h function in the local
 * module.
 */
// const h = vdom.h;
/* tslint:enable */

export
class SAGE2Model extends VDomModel {

}

/**
 * The SAGE2 interface.
 */
// export
//   interface SAGE2 {
//   /**
//    * Add a command item to the launcher, and trigger re-render event for parent
//    * widget.
//    *
//    * @param options - The specification options for a launcher item.
//    *
//    * @returns A disposable that will remove the item from Launcher, and trigger
//    * re-render event for parent widget.
//    *
//    */
//   add(options: ILauncherItem): IDisposable;
// }

export
class SAGE2 extends VDomRenderer<SAGE2Model> {
  // SAGE2 widget constructor
  constructor(options : Partial<SAGE2.IOptions> = {}) {
    super();

    this.id = "jp-SAGE2-" + _SAGE2Instances++;
    this.title.label = "SAGE2";
  }

  // render connections
  protected render(): React.ReactElement<any> | React.ReactElement<any>[] {
    // map connections to vdom VirtualNodes
    let servers = this.getConnections().map((connection : ServerConnection) => connection.createElement())

    // add server click event listener
    let addonclick = () => {
      this.addServer();
    };

    return (
      <div className="jp-SAGE2-body">
        <div className="jp-SAGE2-title">
        </div>
        {/* <hr></hr> */}
        <div className="jp-SAGE2-connections">
          {servers}
        </div>
        <button className="jp-SAGE2-addServerButton jp-SAGE2-buttonAccept jp-SAGE2-button" onClick={addonclick}>
          <i className="fa fa-3x fa-plus-circle"></i>
        </button>
      </div>
    );
  }
  
  // public functions
  public getConnections: Function = null;
  public addServer: Function = null;
}

export
namespace SAGE2 {
  export
  interface IOptions {
    id: string
  };
}