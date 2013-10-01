# Drywall Web

## The Build

1. Install [Node.js & NPM](http://nodejs.org/)
1. Install [Grunt.js](https://github.com/gruntjs/grunt/wiki/Getting-started)
1. Run `npm install` to fetch all dependencies.
1. Run `grunt` to build a production version of the app.

## Running the App

#### Development

1. Run `grunt dev`
1. Open <http://localhost:9000/>

#### Production

1. Run `grunt prod`
1. Open <http://localhost:9002/>

## Tests

1. Install [PhantomJS](http://phantomjs.org/) and [CasperJS](http://casperjs.org/)
1. Run `npm test`

## Optimizations

| Build step | Description | Development | Production |
| --- | --- |--- | --- |
| Watch | Auto-build on file changes | :white_check_mark: | :no_entry_sign: |
| JSHint | Coding style compliance | :white_check_mark: | :white_check_mark: |
| Stylus | Compile CSS | :white_check_mark: | :white_check_mark: |
| Handlebars | Compile templates | :no_entry_sign: | :white_check_mark: |
| HTML Minifier | Reduce HTML size | :no_entry_sign: | :white_check_mark: |
| RequireJS | Concatenate and minify Javascript | :no_entry_sign: | :white_check_mark: |
| JPEGtran & OptiPNG | Compress images | :no_entry_sign: | :white_check_mark: |
| Revving & Usemin | Cache busting for static assets | :no_entry_sign: | :white_check_mark: |

## Dependencies

- [Backbone.js](http://backbonejs.org/)
- [LayoutManager](http://www.layoutmanager.org/)
- [Grunt](http://www.gruntjs.com/)
- [Handlebars](http://handlebarsjs.com/)
- [jQuery](http://jquery.com/)
- [npm](https://npmjs.org/)
- [RequireJS](http://requirejs.org/)
- [Underscore](http://underscorejs.org/)

## Webserver Configuration

[Nginx](server/apache/server.conf)

[Apache2](server/apache/server.conf)
