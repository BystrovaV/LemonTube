import { Router } from "express";
import bcrypt from "bcrypt";
import { createPerson } from "../db/repositories/person.repository.js";
import { PersonForm } from "../controllers/controllers.js";
import passport from "passport";
import { logout } from "../middleware/passport.mw.js";

const router = Router();

router.get('/signin', async (req, res) => {
    res.render('signin.hbs', {layout: 'empty.hbs', error: req.query.error || ''})
})

router.get('/signup', async (req, res) => {
    res.render('signup.hbs', {layout: 'empty.hbs', error: req.query.error || ''})
})

router.post('/signup', async (req, res) => {
    try {
        const formData: PersonForm = req.body;
        if (!formData.password || !formData.username || !formData.name)
            return res.status(400).redirect('/auth/signup?error=Not valid data')
        formData.password = await bcrypt.hash(formData.password, 10);

        const person = await createPerson(formData);
        if (person)
            return res.status(201).redirect('/auth/signin');
        return res.status(400).redirect('/auth/signup?error=Registration failed')
    } catch (error) {
        return res.status(201).redirect('/auth/signup?error=Registration failed');
    }
});

router.post('/login', passport.authenticate('local'), async (req, res) => {
    return res.redirect('../../')
});

router.get('/logout', logout, async (_req, _res) => {})

export default router;
