import {Router, Request} from "express";
import { findFollowingVideo, findLikedVideo, findMyVideo, findVideoByParam, getAll, getImage, getVideoById } from "../db/repositories/video.repository.js";
import { addTorrent } from "./routes.torrent.js";
import { isAuthenticated } from "../middleware/passport.mw.js";
import { Person } from "../db/models/person.js";
import { Note } from "../db/models/note.js";

const router = Router();

router.get('', isAuthenticated, async (req, res) => {
    console.log("in redirect");
    const files = await getAll()
    console.log(files);

    const person = req.user as Person;
    const following: Person[] = await person.getFollowing();
    const followingVideos = await findFollowingVideo(following);

    res.render('main.hbs', {
        user: (<any>req.user).username,
        files: files,
        followingVideos: followingVideos
    })
})

router.get('/video/new', (_, res) => {
    res.render('video-form.hbs')
})

router.get('/video/results', isAuthenticated, async (req: Request, res) => {
    const search = req.query.search as string;

    const video = await findVideoByParam(search);

    res.render('videos_vertical.hbs', {
        user: (<any>req.user).username,
        videos: video
    })
})

router.get('/video/:video_id', isAuthenticated, async (req: Request, res) => {
    const {
        params: {video_id},
    } = req

    const file = await getVideoById(video_id);
    if (!file)
        return res.status(404).send("Video not found");

    const files = await getAll();

    if (file.file == null) {
        console.log("Content add");
        console.log(file.dataValues.infoHash);
        await addTorrent(file.infoHash);
        console.log("here");
    }

    const user = req.user as Person;
    const following: Person[] = await user.getFollowing();
    let isFollowed = false;
    for (const f of following) {
        if (f.dataValues.id === file?.dataValues.person.id) {
            isFollowed = true;
        }
    }

    let isNotAuthor = true;
    if (file.dataValues.person.id == user.id)
        isNotAuthor = false;

    const likes = await file?.getLiked();
    let isLiked = false;
    console.log(likes);
    for (const l of likes) {
        if (l.dataValues.id === user.id) {
            isLiked = true;
        }
    }

    const comments = await Note.findAll({
        where: {
            VideoId: file.id
        },
        include: [{
            model: Person,
            attributes: ["id", "username"],
            as: 'person'
        }]
    })
    // const comments = await file.getComments();

    res.render('player.hbs', {
        user: (<any>req.user).username,
        isFollowed: isFollowed,
        isNotAuthor: isNotAuthor,
        followers: (await file?.dataValues.person.getFollowers()).length,
        file: file,
        files: files,
        likes: likes.length,
        isLiked: isLiked,
        comments: comments
    })
})

router.get('/images/:image_id', async (req: Request, res) => {
    const image = await getImage(req.params.image_id);
    if (image) {
        const imageDataBuffer = Buffer.from(image.payload, 'base64');
        res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': imageDataBuffer.length
        });
        return res.end(imageDataBuffer);
    }

    return res.status(404).send();
})

router.get('/:username/liked', isAuthenticated, async (req: Request, res) => {
    const {
        params: {username},
    } = req

    const user = req.user as Person;
    if (username != user.username) {
        return res.status(401).send();
    }
    const videos = await findLikedVideo(user);

    res.render('videos.hbs', {
        user: (<any>req.user).username,
        title: "My Liked Videos",
        videos: videos
    })
}) 

router.get('/:username/video', isAuthenticated, async (req: Request, res) => {
    const {
        params: {username},
    } = req

    const user = req.user as Person;
    if (username != user.username) {
        return res.status(401).send();
    }
    const videos = await findMyVideo(user);

    res.render('videos.hbs', {
        user: (<any>req.user).username,
        title: "My videos",
        videos: videos
    })
}) 

export default router
