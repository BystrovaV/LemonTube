import { ActivityObject } from "./activityObject.js";

export class Note extends ActivityObject {
    static attributes: string[] = ActivityObject.attributes.concat(["content", "actor"])
    type: string = "Note"
}

export class Video extends ActivityObject {
    static attributes: string[] = ActivityObject.attributes.concat(
        ["description", "infoHash", "thumbnail", "filename", "format", "actor"]);
    type: string = "Video"
}

export class Actor extends ActivityObject {
    // inbox - OrderedCollection
    // outbox - OrderedCollection
    // followers - collection
    // following - collection
    static attributes: string[] = ActivityObject.attributes.concat(["inbox", "outbox", "followers", "following", "preferredUsername"])
    type: string = "Actor"
}

export class Person extends ActivityObject {
    type = "Person"
}

export class Collection extends ActivityObject {
    static attributes: string[] = [...ActivityObject.attributes, "items", "totalItems"];
    type: string = "Collection";

    private _items: ActivityObject[] = [];

    constructor(iterable?: any[], kwargs: Record<string, any> = {}) {
        super(undefined, kwargs);
        if (iterable) {
            if (iterable instanceof Array) {
                this.items = iterable;
            }
        }
    }

    get items(): ActivityObject[] {
        return this._items;
    }

    set items(iterable: any[]) {
        for (const item of iterable) {

            if (item instanceof ActivityObject) {
                this._items.push(item);
            } else if (item && item.toActivityStream) {
                const newItem = asActivityStream(item.toActivityStream());
                this._items.push(newItem);
            } else {
                try {
                    const newItem = asActivityStream(item);
                    this._items.push(newItem);
                } catch {
                    throw new Error(`Invalid ActivityStream object: ${item}`);
                }
            }
        }
    }

    toJson(context: boolean = false): any {
        const json = super.toJson(context);
        const items = this.items.map(item => (item instanceof ActivityObject) ? item.toJson() : item);
        json.items = items;
        return json;
    }
}

export class OrderedCollection extends Collection {
    static attributes: string[] = [...Collection.attributes, "orderedItems"];
    type: string = "OrderedCollection";

    get totalItems(): number {
        return this.items.length;
    }

    set totalItems(value: number) {
        // Setter for totalItems
    }

    get orderedItems(): ActivityObject[] {
        return this.items;
    }

    set orderedItems(iterable: any[]) {
        this.items = iterable;
    }

    toJson(context: boolean = false): any {
        const json = super.toJson(context);
        json.orderedItems = json.items;
        delete json.items;
        return json;
    }
}

export function encodeActivityStream(obj: any): any {
    if (obj instanceof ActivityObject) {
        return obj.to_json();
    }
}

export class Activity extends ActivityObject {
    static attributes: string[] = [...ActivityObject.attributes, "actor", "object"];
    type: string = "Activity";

    get_audience(): Set<string> {
        const audience: string[] = [];
        for (const attr of ["to", "bto", "cc", "bcc", "audience"]) {
            const value = this[attr];
            if (!value) {
                continue;
            }
            if (typeof value === "string") {
                audience.push(value);
            } else if (Array.isArray(value)) {
                audience.push(...value);
            }
        }
        console.log("get audience", audience);
        return new Set(audience);
    }

    strip_audience(): Activity {
        const newActivity = Object.assign({}, this);
        delete newActivity["bto"];
        delete newActivity["bcc"];
        return parseActivity(newActivity);
    }

    validate(): void {
        // Validation logic goes here
    }
}

export class Create extends Activity {
    type: string = "Create";

    validate(): void {
        let msg: string | null = null;
        if (!this.actor) {
            msg = "Invalid Create activity, actor is missing";
        } else if (!this.object) {
            msg = "Invalid Create activity, object is missing";
        } else if (!(this.actor instanceof Actor) && typeof this.actor !== "string") {
            msg = "Invalid actor type, must be an Actor or a string";
        } else if (!(this.object instanceof ActivityObject)) {
            msg = "Invalid object type, must be a ActivityObject";
        }

        if (msg) {
            throw new Error(msg);
        }
    }
}

export class Follow extends Activity {
    type: string = "Follow";
}

export class Like extends Activity {
    type: string = "Like";
}

export class Delete extends Activity {
    type: string = "Delete";
}

export class Undo extends Activity {
    type: string = "Undo";
}


export const ALLOWED_TYPES: Record<string, any> = {
    "Object": ActivityObject,
    "Actor": Actor,
    "Person": Person,
    "Note": Note,
    "Video": Video,
    "Collection": Collection,
    "OrderedCollection": OrderedCollection,
    "Activity": Activity,
    "Create": Create,
    "Follow": Follow,
    "Like": Like,
    "Delete": Delete,
    "Undo": Undo
};

// TODO: несколько вложенностей
export function asActivityStream(obj: any): any {
    
    if (obj.type == "Collection") {
        return new Collection(obj.items)
    }
    obj = parseActivity(obj);

    for (const key in obj) {
        if (obj[key].constructor == Object) {
            obj[key] = parseActivity(obj[key]);
        }
    }
    return obj;
}

export function parseActivity(obj: any): any {
    const type = obj.type;

    if (!type) {
        const msg = "Invalid ActivityStream object, the type is missing";
        throw new Error(msg);
    }

    if (type in ALLOWED_TYPES) {
        return new ALLOWED_TYPES[type](obj);
    }
}
