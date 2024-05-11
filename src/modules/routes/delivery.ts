import { ActivityObject } from '../activity/activityObject.js';
import { Activity, Actor, Collection, asActivityStream } from '../activity/objects.js';
import { Note } from '../db/models/note.js';
import { Person } from '../db/models/person.js';
import Video from '../db/models/video.js';
import { createActivity, getActivityById } from '../db/repositories/activity.repository.js';
import { getNoteByApId } from '../db/repositories/note.repository.js';
import { getPersonByApId } from '../db/repositories/person.repository.js';
import { createVideoSimple, getVideoByApId } from '../db/repositories/video.repository.js';

export async function store(activity: ActivityObject, person: Person, remote: boolean = false): Promise<string> {
    const payload = Buffer.from(JSON.stringify(activity.toJson()), "utf-8");
    const created = await createActivity(payload, person.id, remote);
    const obj = await getActivityById(created.id);

    if (remote) {
        obj!.ap_id = activity.id;
        await obj!.save();
    } else {
        obj!.ap_id = obj!.uris().id
        await obj!.save()
    }

    return obj!.ap_id;
}


export async function deliver(activity: Activity) {
    let audience = activity.get_audience()
    activity = activity.strip_audience()
    audience = await getFinalAudience(audience)
    console.log(audience);

    for (const ap_id of audience) {
        console.log(ap_id);
        deliverTo(ap_id, activity)
    }
}

async function getFinalAudience(audience: Set<string>): Promise<Set<string>> {
    const finalAudience: string[] = [];
    for (const apId of audience) {
        const obj = await dereference(apId);
        if (obj instanceof Collection) {
            finalAudience.push(...obj.items.map(item => item.id));
        } else if (obj instanceof Actor) {
            finalAudience.push(obj.id);
        } 
    }
    console.log("Get Final audience");
    console.log(finalAudience);
    return new Set(finalAudience);
}

export async function dereference(apId: string): Promise<ActivityObject | null> {
    console.log(apId);

    const res = await fetch(apId + '?get_json=true', {
        method: 'GET',
    });

    if (res.status !== 200) {
        throw new Error(`Failed to dereference ${apId}`);
    }

    const data = await res.json();
    console.log(data);
    if (!data || (data instanceof Array && data.length == 0))
        return null;

    return asActivityStream(data);
}

export async function deliverTo(ap_id: string, activity: Activity): Promise<void> {
    const obj = await dereference(ap_id);
    if (!obj)
        return;

    if (!obj.inbox) {
        return;
    }

    const res = await fetch(obj.inbox, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(activity.toJson(true))
    });

    console.log(res);

    if (res.status !== 200) {
        const msg = `Failed to deliver activity ${activity.type} to ${obj.inbox}`;
        console.log(msg);
        // throw new Error(msg);
    } else {
        console.log("Success");
    }

    console.log("Success deliver");
}

export async function getOrCreateRemotePerson(apId: string): Promise<Person> {
    let person: Person | null;
    try {
        person = await getPersonByApId(apId);
    } catch (error) {
        console.error('Error finding person:', error);
        throw error;
    }

    if (!person) {
        try {
            const dereferencedPerson = await dereference(apId); // Получаем данные о персоне по apId
            if (!dereferencedPerson)
                throw new Error('Failed to create or find remote person');
            const hostname = new URL(dereferencedPerson.id).hostname;
            const username = `${dereferencedPerson.preferredUsername}@${hostname}`;
            person = await Person.create({
                username: username,
                name: dereferencedPerson.name,
                ap_id: apId,
                remote: true,
            });
        } catch (error) {
            console.error('Error creating person:', error);
            throw error;
        }
    }

    if (!person) {
        throw new Error('Failed to create or find remote person');
    }

    return person;
}

export async function handleNote(activity: Activity): Promise<void> {
    let apId: string;
    if (activity.actor instanceof Actor) {
        apId = activity.actor.id;
    } else if (typeof activity.actor === 'string') {
        apId = activity.actor;
    } else {
        throw new Error('Invalid actor type');
    }

    const person = await getOrCreateRemotePerson(apId);

    let note: Note | null;
    try {
        note = await getNoteByApId(activity.object.id);
    } catch (error) {
        console.error('Error finding note:', error);
        return;
    }

    if (note) {
        return;
    }

    try {
        const video = await getVideoByApId(activity.object.attachment);

        note = await Note.create({
            content: activity.object.content,
            PersonId: person.id,
            ap_id: activity.object.id,
            remote: true,
            VideoId: video?.id
        });
    } catch (error) {
        console.error('Error creating note:', error);
    }
}

export async function handleVideo(activity: Activity) {
    let apId: string;
    if (activity.actor instanceof Actor) {
        apId = activity.actor.id;
    } else if (typeof activity.actor === 'string') {
        apId = activity.actor;
    } else {
        throw new Error('Invalid actor type');
    }

    const person = await getOrCreateRemotePerson(apId);

    let video: Video | null;
    try {
        video = await getVideoByApId(activity.object.id);
    } catch (error) {
        console.error('Error finding video:', error);
        return;
    }

    if (video) {
        return;
    }

    try {
        video = await createVideoSimple(
            activity.object.id,
            activity.object.name, 
            activity.object.description,
            activity.object.infoHash,
            activity.object.filename,
            activity.object.format,
            person.id,
            activity.object.thumbnail
        )
    } catch (error) {
        console.error('Error creating video:', error);
    }
}

export async function handleFollow(activity: Activity) {
    const followed = await getPersonByApId(activity.object);

    if (!followed)
        return;

    let apId: string;
    if (activity.actor instanceof Actor) {
        apId = activity.actor.id
    } else if (typeof activity.actor === 'string') {
        apId = activity.actor;
    } else {
        throw new Error('Invalid actor type');
    }

    const follower = await getOrCreateRemotePerson(apId);
    await followed.addFollowers(follower);
}

export async function handleLike(activity: Activity) {
    const whoLiked = await getPersonByApId(activity.actor);
    if (!whoLiked)
        throw new Error('Invalid actor type');

    let apId: string;
    if (activity.actor instanceof Actor) {
        apId = activity.actor.id
    } else if (typeof activity.actor === 'string') {
        apId = activity.actor;
    } else {
        throw new Error('Invalid actor type');
    }

    const likedVideo = await getVideoByApId(activity.object);
    whoLiked.addLikes(likedVideo);
}
