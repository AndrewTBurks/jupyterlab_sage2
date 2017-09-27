// import { DisposableDelegate } from '@phosphor/disposable/lib';
import {
  // Widget
} from '@phosphor/widgets';

import {
  // DisposableDelegate
} from '@phosphor/disposable';

import {
  
} from "@jupyterlab/application"

import * as vdom from '@phosphor/virtualdom';

import {
  ServerConnection
} from './ui-elements';

import {
  VDomModel, VDomRenderer
} from '@jupyterlab/apputils';

// import WebsocketIO from './websocket.io';

let _SAGE2Instances = 0;

/* tslint:disable */
/**
 * We have configured the TSX transform to look for the h function in the local
 * module.
 */
const h = vdom.h;
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
  constructor(options : Partial<SAGE2.IOptions> = {}) {
    super();
    this.id = "jp-SAGE2-" + _SAGE2Instances++;
    this.title.label = "SAGE2";
  }

  protected render(): vdom.VirtualNode | vdom.VirtualNode[] {
    let servers = this.getConnections().map((connection : ServerConnection) => connection.createElement())

    let addonclick = () => {
      this.addServer();
    };

    return (
      <div className="jp-SAGE2-body">
        <div className="jp-SAGE2-title">
          {/* <h1>Server Connections</h1> */}
          {/* <img src="../../style/sage2a-green_final.svg" alt="Server Connections"/> */}
        </div>
        <hr></hr>
        <div className="jp-SAGE2-connections">
          {servers}
        </div>
        <button className="jp-SAGE2-addServerButton jp-SAGE2-button" onclick={addonclick}>
          <i className="fa fa-3x fa-plus-circle"></i>
        </button>
      </div>
    );
  }

  // public addServer(options?: ServerConnection.IOptions) {
  //   if (!options) {
  //     options = {url: "https://localhost:9000", "name": "Local SAGE2 Server"};
  //   }

  //   let connection = new ServerConnection(options);
  //   this._connections.push(connection);
  //   this.update();

  //   let delegate = new DisposableDelegate(() => {
  //     let ind = this._connections.indexOf(connection);
  //     this._connections.splice(ind, 1);

  //     this.update();
  //   });

  //   connection.onremove(delegate);
  //   connection.onupdate(this.update.bind(this));
  // }

  // private startConnection() {
  //   console.log("Starting connection to server");
    
  //   let notif = document.createElement("h1");
  //   notif.innerText = `Connected to ${this._server}`;

  //   this._sage2window.appendChild(notif);

  //   this._wsio.emit('startJupyterSharing', {
  //     id: this.id,
  //     title: "jupyter",
  //     color: "green",
  //     src: "raw", type: "image/jpeg", encoding: "binary",
  //     width: 600, height: 600
  //   });
  // }
  
  public getConnections: Function = null;
  public addServer: Function = null;
}

export
namespace SAGE2 {
  export
  interface IOptions {
    id: string
  };

  // export
  // const defaultOptions : IOptions = {
  //   // ip: "127.0.0.1"
  // };
}