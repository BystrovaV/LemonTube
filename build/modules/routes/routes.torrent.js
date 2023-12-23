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
const router = Router();
export const client = new WebTorrent();
let state = {
    progress: 0,
    downloadSpeed: 0,
    ratio: 0,
    uploadSpeed: 0
};
export const torrentOptions = {
    announce: ['http://localhost:3002/announce']
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
export function new_torrent_seed(filename, buffer) {
    const torrentOpt = {
        name: filename,
        announce: torrentOptions.announce
    };
    var infoHash;
    client.seed(buffer, torrentOpt, (torrent) => {
        console.log("============================= TORRENT SEED =============================");
        console.log("InfoHash " + torrent.infoHash);
        console.log("Name " + torrent.name);
        console.log("Magnet " + torrent.magnetURI);
        console.log("========================================================================");
    });
}
router.get('/add/:magnet', (req, res) => {
    const magnet = req.params.magnet;
    client.add(magnet, torrentOptions, (torrent) => {
        const files = torrent.files.map(data => ({
            name: data.name,
            length: data.length
        }));
        res.status(200).send(files);
    });
});
router.get('/stats', (req, res) => {
    state = {
        progress: Math.round(client.progress * 100 * 100) / 100,
        downloadSpeed: client.downloadSpeed,
        ratio: client.ratio,
        uploadSpeed: client.uploadSpeed
    };
    res.status(200).send(state);
});
router.get('/:magnet/:filename', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { params: { magnet, filename }, headers: { range } } = req;
    if (!range) {
        const err = new Error("Range is not defined, please make request from HTML5 Player");
        err.status = 416;
        return next(err);
    }
    const torrentFile = yield client.get(magnet);
    let file = {};
    for (let i = 0; i < torrentFile.files.length; i++) {
        const currentTorrentPiece = torrentFile.files[i];
        if (currentTorrentPiece.name == filename) {
            file = currentTorrentPiece;
        }
    }
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
}));
router.get('/', (req, res) => {
    res.status(200).send({
        hello: 'World'
    });
});
export default router;
//# sourceMappingURL=routes.torrent.js.map