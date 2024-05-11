import { Model } from "sequelize";
import { Person } from "./person.js";
import Video from "./video.js";
import sequelizeConnection from "../config.js";

export class Likes extends Model {
    public PersonId!: Person;
    public VideoId!: Video;
}

Likes.init({}, {
    sequelize: sequelizeConnection,
    modelName: 'Likes',
    tableName: 'Likes'
});

Person.belongsToMany(Video, {
    through: 'Likes',
    as: 'likes',
    foreignKey: 'PersonId'
});

Video.belongsToMany(Person, {
    through: 'Likes',
    as: 'liked',
    foreignKey: 'VideoId'
});
