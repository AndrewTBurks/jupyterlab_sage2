import { ServerConnection } from './interface/ui-elements';
import '../style/out/index.css';

import {
  JupyterLab, JupyterLabPlugin, ILayoutRestorer
} from '@jupyterlab/application';

import {
  Dialog, showDialog, /*ICommandPalette,*/ IMainMenu, InstanceTracker
} from '@jupyterlab/apputils'

import {
  ILauncher
} from '@jupyterlab/launcher';

import {
  // Notebook, 
  NotebookPanel
} from '@jupyterlab/notebook';

import {
  Session
} from '@jupyterlab/services';

import {
  Menu//, Widget
} from '@phosphor/widgets';

import {
  // JSONObject
} from '@phosphor/coreutils';

import {
  DisposableDelegate
} from '@phosphor/disposable';

import {
  ArrayExt
} from '@phosphor/algorithm';

import {
  SAGE2
} from './interface/widget';

import {
  ISAGE2Tracker
} from './tracker';

/**
 * Initialization data for the jupyterlab_sage2 extension.
 */
const extension: JupyterLabPlugin<ISAGE2Tracker> = {
  id: 'jupyterlab_sage2',
  autoStart: true,
  requires: [
    IMainMenu,
    ILayoutRestorer
  ],
  provides: ISAGE2Tracker,
  optional: [
    ILauncher
  ],
  activate: activateSAGE2Plugin
};

// namespace to organize command IDs
namespace CommandIDs {
  export
  const openWidget = "sage2:open-widget";

  export
  const serverConnect = 'sage2:server-connect';

  export
  const serverDisconnect = 'sage2:server-disconnect';

  export
  const sendNotebookCellFav = 'sage2:send-notebook-cell-fav';

  export
  const sendNotebookFav = 'sage2:send-notebook-fav';

  export
  const sendNotebookCell = 'sage2:send-notebook-cell';

  export
  const sendNotebook = 'sage2:send-notebook';
};

// similar render priority, specifying the ranking of types which can be handled by SAGE2
const supportedCellOutputs = [
  // "application/vnd.vega.v2+json",
  // "application/vnd.vegalite.v1+json",
  "application/pdf", // pdfViewer
  "image/svg+xml", // imageViewer
  "image/png",
  "image/jpeg",
  "image/gif",
  "text/html", // webview
  // "text/markdown",
  // "text/latex",
  // "text/javascript",
  // "application/javascript",
  "text/plain" // notepad
];

// Larger plugin-wide references
const _SAGE2_Connections = Array<ServerConnection>();
let fav_SAGE2 : ServerConnection = null;
let tracker : InstanceTracker<SAGE2> = null;
let menu : Menu = null;

// plugin init function
function activateSAGE2Plugin(app: JupyterLab, mainMenu: IMainMenu, restorer: ILayoutRestorer, /*docs: IDocumentManager,*/ launcher: ILauncher | null) : ISAGE2Tracker {

  const { commands } = app;
  const namespace = 'sage2';
  tracker = new InstanceTracker<SAGE2>({ namespace });

  Session.listRunning().then(sessionModels => {
    console.log(sessionModels);
  });

  console.log("SAGE2 Loaded!");
  console.log("Commands:", commands.listCommands());

  // restorer.restore(tracker, {
  //   command: CommandIDs.createNew,
  //   args: widget => ({ name: widget.session.name }),
  //   name: widget => widget.session && widget.session.name
  // });

  // The launcher callback.
  let callback = (cwd: string, name: string) => {
    console.log (cwd);
    console.log(name);
    
    // open the widget -- In command the state is restored
    return commands.execute(
      'sage2:open-widget', 
      {}
    );
  };

  // add SAGE2 plugin to the launcher
  if (launcher) {
    launcher.add({
      displayName: "SAGE2",
      category: 'Other',
      name: "SAGE2",
      iconClass: 'jp-SAGE2Icon',
      callback,
      rank: 0
    });
  }

  // add SAGE2 commands to JupyterLab
  addCommands(app, tracker, mainMenu);

  // create menu object
  menu = createMenu(app);
  mainMenu.addMenu(menu, { rank: 20 });

  return tracker;
}

/**
 * Creates a menu for the SAGE2 Extension.
 */
