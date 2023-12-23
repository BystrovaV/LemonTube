import Video from "./models/video.js";
const dbInit = () => {
    Video.sync({ alter: true });
};
export default dbInit;
//# sourceMappingURL=init.js.map