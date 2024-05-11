import { Router, Request, Response } from "express";
import { getPersonByUsername } from "../db/repositories/person.repository.js";
import { Collection, Follow, OrderedCollection, asActivityStream } from "../activity/objects.js";
import { Person } from "../db/models/person.js";
import { isAuthenticated } from "../middleware/passport.mw.js";

const router = Router();

router.post('/follow', isAuthenticated, async (req: Request, res: Response) => {
    const person = req.user as Person;

    let follow: Follow;
    if (req.body.followed_id) {
        follow = new Follow(undefined, {object: req.body.followed_id});
    } else if (req.body.followed_username) {
        const followed = await getPersonByUsername(req.body.followed_username);
        follow = new Follow({object: followed?.uris().id})
    } else {
        return res.status(400).send("You must specify followed_id or followed_username")
    }

    console.log(follow);
    if (follow) {
        await fetch(person.uris().outbox, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(follow.toJson())
        });
        return res.status(201).send();
    } else {
        return res.status(400);
    }
})

router.get('/:username/following', async (req: Request, res: Response) => {
    const person = await getPersonByUsername(req.params.username);
    if (person == null) {
        res.status(404).send("Person not found");
        return;
    }

    const followings = await person.getFollowing();
    const collection = new Collection(followings);

    if (req.query.get_json) {
        return res.json(collection.toJson(true));
    }

    if (req.user) {
        return res.render('followers.hbs', {user: (<any>req.user).username, followers: collection.toJson(true)});
    } else {
        return res.status(401).send();
    }
})

router.get('/:username/followers', async (req: Request, res: Response) => {
    const person = await getPersonByUsername(req.params.username);
    if (person == null) {
        res.status(404).send("Person not found");
        return;
    }

    const followers: Person[] = await person.getFollowers();
    const collection = new Collection(followers);

    if (req.query.get_json) {
        return res.json(collection.toJson(true));
    }

    if (req.user) {
        return res.render('followers.hbs', {user: (<any>req.user).username, followers: collection.toJson(true)});
    } else {
        return res.status(401).send();
    }
})

export default router;