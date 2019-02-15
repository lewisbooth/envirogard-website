# Envirogard.co.uk Website
A full-stack NodeJS MVC application with custom CMS. 

Designed to sit behind an Nginx proxy which handles SSL and static files.

![Envirogard Website](https://s3.eu-west-2.amazonaws.com/p110/p110-media-website.jpg)

## Tech overview

#### Express
The core web server, route handler and backbone of the application.

#### MongoDB
Stores accounts and simple CMS data for products, categories and industry pages. Simple relational queries are used to attach products to subcategories and subcategories to categories in a tree structure.

#### Passport
Handles login sessions and secure password hashing.

#### Stylus
CSS preprocessor of choice, used with PostCSS for browser prefixing and minifying. Critical above-the-fold CSS is separated and inlined for faster page rendering.

#### Pug
HTML templating language of choice for rendering views and emails.

#### Gulp
Handles CSS and JS preprocessing. Uses a BrowserSync proxy to inject CSS changes, sync across devices and reload pages automatically.

#### Automatic backups
The database is backed up to AWS S3 every night, limited the most recent 30 backups. Backup limits and frequency are configurable.

#### Sitemap
The sitemap is generated by crawling the site when the server loads and is refreshed nightly (configurable) via cron. The XML file is placed into the public folder to be served statically.


## Getting Started

#### Environment variables
Create two files called `variables.env` and `variables.aws.json` in the root folder and enter the correct database/AWS information (see relevant `.example.env` files). Make sure to use a secure session key and secret. Changing the session variables will invalidate any current sessions and force users to re-login.

Set `NODE_ENV` to `development` or `production`. Production mode is much faster and caches Pug templates in memory, but isn't suitable for front-end development because the server must be restarted to load changes.

#### Starting the server
Run `npm install` to install the dependencies before running the server for the first time.

You'll need two terminal sessions for development.

Run `npm start` in the first session to start the Express server and `gulp` in the second session to start the front-end Gulp/BrowserSync scripts.

#### Deployment
Clone the repo and ensure NodeJS, MongoDB and npm dependencies are installed and securely configured on the web server. Use `helpers/mongo-backup.js` and `helpers/mongo-restore.js` to sync the database from local to production if needed.

Create `variables.env` and `variables.aws.json` in the project folder on the server as these aren't checked into version control (see Environment Variables section above). Ensure `NODE_ENV` is set to `production`.

Test the server with `nodemon start.js` and check for runtime errors.

Run `start.js` as a background process using a Node daemon like [Forever](https://www.npmjs.com/package/forever) or [PM2](https://www.npmjs.com/package/pm2). This will keep the app permanently running.

Set up Nginx or equivalent web server to listen for incoming requests on port 80/443. Configure it to handle SSL certificates and serve requests for static content directly, as it's more efficient than Express. Proxy any remaining requests to the app on port 8888. 