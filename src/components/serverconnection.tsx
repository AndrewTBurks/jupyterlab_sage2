import { DisposableDelegate } from '@phosphor/disposable/lib';

import * as React from 'react';

import WebsocketIO from '../websocket.io';

import { Log } from './log';
import { ServerInfo } from './server-info';

export class ServerConnection {
  constructor(options : ServerConnection.IOptions) {
    // initialize url and name
    // make sure the url has http or https prepended -- TODO: check this code
    this._url = options.url.indexOf("http://") || options.url.indexOf("https://") ? options.url : "http://" + options.url;
    this._name = options.name ? options.name : "SAGE2 Server";
  }

  // create vdom.VirtualElement method creates an editable or established server based on _editing state
  createElement() : React.ReactElement<any> {
    return this._editing ? this.editableServer() : this.establishedServer();
  }

  // construct vdom VirtualElement for an established server (no inputs)
  private establishedServer(): React.ReactElement<any> {
    // wrap this._remove in lambda
    let remove = () => {
      // close websocket
      this._wsio.close();
      // dispose of item      
      this._remove.dispose();
    }
    let edit = () => this.startEditing();
    let favorite = () => { 
      this._favorite(true);
      this._update();
    }
    let unfavorite = () => { 
      this._favorite(false);
      this._update();
    }

    let classNames = "jp-SAGE2-serverConnection" + (this._connected ? "" : " jp-SAGE2-serverNotConnected");

    // icon for favorite connection status
    let favicon: React.ReactElement<any> = this._isFavorite() ? (
      <i className="favServer fa fa-star fa-2x" aria-hidden="true" onClick={unfavorite}></i>
    ) : (
      <i className="favServer fa fa-star-o fa-2x" aria-hidden="true" onClick={favorite}></i>
    );

    return (
      <div className={classNames}>
        {favicon}
        <h4>{this._name}</h4>
        <a target="about:blank" href={this._url}>{this._url}</a>
        <div className="jp-SAGE2-serverButtons">
          <button className="jp-SAGE2-serverButtonEdit jp-SAGE2-button" onClick={edit}>
            Edit
          </button>
          <button className="jp-SAGE2-serverButtonRemove jp-SAGE2-button" onClick={remove}>
            Remove
          </button>
        </div>
          <Log items={this._log}></Log>
          <ServerInfo version={this._serverInformation.version}></ServerInfo>
      </div>
    );
  } 

