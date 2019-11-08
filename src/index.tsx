import {
  // @ts-ignore
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ILauncher
} from '@jupyterlab/launcher';


import {
  IMainMenu,
} from '@jupyterlab/mainmenu';

import {
  Menu,
  // Widget
} from "@phosphor/widgets";

import {
  DisposableDelegate
} from '@phosphor/disposable';

import {
  Dialog,
  showDialog,
  UseSignal,
} from "@jupyterlab/apputils";

import {
  NotebookPanel,
} from "@jupyterlab/notebook";


import {
  CodeCellModel,
  MarkdownCellModel
} from "@jupyterlab/cells";

import {
  ArrayExt
} from "@phosphor/algorithm";

import * as React from 'react';

import {
  ReactWidget
} from '@jupyterlab/apputils'

import { SAGE2 } from "./interface/widget";
import { ServerConnection } from "./interface/ui-elements";

import '../style/index.css';
import { Signal } from '@phosphor/signaling';


const _SAGE2_Connections = Array<ServerConnection>();
const ConnectionSignal = new Signal(_SAGE2_Connections);

let _SAGE2Instances = 0;

let fav_SAGE2: ServerConnection = null;

let triggerWidgetUpdate : Function | null = null;

let menu : Menu = null;

/**
 * Initialization data for the jupyterlab_sage extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'jupyterlab_sage2',
  requires: [
    IMainMenu
  ],
  optional: [
    ILauncher
  ],
  autoStart: true,
  activate: (app: JupyterFrontEnd, mainMenu: IMainMenu, launcher: ILauncher) => {
    console.log('JupyterLab extension jupyterlab_sage is activated!');

    menu = createMenu(app);
    mainMenu.addMenu(menu, { rank: 20 });

    addCommands(app, mainMenu);

    if (launcher) {
      launcher.add({
        command: 'sage2:open-widget',
        category: 'Other',
        rank: 0
      });
    }
  }
};

/**
 * Creates a menu for the SAGE2 Extension.
 */
function createMenu(app: JupyterFrontEnd): Menu {
  let { commands } = app;
  let menu = new Menu({ commands: commands });

  menu.title.label = 'SAGE2';
  menu.addItem({ command: CommandIDs.openWidget });

  menu.addItem({ type: 'separator' });

  menu.addItem({ command: CommandIDs.sendNotebookCellFav });
  menu.addItem({ command: CommandIDs.sendNotebookFav });
  
  menu.addItem({ type: 'separator' });
  
  menu.addItem({ command: CommandIDs.sendNotebookCell });
  menu.addItem({ command: CommandIDs.sendNotebook });

  menu.addItem({ type: 'separator' });
  menu.addItem({ command: CommandIDs.subscribeNotebook });

  return menu;
}

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

  export
  const subscribeNotebook = 'sage2:subscribe-notebook';
};

// similar render priority, specifying the ranking of types which can be handled by SAGE2
const supportedCellOutputs = [
  // "application/vnd.vega.v2+json",
  // "application/vnd.vegalite.v1+json",
  // "application/pdf", // pdfViewer
  // "image/svg+xml", // imageViewer
  "image/png",
  "image/jpeg",
  "image/gif",
  // "text/html", // webview
  // "text/markdown",
  // "text/latex",
  // "text/javascript",
  // "application/javascript",
  // "text/plain" // notepad
];

