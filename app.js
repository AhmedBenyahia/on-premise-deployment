const logger = require('morgan');
const express = require('express');
const router = express.Router();
const app = express();
const debug = require('debug')('on-premise-deployment:server');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/",router);


/* POST webhook. */
router.post('/', async (req, res, next) => {
    debug(req.body)
    res.send("OK");
});

module.exports = app;
