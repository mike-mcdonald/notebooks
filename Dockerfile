FROM jupyter/scipy-notebook
COPY requirements.txt /tmp
RUN conda install --yes --file /tmp/requirements.txt && \
    conda install --yes -c esri arcgis && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER