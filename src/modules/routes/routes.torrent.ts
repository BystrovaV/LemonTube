import { Router, Request, Response, NextFunction } from "express"
import WebTorrent, { Torrent } from "webtorrent"
import Video from "../db/models/video.js";

const router = Router();
export const client = new WebTorrent();

let state = {
    progress: 0,
    downloadSpeed: 0,
    ratio: 0,
    uploadSpeed: 0
}

export const torrentOptions = {
    announce: [process.env.TRACKER_URL!],
    path: "/tmp/webtorrent"
}

let error;

client.on('error', (err: string | Error) => {
    console.log(err)
    error = err
})

client.on('torrent', (torrent: Torrent) => {
    state = {
        progress: Math.round(client.progress * 100 * 100) / 100,
        downloadSpeed: client.downloadSpeed,
        ratio: client.ratio,
        uploadSpeed: client.uploadSpeed
    }
})

export async function new_torrent_seed(filename: string, buffer: Buffer, video: Video) {
    const torrentOpt = {
        name: filename,
        announce: torrentOptions.announce
    }

    const infoHash = await client.seed(buffer, torrentOpt, async (torrent) => {
        console.log("============================= TORRENT SEED =============================")
        console.log("InfoHash " + torrent.infoHash)
        console.log("Name " + torrent.name)
        console.log("Magnet " + torrent.magnetURI)
        console.log("========================================================================")

        video.infoHash = torrent.infoHash;
        await video.save();
        return torrent.infoHash;
    })

    return infoHash;
}

all_torrent_seed();
export async function all_torrent_seed() {
    const videos = await Video.findAll()

    for (var i = 0; i < videos.length; i++) {
        if (videos[i].file == null || videos[i].infoHash == null) {
            continue;
        }

        console.log(videos[i]);

        const torrentOpt = {
            name: videos[i].filename,
            announce: torrentOptions.announce
        }

        client.seed(videos[i].file, torrentOpt, async (torrent) => {
            console.log("Here we are")
            console.log("============================= TORRENT SEED =============================")
            console.log("InfoHash " + torrent.infoHash)
            console.log("Name " + torrent.name)
            console.log("Magnet " + torrent.magnetURI)
            console.log("========================================================================")
        })
    }

}

router.get('/add/:id', async (req: Request, res: Response) => {
    const video_id = req.params.id

    const video = await Video.findByPk(video_id);
    if (video == null) {
        res.status(404).send("Video not found");
    }

    client.add(video?.infoHash, torrentOptions, (torrent) => {
        const files = torrent.files.map(data => ({
            name: data.name,
            length: data.length
        }))

        res.status(200).send(files)
    })
})

export const addTorrent = (infoHash: string) => {
    return new Promise((resolve, reject) => {
        client.add(infoHash, torrentOptions, (torrent) => {
            console.log(torrent.infoHash);

            const files = torrent.files;
            let length = files.length;
            console.log("Number of files: " + length);

            let interval = setInterval(() => {
                console.log("Progress: " + (torrent.progress * 100).toFixed()+"%");
            }, 5000);

            resolve('');
        })
    })
}

const sendStats = (res: Response) => {
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

interface ErrorWithStatus extends Error {
    status: number
}

router.get('/:magnet/:filename', async (req: Request, res: Response, next: NextFunction) => {

    const {
        params: { magnet, filename },
        headers: { range }
    } = req

    console.log(magnet + " " + filename);

    if (!range) {
        const err = new Error("Range is not defined, please make request from HTML5 Player") as ErrorWithStatus
        err.status = 416
        return next(err)
    }

    const torrentFile = await client.get(magnet) as Torrent

    let file = null

    if (torrentFile)
        for (let i = 0; i < torrentFile.files.length; i++) {
            const currentTorrentPiece = torrentFile.files[i]

            if (currentTorrentPiece.name == filename) {
                file = currentTorrentPiece
            }
        }

    if (file) {
        const [startParsed, endParsed] = range.replace(/bytes=/, '').split('-')
        const fileSize = file.length

        const start = Number(startParsed)
        const end = endParsed ? Number(endParsed) : fileSize - 1

        const chunkSize = end - start + 1

        const headers = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunkSize,
            'Content-Type': 'video/mp4'
        }

        res.writeHead(206, headers)

        const streamPositions = {
            start,
            end
        }

        const stream = file.createReadStream(streamPositions)
        stream.pipe(res)

        stream.on('error', err => {
            return next(err)
        })
    }
})

router.get('/', (req: Request, res: Response) => {
    res.status(200).send({
        hello: 'World'
    })
})

export default router