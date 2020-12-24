# cyber-security-base-mooc-2020-project

This is a course project for the Cyber Security Base MOOC 2020.

# Table of Contents

- [Installing & running](#installing---running)
  * [Option A) Run directly with node & npm](#option-a--run-directly-with-node---npm)
    + [Installing Node and NPM](#installing-node-and-npm)
      - [Install via package manager](#install-via-package-manager)
      - [Install via installer](#install-via-installer)
    + [Installing app dependencies](#installing-app-dependencies)
    + [Running](#running)
  * [Option B) Run with Docker](#option-b--run-with-docker)

# Installing & running

## Option A) Run directly with node & npm

This app requires node.js version >=11. If you already have node.js installed, run `node -v` to see which version you have.

If you don't have it installed already, install node version 12 or 14.

### Installing Node and NPM

#### Install via package manager

See https://nodejs.org/en/download/package-manager/

#### Install via installer

See https://nodejs.org/en/download/

After installing node, if you had a terminal open already, make sure you restart your terminal/console window (or editor if using integrated terminal) so that the PATH variable where your terminal searches for `node` is updated.

### Installing app dependencies

Once node and npm are installed (npm comes with node), `cd` into this directory and run `npm i`. This will install all required dependencies. If your node version is too old, you'll probably get an error regarding the sqlite3 dependency's native additions.

If the sqlite3 dependency's installation fails, ensure you have the *latest* node 12 or node 14. If it still doesn't work, try installing `libsqlite3` (`sudo apt-get install libsqlite3`), removing `node_modules/` and running `npm install --build-from-source`. Notes about that [here](https://www.npmjs.com/package/sqlite3#source-install).

If it still doesn't work, see section "Run with Docker".

### Running

After dependencies have been installed, run `npm start`. This will start the app at http://localhost:3000. If port 3000 is taken, change the port via environment variables by doing (on Linux or macOS):

```sh
APP_PORT=3001 npm start
```

or on Windows:

```sh
# cmd.exe:
set APP_PORT="3001"
# powershell:
$env:APP_PORT="3001"

npm start
```



See sample user credentials in `seeds/001-dummy-data.sql`.

## Option B) Run with Docker

1. [Get Docker](https://docs.docker.com/get-docker/)
2. Ensure docker is running
3. Run `sudo docker build . -t cybermooc-forum`
    - On Windows, `sudo` is not required
4. Run:
    ```
    sudo docker run --rm --init -it -p 3000:3000 cybermooc-forum
    ```
    - On Windows, `sudo` is not required
5. The app is now running at http://localhost:3000. If the port is not free and you get an error related to binding to a port, change the port e.g. `-p 5000:3000` to bind to port 5000.