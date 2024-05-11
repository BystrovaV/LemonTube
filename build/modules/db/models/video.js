import { DataTypes, Model } from "sequelize";
import sequelizeConnection from "../config.js";
import { uri } from "./uris.js";
class Video extends Model {
    get uris() {
        if (this.remote) {
            return { id: this.ap_id };
        }
        else {
            return { id: uri("video", { id: this.id }) };
        }
    }
    toActivityStream() {
        return {
            type: "Video",
            id: this.uris.id,
            name: this.name,
            description: this.description,
            infoHash: this.infoHash,
            filename: this.filename,
            format: this.format
        };
    }
}
Video.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    ap_id: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    file: {
        type: DataTypes.BLOB,
        allowNull: true,
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    format: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    infoHash: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    thumbnail: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    imageURL: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    timestamps: true,
    sequelize: sequelizeConnection,
});
export default Video;
//# sourceMappingURL=video.js.map