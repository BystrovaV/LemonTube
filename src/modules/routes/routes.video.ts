import { Router, Request, Response } from "express";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import streamifier from 'streamifier';
import fs from 'fs';
import { new_torrent_seed } from './routes.torrent.js';
import { createImage, createVideo, getVideoById } from "../db/repositories/video.repository.js";
import { Create, Note, Video } from "../activity/objects.js";
import { isAuthenticated } from "../middleware/passport.mw.js";
import { Person } from "../db/models/person.js";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('', upload.single('file'), isAuthenticated, async (req: Request, res: Response) => {
    if (req.file == undefined) {
        res.status(500).send('Internal Server Error')
    } else {
        const {
            body: {video_name, video_description},
        } = req

        const videoInfo = await createVideo(req.file, video_name, video_description, (<any>req).user.dataValues.id)
        const infoHash = new_torrent_seed(req.file?.originalname, req.file.buffer, videoInfo)

        const screenshot = await generateScreenshot(req.file);
        const image = await createImage(screenshot.toString("base64"));
        if (image) {
            videoInfo.imageURL = image.uris.id;
            await videoInfo.save()
        }

        const person = await videoInfo?.getPerson();

        const objVideo = new Video(undefined, {
            id: videoInfo.uris.id,
            name: videoInfo.name, 
            description: videoInfo.description,
            infoHash: infoHash,
            filename: videoInfo.filename,
            format: videoInfo.format,
            thumbnail: videoInfo.imageURL
        });

        const audience = [];
        audience.push(person.uris().followers);

        const create = new Create(undefined, { to: audience, object: objVideo, actor: person.uris().id });
        console.log(create);

        await fetch(person.uris().outbox, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(create.toJson())
        });

        res.redirect('../')
    }
})

function generateScreenshot(file: Express.Multer.File) {
    return new Promise<Buffer>((resolve, reject) => {
        const fileStream = streamifier.createReadStream(file.buffer);

        ffmpeg(fileStream)
            .screenshots({
                count: 1,
                timestamps: ['00:10'],
                folder: '/tmp',
                // size: '320x240',
                filename: 'screenshot.png',
            })
            .on('end', () => {
                const screenshotPath = '/tmp/screenshot.png';
                fs.readFile(screenshotPath, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        fs.unlinkSync(screenshotPath);
                        resolve(data);
                    }
                });
            })
            .on('error', (err) => {
                reject(err);
            });
  });
}

router.post('/:video_id/comment', isAuthenticated, async (req: Request, res: Response) => {
    const person = req.user as Person;
    const video = await getVideoById(req.params.video_id);
    if (!video) {
        return res.status(404).send("Video not found");
    }

    const content = req.body.content || 'Undefined';

    const note = new Note(undefined, {content: content, attachment: video.dataValues.ap_id});
    const create = new Create(undefined, { 
        to: [video.dataValues.person.ap_id], 
        object: note, 
        actor: person.uris().id
    });

    console.log(create);

    await fetch(person.uris().outbox, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(create.toJson())
    });
    res.status(201).send();
})

export default router
