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
import { new_torrent_seed } from './routes.torrent.js';
import { create } from "../db/repositories/video.repository.js";
const router = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router.post('/upload', upload.single('file'), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (req.file == undefined) {
        res.status(500).send('Internal Server Error');
    }
    else {
        const videoInfo = yield create(req.file);
        new_torrent_seed((_a = req.file) === null || _a === void 0 ? void 0 : _a.originalname, req.file.buffer);
        res.json(videoInfo);
    }
}));
export default router;
//# sourceMappingURL=routes.video.js.map