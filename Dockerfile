FROM jupyter/datascience-notebook

MAINTAINER Andrew Burks <andrewtburks@gmail.com>

USER root
COPY . jupyterlab_sage2/
# RUN cd jupyterlab_sage2/; npm install --production; cd ..

RUN jupyter labextension install ./jupyterlab_sage2/
RUN rm -rf ./jupyterlab_sage2
USER $NB_USER