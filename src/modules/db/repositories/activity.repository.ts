import { Activity } from "../models/activity.js";
import { Person } from "../models/person.js";

export const createActivity = async (payload: Buffer, PersonId: string, remote: boolean) => {
    const activity = await Activity.create({ 
        payload: payload,
        PersonId: PersonId,
        remote: remote
    })

    return activity;
}

export const getActivityById = async (id: string) => {
    return await Activity.findByPk(id, {
        include: [{
            model: Person,
            as: 'person'}]
        })
}

export const getPersonInbox = async (person: Person, remote: boolean) => {
    return await Activity.findAll({
        where: {
            remote: remote,
            PersonId: person.id
        }, 
        order: [['createdAt', 'desc']],
        include: [{
            model: Person,
            as: 'person'}]
    })
}
