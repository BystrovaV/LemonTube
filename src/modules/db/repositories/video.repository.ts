import Video from "../models/video.js"
import { Person } from "../models/person.js";
import Image from "../models/images.js";
import { Op } from "sequelize";
import { Likes } from "../models/likes.js";

export const createVideo = async (file: Express.Multer.File, name: string, description: string, personId: string) => {
    const video = await Video.create({ 
        name: name, 
        file: file.buffer, 
        filename: file.originalname,
        format: file.mimetype,
        description: description,
        PersonId: personId
    })

    video.ap_id = video.uris.id;
    video.save();

    return video;
}

export const createVideoSimple = async (apId: string, name: string, description: string, infoHash: string,
    filename: string, format: string, personId: string, imageURL: string) => {
    const video = await Video.create({ 
        ap_id: apId,
        name: name, 
        infoHash: infoHash,
        filename: filename,
        format: format,
        description: description, 
        PersonId: personId,
        imageURL: imageURL
    })

    return video;
}

export const getAll = async (): Promise<Video[]> => {
    const video = Video.findAll({
        attributes: ['id', 'name', 'filename', 'createdAt', 'imageURL'],
        include: [{
            model: Person,
            as: 'person'
        }],
        order: [['createdAt', 'desc']]
    })

    return video;
}

export const findVideoByParam = async (search: string): Promise<Video[]> => {
    const video = await Video.findAll({
        attributes: ['id', 'name', 'filename', 'description', 'createdAt', 'imageURL'],
        where: {
            [Op.or]: [
                {
                  name: { [Op.iLike]: `%${search}%` },
                },
                {
                  '$person.name$': { [Op.iLike]: `%${search}%` },
                },
            ],
        },
        include: [{
            model: Person,
            as: 'person'
        }],
    })

    return video;
}

export const findFollowingVideo = async (following: Person[]): Promise<Video[]> => {
    const ids = following.map(v => v.id);

    const videos = await Video.findAll({
        attributes: ['id', 'name', 'filename', 'createdAt', 'imageURL'],
        where: {
            PersonId: {[Op.in]: ids}
        },
        include: [{
            model: Person,
            as: 'person'
        }],
        limit: 9,
        order: [['createdAt', 'desc']]
    })
    return videos;
}

export const findLikedVideo = async (person: Person): Promise<Video[]> => {
    const likes = await Likes.findAll({
        where: {PersonId: person.id}
    })

    const ids = likes.map(v => v.VideoId);

    const videos = await Video.findAll({
        attributes: ['id', 'name', 'filename', 'createdAt', 'imageURL'],
        where: {
            id: {[Op.in]: ids}
        },
        order: [['createdAt', 'desc']]
    })
    return videos;
}

export const findMyVideo = async (person: Person): Promise<Video[]> => {
    const videos = await Video.findAll({
        attributes: ['id', 'name', 'filename', 'createdAt', 'imageURL'],
        where: {
            PersonId: person.id
        },
        order: [['createdAt', 'desc']]
    })
    return videos;
}

export const findPopularVideo = async ():  Promise<Video[]> => {

    const video = Video.findAll({
        attributes: ['id', 'name', 'filename', 'createdAt', 'imageURL',],
        include: [{
            model: Person,
            as: 'person',
        }, {
            model: Likes,
            as: 'likes',
        }],
        group: ["id"],
        order: [['createdAt', 'desc']]
    })

    return video;
}

export const getVideoById = async (id: string): Promise<Video | null> => {
    return Video.findByPk(id, 
        {
            include: [{
                model: Person,
                as: 'person'
            }]
        })
}

export const getVideoByApId = async (apId: string): Promise<Video | null> => {
    return Video.findOne({
        where: {
            ap_id: apId
        },
        include: [{
            model: Person,
            as: 'person'
        }]
    });
}

export const createImage = async (payload: string): Promise<Image | null> => {
    return await Image.create({
        payload: payload
    })
}

export const getImage = async (id: string): Promise<Image | null> => {
    return await Image.findByPk(id);
}
