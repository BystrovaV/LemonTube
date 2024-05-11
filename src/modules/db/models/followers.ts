import { UUID } from "crypto";
import { Model } from "sequelize";
import { Person } from "./person.js";
import sequelizeConnection from "../config.js";

export class Followers extends Model {
    public PersonFromId!: UUID;
    public PersonToId!: UUID;
}

Followers.init({}, {
    sequelize: sequelizeConnection,
    modelName: 'Followers',
    tableName: 'Followers'
});
  
Person.belongsToMany(Person, {
    through: 'Followers',
    as: 'following',
    foreignKey: 'PersonFromId'
});

Person.belongsToMany(Person, {
    through: 'Followers',
    as: 'followers',
    foreignKey: 'PersonToId'
});