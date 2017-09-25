// import { DisposableDelegate } from '@phosphor/disposable/lib';
import {
  // Widget
} from '@phosphor/widgets';

import {
  DisposableDelegate
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
    this.id = "sage2-" + _SAGE2Instances++;

    this.addServer({ url: "http://thor.evl.uic.edu", name: "ICE Wall" });
    // this._wsio = null;

    // // let that = this;

    // let node = this.node;

    // let mainUI = this._sage2window = document.createElement("div");
    // mainUI.classList.add("jp-SAGE2-uiWrapper");
    // mainUI.innerText = "Hello to SAGE2!";

    // node.appendChild(mainUI);

    // let form = document.createElement("div");
    // let label = document.createElement("label");
    // let input = document.createElement("input");
    // let go = document.createElement("button");

    // form.classList.add("jp-SAGE2-serverConnectForm");

    // label.innerText = "Server Address: "
    // label.htmlFor = `sage2-inputlabel`;

    // input.id = `sage2-inputlabel`;

    // go.innerText = "Connect";
    // go.id = "sage2-gobutton";

    // form.appendChild(label);
    // form.appendChild(input);
    // form.appendChild(go);

    // mainUI.appendChild(form);
    
    // let that = this;
    // go.addEventListener("click", () => {
    //   console.log("connect to ", (<HTMLInputElement>document.getElementById(input.id)).value);

    //   this._server = (<HTMLInputElement>document.getElementById(input.id)).value;
    //   this._session.setName(this._server);

    //   this._wsio = new WebsocketIO(this._server);
    //   this._wsio.open(function () {
    //     var clientDescription = {
    //       clientType: "jupyter",
    //       requests: {
    //         config: true,
    //         version: true,
    //         time: false,
    //         console: false
    //       },
    //     };
    //     that._wsio.on('initialize', function (data : any) {
    //       that.id = data.UID;
    //       that.startConnection();

    //       form.remove();
    //     });
    //     that._wsio.emit('addClient', clientDescription);
    //   });
    // });
  }

  // get serverAddress(): String | null {
  //   return this._server;
  // }

  // set serverAddress(value : String | null) {

  // }

  protected render(): vdom.VirtualNode | vdom.VirtualNode[] {
    let servers = this._connections.map(connection => connection.createElement())

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
          <button className="jp-SAGE2-addServerButton jp-SAGE2-button" onclick={addonclick}>
            +
          </button>
        </div>
      </div>
    );
  }

  public addServer(options?: ServerConnection.IOptions) {
    if (!options) {
      options = {url: "https://localhost:9000", "name": "Local SAGE2 Server"};
    }

    let connection = new ServerConnection(options);
    this._connections.push(connection);
    this.update();

    let delegate = new DisposableDelegate(() => {
      let ind = this._connections.indexOf(connection);
      this._connections.splice(ind, 1);

      this.update();
    })

    connection.onremove(delegate);
    connection.onupdate(this.update.bind(this));
  }

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

  // private _server: string | null = null;
  // private _wsio : any;
  private _connections: Array<ServerConnection> = [];
}

export
namespace SAGE2 {
  export
  interface IOptions {
    ip: string;
  };

  export
  const defaultOptions : IOptions = {
    ip: "127.0.0.1"
  };
}