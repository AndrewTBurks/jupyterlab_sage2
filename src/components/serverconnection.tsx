import * as vdom from '@phosphor/virtualdom';

/* tslint:disable */
/**
 * We have configured the TSX transform to look for the h function in the local
 * module.
 */
const h = vdom.h;
/* tslint:enable */

export class ServerConnection {
  constructor(options : ServerConnection.IOptions) {
    // create html element
    this._url = options.url;
    this._name = options.name ? options.name : "SAGE2 Server";
  }

  createElement() : vdom.VirtualElement{
    return (
      <div className="jp-SAGE2-serverConnection">
        <h3>{this._name}</h3>
        <h4>{this._url}</h4>
      </div>
    );
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

export
namespace ServerConnection {
  export
  interface IOptions {
    // A name for the server
    name?: string,

    // the server's url
    url: string
  }
}