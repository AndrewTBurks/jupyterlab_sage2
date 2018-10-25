# jupyterlab_sage2

A JupyterLab extension integrating the Jupyter data science workflow with the SAGE2 collaborative system.


## Prerequisites

* JupyterLab

## Installation

```bash
jupyter labextension install jupyterlab_sage2
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
npm run build
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

