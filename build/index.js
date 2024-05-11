import express from 'express';
import hbs from 'express-handlebars';
import handlebars from 'handlebars';
import streamRouter from './modules/routes/routes.torrent.js';
import contentRouter from './modules/routes/routes.content.js';
import videoRouter from './modules/routes/routes.video.js';
import personRouter from './modules/routes/routes.activity.js';
import followRouter from './modules/routes/routes.follow.js';
import authRouter from './modules/routes/routes.auth.js';
import likeRouter from './modules/routes/routes.like.js';
import dbInit from './modules/db/init.js';
import dotenv from "dotenv";
import session from "express-session";
import { initPassport } from './modules/middleware/passport.mw.js';
import moment from 'moment';
import { createClient } from "redis";
import RedisStore from 'connect-redis';
import cors from 'cors';
dbInit();
const app = express();
const port = 3000;
dotenv.config();
app.engine('hbs', hbs.engine({
    extname: 'hbs',
    defaultLayout: 'base',
    layoutsDir: 'src/views/layouts',
    partialsDir: [
        'src/views/partials',
    ],
}));
let redisClient = createClient();
redisClient.connect().catch(console.error);
let redisStore = new RedisStore({
    client: redisClient,
    prefix: "myapp:",
});
app.use(session({
    secret: 'This is a secret',
    resave: false,
    saveUninitialized: false,
    store: redisStore,
}));
initPassport(app);
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
handlebars.registerHelper('formatRelative', function (date, options) {
    const formattedDate = moment(date).fromNow();
    return options.fn(formattedDate);
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('src/public'));
app.set("view engine", "hbs");
app.set("views", "src/views");
app.use('/stream', streamRouter);
app.use('/', contentRouter);
app.use('/video', videoRouter);
app.use('/', followRouter);
app.use('/', likeRouter);
app.use('/', personRouter);
app.use('/auth', authRouter);
//# sourceMappingURL=index.js.map