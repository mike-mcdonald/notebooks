FROM jupyter/datascience-notebook:ae5f7e104dd5

USER root

# Install Microsoft ODBC driver
RUN buildDeps="\
    gnupg2 \
    curl \
    " \
    && apt-get update \
    && apt-get install -y --no-install-recommends $buildDeps \
    && curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/ubuntu/16.04/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \ 
    && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql17 \
    && apt-get purge -y --auto-remove $buildDeps

USER jovyan

COPY requirements.txt /tmp
RUN conda install --yes --file /tmp/requirements.txt && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER