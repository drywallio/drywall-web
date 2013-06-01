# Drywall Web

## Building the App

1. Install [Node.js & NPM](http://nodejs.org/)
1. Install [Grunt.js](https://github.com/gruntjs/grunt/wiki/Getting-started)
1. Install [PhantomJS](http://phantomjs.org/) and [CasperJS](http://casperjs.org/)
1. Run `npm install` to fetch all dependencies.
1. Run `npm test` to check the code.
1. Run `grunt` to build a production version of the app.
1. *(Optional)* Run `grunt dev` to enable file change monitoring and automatic rebuilding.

## Local Deployment

For local develpoment, add the following entries to your `hosts` file.

	# Lin: /etc/hosts
	# Mac: /etc/hosts
	# Win: %SYSTEMROOT%\system32\drivers\etc\hosts

	127.0.0.1   drywall.localhost
	127.0.0.1   dev.drywall.localhost

## Webserver Configuration

The built app serves out of the `./publish` directory. For debugging purposes, a non-optimised build can be served from the `./source` root directory. The `./intermediate` directory is used only during the build process and should not be accessed from a browser.

To provide client-side URL routing, the webserver serves `index.html`, a minimal app loader, for any missing file.

Assets such as images and fonts are revisioned by renaming them based on a file content hash. Cache expiration in production should be set to forever. In the development build asset revving is not applied, so caching is disabled to make testing easier.

##### Nginx

	# Development environment
	server {
		listen 80;
		server_name dev.drywall.localhost;
		root /var/www/drywall-web/source;
		index index.html;
		# Disable caching in development
		add_header Cache-Control 'no-cache';
		location / {
			# Forward missing files to the client-side router
			try_files $uri $uri/ /index.html;
		}
	}

	# Production environment
	server {
		listen 80;
		server_name drywall.localhost;
		root /var/www/drywall-web/publish;
		index index.html;
		# Revved assets can be cached forever
		location ~ ^/(styles|fonts|img|js)/ { expires max; }
		location / {
			# Forward missing files to the client-side router
			try_files $uri $uri/ /index.html;
			# Browser should not check for updates within a minute
			add_header Cache-Control 'max-age=60, must-revalidate';
		}
	}

##### Apache2

	NameVirtualHost *

	# Development environment
	<VirtualHost *:80>
	DocumentRoot /var/www/drywall-web/source
	ServerName dev.drywall.localhost
	RewriteEngine On
	RewriteCond %{REQUEST_URI} !^\/(styles|fonts|img|js|templates|(.+\.))(.*)
	RewriteRule ^\/(.*)$ \/index.html [L]
	RewriteLog "/var/log/apache2/rewrite_log"
	RewriteLogLevel 3
	ExpiresDefault A0
	Header set Cache-Control "no-cache, no-store, must-revalidate, max-age=0, proxy-revalidate"
	Header set Pragma "no-cache"
	</VirtualHost>

	# Production environment
	<VirtualHost *:80>
	DocumentRoot /var/www/drywall-web/publish
	ServerName drywall.localhost
	RewriteEngine On
	RewriteCond %{REQUEST_URI} !^\/(styles|fonts|img|js|(.+\.))(.*)
	RewriteRule ^\/(.*)$ \/index.html [L]
	<FilesMatch "^\/(styles|fonts|img|js)\/">
	Header set Cache-Control "max-age=31556926"
	</FilesMatch>
	</VirtualHost>

## Development Guidelines

- Use [EditorConfig](http://editorconfig.org/) if supported by your favourite code editor.
- Sublime Text [project settings](http://www.sublimetext.com/docs/2/projects.html) are included.
- Run `npm test` to sanity check the code.
- Open <http://drywall.localhost/> (production) or <http://dev.drywall.localhost/> (development)
- Run `grunt dev` to automatically rebuild the app on any changes to the code, styles, or assets.

## Dependencies

- [Backbone.js](http://backbonejs.org/)
- [LayoutManager](http://www.layoutmanager.org/)
- [Grunt](http://www.gruntjs.com/)
- [Handlebars](http://handlebarsjs.com/)
- [jQuery](http://jquery.com/)
- [npm](https://npmjs.org/)
- [RequireJS](http://requirejs.org/)
- [Underscore](http://underscorejs.org/)
