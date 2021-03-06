# Tap Tap Pew Pew

A space shooter game made for the [Over The Air 2013](http://overtheair.org/) hackathon.

Deployed to http://taktran.github.io/ttpp/

Website built using [generator-starttter](https://github.com/taktran/generator-starttter).

## Development

Install npm packages

    npm install

Start the server

    grunt

View the site at [http://localhost:7770](http://localhost:7770), or your local (internal) ip address (useful for testing on other devices). You can also run

    grunt open

To run the site on another port, use the `port` flag eg,

    grunt --port=3000

To run the site using a different livereload port (default is `35729`), use the `lrp` flag (prevents this error: `Fatal error: Port 35729 is already in use by another process.`) eg,

    grunt --lrp=35720

## Testing

Uses [karma](http://karma-runner.github.io/) and [jasmine](http://jasmine.github.io/).

Karma is run automatically when `grunt` is called. To run it manually

    karma start config/karma.conf.js

## Deployment

The production site is on github pages at: http://taktran.github.io/ttpp/. To deploy, you need access to the repository, then

1. Make `_site` folder if not already created
2. Clone the `gh-pages` branch in `_sites`
3. Run `grunt deploy` (copies everything from `app/public` to `_site` folder, and pushes to github)
4. It should be viewable at http://taktran.github.io/ttpp/

## Authors

* [Mark Durrant](https://twitter.com/M6_D6)
* [Tak Tran](http://tutaktran.com)
