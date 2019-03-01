const User = require("./models").User;
const bcrypt = require("bcryptjs");

module.exports = {

    createUser(newUser, callback){

        const salt = bcrypt.genSaltSync();
        const hashedPassword = bcrypt.hashSync(newUser.password, salt);

        return User.create({

            email: newUser.email,
            password: hashedPassword
        })
        .then((user) => {
            callback(null, user);
        })
        .catch((err) => {
            callback(err);
        })
    },
    upgradeUser(req, callback){
        User.update({where: {id: req.params.id}}).set({role: 1}).then((user) => {
            callback(null, user);
        })
        .catch((err) => {
            callback(err);
        })
    },
    downgradeUser(req, callback){
        User.update({where: {id: req.params.id}}).set({role: 0}).then((user) => {
            callback(null, user);
        })
        .catch((err) => {
            callback(err);
        })
    }
}