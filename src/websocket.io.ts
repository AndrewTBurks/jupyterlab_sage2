// SAGE2 is available for use under the SAGE2 Software License
//
// University of Illinois at Chicago's Electronic Visualization Laboratory (EVL)
// and University of Hawai'i at Manoa's Laboratory for Advanced Visualization and
// Applications (LAVA)
//
// See full text, terms and conditions in the LICENSE.txt included file
//
// Copyright (c) 2014

"use strict";

/**
 * @module client
 * @submodule WebsocketIO
 */

interface WebSocketIO {
  url: string
  ws : any
  messages : any
  aliasCount: number
  remoteListeners: any
  localListeners: any
}

class WebSocketIO {
  constructor(url: string) {
    if (url !== undefined && url !== null) {
      this.url = url;
    } else {
      this.url = (window.location.protocol === "https:" ? "wss" : "ws") + "://" + window.location.host +
        "/" + window.location.pathname.split("/")[1];
    }

    /**
     * websocket object handling the communication with the server
     *
     * @property ws
     * @type WebSocket
     */
    this.ws = null;
    /**
     * list of messages to be handled (name + callback)
     *
     * @property messages
     * @type Object
     */
    this.messages = {};
    /**
     * number of aliases created for listeners
     *
     * @property aliasCount
     * @type Integer
     */
    this.aliasCount = 1;
    /**
     * list of listeners on other side of connection
     *
     * @property remoteListeners
     * @type Object
     */
    this.remoteListeners = {
      "#WSIO#addListener": "0000"
    };
    /**
     * list of local listeners on this side of connection
     *
     * @property localListeners
     * @type Object
     */
    this.localListeners = {
      "0000": "#WSIO#addListener"
    };
  }


  /**
   * Open a websocket
   *
   * @method open
   * @param callback {Function} function to be called when the socket is ready
   */
  public open(callback: Function) {
    var _this = this;

    console.log('WebsocketIO> open', this.url);
    this.ws = new WebSocket(this.url);
    this.ws.binaryType = "arraybuffer";
    this.ws.onopen = callback;

    // Handler when a message arrives
    this.ws.onmessage = function (message: any) {
      var fName;
      // text message
      if (typeof message.data === "string") {
        var msg = JSON.parse(message.data);
        fName = _this.localListeners[msg.f];
        if (fName === undefined) {
          console.log('WebsocketIO> No handler for message');
        }

        if (fName === "#WSIO#addListener") {
          _this.remoteListeners[msg.d.listener] = msg.d.alias;
          return;
        }
        _this.messages[fName](msg.d);
      } else {
        var uInt8 = new Uint8Array(message.data);
        var func = String.fromCharCode(uInt8[0]) +
          String.fromCharCode(uInt8[1]) +
          String.fromCharCode(uInt8[2]) +
          String.fromCharCode(uInt8[3]);
        fName = _this.localListeners[func];
        var buffer = uInt8.subarray(4, uInt8.length);
        _this.messages[fName](buffer);
      }


      if (_this._logger) {
        _this._logger(["Recv", fName]);
      }
    };
    // triggered by unexpected close event
    this.ws.onclose = function (evt: Event) {
      if (_this._logger) {
        _this._logger(["Recv", "Close"]);
      }

      console.log("WebsocketIO> socket closed");
      
      if ('close' in _this.messages) {
        _this.messages.close(evt);
      }
    };
  };

  /**
   * Set a message handler for a given name
   *
   * @method on
   * @param name {String} name for the handler
   * @param callback {Function} handler to be called for a given name
   */
  public on(name: any, callback: Function) {
    var alias = ("0000" + this.aliasCount.toString(16)).substr(-4);
    this.localListeners[alias] = name;
    this.messages[name] = callback;
    this.aliasCount++;
    if (name === "close") {
      return;
    }
    this.emit('#WSIO#addListener', {
      listener: name,
      alias: alias
    });
  };

  /**
   * Send a message with a given name and payload (format> f:name d:payload)
   *
   * @method emit
   * @param name {String} name of the message (i.e. RPC)
   * @param data {Object} data to be sent with the message
   */
  public emit(name: any, data: any, attempts: number = 16) {
    if (name === null || name === "") {
      console.log("Error: no message name specified");
      return;
    }

    var _this = this;
    var message;
    var alias = this.remoteListeners[name];
    if (alias === undefined) {
      if (attempts === undefined) {
        attempts = 16;
      }
      if (attempts >= 0) {
        setTimeout(function () {
          _this.emit(name, data, attempts - 1);
        }, 4);
      } else {
        console.log("Warning: not sending message, recipient has no listener (" + name + ")");
      }
      return;
    }

    if (this._logger) {
      this._logger(["Send", name]);
    }

    // send binary data as array buffer
    if (data instanceof Uint8Array) {
      // build an array with the name of the function
      var funcName = new Uint8Array(4);
      funcName[0] = alias.charCodeAt(0);
      funcName[1] = alias.charCodeAt(1);
      funcName[2] = alias.charCodeAt(2);
      funcName[3] = alias.charCodeAt(3);
      message = new Uint8Array(4 + data.length);
      // copy the name of the function first
      message.set(funcName, 0);
      // then copy the payload
      message.set(data, 4);
      // send the message using websocket
      this.ws.send(message.buffer);
    } else {
      // send data as JSON string
      message = {
        f: alias,
        d: data
      };
      this.ws.send(JSON.stringify(message));
    }
  };

  /**
   * Deliberate close function
   *
   * @method close
   */
  public close() {
    // disable onclose handler first
    this.ws.onclose = function () {};
    // log close
    console.log("WebsocketIO> socket closed"); 

    if (this._logger) {
      this._logger(["Send", "Close"]);
    }
    
    // then close
    this.ws.close();
  };

  set logger(logFunction : Function) {
    this._logger = logFunction;
  }

  private _logger : Function = null;
}

export default WebSocketIO;