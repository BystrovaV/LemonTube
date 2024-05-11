import { PersonForm } from "../../controllers/controllers.js"
import { Person } from "../models/person.js"
import { uri } from "../models/uris.js"

export const getPersonByUsername = async (username: string): Promise<Person | null> => {
    return Person.findOne({
        where: {
            username: username
        }
    })
}

export const getPersonByApId = async (apId: string): Promise<Person | null> => {
    return Person.findOne({
        where: {
            ap_id: apId
        }
    })
}

export const createPerson = async (personData: PersonForm) => {
    const person = await Person.create({ 
        ap_id: uri("person", { username: personData.username }),
        name: personData.name, 
        username: personData.username,
        password: personData.password
    })

    return person;
}
