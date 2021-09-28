const logger = require('morgan');
const express = require('express');
const router = express.Router();
const app = express();
const debug = require('debug')('on-premise-deployment:server');
const shell = require('shelljs');
const config = require('config');

const runBuild = async () => {
    if (!shell.which('git')) {
        shell.echo('Sorry, this script requires git');
        shell.exit(1);
    }
    !shell.cd(config.get("repoPath")).code &&
    !shell.exec('git pull').code &&
    !shell.exec('mvn clean install -DskipTests').code &&
    !shell.exec('sudo docker build -t ltm-api:1.13 .').code &&
    shell.exec('sudo docker run -p 5005:5005 -p 3306:306 --name ltm-api ltm-api:1.13');
}

const stopAppServer = () => {
    !shell.exec('sudo docker stop ltm-api').code &&
    shell.exec('sudo docker rm ltm-api')
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/",router);




/* POST webhook. */
router.post('/', async (req, res, next) => {
    debug(req.body)
    stopAppServer()
    runBuild()
    res.send("OK");
});

module.exports = app;
