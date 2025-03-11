require('./db/mongoose');

const express = require('express');
const cors = require('cors');

const userRouter = require('./routers/user');
const parksRouter = require('./routers/national-parks');
const campgroundsRouter = require('./routers/campgrounds');
const thingstodoRouter = require('./routers/things-to-do');

const app = express();
app.use(express.json());

app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use(userRouter);
app.use(parksRouter);
app.use(campgroundsRouter);
app.use(thingstodoRouter);

const port = process.env.PORT;
app.listen(port, () => {
    console.log('API service is up on port ' + port);
});