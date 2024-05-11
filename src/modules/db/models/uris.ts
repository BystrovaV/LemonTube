export class URIs {
    constructor(kwargs: { [s: string]: unknown; } | ArrayLike<unknown>) {
        for (const [attr, value] of Object.entries(kwargs)) {
            (this as any)[attr] = value;
        }
    }
}

export const urlPatterns: Record<string, string> = {
    person: "/person/:username",
    following: "/:username/following",
    followers: "/:username/followers",
    outbox: "/:username/outbox",
    outbox_item: "/:username/outbox/:id",
    inbox: "/:username/inbox",
    notes: "/:username/notes",
    note: "/notes/:id",
    video: "/video/:id",
    image: "/images/:id"
};

export function uri(name: string, args: any): string {
    const pattern: string | undefined = urlPatterns[name];
    if (!pattern) {
        throw new Error(`Pattern for "${name}" not found`);
    }

    let url: string = pattern;
    for (const key in args) {
        const placeholder = `:${key}`;
        const value = args[key];
        url = url.replace(placeholder, String(value));
    }

    return `http://${process.env.HOSTNAME + url}`;
}