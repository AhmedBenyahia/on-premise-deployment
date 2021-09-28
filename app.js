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
    shell.echo("######## Change dir to repository path ########")
    !shell.cd(config.get("repoPath")).code &&
    shell.echo("######## Pulling git repo for updates ########") &&
    !shell.exec('git pull').code &&
    // shell.echo("######## Running mvn clean install ########") &&
    // !shell.exec('mvn clean install -DskipTests').code &&
    shell.echo("######## Building the docker container ########") &&
    !shell.exec('docker build -t ltm-api:webhook .').code &&
    shell.echo("######## Starting the docker container ########") &&
    shell.exec('docker run -p 5005:5005 -p 3306:306 --name ltm-api ltm-api:webhook', {async:true});
}
// mvn -N io.takari:maven:wrapper


const stopAppServer = () => {
    shell.echo("######## Stop and Delete the old container ########")
    !shell.exec('docker stop ltm-api').code &&
    shell.exec('docker rm ltm-api')
}

const removeUnusedObject = () => {
    shell.exec("docker image prune -a -f")
    shell.exec("docker container prune -f")
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/",router);




/* POST webhook. */
router.post('/', async (req, res, next) => {
    debug(req.body);
    res.status(202).send("OK")
    stopAppServer()
    removeUnusedObject()
    runBuild()
});

module.exports = app;