  // construct vdom VirtualElement for editable server -- contains input fields for name/address
  private editableServer(): React.ReactElement<any> {
    // wrap this.saveEdits in lambda
    let save = () => this.saveEdits();

    let that = this;
    let nameChange = function (event: React.FormEvent<HTMLInputElement>) {
      that._name = (event.target as any).value;
      that._update();
    }

    let urlChange = function (event: React.FormEvent<HTMLInputElement>) {
      that._url = (event.target as any).value;
      that._update();
    }
    
    return (
      <div className="jp-SAGE2-serverConnection">
        <label>Server Name: <input onInput={nameChange} value={this._name}></input></label>
        <label>Address: <input onInput={urlChange} value={this._url}></input></label>
        <div className="jp-SAGE2-serverButtons">
          <button className="jp-SAGE2-serverButtonEdit jp-SAGE2-button" onClick={save}>
            Save
          </button>
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

  // check if the cell id exists within the connection (as a receiver of changes)
  public isCellRegistered(id : string) {
    return this._registeredCells[id];
  }

  // id = code cell ID, signal is object to connect/disconnect to/from
  public setCellRegistered(id: string, signal: any, mime: string) {
    this._registeredCells[id] = signal;

    this._wsio.emit('startJupyterSharing', {
      id: `${this._id}~${id}`,
      title: "jupyter",
      color: "green",
      src: "raw", type: mime, encoding: "base64",
      width: 600, height: 600
    });
  }

  // accesors to set functions for remove, update, favoriting (plugin-wide behavior)
  public onremove(delegate : DisposableDelegate) {
    this._remove = delegate;
  }

  public onupdate(vdomUpdate: Function) {
    this._update = vdomUpdate;
  }

  public onfavorite(favoriteUpdate: Function) {
    this._favorite = favoriteUpdate.bind(this);
  }

  public isfavorite(checkFavorite: Function) {
    this._isFavorite = checkFavorite.bind(this);
  }

  // send cell data to SAGE2 through websocket
  public sendCellData(data: any, mime: string, title: string, cellID: string) {
    let that = this;

    if (mime.indexOf("image") >= 0) {
      let base64 = `data:${mime};base64,` + data;
      
      // create image to get correct size
      var i = new Image();
      i.onload = function () {
        let imageToSend = {
          src: base64,
          sender: window.location.href,
          title,
          url: window.location.href,
          mime,
          width: i.width,
          height: i.height
        };
        
        console.log(imageToSend);
        
        that._wsio.emit('updateJupyterSharing', {
          id: `${that._id}~${cellID}`,
          src: base64,
          width: i.width,
          height: i.height,
          title,
          // cellId: cellId
        });

        // that._wsio.emit("loadImageFromBuffer", imageToSend);
      };
      
      i.src = base64; 
    }

    // maybe transition to using existing JupyterSharing messages (this would have Jupyter app already to use for content)
  }

  // send notebook data to SAGE2 through http POST
  public sendNotebook(file: File, title: string) {
    var formdata = new FormData();
    formdata.append("file0", file);
    formdata.append("dropX", "0");
    formdata.append("dropY", "0");
    formdata.append("open", "true");

    formdata.append("SAGE2_ptrName", localStorage.SAGE2_ptrName);
    formdata.append("SAGE2_ptrColor", localStorage.SAGE2_ptrColor);

    var sendFile = new XMLHttpRequest();
    // add the request into the array
    // build the URL
    var server = 'https://' + this._serverInformation.config.host + ':' + this._serverInformation.config.secure_port;
    server += '/upload';
    sendFile.open("POST", server, true);
    (sendFile.upload as any).id = "file0";
    // sendFile.upload.addEventListener('progress', function(ev) {
    //   console.log(ev);
    // }, false);
    sendFile.addEventListener('load', function(ev) {
      console.log(this.response);
    }, false);

    sendFile.send(formdata);
  }

  private startEditing() {
    this._editing = true;

    // reset websocket
    if (this._wsio) {
      this._wsio.close();
      this._wsio = null;
    }

    // reset registered update cells
    for (let cell of this._registeredCells) {
      cell.disconnect();
    }
    this._registeredCells = {};

    // clear log
    this.clearLog();

    // unfavorite
    this._favorite(false);

    // update widget render
    this._update();
  }

  private saveEdits() {
    this._editing = false;
    // ensure correct URL formatting
    this._url = this._url.indexOf("http://") || this._url.indexOf("https://") ? this._url : "http://" + this._url;

    let that = this;

    this._wsio = new WebsocketIO(this._url.replace("http", "ws"));
    this._wsio.logger = this.log.bind(this); // pass logging method for methods into WebsocketIO
    
    // reinitialize server information object
    this._serverInformation = {};

    // open connection to server
    this._wsio.open(function() {
      // initialize listeners for incoming information from server
      that.setupListeners();

      // Special Jupyter Client
      var clientDescription = {
          clientType: "jupyter",
          requests: {
            config: true,
            version: true,
            time: false,
            console: false
          }
        };

        // add client and request file listing
        that._wsio.emit('addClient', clientDescription);
        that._wsio.emit('requestStoredFiles');
    });
    
    // update UI
    this._update();
  }

  // prepare event listeners for information to get sent to client (files, config, etc)
  private setupListeners() {
    let that = this;

    this._wsio.on('initialize', function (data: any) {
      that._id = data.UID;
      that._connected = true;

      that._update();
      // that.startConnection();
    });

    this._wsio.on('close', function (data: any) {
      that._connected = false;

      that._update();
    });

    // setup other listener types

    // Server sends the SAGE2 version
    this._wsio.on('setupSAGE2Version', function (data : any) {
      that._serverInformation.version = data;
      console.log('SAGE2: version', data.base, data.branch, data.commit, data.date);

      // redraw with info of Version
      that._update();
    });

    this._wsio.on('setupDisplayConfiguration', function (config: any) {
      that._serverInformation.config = config;
      console.log(config);
    });

    this._wsio.on('storedFileList', function (data : any) {
      console.log(data);
    });

    this._wsio.on('jupyterShareTerminated', function (data: any) {
      let idPieces = data.id.split("~");
      console.log(data.id, idPieces)
      console.log(that._id, that._registeredCells);

      // message from server on application close of Jupyter Window
      if (that._id === idPieces[0] && that._registeredCells[idPieces[1]]) {
        that._registeredCells[idPieces[1]].disconnect();
        delete that._registeredCells[idPieces[1]];
      }
    });
  }

  // log function to pass into websocket
  private log(event: Array<string>) {
    this._log.unshift(event);

    // update UI on new log item
    this._update();
  }

  // remove all log elements
  private clearLog() {
    this._log = [];

    this._update();
  }

  // general server info
  private _name : string = "SAGE2 Server";
  private _url : string = "http://sage2.server.address.com";
  private _id : string = null;
  private _serverInformation: any = {};

  // connection information
  private _wsio : WebsocketIO = null;
  private _connected: boolean = false;

  // updating cell list (auto send new output)
  private _registeredCells: any = {};

  // websocket event log
  private _log : Array<Array<string>> = [];

  // state variable for if the server is being edited
  private _editing: boolean = true;
  
  // functions passed in for plugin-wide behavior
  private _remove: DisposableDelegate;
  private _update: Function;
  private _favorite: Function;
  private _isFavorite: Function;
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