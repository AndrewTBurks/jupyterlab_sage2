# jupyterlab_sage2

A JupyterLab extension to integrate JupyterLab and SAGE2 into one scientific workflow.


## Prerequisites

* JupyterLab

## Installation

```bash
git clone git://github.com/AndrewTBurks/jupyterlab_sage2.git
cd jupyterlab_sage2
npm install
jupyter labextension install .
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

