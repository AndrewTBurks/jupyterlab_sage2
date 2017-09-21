import '../style/index.css';

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
  Session
} from '@jupyterlab/services';

import {
  Menu//, Widget
} from '@phosphor/widgets';

import {
  // JSONExt
} from '@phosphor/coreutils';

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
  const createNew = "sage2:create-new";

  export
  const serverConnect = 'sage2:server-connect';

  export
  const serverDisconnect = 'sage2:server-disconnect';

  export
  const serverSend = 'sage2:server-send';
};

function activateSAGE2Plugin(app: JupyterLab, mainMenu: IMainMenu, restorer: ILayoutRestorer, launcher: ILauncher | null) : ISAGE2Tracker {

  const { commands } = app;
  // const category = "SAGE2";
  const namespace = 'sage2';
  const tracker = new InstanceTracker<SAGE2>({ namespace });

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
    return commands.execute('sage2:create-new', {})
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

  addCommands(app, tracker);

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

export
  function addCommands(app: JupyterLab, tracker: InstanceTracker<SAGE2>) {
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
  commands.addCommand(CommandIDs.createNew, {
    label: 'New SAGE2 Window',
    caption: 'Start a new SAGE2 Connection',
    execute: args => {
      console.log ("Start new SAGE2 Window");

      // let name = args['name'] as string;
      let sage2 = new SAGE2();
      // sage2.id = "sage2-" + _SAGE2Instances++;
      sage2.title.closable = true;
      sage2.title.icon = "jp-SAGE2favicon";
      sage2.title.label = 'SAGE2';

      
      // tracker.add(sage2);
      shell.addToMainArea(sage2);
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
      return showDialog({
        title: 'Connect to SAGE2',
        body: `What server do you want to connect to?`,
        buttons: [Dialog.cancelButton(), Dialog.warnButton()]
      }).then(result => {
        if (result.button.accept) {
          console.log("Connect");
          return;
        } else {
          console.log("Cancel")
          return;
        }
      });
    },
    isEnabled: hasWidget
  });
}


export default extension;
