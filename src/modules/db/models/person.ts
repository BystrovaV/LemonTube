import { DataTypes, Model } from "sequelize";
import sequelizeConnection from "../config.js";
import { URIs, uri } from "./uris.js";
import { UUID } from "crypto";
import { Activity } from "./activity.js";
import { Followers } from "./followers.js";
import Video from "./video.js";

export class Person extends Model {
    [x: string]: any;
    public id!: UUID
    public ap_id!: string;
    public remote!: boolean;
    public username!: string;
    public name!: string;
    public activities!: Activity;
    public followers!: Followers[];
    public following!: Followers[];
    public password!: string;
    uris!: () => any;
    toActivityStream!: () => { type: string; id: any; name: string; preferredUsername: string; };
}

Person.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    ap_id: { 
        type: DataTypes.TEXT, allowNull: false 
    },
    remote: { 
        type: DataTypes.BOOLEAN, defaultValue: false 
    },
    username: { 
        type: DataTypes.STRING(100), allowNull: false, unique: true 
    },
    name: { 
        type: DataTypes.STRING(100), allowNull: false 
    },
    password: { 
        type: DataTypes.STRING(100), allowNull: true 
    }
  }, {
    sequelize: sequelizeConnection,
    modelName: 'Person', // Название модели
    tableName: 'Person' // Название таблицы в единственном числе
});

Video.belongsTo(Person, { 
    foreignKey: 'PersonId', 
    as: 'person' 
});

Person.hasMany(Video, {
    as: 'videos'
});

Person.prototype.uris = function () {
    if (this.remote) {
        return new URIs({ id: this.ap_id });
    }
  
    return new URIs({
        id: uri("person", { username: this.username }),
        following: uri("following", { username: this.username }),
        followers: uri("followers", { username: this.username }),
        outbox: uri("outbox", { username: this.username }),
        inbox: uri("inbox", { username: this.username }),
        notes: uri("notes", { username: this.username })
    });
};

interface ActivityStreamJson {
    type: string;
    id: any;
    name: string;
    preferredUsername: string;
    following?: string;
    followers?: string;
    outbox?: string;
    inbox?: string;
}

Person.prototype.toActivityStream = function (): ActivityStreamJson {
    const json_format: ActivityStreamJson = {
        type: "Actor",
        id: this.uris().id,
        name: this.name,
        preferredUsername: this.username
    };

    if (!this.remote) {
        const uris = this.uris();
        json_format.following = uris.following;
        json_format.followers = uris.followers;
        json_format.outbox = uris.outbox;
        json_format.inbox = uris.inbox;
    }

    return json_format;
};