function addCommands(
  app: JupyterFrontEnd, 
  mainMenu: IMainMenu, 
  // tracker: InstanceTracker<SAGE2>
  ) {
  let { commands, shell } = app;

  
  /**
   * Whether there is an active sage2.
   */
  function hasWidget(): boolean {
    return false;
    // return tracker.currentWidget !== null;
  }


  /**
   * Whether there is at least 1 SAGE2 connection.
   */
  function hasSAGE2(): boolean {
    return _SAGE2_Connections.filter(connection => connection._connected).length > 0;
  }

  /**
   * Whether there is a favorited SAGE2 server.
   */
  function hasFavoriteSAGE2(): boolean {
    return fav_SAGE2 !== null;
  }

  /**
   * Whether there is an active notebook.
   */
  function hasNotebookToSend(): boolean {
    return shell.currentWidget instanceof NotebookPanel;
  }

  /**
   * Whether there is an active notebook with a cell selected.
   */
  function hasCellToSend(): boolean {
    let hasDataToSend = false;
    let notebook = shell.currentWidget instanceof NotebookPanel ? (shell.currentWidget as NotebookPanel) : null;

    // console.log(notebook);

    if (notebook) {
      let selectedCell = null;
      selectedCell = notebook.content.activeCell as any;
      let outputs = selectedCell.model.outputs;

      // console.log(selectedCell, outputs);

      if (outputs && outputs.get(0)) {
        let outputData = outputs.get(0).data;
        // console.log(outputData);

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

  // Add sage2 commands.
  commands.addCommand(CommandIDs.openWidget, {
    label: "SAGE2 Portal",
    // name: "SAGE2",
    iconClass: "jp-SAGE2favicon",
    caption: "Open the SAGE2 Connection Panel",
    execute: args => {
      let sage2 = ReactWidget.create(
        <UseSignal signal={ConnectionSignal} initialArgs={_SAGE2_Connections}>
          {(_, connections: any) => (
            <SAGE2
              connections={connections}
              // setUpdater={(func: Function) => triggerWidgetUpdate = func}
              addServer={() => {
                commands.execute(CommandIDs.serverConnect, {});
              }}
            />
          )}
        </UseSignal>
      );

      // TODO: work to change to open widget if there is a SAGE2 widget
      // if (!tracker.currentWidget) {
      //   let sage2 = new SAGE2();

      // } else {
      //   tracker.has(SAGE2)
      // }

      sage2.title.closable = true;
      sage2.title.icon = "jp-SAGE2favicon";
      sage2.title.label = "SAGE2";
      sage2.id = "jp-SAGE2-" + _SAGE2Instances++;

      shell.add(sage2);

      // shell.add(sage2);

      // add sage2 widget to the tracker
      // tracker.add(sage2).then(() => {
      //   // add tab to main area

      //   // switch to the tab
      //   shell.activateById(sage2.id);
      // });

      return sage2;
    }
  });

  commands.addCommand(CommandIDs.serverDisconnect, {
    label: "Disconnect from SAGE2 Server",
    execute: args => {
      console.log("Server Disconnect")
    },
    isEnabled: hasWidget
  });


  commands.addCommand(CommandIDs.serverConnect, {
    label: "Connect to SAGE2 Server",
    execute: args => {
      console.log("Connect to Server!");

      // console.log(CommandIDs.serverConnect, _SAGE2_Connections);

      let options: ServerConnection.IOptions = ServerConnection.defaultOptions;

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

      console.log("Updating Widget");
      updateWidget();
    },
    isEnabled: hasWidget
  });

  commands.addCommand(CommandIDs.sendNotebookCell, {
    label: "Send Cell to ...",
    execute: args => {
      return showDialog({
        title: "Send a JupyterNotebook to a SAGE2 Server",
        body: `Choose a server to send to: `,
        buttons: [
          // use spread operator to create buttos for all SAGE2 connections
          ..._SAGE2_Connections.map(connection =>
            Dialog.createButton({
              label: connection.name,
              caption: connection.url,
              className: "jp-SAGE2-dialogButton"
            })
          ),
          Dialog.cancelButton()
        ]
      }).then(result => {
        if (result.button.accept) {
          // get selected connection reference
          let index = ArrayExt.findFirstIndex(
            _SAGE2_Connections,
            conn => conn.url === result.button.caption
          );

          let connection = _SAGE2_Connections[index];

          sendCellTo(connection);
        } else {
          console.log("Cancel send operation");
          return;
        }
      });
    },
    isEnabled: () => {
      // return true;
      return hasSAGE2() && hasCellToSend();
    }
  });

  commands.addCommand(CommandIDs.sendNotebook, {
    label: "Send Notebook to ...",
    execute: args => {
      return showDialog({
        title: "Send a JupyterNotebook to a SAGE2 Server",
        body: `Choose a server to send to: `,
        buttons: [
          // use spread operator to create buttos for all SAGE2 connections
          ..._SAGE2_Connections.map(connection =>
            Dialog.createButton({
              label: connection.name,
              caption: connection.url,
              className: "jp-SAGE2-dialogButton"
            })
          ),
          Dialog.cancelButton()
        ]
      }).then(result => {
        if (result.button.accept) {
          // get selected connection reference
          let index = ArrayExt.findFirstIndex(
            _SAGE2_Connections,
            conn => conn.url === result.button.caption
          );

          let connection = _SAGE2_Connections[index];

          sendNotebookTo(connection);
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

  commands.addCommand(CommandIDs.sendNotebookCellFav, {
    label: "★ Send Cell",
    execute: args => {
      let connection = fav_SAGE2;

      sendCellTo(connection);
    },
    isEnabled: () => {
      // return true;
      return hasFavoriteSAGE2() && hasCellToSend();
    }
  });

  commands.addCommand(CommandIDs.sendNotebookFav, {
    label: "★ Send Notebook File",
    execute: args => {
      let connection = fav_SAGE2;
      
      sendNotebookTo(connection);
    },
    isEnabled: () => {
      return hasFavoriteSAGE2() && hasNotebookToSend();
    }
  });

  commands.addCommand(CommandIDs.subscribeNotebook, {
    label: "★ Send Notebook",
    execute: args => {
      let server = fav_SAGE2;

      return showDialog({
        title: "Share a Notebook Dynamically to a SAGE2 Server",
        body: `Choose content to send:`,
        buttons: [
          Dialog.createButton({
            label: "Code",
            caption: "Code Only",
            className: "jp-SAGE2-dialogButton"
          }),
          Dialog.createButton({
            label: "Code+MD",
            caption: "Code and MD",
            className: "jp-SAGE2-dialogButton"
          }),
          Dialog.cancelButton()
        ]
      }).then(result => {
        if (result.button.accept) {
          sendNotebookToDynamic(
            server,
            result.button.caption === "Code Only" ? false : true
          );
        } else {
          console.log("Cancel send operation");
          return;
        }
      });
    },
    isEnabled: () => {
      return hasFavoriteSAGE2() && hasNotebookToSend();
    }
  });

  function sendNotebookToDynamic(server: ServerConnection, show_markdown: boolean) {
    let notebook = shell.currentWidget as NotebookPanel;

    let kernel_id = notebook.session.kernel.id;
    let notebookJSON: any = notebook.model.toJSON();

    let notebookCells = notebook.model.cells;

    for (let i = 0; i < notebook.model.cells.length; i++) {
      let cell = notebookCells.get(i);
      let cellID = `${kernel_id}~${i}`;

      if (cell.type === "code") {
        let codeCell = cell as CodeCellModel;

        if (!server.isCellRegistered(cellID)) {
          server.setCellRegistered(
            cellID,
            codeCell.outputs.changed,
            {
              cell_type: cell.type, 
              path: notebook.context.path,
              kernel_id: notebook.session.kernel.id
            }
          );

          codeCell.outputs.changed.connect((sender, args) => {
            let toSend = {
              cell: codeCell.toJSON(),
              ind: i,
              kernel_id
            };

            server.updateDynamicNotebookCell(toSend);
          });
        }
        // 
      } else if (show_markdown && cell.type === "markdown") {
        let mdCell = cell as MarkdownCellModel;
        let sendTimeout = -1;

        if (!server.isCellRegistered(cellID)) {
          server.setCellRegistered(
            cellID,
            mdCell.contentChanged,
            {
              cell_type: cell.type, 
              path: notebook.context.path,
              kernel_id: notebook.session.kernel.id
            }
          );

          mdCell.contentChanged.connect((sender, args) => {
            // subscribe to markdown content changes (debounced)
            if (sendTimeout !== -1) {
              clearTimeout(sendTimeout);
            }

            sendTimeout = setTimeout(() => {
              let toSend = {
                cell: mdCell.toJSON(),
                ind: i,
                kernel_id
              };

              server.updateDynamicNotebookCell(toSend);

              // console.log("send md", toSend);
              sendTimeout = -1;
            }, 500);
          });
        }
      }
    }

    let infoToSend = {
      notebook: notebookJSON,
      show_markdown: show_markdown,
      kernel_id
    };

    server.sendNotebookDynamic(infoToSend);
  }

  function sendNotebookTo(server: ServerConnection) {
    // get notebook reference
    let notebookPanel = shell.currentWidget as any;

    console.log(
      "Send",
      notebookPanel.dataset,
      notebookPanel.context.path,
      notebookPanel.context
    );
    console.log("To", server);

    // load the notebook as File
    let getFile = new XMLHttpRequest();
    getFile.open("GET", "/files/" + notebookPanel.context.path, true);
    getFile.addEventListener(
      "load",
      function(e) {
        // send the notebook to favorite SAGE2 connection
        server.sendNotebook(
          new File([this.responseText], shell.currentWidget.title.label),
          shell.currentWidget.title.label
        );
      },
      false
    );
    getFile.send();

    return;
  }

  function sendCellTo(server: ServerConnection) {
    // get output data
    let notebook =
      shell.currentWidget instanceof NotebookPanel
        ? (shell.currentWidget as NotebookPanel).content
        : null;
    let codeCell = notebook.activeCell as any;
    let cellModel = codeCell.model;
    let outputArea = cellModel.outputs;
    let outputData = outputArea.get(0).data;

    let dataToSend = null;

    // get prioritized data to send by mime ranking
    for (let mime of supportedCellOutputs) {
      if (outputData[mime]) {
        // send data to connection if supported type

        // if the cell is not registered for updates, register it
        if (!server.isCellRegistered(cellModel.id)) {
          console.log("Register new Cell for updates", cellModel);

          server.setCellRegistered(
            cellModel.id,
            outputArea.changed,
            {
              path: (shell.currentWidget as NotebookPanel).context.path,
              kernel_id: (shell.currentWidget as NotebookPanel).session.kernel.id
            }
          );

          // update on cell change
          outputArea.changed.connect(
            function(outputAreaModel: any) {
              let newOutput = outputAreaModel.get(0);

              // console.log("CELL UPDATE:", newOutput);

              // send updated data to SAGE2
              if (newOutput && newOutput.data[mime]) {
                server.sendCellData(
                  newOutput.data[mime],
                  mime,
                  `${shell.currentWidget.title.label} [${
                    notebook.activeCellIndex + 1
                  }]`,
                  cellModel.id,
                  cellModel.value.text
                );
              }
            },
            server
          );
        }

        console.log("Send data of MIME", mime, "content");
        dataToSend = outputData[mime];
        server.sendCellData(
          dataToSend,
          mime,
          `${shell.currentWidget.title.label} [${
            notebook.activeCellIndex
          }]`,
          cellModel.id,
          cellModel.value.text
        );
        break;
      }
    }
  }
}

// function to update the SAGE2 widget
// -- passed to SAGE2 Connection
function updateWidget() {
  triggerWidgetUpdate && triggerWidgetUpdate(_SAGE2_Connections);
  // if (tracker.currentWidget) {
  //   tracker.currentWidget.update();
  // }

  ConnectionSignal.emit(_SAGE2_Connections);
}

// function to change the favorite server
// -- passed to SAGE2 Connection
function serverFavorited(this: ServerConnection, set: boolean) {
  if (set) {
    fav_SAGE2 = this;
  } else if (fav_SAGE2 === this) {
    fav_SAGE2 = null;
  }
}

// function to check the favorite server
// -- passed to SAGE2 Connection
function serverIsFavorite(this: ServerConnection) {
  return fav_SAGE2 === this;
}

export default extension;
