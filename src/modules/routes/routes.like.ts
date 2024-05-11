import { Router, Request, Response } from "express";
import { isAuthenticated } from "../middleware/passport.mw.js";
import { Person } from "../db/models/person.js";
import { getVideoById } from "../db/repositories/video.repository.js";
import { Like } from "../activity/objects.js";

const router = Router();

router.post('/video/:video_id/like', isAuthenticated, async (req: Request, res: Response) => {
    const person = req.user as Person;
    
    if (!req.params.video_id) {
        return res.status(400).send("Specify video_id");
    }

    const video = await getVideoById(req.params.video_id);
    if (!video) {
        return res.status(404).send("Video not found");
    }

    const to = video.dataValues.person.ap_id;
    const like = new Like({to: [to], actor: person.ap_id, object: video.ap_id});

    if (like) {
        console.log(like);
        await fetch(person.uris().outbox, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(like.toJson())
        });
        return res.status(201).send();
    } else {
        return res.status(400);
    }
})

export default router;