import { Model, DataTypes } from 'sequelize';
import sequelizeConnection from '../config.js';
import { Person } from './person.js';
import { UUID } from 'crypto';
import { uri } from './uris.js';
import Video from './video.js';

class Note extends Model {
    public id!: UUID;
    public ap_id!: string;
    public remote!: boolean;
    public content!: string;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public readonly person!: Person;
    public readonly VideoId!: string;

    public get uris(): { id: string } {
        if (this.remote) {
            return { id: this.ap_id };
        } else {
            return { id: uri("note", {id: this.id}) };
        }
    }

    public toActivityStream(): { type: string, id: string, content: string, actor: string } {
        return {
            type: "Note",
            id: this.uris.id,
            content: this.content,
            actor: this.person.uris().id
        };
    }
}

Note.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    ap_id: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    remote: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    content: {
        type: DataTypes.STRING(500),
        allowNull: false
    }
}, {
    sequelize: sequelizeConnection,
    modelName: 'Note'
});


Note.belongsTo(Person, { 
    foreignKey: 'PersonId', 
    as: 'person' 
});

Person.hasMany(Note, {
    as: 'notes'
});

Note.belongsTo(Video, {
    foreignKey: 'VideoId', 
    as: 'video' 
})

Video.hasMany(Note, {
    as: "comments"
})

export { Note };
