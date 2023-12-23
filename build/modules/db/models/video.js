import { DataTypes, Model } from "sequelize";
import sequelizeConnection from "../config.js";
class Video extends Model {
}
Video.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    file: {
        type: DataTypes.BLOB,
        allowNull: false,
    },
    format: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: true,
    sequelize: sequelizeConnection,
});
export default Video;
//# sourceMappingURL=video.js.map