import { UUID } from "crypto";
import { DataTypes, Model } from "sequelize";
import sequelizeConnection from "../config.js";
import { uri } from "./uris.js";
import { Person } from "./person.js";

class Video extends Model {
    [x: string]: any;
    public id!: UUID
    public ap_id!: string

    public name!: string

    public file!: Blob
    public filename!: string
    public format!: string

    public infoHash!: string
    public description!: string
    public thumbnail!: string
    public imageURL!: string

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public readonly person!: Person;

    public get uris(): { id: string } {
        if (this.remote) {
            return { id: this.ap_id };
        } else {
            return { id: uri("video", {id: this.id}) };
        }
    }

    public toActivityStream(): { type: string, id: string, name: string, description: string, 
        infoHash: string, filename: string, format: string } {
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

Video.init(
    {
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
    },
    {
        timestamps: true,
        sequelize: sequelizeConnection,
    }
)

export default Video
