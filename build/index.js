import express from 'express';
import streamRouter from './modules/routes/routes.torrent.js';
import contentRouter from './modules/routes/routes.content.js';
import videoRouter from './modules/routes/routes.video.js';
import dbInit from './modules/db/init.js';
dbInit();
const app = express();
const port = 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
app.use('/stream', streamRouter);
app.use('/content', contentRouter);
app.use('/video', videoRouter);
//# sourceMappingURL=index.js.map