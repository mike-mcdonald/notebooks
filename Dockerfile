FROM jupyter/scipy-notebook:41e066e5caa8
COPY requirements.txt /tmp
RUN conda install --yes --file /tmp/requirements.txt && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER