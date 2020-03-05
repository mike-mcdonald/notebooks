# Notebooks
A repository for documenting and testing processes used throughout PBOT for data management and analysis.  This is also a repository for testing and developing notebook containers that can be used by JupyterHub.
## Setup
In order to run many of the notebooks in this repository, you will need a large set of python modules.  For that reason, I've used Docker to encapsulate those requirements, starting from [Jupyter Stack's containers](https://jupyter-docker-stacks.readthedocs.io/en/latest/index.html).  The `Dockerfile` included in this repository sets up additional modules for working with geospatial data and OpenStreetMaps, and sets up ODBC packages for useing Microsoft SQL Server.
### Using the notebook containers
To initially build and run if there are no changes to the Dockerfile

    docker-compose up
To force a rebuild and start the notebook server:

    docker-compose up --build
To build the image without starting a container:

    docker-compose build
Once the container is running, the output will contain a link to the notebook server with the security token included in the URL.
## Noteable notebooks
All notebooks are within the `py` folder.  The following are descriptions of notebooks I'd like to direct specific attention to for viewers of this repository.
### [Portland_aggregated](./py/Portland_aggregated.ipynb)
A notebook describing a process for aggregating the city of Portland, Oregon to Voronoi polygons based on housing and employment data.  This is the process that the Portland Bureau of Transportation uses in its micromobility data collection to aggregate raw location data to protect privacy.