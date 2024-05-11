var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Video from "../models/video.js";
import { Person } from "../models/person.js";
import Image from "../models/images.js";
export const createVideo = (file, name, description, personId) => __awaiter(void 0, void 0, void 0, function* () {
    const video = yield Video.create({
        name: name,
        file: file.buffer,
        filename: file.originalname,
        format: file.mimetype,
        description: description,
        PersonId: personId
    });
    video.ap_id = video.uris.id;
    video.save();
    return video;
});
export const createVideoSimple = (apId, name, description, infoHash, filename, format, personId, imageURL) => __awaiter(void 0, void 0, void 0, function* () {
    const video = yield Video.create({
        ap_id: apId,
        name: name,
        infoHash: infoHash,
        filename: filename,
        format: format,
        description: description,
        PersonId: personId,
        imageURL: imageURL
    });
    video.ap_id = video.uris.id;
    video.save();
    return video;
});
export const getAll = () => __awaiter(void 0, void 0, void 0, function* () {
    const video = Video.findAll({
        attributes: ['id', 'name', 'filename', 'createdAt', 'imageURL'],
        include: [{
                model: Person,
                as: 'person'
            }]
    });
    return video;
});
export const getVideoById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return Video.findByPk(id, {
        include: [{
                model: Person,
                as: 'person'
            }]
    });
});
export const getVideoByApId = (apId) => __awaiter(void 0, void 0, void 0, function* () {
    return Video.findOne({
        where: {
            ap_id: apId
        },
        include: [{
                model: Person,
                as: 'person'
            }]
    });
});
export const createImage = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Image.create({
        payload: payload
    });
});
export const getImage = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return yield Image.findByPk(id);
});
//# sourceMappingURL=video.repository.js.map