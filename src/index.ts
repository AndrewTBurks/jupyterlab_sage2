import {
  JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  ILauncher
} from '@jupyterlab/launcher';

/**
 * Initialization data for the jupyterlab_sage2 extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_sage2',
  autoStart: true,
  requires: [],
  optional: [
    ILauncher
  ],
  activate: activateSAGE2Plugin
};

function activateSAGE2Plugin(app : JupyterLab, launcher : ILauncher | null) {

  const { commands } = app;

  // The launcher callback.
  let callback = (cwd: string, name: string) => {
    return commands.execute(
      'docmanager:new-untitled', { path: cwd, type: 'notebook' }
    ).then(model => {
      return commands.execute('docmanager:open', {
        path: model.path
      });
    });
  };

  if (launcher) {
    launcher.add({
      displayName: "SAGE2",
      category: 'Other',
      name,
      iconClass: 'jp-NotebookRunningIcon',
      callback,
      rank: 0
    });
  }
}



export default extension;
