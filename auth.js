// JavaScript source code

const db = require('./db');
const bcrypt = require('bcryptjs');
const localStrategy = require('passport-local').Strategy;

const users = db.Mongoose.model('users', db.UserSchema, 'users')

module.exports = function (passport) {

    function findUser(username) {
            return users.find(user => user.username === username)
    }

    function findUserById(id) {
        return users.find(user => user._id === id);
    }

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        try {
            const user = findUserById(id);
            done(null, user);
        } catch (err) {
            done(err, null);
        }
    });

    passport.use(new localStrategy({
        userNmaeField: 'username',
        passwordField: 'password'
    }, (username, password, done) => {
            try {
                const user = findUser(username);

                if (!user) { return done(null, false) }

                const isValid = bcrypt.compareSync(password, user.password);
                if (!isValid) { return done(null, false) }

                return done(null, false);

            } catch (err) {
                    done(null, false)
            }
        }

    ))

}