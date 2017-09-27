import { DisposableDelegate } from '@phosphor/disposable/lib';
import * as vdom from '@phosphor/virtualdom';
import WebsocketIO from '../websocket.io';

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
    this._url = options.url.indexOf("http://") || options.url.indexOf("https://") ? options.url : "http://" + options.url;
    this._name = options.name ? options.name : "SAGE2 Server";
  }

  createElement() : vdom.VirtualElement {
    return this._editing ? this.editableServer() : this.establishedServer();
  }

  private establishedServer() : vdom.VirtualElement {
    // wrap this._remove in lambda
    let remove = () => {
      // close websocket
      this._wsio.close();
      // dispose of item      
      this._remove.dispose();
    }
    let edit = () => this.startEditing();

    let classNames = "jp-SAGE2-serverConnection" + (this._connected ? "" : " jp-SAGE2-serverNotConnected");

    return (
      <div className={classNames}>
        <h4>{this._name}</h4>
        <a target="about:blank" href={this._url}>{this._url}</a>
        <div className="jp-SAGE2-serverButtons">
          <button className="jp-SAGE2-serverButtonEdit jp-SAGE2-button" onclick={edit}>
            Edit
          </button>
          <button className="jp-SAGE2-serverButtonRemove jp-SAGE2-button" onclick={remove}>
            Remove
          </button>
        </div>
      </div>
    );
  } 

  private editableServer(): vdom.VirtualElement {
    // wrap this._remove in lambda
    // let remove = () => this._remove.dispose();
    let save = () => this.saveEdits();

    let that = this;
    let nameChange = function() {
      that._name = this.value;
    }
    let urlChange = function () {
      that._url = this.value;
    }
    
    return (
      <div className="jp-SAGE2-serverConnection">
        <input oninput={nameChange} value={this._name}></input>
        <input oninput={urlChange} value={this._url}></input>
        <div className="jp-SAGE2-serverButtons">
          <button className="jp-SAGE2-serverButtonEdit jp-SAGE2-button" onclick={save}>
            Save
          </button>
          {/* <button className="jp-SAGE2-serverButtonRemove jp-SAGE2-button" onclick={remove}>
            Remove
          </button> */}
        </div>
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

  get url() : string {
    return this._url;
  }

  set url(url : string) {
    this._url = url.indexOf("http://") || url.indexOf("https://") ? url : "http://" + url;
  }

  public onremove(delegate : DisposableDelegate) {
    this._remove = delegate;
  }

  public onupdate(vdomUpdate: Function) {
    this._update = vdomUpdate;
  }

  private startEditing() {
    this._editing = true;

    if (this._wsio) {
      this._wsio.close();
      this._wsio = null;
    }

    this._update();
  }

  private saveEdits() {
    this._editing = false;
    // ensure correct URL formatting
    this._url = this._url.indexOf("http://") || this._url.indexOf("https://") ? this._url : "http://" + this._url;

    let that = this;

    this._wsio = new WebsocketIO(this._url.replace("http", "ws"));
    this._wsio.open(function() {
      var clientDescription = {
          clientType: "jupyter",
          requests: {
            config: true,
            version: true,
            time: false,
            console: false
          },
        };

        
        that._wsio.on('initialize', function (data : any) {
          that._id = data.UID;
          that._connected = true;

          that._update();
          // that.startConnection();
        });

        that._wsio.on('close', function(data : any) {
          that._connected = false;

          that._update();
        });

        that._wsio.emit('addClient', clientDescription);
    });
    
    this._update();
  }

  private _name : string = "SAGE2 Server";
  private _url : string = "http://sage2.server.address.com";
  private _id : string = null;
  private _wsio : WebsocketIO = null;
  private _connected: boolean = false;

  private _editing: boolean = true;
  private _remove: DisposableDelegate;
  private _update: Function;
}

export
namespace ServerConnection {
  export
  interface IOptions {
    // A name for the server
    name?: string,

    // the server's url
    url: string
  };

  export
  const defaultOptions : IOptions = {
    url: 'https://localhost:9090',
    name: "Local SAGE2 Server"
  };
}