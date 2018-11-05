FROM jupyter/datascience-notebook

MAINTAINER Andrew Burks <andrewtburks@gmail.com>

USER root
COPY . /tmp/jupyterlab_sage2/

# force update JupyterLab, etc. to ^0.35.0 compatability
RUN conda install --quiet --yes \
  # 'notebook=5.7.0' \
  # 'jupyterhub=0.9.4' \
  'jupyterlab=0.35.4' && \
  conda clean -tipsy && \
  jupyter labextension install @jupyterlab/hub-extension@^0.12.0 && \
  jupyter labextension install @jupyter-widgets/jupyterlab-manager@^0.38.0 && \
  jupyter labextension install /tmp/jupyterlab_sage2/ && \
  npm cache clean --force && \
  # jupyter notebook --generate-config && \
  rm -rf $CONDA_DIR/share/jupyter/lab/staging && \
  rm -rf /home/$NB_USER/.cache/yarn && \
  fix-permissions $CONDA_DIR && \
  fix-permissions /home/$NB_USER

RUN jupyter lab --version
RUN jupyter labextension list
USER $NB_USER



