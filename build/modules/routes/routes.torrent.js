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
import WebTorrent from "webtorrent";
import Video from "../db/models/video.js";
const router = Router();
export const client = new WebTorrent();
let state = {
    progress: 0,
    downloadSpeed: 0,
    ratio: 0,
    uploadSpeed: 0
};
export const torrentOptions = {
    announce: ['http://localhost:3002/announce'],
};
let error;
client.on('error', (err) => {
    console.log(err);
    error = err;
});
client.on('torrent', (torrent) => {
    state = {
        progress: Math.round(client.progress * 100 * 100) / 100,
        downloadSpeed: client.downloadSpeed,
        ratio: client.ratio,
        uploadSpeed: client.uploadSpeed
    };
});
export function new_torrent_seed(filename, buffer, video) {
    const torrentOpt = {
        name: filename,
        announce: torrentOptions.announce
    };
    client.seed(buffer, torrentOpt, (torrent) => __awaiter(this, void 0, void 0, function* () {
        console.log("============================= TORRENT SEED =============================");
        console.log("InfoHash " + torrent.infoHash);
        console.log("Name " + torrent.name);
        console.log("Magnet " + torrent.magnetURI);
        console.log("========================================================================");
        video.infoHash = torrent.infoHash;
        yield video.save();
    }));
}
export function all_torrent_seed() {
    return __awaiter(this, void 0, void 0, function* () {
        const videos = yield Video.findAll();
        for (var i = 0; i < videos.length; i++) {
            if (videos[i].file == null || videos[i].infoHash == null) {
                continue;
            }
            console.log(videos[i]);
            const torrentOpt = {
                name: videos[i].filename,
                announce: torrentOptions.announce
            };
            client.seed(videos[i].file, torrentOpt, (torrent) => __awaiter(this, void 0, void 0, function* () {
                console.log("Here we are");
                console.log("============================= TORRENT SEED =============================");
                console.log("InfoHash " + torrent.infoHash);
                console.log("Name " + torrent.name);
                console.log("Magnet " + torrent.magnetURI);
                console.log("========================================================================");
            }));
        }
    });
}
client.add("dffd65f4e0b862438dd014543834361f3799188e", torrentOptions, (torrent) => { });
router.get('/add/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const video_id = req.params.id;
    const video = yield Video.findByPk(video_id);
    if (video == null) {
        res.status(404).send("Video not found");
    }
    client.add(video === null || video === void 0 ? void 0 : video.infoHash, torrentOptions, (torrent) => {
        const files = torrent.files.map(data => ({
            name: data.name,
            length: data.length
        }));
        res.status(200).send(files);
    });
}));
export const addTorrent = (infoHash) => {
    return new Promise((resolve, reject) => {
        client.add(infoHash, torrentOptions, (torrent) => {
            console.log(torrent.infoHash);
        });
        console.log("hi");
        resolve('');
    });
};
const sendStats = (res) => {
    const state = {
        progress: Math.round(client.progress * 100 * 100) / 100,
        downloadSpeed: client.downloadSpeed,
        ratio: client.ratio,
        uploadSpeed: client.uploadSpeed
    };
    res.status(200).send(state);
};
router.get('/stats', (req, res) => {
    sendStats(res);
    const interval = setInterval(() => {
        sendStats(res);
    }, 1000);
    res.on('close', () => {
        clearInterval(interval);
    });
});
router.get('/:magnet/:filename', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { params: { magnet, filename }, headers: { range } } = req;
    console.log(magnet + " " + filename);
    if (!range) {
        const err = new Error("Range is not defined, please make request from HTML5 Player");
        err.status = 416;
        return next(err);
    }
    const torrentFile = yield client.get(magnet);
    let file = null;
    for (let i = 0; i < torrentFile.files.length; i++) {
        const currentTorrentPiece = torrentFile.files[i];
        if (currentTorrentPiece.name == filename) {
            file = currentTorrentPiece;
        }
    }
    if (file) {
        const [startParsed, endParsed] = range.replace(/bytes=/, '').split('-');
        const fileSize = file.length;
        const start = Number(startParsed);
        const end = endParsed ? Number(endParsed) : fileSize - 1;
        const chunkSize = end - start + 1;
        const headers = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4'
        };
        res.writeHead(206, headers);
        const streamPositions = {
            start,
            end
        };
        const stream = file.createReadStream(streamPositions);
        stream.pipe(res);
        stream.on('error', err => {
            return next(err);
        });
    }
}));
router.get('/', (req, res) => {
    res.status(200).send({
        hello: 'World'
    });
});
export default router;
//# sourceMappingURL=routes.torrent.js.map