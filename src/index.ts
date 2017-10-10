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

namespace CommandIDs {
  export
  const openWidget = "sage2:open-widget";

  export
  const serverConnect = 'sage2:server-connect';

  export
  const serverDisconnect = 'sage2:server-disconnect';

  export
  const serverSend = 'sage2:server-send';
};

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
  // "application/vnd.jupyter.stdout",
  // "application/vnd.jupyter.stderr"
];

const _SAGE2_Connections = Array<ServerConnection>();
let tracker : InstanceTracker<SAGE2> = null;
let menu : Menu = null;

function activateSAGE2Plugin(app: JupyterLab, mainMenu: IMainMenu, restorer: ILayoutRestorer, launcher: ILauncher | null) : ISAGE2Tracker {

  const { commands } = app;
  // const category = "SAGE2";
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
    console.log(name);
    
    // return commands.execute('sage2:open-widget', { "connections": _SAGE2_Connections })
    return commands.execute(
      'sage2:open-widget', 
      {}
    );
  };

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

  addCommands(app, tracker, mainMenu);

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
  menu.addItem({ command: CommandIDs.serverConnect });
  menu.addItem({ command: CommandIDs.serverDisconnect });

  menu.addItem({ command: CommandIDs.serverSend });
  // menu.addItem({ type: 'separator' });
  // menu.addItem({ type: 'submenu', submenu: connection });

  // _SAGE2_Connections.forEach(server => {
  //   let item = connection.addItem({command: CommandIDs.serverSend, args: { url: server.url }});
  //   console.log(item);
  //   // item.label = server.name;
  // });

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

  // Add sage2 commands.
  commands.addCommand(CommandIDs.openWidget, {
    label: 'New SAGE2 Window',
    caption: 'Start a new SAGE2 Connection',
    execute: args => {
      console.log ("Start SAGE2 Widget");

      // let name = args['name'] as string;
      let sage2 = new SAGE2();
      // sage2.id = "sage2-" + _SAGE2Instances++;
      sage2.title.closable = true;
      sage2.title.icon = "jp-SAGE2favicon";
      sage2.title.label = 'SAGE2';

      sage2.getConnections = () => {
        return _SAGE2_Connections;
      };

      sage2.addServer = () => {
        commands.execute(CommandIDs.serverConnect, {});
      }
      
      tracker.add(sage2);

      // add tab to main area
      shell.addToMainArea(sage2);

      // switch to the tab
      shell.activateById(sage2.id);
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

      let newConnection = new ServerConnection(options);
      let delegate = new DisposableDelegate(() => {
        let ind = _SAGE2_Connections.indexOf(newConnection);
        _SAGE2_Connections.splice(ind, 1);

        updateWidget();
      });

      newConnection.onupdate(updateWidget);
      newConnection.onremove(delegate)

      _SAGE2_Connections.push(newConnection);

      if (tracker.currentWidget) {
        tracker.currentWidget.update();
      }

      // // remove old menu
      // menu.dispose();
      // // add new meny with new list of servers
      // menu = createMenu(app);
      // mainMenu.addMenu(menu, { rank: 20 });
      
    }
    // isEnabled: hasWidget
  });

  commands.addCommand(CommandIDs.serverSend, {
    label: 'Send Cell to SAGE2',
    execute: args => {
      return showDialog({
        title: 'Send Cell to a SAGE2 Server',
        body: `Choose a server to send to: `,
        buttons: [
          ..._SAGE2_Connections.map((connection) => Dialog.createButton({
            label: connection.name,
            caption: connection.url,
            className: "jp-SAGE2-dialogButton",
          })),
          Dialog.cancelButton()
        ]
      }).then(result => {
        if (result.button.accept) {
          let index = ArrayExt.findFirstIndex(_SAGE2_Connections, (conn) => conn.url === result.button.caption);
          let connection = _SAGE2_Connections[index];

          let notebook = (shell.currentWidget as NotebookPanel).notebook;
          let codeCell = (notebook.activeCell) as any;
          let cellModel = codeCell.model;
          let outputArea = cellModel.outputs;
          let outputData = outputArea.get(0).data;

          // console.log(codeCell, cellModel, outputArea);

          let dataToSend = null;

          for (let mime of supportedCellOutputs) {
            if (outputData[mime]) {
              // send data to connection if supported type

              // if the cell is not registered for updates, register it
              if (!connection.isCellRegistered(cellModel.id)) {
                console.log("Register new Cell for updates", cellModel.id);

                connection.setCellRegistered(cellModel.id, outputArea.changed, mime);
                
                // update on cell change -- TODO: MAKE SURE TO DISCONNECT ON APP CLOSE IN SAGE2
                // TODO: maybe move this into serverconnection
                outputArea.changed.connect(function (outputAreaModel: any) {
                  let newOutput = outputAreaModel.get(0);
  
                  if (newOutput && newOutput.data[mime]) {
                    this.sendData(newOutput.data[mime], mime, `${shell.currentWidget.title.label} [${notebook.activeCellIndex}]`, cellModel.id);
                  }  
                }, connection);
              }

              console.log("Send data of MIME", mime, "content");
              dataToSend = outputData[mime];
              connection.sendData(dataToSend, mime, `${shell.currentWidget.title.label} [${notebook.activeCellIndex}]`, cellModel.id);
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
      let hasDataToSend = false;
      let notebook = (shell.currentWidget instanceof NotebookPanel) ? shell.currentWidget as NotebookPanel : null;
      
      
      if (notebook) {
        let selectedCell = null;
        selectedCell = (shell.currentWidget as NotebookPanel).notebook.activeCell as any;
        let outputs = selectedCell.model.outputs

        if (outputs && outputs.get(0)) {
          let outputData = outputs.get(0).data;

          for (let mime of supportedCellOutputs) {
            if (outputData[mime]) {
              // console.log("Found data in cell for MIME", mime);
              hasDataToSend = true;
              break;
            }
          }
        }
      }

      // console.log((_SAGE2_Connections.length > 0), hasDataToSend);


      return (_SAGE2_Connections.length > 0) && hasDataToSend;
    }
  });
}

function updateWidget() {
  if (tracker.currentWidget) {
    tracker.currentWidget.update();
  }
}

export default extension;
