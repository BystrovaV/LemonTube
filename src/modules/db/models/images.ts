import { DataTypes, Model } from "sequelize";
import sequelizeConnection from "../config.js";
import { uri } from "./uris.js";
import { UUID } from "crypto";

class Image extends Model {
    public id!: UUID
    public payload!: string

    public get uris(): { id: string } {
        return { id: uri("image", {id: this.id}) };
    }
}

Image.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        payload: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    },
    {
        timestamps: true,
        sequelize: sequelizeConnection,
    }
)

export default Image;