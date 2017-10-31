# jupyterlab_sage2

A JupyterLab extension to integrate SAGE2 into the JupyterLab scientific workflow.

## Extension

This extension to JupyterLab allows a user to simultaneously connect to multiple SAGE2 servers and share JupyterLab content with SAGE2, including:
* Notebooks
* Notebook Cells (Images)

Notebooks are sent to SAGE2 and rendered using [nbviewer](http://nbviewer.jupyter.org/). Notebook cells are rendered as images and automatically updated when a cell is re-run.

### Prerequisites

* **JupyterLab**

### Installation

```bash
jupyter labextension install jupyterlab_sage2
```

### Development

For a development install (requires `npm` version 4 or later), do the following in the repository directory:

```bash
npm install
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

## Docker

To try JupyterLab with SAGE2, use the `sage2/jupyterlab-datascience-notebook` Docker image. This image is built `FROM` the `jupyter/datascience-notebook` and includes Python 3, R, and Julia as well as a variety of data science packages. 

### To install:
```
docker pull sage2/jupyterlab-datascience-notebook
```

### To run:
```
docker run -it --rm -p 8888:8888 sage2/jupyterlab-datascience-notebook start.sh jupyter lab
```

For more information on the jupyter/datascience-notebook image, visit: https://github.com/jupyter/docker-stacks/tree/master/datascience-notebook

## Future Plans

In the future, we plan to support more content types and methods of sending data from JupyterLab to SAGE2, as well as implement a file browser for JupyterLab which allows access to SAGE2 files in the JupyterLab workspace.

## Issues and Contributing
Please direct any issues or bug reports to the repository's [Issues](https://github.com/AndrewTBurks/jupyterlab_sage2/issues).

If you would like to contribute, submit a [Pull Request](https://github.com/AndrewTBurks/jupyterlab_sage2/pulls).