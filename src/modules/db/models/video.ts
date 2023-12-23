import { UUID } from "crypto";
import { DataTypes, Model, Sequelize } from "sequelize";
import sequelizeConnection from "../config.js";

class Video extends Model {
    public id!: UUID

    public name!: string

    public file!: Blob
    public filename!: string
    public format!: string

    public infoHash!: string
    public description!: string
    public thumbnail!: string

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Video.init(
    {
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
        }
    },
    {
        timestamps: true,
        sequelize: sequelizeConnection,
    }
)

export default Video
