FROM jupyter/datascience-notebook:ae5f7e104dd5

USER root

# Install Microsoft ODBC driver
RUN buildDeps="\
    gnupg2 \
    curl \
    " \
    && runDeps="\
    openssl1.0 \
    " \
    && apt-get update \
    && apt-get install -y --no-install-recommends $buildDeps $runDeps \
    && curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/ubuntu/18.04/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \ 
    && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql17 \
    && apt-get purge -y --auto-remove $buildDeps

USER jovyan

COPY requirements-conda.txt /tmp
COPY requirements-pip.txt /tmp
RUN conda install --yes --file /tmp/requirements-conda.txt && \
    pip install -r /tmp/requirements-pip.txt && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER
