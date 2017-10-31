FROM jupyter/datascience-notebook

MAINTAINER Andrew Burks <andrewtburks@gmail.com>

USER root
COPY . /tmp/jupyterlab_sage2/
RUN ls /tmp

RUN jupyter labextension install /tmp/jupyterlab_sage2/
# RUN rm -rf ./jupyterlab_sage2
USER $NB_USER