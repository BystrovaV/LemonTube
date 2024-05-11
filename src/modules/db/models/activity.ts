import { DataTypes, Model } from "sequelize";
import sequelizeConnection from "../config.js";
import { Person } from "./person.js";
import { URIs, uri } from "./uris.js";
import { UUID } from "crypto";

export class Activity extends Model {
    public id!: UUID
    public ap_id!: string;
    public payload!: string;
    public remote!: boolean;
    public PersonId!: string;
    public person!: Person; 

    public readonly createdAt!: Date;
    uris!: () => any;
    toActivityStream!: () => any;
}

Activity.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    ap_id: { 
        type: DataTypes.TEXT
    },
    payload: { 
        type: DataTypes.BLOB 
    },

    remote: { 
        type: DataTypes.BOOLEAN, 
        defaultValue: false 
    },
}, {
    timestamps: true,
    sequelize: sequelizeConnection,
    modelName: 'Activity'
});

Activity.belongsTo(Person, { as: 'person', foreignKey: 'PersonId' });

Person.hasMany(Activity, {
    as: "activities"
})

Activity.prototype.uris = function () {
    let ap_id;

    if (this.remote) {
        ap_id = this.ap_id;
    } else {
        ap_id = uri("outbox_item", {username: this.person.username, id: this.id});
    }
  return new URIs({ id: ap_id });
};

Activity.prototype.toActivityStream = function () {
    const payloadString = Buffer.from(this.payload, 'base64').toString('utf-8');
    const data = JSON.parse(payloadString);
    data.id = this.uris().id;
    return data;
};