import { Activity } from "./models/activity.js"
import { Followers } from "./models/followers.js"
import Image from "./models/images.js"
import { Likes } from "./models/likes.js"
import { Note } from "./models/note.js"
import { Person } from "./models/person.js"
import Video from "./models/video.js"

const dbInit = () => {
    Video.sync({ alter: true }),
    Person.sync({ alter: true }),
    Followers.sync({alter: true}),
    Activity.sync({ alter: true }),
    Note.sync({alter: true}),
    Likes.sync({alter: true}),
    Image.sync({alter: true})
}

export default dbInit 