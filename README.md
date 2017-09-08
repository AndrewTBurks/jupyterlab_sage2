# jupyterlab_sage2

A JupyterLab extension to integrate JupyterLab and SAGE2 into one scientific workflow.


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
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

