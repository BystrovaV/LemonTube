var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Router } from "express";
import multer from "multer";
import ffmpeg from "fluent-ffmpeg";
import streamifier from 'streamifier';
import fs from 'fs';
import { new_torrent_seed } from './routes.torrent.js';
import { createImage, createVideo, getVideoById } from "../db/repositories/video.repository.js";
import { Create, Note, Video } from "../activity/objects.js";
import { isAuthenticated } from "../middleware/passport.mw.js";
const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post('', upload.single('file'), isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (req.file == undefined) {
        res.status(500).send('Internal Server Error');
    }
    else {
        const { body: { video_name, video_description }, } = req;
        const videoInfo = yield createVideo(req.file, video_name, video_description, req.user.dataValues.id);
        new_torrent_seed((_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname, req.file.buffer, videoInfo);
        const screenshot = yield generateScreenshot(req.file);
        const image = yield createImage(screenshot.toString("base64"));
        if (image) {
            videoInfo.imageURL = image.uris.id;
            yield videoInfo.save();
        }
        const person = yield (videoInfo === null || videoInfo === void 0 ? void 0 : videoInfo.getPerson());
        const objVideo = new Video(undefined, {
            id: videoInfo.uris.id,
            name: videoInfo.name,
            description: videoInfo.description,
            infoHash: videoInfo.infoHash,
            filename: videoInfo.filename,
            format: videoInfo.format,
            thumbnail: videoInfo.imageURL
        });
        const audience = [];
        audience.push(person.uris().followers);
        const create = new Create(undefined, { to: audience, object: objVideo, actor: person.uris().id });
        console.log(create);
        yield fetch(person.uris().outbox, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(create.toJson())
        });
        res.redirect('../');
    }
}));
function generateScreenshot(file) {
    return new Promise((resolve, reject) => {
        const fileStream = streamifier.createReadStream(file.buffer);
        ffmpeg(fileStream)
            .screenshots({
            count: 1,
            timestamps: ['00:10'],
            folder: '/tmp',
            filename: 'screenshot.png',
        })
            .on('end', () => {
            const screenshotPath = '/tmp/screenshot.png';
            fs.readFile(screenshotPath, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
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
router.post('/:video_id/comment', isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const person = req.user;
    const video = yield getVideoById(req.params.video_id);
    if (!video) {
        return res.status(404).send("Video not found");
    }
    const content = req.body.content || 'Undefined';
    const note = new Note(undefined, { content: content, attachment: video.dataValues.ap_id });
    const create = new Create(undefined, {
        to: [video.dataValues.person.ap_id],
        object: note,
        actor: person.uris().id
    });
    console.log(create);
    yield fetch(person.uris().outbox, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(create.toJson())
    });
    res.status(201).send();
}));
export default router;
//# sourceMappingURL=routes.video.js.map