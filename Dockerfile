FROM jupyter/datascience-notebook

LABEL maintainer="Andrew Burks <andrewtburks@gmail.com>"

USER root
COPY . /tmp/jupyterlab_sage2/

# force update JupyterLab, etc. to ^1.2.1 compatability
RUN conda install --quiet --yes \
  'jupyterlab=1.2.3' && \
  conda clean -tipsy && \
  jupyter labextension install /tmp/jupyterlab_sage2/ && \
  npm cache clean --force && \
  rm -rf $CONDA_DIR/share/jupyter/lab/staging && \
  rm -rf /home/$NB_USER/.cache/yarn && \
  fix-permissions $CONDA_DIR && \
  fix-permissions /home/$NB_USER

RUN jupyter lab --version
RUN jupyter labextension list
USER $NB_USER



