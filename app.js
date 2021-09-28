const logger = require('morgan');
const express = require('express');
const router = express.Router();
const app = express();
const debug = require('debug')('on-premise-deployment:server');
const shell = require('shelljs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/",router);


if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
}

// Copy files to release dir
shell.rm('-rf', 'out/Release');
shell.cp('-R', 'stuff/', 'out/Release');

// Replace macros in each .js file
shell.cd('lib');
shell.ls('*.js').forEach(function (file) {
    shell.sed('-i', 'v0.1.2', 'v0.1.2', file);

    shell.sed('-i', /.*REPLACE_LINE_WITH_MACRO.*\n/, shell.cat('macro.js'), file);
});
shell.cd('..');
/* POST webhook. */
router.post('/', async (req, res, next) => {
    debug(req.body)
    res.send("OK");
});

module.exports = app;
