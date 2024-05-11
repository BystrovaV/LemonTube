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
import { getAll, getImage, getVideoById } from "../db/repositories/video.repository.js";
import { isAuthenticated } from "../middleware/passport.mw.js";
import { Person } from "../db/models/person.js";
import { Note } from "../db/models/note.js";
const router = Router();
router.get('', isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("in redirect");
    const files = yield getAll();
    console.log(files);
    res.render('main.hbs', {
        user: req.user.username,
        files: files
    });
}));
router.get('/video/new', (_, res) => {
    res.render('video-form.hbs');
});
router.get('/video/:video_id', isAuthenticated, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { params: { video_id }, } = req;
    const file = yield getVideoById(video_id);
    if (!file)
        return res.status(404).send("Video not found");
    const files = yield getAll();
    if (file.file == null) {
        console.log("Content add");
        console.log(file.dataValues.infoHash);
        console.log("here");
    }
    const user = req.user;
    const following = yield user.getFollowing();
    let isFollowed = false;
    for (const f of following) {
        if (f.dataValues.id === (file === null || file === void 0 ? void 0 : file.dataValues.person.id)) {
            isFollowed = true;
        }
    }
    const likes = yield (file === null || file === void 0 ? void 0 : file.getLiked());
    let isLiked = false;
    for (const l of likes) {
        if (l.dataValues.id === (file === null || file === void 0 ? void 0 : file.dataValues.person.id)) {
            isLiked = true;
        }
    }
    const comments = yield Note.findAll({
        where: {
            VideoId: file.id
        },
        include: [{
                model: Person,
                attributes: ["id", "username"],
                as: 'person'
            }]
    });
    res.render('player.hbs', {
        user: req.user,
        isFollowed: isFollowed,
        file: file,
        files: files,
        likes: likes.length,
        isLiked: true,
        comments: comments
    });
}));
router.get('/images/:image_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const image = yield getImage(req.params.image_id);
    if (image) {
        const imageDataBuffer = Buffer.from(image.payload, 'base64');
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': imageDataBuffer.length
        });
        return res.end(imageDataBuffer);
    }
    return res.status(404).send();
}));
export default router;
//# sourceMappingURL=routes.content.js.map