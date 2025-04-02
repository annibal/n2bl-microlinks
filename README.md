# MICROLINKS

Turns your **links** into **microlinks** !

**TODO**:
- [ ] Purchase a hosting plan
  - [ ] Deploy production app
    - [ ] Add the production preview app link here
- [x] Setup structure, dockers, bundlers etc
  - [ ] Ensure the functionality of the whole "microlinks" application
    - [ ] Do an pretty interface to drive the microlinks engine
  

## Prerequisites
- [Docker](https://docs.docker.com/compose/install/) & [Docker Compose](https://docs.docker.com/compose/install/);
- [Make](https://www.gnu.org/software/make/) (I'm hoping you're on an Unix environment, like a Mac, [WSL](https://learn.microsoft.com/en-us/windows/wsl/install), or any popular Linux distro);

## Quickstart
1. After having a copy of all these files in your environment, and having a terminal shell on the `microlinks` folder
2. Run `make install`
3. Run `make start-db`
4. Run `make start-server`
5. Open `http://localhost:3069/`

## Make Commands overview:
- `make start-db`: Starts an [PostgreSQL](https://neon.tech/postgresql/postgresql-getting-started) database, detached to prevent a flood of logs.
  > All db-related stuff lies in the `microlinks/database` folder
- `make stop-db`: Stops the aforementioned database service;
- `make db-wipe`: Truncate the database (must be running), keeps the tables and relations but removes all registered data;
- `make db-reset`: Completely destroys and recreates the database, fresh new;
- `make start-server`: Runs a [nodemon](https://github.com/remy/nodemon?tab=readme-ov-file#automatic-re-running) server, to provide a way to access the web interface on the browser, and also the routes that provide functionality.
  > All non-db related stuff are in the `microlinks/src` folder
- `make start-server-detached`: Same as `start-server` but doesn't dedicates the terminal for the application logs, instead hides them within docker's universe.
- `make stop`: Makes it stop.
- `make clean`: Clean up Docker resources
- `make install`: Setup the database and the server's dependencies, in their respective docker images. Also creates an `.env` for you, if there's none.