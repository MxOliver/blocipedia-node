const Wiki = require("./models").Wiki;

module.exports = {
    getAllPublicWikis(callback){
        return Wiki.findAll({where: {private: false}}).then((wikis) => {
            callback(null, wikis);
        })
        .catch((err) => {
            callback(err);
        })
    },
    addWiki(newWiki, callback){
        return Wiki.create(newWiki)
        .then((wiki) => {
            callback(null, wiki);
        })
        .catch((err) => {
            callback(err);
        })
    },
    addPrivateWiki(newWiki, callback){
        return Wiki.create(newWiki)
        .then((wiki) => {
            console.log(wiki);
            callback(null, wiki);
        })
        .catch((err) => {
            callback(err);
        }) 
    },
    updateWiki(req, updatedWiki, callback){
        return Wiki.findByPk(req.params.id).then((wiki) => {
            if(!wiki){
                return callback("Wiki not found");
            } else {
                wiki.update(updatedWiki, {
                    fields: Object.keys(updatedWiki)
                }).then(() => {
                    callback(null, wiki);
                })
                .catch((err) => {
                    callback(err);
                })
            }
        });
    },
    getWiki(id, callback){
        return Wiki.findByPk(id).then((wiki) => {
            callback(null, wiki);
        })
        .catch((err) => {
            callback(err);
        })
    },
    deleteWiki(req, callback){
        return Wiki.findByPk(req.params.id).then((wiki) => {
            wiki.destroy().then(() => {
                callback(null, wiki);
            });
        })
        .catch((err) => {
            callback(err);
        })
    },
    makePrivate(req, callback){
        Wiki.update({private: true}, {where: {id: req.params.id}}).then((wiki) => {
            callback(null, wiki);
        })
        .catch((err) => {
            callback(err);
        })
    },
    makePublic(req, callback){
        Wiki.update({private: false}, {where: {id: req.params.id}}).then((wiki) => {
            callback(null, wiki);
        })
        .catch((err) => {
            callback(err);
        })
    },
    handleDowngrade(req, callback){
        console.log("running?");
        Wiki.update({private: false}, {where: {userId: req.user.id}}).then((wikis) => {
            callback(null, wikis);
        })
        .catch((err) => {
            callback(err);
        })
    },
}