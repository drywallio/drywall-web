## Deploying to Heroku

### Buildpacks

Heroku uses buildpacks to configure the application environment. Use [heroku-buildpack-multi](https://github.com/ddollar/heroku-buildpack-multi) to load the buildpacks listed in `.buildpacks`.

Use the `heroku` command line interface to configure your app.

```bash
heroku config:set BUILDPACK_URL=https://github.com/ddollar/heroku-buildpack-multi --app APPNAME
```
