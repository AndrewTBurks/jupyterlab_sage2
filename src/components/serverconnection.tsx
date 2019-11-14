import { DisposableDelegate } from '@phosphor/disposable/lib';

import * as React from 'react';

import WebsocketIO from '../websocket.io';

import { Log } from './log';
import { ServerInfo } from './server-info';

import {
  FaNetworkWired,
  FaInfoCircle,
  FaLink,
  FaTrash,
  FaEdit,
  FaShareSquare
} from 'react-icons/fa';

import {
  animated,
  useSpring,
} from 'react-spring';

import * as jp from "../../style/img/jupyter.png";
import * as s2 from "../../style/img/S2-512.png";
// import SAGE2Logo from "../../style/img/sage2a-green_final.svg"

let {
  // useState,
  useCallback,
  useRef,
} = React;

const NetworkWired = animated(FaNetworkWired);

export class ServerConnection {
  constructor(options : ServerConnection.IOptions) {
    // initialize url and name
    // make sure the url has http or https prepended -- TODO: check this code
    this._url = options.url.indexOf("http://") || options.url.indexOf("https://") ? options.url : "http://" + options.url;
    this._name = options.name ? options.name : "SAGE2 Server";

    this.EditableServer = this.EditableServer.bind(this);
    this.EstablishedServer = this.EstablishedServer.bind(this);
  }

  // create vdom.VirtualElement method creates an editable or established server based on _editing state
  static Element({
    connection,
    setModalContent
  }: { connection: ServerConnection, setModalContent: any }) : React.ReactElement<any> {
    let Card = connection._editing ? connection.EditableServer : connection.EstablishedServer;

    return <Card setModalContent={setModalContent}/>;
  }

  // construct vdom VirtualElement for an established server (no inputs)
  private EstablishedServer(props: any): React.ReactElement<any> {
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
    // let favicon: React.ReactElement<any> = this._isFavorite() ? (
    //   <i className="favServer fa fa-star fa-2x" aria-hidden="true" onClick={this._isFavorite ? unfavorite : favorite}></i>
    // ) : (
    //   <i className="favServer fa fa-star-o fa-2x" aria-hidden="true" onClick={favorite}></i>
    // );

    let serverName = useSpring({
      color: this._connected ? "#0EB87B" : "#B82D0E",
      backgroundColor: this._connected ? "#f0f0f0" : "#ffd6d6"
    })

    let s2Icon = useSpring({
      opacity: this._connected ? 1 : 0.25,
      from: {
        opacity: 0.25
      }
    });

    let s2Link = useSpring({
      strokeDashoffset: this._connected ? 0 : 100,
      stroke: this._connected ? "#0093B8" : "#B82D0E",
      from: { 
        strokeDashoffset: 100,
        stroke: "#B82D0E",
      }
    });

    let networkIcon = useSpring({
      fill: this._connected ? "#0093B8" : "#B82D0E",
      from: {
        fill: "#B82D0E",
      }
    }) as any;

    let favicon : React.ReactElement<any> = <i 
      className={`favServer fa fa-star ${this._isFavorite() ? 'favorite' : ''}`}
      aria-hidden="true"
      onClick={this._isFavorite() ? unfavorite : favorite}
    />;

    return (
      <div className={classNames}>
        <div className="jp-SAGE2-serverInfo">
          <animated.div className="jp-SAGE2-serverName" style={serverName}>
            {favicon}
            {this._name}
          </animated.div>
          <div className="jp-SAGE2-connectionVis">
            <div className="jp-SAGE2-connectionEndpoint">
              <img src={jp} alt="JupyterLab" />
            </div>
            <div className="jp-SAGE2-connectionVisLink">
              <svg className="jp-SAGE2-connectionLine" viewBox="0 0 100 100" preserveAspectRatio="none" shapeRendering="geometricPrecison">
                <animated.path 
                  d="M 5 50 L 95 50"
                  strokeDasharray="100% 100%"
                  style={{
                    ...s2Link,
                    strokeWidth: 4,
                    strokeLinecap: "round"
                  }}
                />
              </svg>
              <NetworkWired size="3em" color={networkIcon.fill}/>
            </div>
            <div className="jp-SAGE2-connectionEndpoint" style={{position: "relative"}}>
              <animated.img src={s2} alt="SAGE2" style={s2Icon}/>
              {(
                // true
                this._isConnecting
                && <div className="lds-ripple"><div></div><div></div></div>)
                || null
              }
            </div>
            {/* <SAGE2Logo /> */}
          </div>
          <div>
            <a
              // className="jp-SAGE2-buttonLink"
              style={{
                fontWeight: "bold"
              }}
              target="about:blank"
              href={this._url}>
                <FaLink color="#0093B8"/> {this._url}
            </a>
          </div>
          <div style={{color: "var(--sage2-gray-l10)"}}>
            <FaInfoCircle /> <ServerInfo version={this._serverInformation.version}/>
          </div>
        </div>
        <div className="jp-SAGE2-serverButtons" style={{ marginBottom: 5, marginTop: 5 }}>
          <button className="jp-SAGE2-serverButtonEdit jp-SAGE2-button" onClick={edit}>
            <FaEdit />{" "}
            <span style={{ display: "inline-block" }}>
              Edit
            </span>
          </button>
          <button className="jp-SAGE2-serverButtonRemove jp-SAGE2-button" onClick={remove}>
            <FaTrash />{" "}
            <span style={{ display: "inline-block" }}>
              Remove
            </span>
          </button>
        </div>
        <div className="jp-SAGE2-serverButtons" style={{ marginBottom: 5, marginTop: 5 }}>
          <button className="jp-SAGE2-serverButtonShared jp-SAGE2-button"
            // disabled={!Object.keys(this._registeredCells).length ? true : false}
            onClick={() => {
              props.setModalContent(this);
              // console.log(this._registeredCells);
            }}>
            <FaShareSquare />{" "}
            <span style={{ display: "inline-block" }}>
              Shared Content
            </span>
          </button>
        </div>
        <Log items={this._log}></Log>
      </div>
    );
  } 

