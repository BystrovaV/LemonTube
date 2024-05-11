import { Note } from "../models/note.js";
import { Person } from "../models/person.js";

export const createNote = async (content: string, person: Person, videoId: string) => {
    const note = await Note.create({ 
        content: content,
        PersonId: person.id,
        VideoId: videoId
    })

    note.ap_id = note.uris.id;
    note.save();

    return note;
}

export const getNoteById = async (id: string): Promise<Note | null> => {
    return Note.findByPk(id, { 
        include: [{
            model: Person,
            as: 'person'
    }] });
}

export const getNoteByApId = async (apId: string): Promise<Note | null> => {
    return Note.findOne({
        where: {
            ap_id: apId
        },
        include: [{
            model: Person,
            as: 'person'
        }]
    });
}