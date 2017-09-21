import * as vdom from '@phosphor/virtualdom';

import {
  VDomModel, VDomRenderer
} from '@jupyterlab/apputils';

const h = vdom.h;

export class ServerConnection {
  constructor(options : ServerConnection.IOptions) {
    // create html element 

  }

  createElement(data) : vdom.VirtualElement {

    return (
      <div class="jp-SAGE2-serverConnection">

      </div>
    );
  }

  remove() {
    this._element.remove();
  }

  // get the name of a connection
  get name() : string {
    return this._name;
  }

  // set the name of a connection
  set name(name : string) {
    this._name = name;

    // update UI element to match
  }

  // get dom element
  get element(): vdom.VirtualElement {
    return this._element;
  }

  private _element: vdom.VirtualElement = null;
  private _name : string = "SAGE2 Server";
  private _url : string;
}

namespace ServerConnection {
  export
  interface IOptions {
    // node for the connection to be appended to
    parent: HTMLElement,

    // A name for the server
    name?: string,

    // the server's url
    url: string
  }
}