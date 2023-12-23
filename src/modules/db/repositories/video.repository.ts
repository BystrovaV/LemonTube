import { UUID } from "crypto"
import Video from "../models/video.js"

export const create = async (file: Express.Multer.File, name: string, description: string) => {
    const video = await Video.create({ 
        name: name, 
        file: file.buffer, 
        filename: file.originalname,
        format: file.mimetype,
        description: description, 
    })

    return video;
}

export const getAll = async (): Promise<Video[]> => {
    return Video.findAll()
}

export const getById = async (id: string): Promise<Video | null> => {
    return Video.findByPk(id)
}
