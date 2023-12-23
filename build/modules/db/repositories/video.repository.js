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
export const create = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const video = yield Video.create({
        name: file.originalname,
        file: file.buffer,
        format: file.mimetype
    });
    return { id: video.id, name: video.name };
});
export const getAll = () => __awaiter(void 0, void 0, void 0, function* () {
    return Video.findAll();
});
//# sourceMappingURL=video.repository.js.map