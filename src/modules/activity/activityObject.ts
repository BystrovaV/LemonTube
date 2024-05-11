export class ActivityObject {
    [x: string]: any;
    static attributes: string[] = ["type", "id", "name", "to", "bto", "bcc", "cc", "attachment"];
    type: string = "Object";

    constructor(obj?: any, kwargs: Record<string, any> = {}) {
        if (obj) {
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    this[key] = obj[key];
                }
            }
        }

        for (const key of (<typeof ActivityObject>this.constructor).attributes) {
            if (key === "type") {
                continue;
            }

            const value = kwargs[key];
            if (value === undefined) {
                continue;
            }

            (this as any)[key] = value;
        }
    }

    static fromJson(json: any): ActivityObject {
        return new ActivityObject(json);
    }

    toString(): string {
        const content = JSON.stringify(this);
        return `<${this.type}: ${content}>`;
    }

    toJson(context: boolean = false): any {
        const values: any = {};
        for (const attribute of (<typeof ActivityObject>this.constructor).attributes) {
            let value = (this as any)[attribute];

            if (value === undefined) {
                continue;
            }

            if (value instanceof ActivityObject) {
                value = value.toJson();
            }
            
            values[attribute] = value;
        }

        this.getFromArray(values, "to");
        this.getFromArray(values, "bto");
        this.getFromArray(values, "bcc");
        this.getFromArray(values, "cc");

        if (context) {
            values["@context"] = "https://www.w3.org/ns/activitystreams";
        }
        return values;
    }

    toActivityStream(): ActivityObject {
        return this;
    }

    getFromArray(values: Record<string, any>, title: string): void {
        const arr = values[title];

        if (typeof arr === "string") {
            values[title] = [arr];
        } else if (arr && typeof arr[Symbol.iterator] === "function") {
            values[title] = [];
            for (const item of arr) {
                if (typeof item === "string") {
                    values[title].push(item);
                }
                if (item instanceof ActivityObject) {
                    values[title].push(item.id);
                }
            }
        }
    }
}