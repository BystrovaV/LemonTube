import { Router, Request, Response } from "express";
import multer from "multer";
import Video from "../db/models/video.js";
import ffmpeg from "fluent-ffmpeg";
import streamifier from 'streamifier';
import fs from 'fs';
import { new_torrent_seed } from './routes.torrent.js';
import { create } from "../db/repositories/video.repository.js";

const router = Router();

const storage = multer.memoryStorage(); // Важно! Мы хотим хранить файл в памяти
const upload = multer({ storage: storage });

router.post('', upload.single('file'), async (req: Request, res: Response) => {

  // console.log(req.body);
  // console.log(req.file);

  if (req.file == undefined) {
      res.status(500).send('Internal Server Error')
  } else {
      const {
          body: {video_name, video_description},
      } = req

      var videoInfo = await create(req.file, video_name, video_description)
      new_torrent_seed(req.file?.originalname, req.file.buffer, videoInfo)

      const screenshot = await generateScreenshot(req.file);
      videoInfo.thumbnail = screenshot.toString("base64");
      await videoInfo.save()

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

export default router
