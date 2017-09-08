import {
  JupyterLabPlugin
} from '@jupyterlab/application';

import '../style/index.css';

/**
 * Initialization data for the jupyterlab_sage2 extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab_sage2',
  autoStart: true,
  activate: (app) => {
    console.log('JupyterLab extension jupyterlab_sage2 is activated!');
  }
};

export default extension;