  // construct vdom VirtualElement for editable server -- contains input fields for name/address
  private EditableServer(): React.ReactElement<any> {
    // wrap this.saveEdits in lambda
    let nameInput = useRef<any>();
    let urlInput = useRef<any>();

    let save = useCallback(() => {
      this.saveEdits(
        nameInput.current.value,
        urlInput.current.value)
    }, [nameInput.current, urlInput.current]);
    
    // let that = this;
    // let nameChange = function (event: React.FormEvent<HTMLInputElement>) {
    //   that._name = (event.target as any).value;
    //   that._update();
    // }

    // let urlChange = function (event: React.FormEvent<HTMLInputElement>) {
    //   that._url = (event.target as any).value;
    //   that._update();
    // }
    
    return <div className="jp-SAGE2-serverConnection">
        <span style={{color: "#666", margin: "15px 0 3px", display: "inline-block"}}>
          Connection Information
        </span>
        <div className="jp-SAGE2-inputField">
          <label>
            <span className="SAGE2-green-font" style={{fontWeight: "bold"}}>
              SAGE<span className="SAGE2-gray-font" >2</span>
            </span> Server Name <input ref={nameInput} defaultValue={this._name} />
          </label>
        </div>
        <div className="jp-SAGE2-inputField">
          <label>
            <span className="SAGE2-green-font" style={{fontWeight: "bold"}}>
              SAGE<span className="SAGE2-gray-font" >2</span>
            </span> URL <input className="SAGE2-url" ref={urlInput} defaultValue={this._url} />
          </label>
        </div>
        <div className="jp-SAGE2-serverButtons" style={{marginBottom: "5px"}}>
          <button className="jp-SAGE2-buttonAccept jp-SAGE2-button" onClick={save}>
            Save
          </button>
        </div>
      </div>;
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

  get id() {
    return this._id;
  }

  // check if the cell id exists within the connection (as a receiver of changes)
  public isCellRegistered(id : string) {
    return this._registeredCells[id];
  }

  // id = code cell ID, signal is object to connect/disconnect to/from
  public setCellRegistered(id: string, signal: any, info?: any) {
    this._registeredCells[id] = {
      signal,
      info
    };
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
  public sendCellData(data: any, mime: string, title: string, cellID: string, code: string) {
    let that = this;

    if (mime.indexOf("image") >= 0) {
      let base64 = `data:${mime};base64,` + data;
      
      // create image to get correct size
      var i = new Image();
      i.onload = function () {
        
        that._wsio.emit('updateJupyterSharing', {
          id: `${that._id}~${cellID}`,
          src: base64,
          mime,
          width: i.width,
          height: i.height,
          title,
          code
        });

        return {
          id: `${that._id}~${cellID}`,
          src: base64,
          width: i.width,
          height: i.height,
          title,
        };

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
    }, false);

    sendFile.send(formdata);
  }

  public sendNotebookDynamic(data: {
    notebook: any,
    show_markdown: boolean,
    kernel_id: string
  }) {
    // console.log("sendNotebookDynamic", data);

    this._wsio.emit("sendNotebookDynamic", data);
  }

  public updateDynamicNotebookCell(data: {
    cell: any,
    ind: number,
    kernel_id: string
  }) {
    // console.log("updateDynamicNotebookCell", data);

    this._wsio.emit("updateDynamicNotebookCell", data);
  }

  public stopSharingNotebookCells(cells: any[]) {
    this._wsio.emit("removeDynamicNotebookCells", {
      cells
    });
  }

  private startEditing() {
    this._editing = true;

    // update widget render
    this._update();
  }

  private saveEdits(name: string, url: string) {
    this._editing = false;

    let oldUrl = this._url;

    // ensure correct URL formatting
    this._name = name;
    this._url = url.indexOf("http://") || url.indexOf("https://") ? url : "http://" + url;

    // if it needs to be reset because url is new
    if (oldUrl !== this._url || !this._connected) {
      // reset websocket
      if (this._wsio) {
        this._wsio.close();
      }

      this._wsio = null;
      this._connected = false;
      this._isConnecting = true;
      
      // reset registered update cells
      for (let cellId of Object.keys(this._registeredCells)) {
        that._registeredCells[cellId]
          && that._registeredCells[cellId].disconnect
          && that._registeredCells[cellId].disconnect();
      }
      this._registeredCells = {};

      // clear log
      this.clearLog();

      // unfavorite
      this._favorite(false);

      let that = this;
  
      this._wsio = new WebsocketIO(this._url.replace("http", "ws"));
      this._wsio.logger = this.log.bind(this); // pass logging method for methods into WebsocketIO
      
      // reinitialize server information object
      this._serverInformation = {};
  
      // open connection to server
      this._wsio.open(function() {
        // that._isConnecting = true;
        // that._update();
  
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

    this._update();
  }

  // prepare event listeners for information to get sent to client (files, config, etc)
  private setupListeners() {
    let that = this;

    this._wsio.on('initialize', function (data: any) {
      that._id = data.UID;
      that._connected = true;
      that._isConnecting = false;

      that._update();
      // that.startConnection();
    });

    this._wsio.on('close', function (data: any) {
      that._connected = false;
      that._isConnecting = false;

      for (let cellId of Object.keys(that._registeredCells)) {
        that._registeredCells[cellId]
          && that._registeredCells[cellId].disconnect
          && that._registeredCells[cellId].disconnect();
      }
      that._registeredCells = {};

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

      // TODO: these two cases should be consolidated 
      if (that._id === idPieces[0] && that._registeredCells[idPieces[1]]) {
        // message from server on application close of Jupyter Single Cell
        that._registeredCells[idPieces[1]].signal.disconnect();
        delete that._registeredCells[idPieces[1]];
      } else if (that._registeredCells[data.id]) {
        // message from server on application close of Dynamic Notebook Cell
        that._registeredCells[data.id].signal.disconnect();
        delete that._registeredCells[data.id];
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
  public _isConnecting: boolean = false;
  public _connected: boolean = false;

  // updating cell list (auto send new output)
  private _registeredCells: any = {};

  // websocket event log
  private _log : Array<Array<string>> = [];

  // state variable for if the server is being edited
  public _editing: boolean = true;
  
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