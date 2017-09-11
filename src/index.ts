import '../style/index.css';

import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  Dialog, showDialog, /*ICommandPalette,*/ IMainMenu, IInstanceTracker
} from '@jupyterlab/apputils'

import {
  ILauncher
} from '@jupyterlab/launcher';

import {
  Token
} from '@phosphor/coreutils';

import {
  Menu//, Widget
} from '@phosphor/widgets';

import {
  SAGE2
} from './widget';

export
interface ISAGE2Tracker extends IInstanceTracker<SAGE2> {};

export
const ITerminalTracker = new Token<ISAGE2Tracker>('jupyter.services.terminal-tracker');


/**
 * Initialization data for the jupyterlab_sage2 extension.
 */
const SAGE2: JupyterLabPlugin<ISAGE2Tracker> = {
  id: 'jupyterlab_sage2',
  autoStart: true,
  requires: [],
  provides: InstanceTracker,
  optional: [
    ILauncher,
    IMainMenu
  ],
  activate: activateSAGE2Plugin
};

namespace CommandIDs {
  export
  const serverConnect = 'sage2:server-connect';

  export
  const serverDisconnect = 'sage2:server-disconnect';

  export
  const serverSend = 'sage2:server-send';
};


function activateSAGE2Plugin(app : JupyterLab, launcher : ILauncher | null, mainMenu : IMainMenu) : ISAGE2Tracker {

  const { commands } = app;


  console.log("SAGE2 Loaded!");
  console.log("Commands:", commands.listCommands());

  // The launcher callback.
  let callback = (cwd: string, name: string) => {
    return commands.execute(
      'sage2:server-connect', { }
    )
    // .then(model => {
    //   return commands.execute('docmanager:open', {
    //     path: model.path
    //   });
    // });
  };

  if (launcher) {
    launcher.add({
      displayName: "SAGE2",
      category: 'Other',
      name,
      iconClass: 'jp-SAGE2Icon',
      callback,
      rank: 0
    });
  }

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
    isEnabled: function() { return true; }
  });

  commands.addCommand(CommandIDs.serverConnect, {
    label: 'Connect to SAGE2 Server',
    execute: args => {
      return showDialog({
        title: 'Connect to SAGE2',
        body: `What server do you want to connect to?`,
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
    isEnabled: function () { return true; }
  });

  mainMenu.addMenu(createMenu(app), { rank: 20 });

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
  connection.title.label = 'Settings';
  connection.addItem({ command: CommandIDs.serverConnect });
  connection.addItem({ command: CommandIDs.serverDisconnect });

  menu.addItem({ command: CommandIDs.serverSend });
  menu.addItem({ type: 'separator' });
  menu.addItem({ type: 'submenu', submenu: connection });

  return menu;
}


export default extension;
