# cyber-security-base-mooc-2020-project

This is a course project for the Cyber Security Base MOOC 2020.

# Table of Contents

- [Installing & running](#installing---running)
  * [Option A) Run directly with node & npm](#option-a-run-directly-with-node--npm)
    + [Installing Node and NPM](#installing-node-and-npm)
      - [Install via package manager](#install-via-package-manager)
      - [Install via installer](#install-via-installer)
    + [Installing app dependencies](#installing-app-dependencies)
    + [Running](#running)
  * [Option B) Run with Docker](#option-b-run-with-docker)
- [Report](#report)

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
5. The app is now running at http://localhost:3000. If the port is not free and you get an error related to binding to a port, change the port via the `-p` flag: e.g. `-p 5000:3000` to bind to port 5000.


# Report

LINK: https://github.com/cxcorp/cyber-course-project-2020
Installation instructions: Follow the instructions in README.md in the repository.

### FLAW 1: Broken authentication

#### Flaw description.
The application's authentication is broken in multiple ways.

1. The application does not apply a password-hashing function on the users' passwords before storing them in the database. As a result, users' passwords are stored in plain text. This amplifies the risks of database injection attacks, as attackers don't need to spend any time cracking the password hashes. This also allows for timing based attacks where the attacker can guess the password letter as a correct password will take longer to verify letter-by-letter than an incorrect password.

2. The application allows weak passwords. When registering, there are no length or complexity requirements on the passwords. Even if the passwords were hashed using an appropriate password-hashing function, this would mean that users could enter short passwords which take negligible time to crack.

3. The application does not protect against credential stuffing. When logging in, there is no rate limiting applied to the route handler. This means that an attacker could guess credentials using a list of usernames and passwords arbitrarily fast.

#### Suggestions for fixes.

1. Hash all user's passwords with bcrypt, scrypt or Argon2 before persisting them in the database. With bcrypt, use a large enough work factor. Benchmark the work factors on the server and choose a factor that takes more than 100ms to hash, up to as long as you're comfortable making the user wait for. The higher the work factor, the longer the hash takes to crack. To counter the timing attack, compare the hashes letter-by-letter, but don't return immediately after an invalid character is found. Use mature and tested cryptographic libraries.

2. Apply password requirements. The minimum length should be enforced to be no shorter than 8 characters, [as recommended by OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#implement-proper-password-strength-controls). The maximum length should be set to make sure that the password hash function does not truncate the password (e.g. bcrypt truncates inputs longer than 72 characters), and to deny the possibility for a Denial of Service attack with extremely large payloads.

3. Set up route limiting for the login route handler. Issue a temporary ban from login attempts if more than a few incorrect attempts have been made.

### FLAW 2: Broken Access Control

#### Flaw description.

The application provides a page for updating the user's username and password at the route `/profile/:uid`. However, the route handler does not apply access control restrictions on the route, meaning that any user can access and update another user's profile simply by changing the uid parameter in the URL. Combined with the fact that the passwords are stored in plain text, this results in any user being able to see and change any other users' passwords.

#### Suggestions for fixing.
Apply access control to the profile page's routes. Ensure that the user can only use his own information, by checking that the requested user ID matches that of the user.

### FLAW 3: Cross-Site Scripting (XSS)

#### Flaw description.

The thread reply text content is not HTML escaped before rendered. The template file `src/views/threads/index.handlebars` uses the `breaklines` helper function defined in `src/view-helpers.js` to change newlines ('\n') to HTML `<br>` elements. However, by using the Handlebars.SafeString class, the code instructs the template renderer to not escape any HTML. This means the reply field can be used to execute arbitrary JavaScript in users' browsers to, for example, steal credentials. Additionally, no `Content-Security-Policy` header is sent by the server, meaning that the scripts are executed freely by the browser.

#### Suggestions for fixing.

Before replacing the newlines in the `breaklines` function, HTML escape the input string with `Handlebars.Utils.escapeExpression()`. Send CSP headers with a mature, tested library such as [Helmet](https://helmetjs.github.io/), to deny any other scripts than from authorized sources.

### FLAW 4: Security Misconfiguration

#### Flaw description.

The application uses the `express-session` package for cookie-based session handling. However, the encryption key for the cookie is hardcoded to be the same key as in the package's sample code. This package is the de-facto session library for Express.js, and as such, the default key would be the first thing tried by an attacker. Additionally, the server tags setting is left enabled, meaning that the server sends the `X-Powered-By: Express` header. This allows an attacker to immediately identify the server and its defaults.

#### Suggestions for fixing.

Replace the hardcoded 'keyboard cat' encryption key constant to read the key from environmental variables, and make sure the application throws an error if a key is not specified. Users should randomly generate a longer, cryptographically secure key. Ensure that the application does not accept short (<8 characters), easily crackable encryption keys.

To disable the `X-Powered-By` header, apply `app.disable('x-powered-by')` when constructing the application instance. Alternatively, use a package designed to turn off insecure defaults and apply additional security headers such as [Helmet](https://helmetjs.github.io/).

### FLAW 5: Injection

#### Flaw description.

The login handler with which Passport.js has been configured contains an SQL injection vulnerability. Other areas of the codebase use the `SQL` tagged literals using the `sql-template-strings` library, which automatically converts the string interpolation into a parameterized query. However, in this case, the SQL tag has been forgotten, leading to SQL injection when finding the user who matches the given username.

#### Suggestions for fixing.

Add the `SQL` tag before the template literal. Consider not using `sql-template-strings` at all, as it is much harder to spot a missing `SQL` keyword in front of a template literal, than it is to notice that a query isn't parameterized using the traditional fashion of placing question marks and specifically passing the values as variable arguments.
