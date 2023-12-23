import express, { Application } from 'express'
import hbs from 'express-handlebars'
import streamRouter from './modules/routes/routes.torrent.js'
import contentRouter from './modules/routes/routes.content.js'
import videoRouter from './modules/routes/routes.video.js'
import dbInit from './modules/db/init.js'

dbInit()

const app: Application = express()
const port = 3000

app.engine('hbs', hbs.engine({
    extname: 'hbs', 
    defaultLayout: 'base', 
    layoutsDir: 'src/views/layouts',
    partialsDir  : [
        //  path to your partials
        'src/views/partials',
    ]
}));

app.listen(port, ():void => {
    console.log(`Listening on port ${port}`)
})

app.use(express.static('src/public'));
app.set("view engine", "hbs");
app.set("views", "src/views");
// hbs.registerPartials("src/views/partials");

app.use('/stream', streamRouter)
app.use('/', contentRouter)
app.use('/video', videoRouter)
