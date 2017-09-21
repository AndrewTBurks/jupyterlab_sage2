import {
  Widget
} from '@phosphor/widgets';

import {
  
} from "@jupyterlab/application"

import {
  // ServerConnection
} from "./serverconnection";

// import WebsocketIO from './websocket.io';

let _SAGE2Instances = 0;

export
class SAGE2 extends Widget {
  constructor(options : Partial<SAGE2.IOptions> = {}) {
    super();
    this.id = "sage2-" + _SAGE2Instances++;
    this._wsio = null;

    // let that = this;

    let node = this.node;

    let mainUI = this._sage2window = document.createElement("div");
    mainUI.classList.add("jp-SAGE2-uiWrapper");
    mainUI.innerText = "Hello to SAGE2!";

    node.appendChild(mainUI);

    let form = document.createElement("div");
    let label = document.createElement("label");
    let input = document.createElement("input");
    let go = document.createElement("button");

    form.classList.add("jp-SAGE2-serverConnectForm");

    label.innerText = "Server Address: "
    label.htmlFor = `sage2-inputlabel`;

    input.id = `sage2-inputlabel`;

    go.innerText = "Connect";
    go.id = "sage2-gobutton";

    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(go);

    mainUI.appendChild(form);
    
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

  get serverAddress(): String | null {
    return this._server;
  }

  set serverAddress(value : String | null) {

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

  private _server: string | null = null;
  private _wsio : any;
  private _sage2window: HTMLElement;
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