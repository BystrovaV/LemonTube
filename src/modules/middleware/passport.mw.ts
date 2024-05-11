import * as passportStrategy from "passport-local";
import passport from "passport";
import bcrypt from "bcrypt";
import { Application, Request, Response, NextFunction } from "express";
import { getPersonByUsername } from "../db/repositories/person.repository.js";

export function initPassport(app: Application) {    
    app.use(passport.initialize());
    app.use(passport.authenticate('session'));

    passport.use(new passportStrategy.Strategy(
        async (username, password, done) => {
            try {
                if (!username) { done(null, false) }
                const user = await getPersonByUsername(username);
                console.log(user);
                if (!user) {
                    done(null, false, { message: "User or password incorrect"});
                } else if (user.username == username && await bcrypt.compare(password, (user.password).toString())) {
                    done(null, user);
                } else {
                    done(null, false, { message: "User or password incorrect"});
                }
            } catch (e) {
                done(e);
            }
        })
    );
    
    type DoneSerializeCallback = (error: any, id?: any) => void;

    passport.serializeUser((req: Request, user: any, done: DoneSerializeCallback) => {
        done(null, user);
    });

    passport.deserializeUser(async (user: any, done) => {
        const u = await getPersonByUsername(user.username);
        done(null, u);
    });

}

export async function isAuthenticated(req: Request ,res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>> {
    if(req.user)
        return next();
    res.redirect("/auth/signin"); 
}

export function logout(req: Request ,res: Response): Response | void {
    req.user = undefined;
    res.redirect("/auth/signin");
}
     