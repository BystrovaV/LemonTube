import {Router, Request, Response} from "express";
import { UUID } from "crypto";
import { getAll, getById } from "../db/repositories/video.repository.js";
import { addTorrent } from "./routes.torrent.js";

const router = Router();

router.get('', async (_, res) => {
    const files = await getAll()

    res.render('main.hbs', {
        files: files
    })
})

router.get('/video/new', (_, res) => {
    res.render('video-form.hbs')
})

router.get('/video/:video_id', async (req: Request, res) => {
    const {
        params: {video_id},
    } = req

    const file = await getById(video_id);
    const files = await getAll();

    if (file?.file == null) {
        const addFile = await addTorrent(file?.infoHash!);
    }

    res.render('player.hbs', {
        file: file,
        files: files
    })
})

export default router
