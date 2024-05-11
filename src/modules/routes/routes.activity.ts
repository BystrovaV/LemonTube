import { Router, Request, Response } from "express"
import { getPersonByUsername } from "../db/repositories/person.repository.js";
import { Create, Note, OrderedCollection, asActivityStream } from "../activity/objects.js";
import { createNote } from "../db/repositories/note.repository.js";
import { deliver, getOrCreateRemotePerson, handleFollow, handleLike, handleNote, handleVideo, store } from "./delivery.js";
import { getActivityById, getPersonInbox } from "../db/repositories/activity.repository.js";
import { getVideoByApId } from "../db/repositories/video.repository.js";

const router = Router();

router.get('/person/:username', async (req: Request, res: Response) => {
    const username = req.params.username;

    const person = await getPersonByUsername(username);
    if (person == null) {
        res.status(404).send("Person not found");
    }

    if (req.query.get_json) {
        return res.json(person?.toActivityStream());
    }

    res.status(200).send(person);
})

router.post('/:username/outbox', async (req: Request, res: Response) => {
    const person = await getPersonByUsername(req.params.username);
    if (person == null) {
        res.status(404).send("Person not found");
        return;
    }

    let activity = asActivityStream(req.body);

    if (activity.type == "Note") {
        const obj = activity
        activity = new Create(undefined, {
            to: person.uris().followers,
            actor: person.uris().id,
            object: obj
        })
    }

    activity.validate();

    if (activity.type == "Create") {
        if (activity.object.type == "Video") {
            console.log("In create video");
        } else if (activity.object.type == "Note") {
            const content = activity.object.content
            const video = await getVideoByApId(activity.object.attachment);
            if (!video) {
                return res.status(404).send();
            }
            const note = await createNote(content, person, video.id);
            activity.object.id = note!.uris.id
        } else {
            res.status(401).send("Sorry, you can only create Notes and Video objects")
        }
        console.log("1")

        activity.id = await store(activity, person)
        console.log(activity);
        deliver(activity);
    }

    if (activity.type == "Follow") {
        const followed = await getOrCreateRemotePerson(activity.object)
        await person.addFollowing(followed);
        
        activity.actor = person.uris().id;
        activity.to = followed.uris().id;
        activity.id = await store(activity, person);
        deliver(activity);
    }

    if (activity.type == "Like") {
        console.log("Come to like");

        const likedVideo = await getVideoByApId(activity.object);
        if (!likedVideo)
            return res.status(404).send("Video not found");
        await likedVideo.addLiked(person);

        activity.actor = person.uris().id;
        activity.id = await store(activity, person);
        deliver(activity);
    }

    return res.status(200).send("ok");
})

router.get('/:username/outbox', async (req: Request, res: Response) => {
    const person = await getPersonByUsername(req.params.username);
    if (person == null) {
        res.status(404).send("Person not found");
        return;
    }

    const activities = await getPersonInbox(person, false);
    const collection = new OrderedCollection(activities).toJson(true)

    return res.status(200).send(collection["orderedItems"]);
})

router.get('/:username/:folder/:id',  async (req: Request, res: Response) => {
    if (req.params.folder != "outbox" && req.params.folder != "inbox") {
        return res.status(404).send("Page not found");
    }
    const person = await getPersonByUsername(req.params.username);
    if (person == null) {
        res.status(404).send("Person not found");
        return;
    }

    const activity = await getActivityById(req.params.id);
    if (activity == null) {
        res.status(404).send("Activity not found");
        return;
    }

    return res.status(200).send(asActivityStream(activity.toActivityStream()));
})

router.post('/:username/inbox', async (req: Request, res: Response) => {
    const person = await getPersonByUsername(req.params.username);
    if (person == null) {
        res.status(404).send("Person not found");
        return;
    }

    let activity = asActivityStream(req.body);
    activity.validate();

    console.log("inbox");
    console.log(activity);

    if (activity.type == "Create") {
        console.log("in handle");
        if (activity.object.type == "Note")
            handleNote(activity)
        else if (activity.object.type == "Video")
            handleVideo(activity)
    }

    if (activity.type == "Follow") {
        console.log("in handle");
        handleFollow(activity)
    }

    if (activity.type == "Like") {
        console.log("in handle");
        handleLike(activity)
    }

    store(activity, person, true)
    return res.status(200).send();
})

router.get('/:username/inbox', async (req: Request, res: Response) => {
    const person = await getPersonByUsername(req.params.username);
    if (person == null) {
        res.status(404).send("Person not found");
        return;
    }

    const activities = await getPersonInbox(person, true);
    const collection = new OrderedCollection(activities).toJson(true)

    return res.status(200).send(collection["orderedItems"]);
})

router.post('/:username/notes', async(req: Request, res: Response) => {
    const person = await getPersonByUsername(req.params.username);
    if (person == null) {
        res.status(404).send("Person not found");
        return;
    }

    const receivers = req.body.receivers || [];
    const content = req.body.content || 'Undefined';

    const audience: string[] = [];
    for (const receiver of receivers) {
        try {
            const person1 = await getPersonByUsername(receiver);
            if (person1) {
                audience.push(person1.uris().id);
            }
        } catch (error) {
            console.error(error);
            continue;
        }
    }

    if (audience.length === 0) {
        audience.push(person.uris().followers);
    }

    const note = new Note(undefined, {content: content});
    const create = new Create(undefined, { to: audience, object: note, actor: person.uris().id });
    // console.log(create);
    // console.log(create.toJson());
    // console.log(JSON.stringify(create.toJson()));
    await fetch(person.uris().outbox, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(create.toJson())
    });
    res.status(201).send();
    // return res.redirect(person.uris().id);
})

export default router