function createMenu(app: JupyterLab): Menu {
  let { commands } = app;
  let menu = new Menu({ commands });
  let connection = new Menu({ commands });

  menu.title.label = 'SAGE2';
  connection.title.label = 'Send to';
  menu.addItem({ command: CommandIDs.openWidget });

  menu.addItem({ type: 'separator' });

  menu.addItem({ command: CommandIDs.sendNotebookCellFav });
  menu.addItem({ command: CommandIDs.sendNotebookFav });
  
  menu.addItem({ type: 'separator' });
  
  menu.addItem({ command: CommandIDs.sendNotebookCell });
  menu.addItem({ command: CommandIDs.sendNotebook });

  return menu;
}

export
  function addCommands(app: JupyterLab, tracker: InstanceTracker<SAGE2>, mainMenu: IMainMenu) {
  let { commands, shell } = app;

  console.log(app.shell);
  console.log(tracker, tracker.currentWidget);

  /**
   * Whether there is an active sage2.
   */
  function hasWidget(): boolean {
    return tracker.currentWidget !== null;
  }

  /**
   * Whether there is at least 1 SAGE2 connection.
   */
  function hasSAGE2(): boolean {
    return (_SAGE2_Connections.length > 0);
  }

  /**
   * Whether there is a favorited SAGE2 server.
   */
  function hasFavoriteSAGE2(): boolean {
    return fav_SAGE2 !== null;
  }

  /**
   * Whether there is an active notebook with a cell selected.
   */
  function hasCellToSend(): boolean {
    let hasDataToSend = false;
    let notebook = (shell.currentWidget instanceof NotebookPanel) ? shell.currentWidget as NotebookPanel : null;


    if (notebook) {
      let selectedCell = null;
      selectedCell = (shell.currentWidget as NotebookPanel).notebook.activeCell as any;
      let outputs = selectedCell.model.outputs

      if (outputs && outputs.get(1)) {
        let outputData = outputs.get(1).data;

        for (let mime of supportedCellOutputs) {
          if (outputData[mime]) {
            // console.log("Found data in cell for MIME", mime);
            hasDataToSend = true;
            break;
          }
        }
      }
    }

    return hasDataToSend;
  }

  /**
   * Whether there is an active notebook.
   */
  function hasNotebookToSend(): boolean {
    return (shell.currentWidget instanceof NotebookPanel);
  }

  // Add sage2 commands.
  commands.addCommand(CommandIDs.openWidget, {
    label: 'Open SAGE2 Manager',
    caption: 'Open the SAGE2 Connection Panel',
    execute: args => {
      console.log ("Start SAGE2 Widget");

      // let name = args['name'] as string;
      let sage2 = new SAGE2();

      // TODO: work to change to open widget if there is a SAGE2 widget
      // if (!tracker.currentWidget) {
      //   let sage2 = new SAGE2();

      // } else {
      //   tracker.has(SAGE2)
      // }

      sage2.title.closable = true;
      sage2.title.icon = "jp-SAGE2favicon";
      sage2.title.label = 'SAGE2';

      // specify getConnections function based on connection set which is contained in plugin
      sage2.getConnections = () => {
        return _SAGE2_Connections;
      };

      // specify addServer function -- executes serverConnect command
      sage2.addServer = () => {
        commands.execute(CommandIDs.serverConnect, {});
      }
      
      // add sage2 widget to the tracker
      tracker.add(sage2).then(() => {
        // add tab to main area
        shell.addToMainArea(sage2);
  
        // switch to the tab
        shell.activateById(sage2.id);
      });

      return sage2;
    }
  });

  commands.addCommand(CommandIDs.serverDisconnect, {
    label: 'Disconnect from SAGE2 Server',
    execute: args => {
      return showDialog({
        title: 'Disconnect from SAGE2',
        body: `Do you want to disconnect from the server?`,
        buttons: [Dialog.cancelButton(), Dialog.warnButton()]
      }).then(result => {
        if (result.button.accept) {
          console.log("Disconnect");
          return;
        } else {
          console.log("Cancel")
          return;
        }
      });
    },
    isEnabled: hasWidget
  });

  commands.addCommand(CommandIDs.serverConnect, {
    label: 'Connect to SAGE2 Server',
    execute: args => {
      console.log(CommandIDs.serverConnect, _SAGE2_Connections);

      let options : ServerConnection.IOptions = ServerConnection.defaultOptions;

      // create new connection which can dispose of itself
      let newConnection = new ServerConnection(options);
      let delegate = new DisposableDelegate(() => {
        let ind = _SAGE2_Connections.indexOf(newConnection);
        _SAGE2_Connections.splice(ind, 1);

        updateWidget();

        // clear favorite if fav server is removed
        if (newConnection === fav_SAGE2) {
          fav_SAGE2 = null;
        }
      });

      // pass function references to the connection which act on plugin state
      newConnection.onupdate(updateWidget);
      newConnection.onremove(delegate);
      newConnection.onfavorite(serverFavorited);
      newConnection.isfavorite(serverIsFavorite);

      // set first server created to be the favorite by default
      if (_SAGE2_Connections.length === 0) {
        fav_SAGE2 = newConnection;
      }
      
      _SAGE2_Connections.push(newConnection);

      if (tracker.currentWidget) {
        tracker.currentWidget.update();
      }
    }
  });

  // send cell to any server
  commands.addCommand(CommandIDs.sendNotebookCell, {
    label: 'Send Cell to ...',
    execute: args => {
      return showDialog({
        title: 'Send Cell to a SAGE2 Server',
        body: `Choose a server to send to: `,
        buttons: [
          // use spread operator to create buttons for each SAGE2 connection
          ..._SAGE2_Connections.map((connection) => Dialog.createButton({
            label: connection.name,
            caption: connection.url,
            className: "jp-SAGE2-dialogButton",
          })),
          Dialog.cancelButton()
        ]
      }).then(result => {
        if (result.button.accept) {
          // get selected SAGE2 cell
          let index = ArrayExt.findFirstIndex(_SAGE2_Connections, (conn) => conn.url === result.button.caption);
          let connection = _SAGE2_Connections[index];

          // build reference to the data to be sent
          let notebook = (shell.currentWidget as NotebookPanel).notebook;
          let codeCell = (notebook.activeCell) as any;
          let cellModel = codeCell.model;
          let outputArea = cellModel.outputs;
          let outputData = outputArea.get(1).data;

          let dataToSend = null;

          // check mime tipe of data -- prioritizing the most highly ranked
          for (let mime of supportedCellOutputs) {
            if (outputData[mime]) {
              // send data to connection if supported type

              // if the cell is not registered for updates, register it
              if (!connection.isCellRegistered(cellModel.id)) {
                console.log("Register new Cell for updates", cellModel.id);

                // set as registered cell for onchange 
                connection.setCellRegistered(cellModel.id, outputArea.changed, mime);
                
                // update on cell change
                outputArea.changed.connect(function (outputAreaModel: any) {
                  let newOutput = outputAreaModel.get(1);
  
                  // send changed output to SAGE2
                  if (newOutput && newOutput.data[mime]) {
                    this.sendCellData(newOutput.data[mime], mime, `${shell.currentWidget.title.label} [${notebook.activeCellIndex}]`, cellModel.id);
                  }  
                }, connection);
              }

              // cell data send to chosen SAGE2 connection 
              console.log("Send data of MIME", mime, "content");
              dataToSend = outputData[mime];
              connection.sendCellData(dataToSend, mime, `${shell.currentWidget.title.label} [${notebook.activeCellIndex}]`, cellModel.id);
              break;
            }
          }

          return;
        } else {
          console.log("Cancel send operation");
          return;
        }
      });
    },
    isEnabled: () => {
      return hasSAGE2() && hasCellToSend();
    }
  });

  // send notebook to any server
  commands.addCommand(CommandIDs.sendNotebook, {
    label: "Send Notebook to ...",
    execute: args => {
      return showDialog({
        title: 'Send a JupyterNotebook to a SAGE2 Server',
        body: `Choose a server to send to: `,
        buttons: [
          // use spread operator to create buttos for all SAGE2 connections
          ..._SAGE2_Connections.map((connection) => Dialog.createButton({
            label: connection.name,
            caption: connection.url,
            className: "jp-SAGE2-dialogButton",
          })),
          Dialog.cancelButton()
        ]
      }).then(result => {
        if (result.button.accept) {
          // get selected connection reference
          let index = ArrayExt.findFirstIndex(_SAGE2_Connections, (conn) => conn.url === result.button.caption);
          let connection = _SAGE2_Connections[index];

          // get selected notebook
          let notebookPanel = shell.currentWidget as any;
          
          console.log("Send", notebookPanel.dataset, notebookPanel.context.path, notebookPanel.context);
          console.log("To", connection);

          // load the notebook file, then send to the selected connection
          let getFile = new XMLHttpRequest();
          getFile.open("GET", "/files/" + notebookPanel.context.path, true);
          getFile.addEventListener('load', function(e) {
            // send the notebook File to the SAGE2 connection
            connection.sendNotebook(new File([this.responseText], shell.currentWidget.title.label), shell.currentWidget.title.label);
          }, false);
          getFile.send();

          return;
        } else {
          console.log("Cancel send operation");
          return;
        }
      });
      },
      isEnabled: () => {
        return hasSAGE2() && hasNotebookToSend();
      }
    });

  // send a cell to a favorited notebook
  commands.addCommand(CommandIDs.sendNotebookCellFav, {
    label: 'Send Cell to Favorite',
    execute: args => {
      let connection = fav_SAGE2;

      // get output data
      let notebook = (shell.currentWidget as NotebookPanel).notebook;
      let codeCell = (notebook.activeCell) as any;
      let cellModel = codeCell.model;
      let outputArea = cellModel.outputs;
      let outputData = outputArea.get(1).data;

      let dataToSend = null;

      // get prioritized data to send by mime ranking
      for (let mime of supportedCellOutputs) {
        if (outputData[mime]) {
          // send data to connection if supported type

          // if the cell is not registered for updates, register it
          if (!connection.isCellRegistered(cellModel.id)) {
            console.log("Register new Cell for updates", cellModel.id);

            connection.setCellRegistered(cellModel.id, outputArea.changed, mime);

            // update on cell change
            outputArea.changed.connect(function (outputAreaModel: any) {
              let newOutput = outputAreaModel.get(1);

              // send updated data to SAGE2
              if (newOutput && newOutput.data[mime]) {
                this.sendCellData(newOutput.data[mime], mime, `${shell.currentWidget.title.label} [${notebook.activeCellIndex}]`, cellModel.id);
              }
            }, connection);
          }

          console.log("Send data of MIME", mime, "content");
          dataToSend = outputData[mime];
          connection.sendCellData(dataToSend, mime, `${shell.currentWidget.title.label} [${notebook.activeCellIndex}]`, cellModel.id);
          break;
        }
      }
    },
    isEnabled: () => {
      return hasFavoriteSAGE2() && hasCellToSend();
    }
  });

  // send notebook to favorited SAGE2 server
  commands.addCommand(CommandIDs.sendNotebookFav, {
    label: "Send Notebook to Favorite",
    execute: args => {
      let connection = fav_SAGE2;

      // get notebook reference
      let notebookPanel = shell.currentWidget as any;

      console.log("Send", notebookPanel.dataset, notebookPanel.context.path, notebookPanel.context);
      console.log("To", connection);

      // load the notebook as File
      let getFile = new XMLHttpRequest();
      getFile.open("GET", "/files/" + notebookPanel.context.path, true);
      getFile.addEventListener('load', function (e) {
        // send the notebook to favorite SAGE2 connection
        connection.sendNotebook(new File([this.responseText], shell.currentWidget.title.label), shell.currentWidget.title.label);
      }, false);
      getFile.send();

      return;
    },
    isEnabled: () => {
      return hasFavoriteSAGE2() && hasNotebookToSend();
    }
  });
}

// function to update the SAGE2 widget
// -- passed to SAGE2 Connection
function updateWidget() {
  if (tracker.currentWidget) {
    tracker.currentWidget.update();
  }
}

// function to change the favorite server
// -- passed to SAGE2 Connection
function serverFavorited(set: boolean) {
  if (set) {
    fav_SAGE2 = this;
  } else if (fav_SAGE2 === this) {
    fav_SAGE2 = null;
  }
}

// function to check the favorite server
// -- passed to SAGE2 Connection
function serverIsFavorite() {
  return fav_SAGE2 === this;
}

// export SAGE2 plugin
export default extension;
