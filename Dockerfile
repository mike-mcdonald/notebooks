FROM jupyter/datascience-notebook:414b5d749704

USER root

# Use CoP certificates
COPY ./.certs /usr/local/share/ca-certificates/
RUN update-ca-certificates
ENV REQUESTS_CA_BUNDLE /etc/ssl/certs/ca-certificates.crt


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
    && curl https://packages.microsoft.com/config/ubuntu/16.04/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql17 \
    && apt-get purge -y --auto-remove $buildDeps

RUN conda config --remove channels defaults
COPY .condarc /home/$NB_USER
RUN chown $NB_USER:users /home/$NB_USER/.condarc

USER $NB_UID

RUN conda install -c conda-forge --override-channels --quiet --yes \
    'geopandas' \
    'geoplot' \
    'overpy' \
    'psycopg2' \
    'pyarrow' \
    'pyodbc' \
    # fixes segmentation fault when usin to_crs on GeoSeries
    'pyproj>2.3.1' \
    && \
    conda clean --all -f -y && \
    fix-permissions $CONDA_DIR && \
    fix-permissions /home/$NB_USER
