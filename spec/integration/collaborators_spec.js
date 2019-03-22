const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;
const Collaborator = require("../../src/db/models").Collaborator;
const sequelize = require("../../src/db/models/index").sequelize;
const request = require("request");
const base = "http://localhost:8000/wikis/";
const accountBase = "http://localhost:8000/account/";
const server = require("../../src/server");

describe("routes : collaborators", () => {

    beforeEach((done) => {
        this.premiumUser;
        this.privateWiki;

        sequelize.sync({force: true}).then(() => {
    
            User.create({
              name: "Patty Premium",
              email: "premiumUser@example.com",
              password: "1333324"
            }).then((user) => {
              User.findOne({where: {id: user.id}}).then(() => {
    
                request.post(`${accountBase}upgrade`, (err, res, body) => {
                  User.findOne({where: {id: user.id}}).then((premiumdUser) => {
                    this.premiumUser = premiumdUser;
                    
                    Wiki.create({
                        title: "Wizard of Oz",
                        body: "Everything is better in green!",
                        userId: this.premiumUser.id,
                    }).then((wiki) => {
                        this.privateWiki = wiki;
                    }).catch((err) => {
                        console.log(err);
                        done();
                    })
                  }).catch((err) => {
                    console.log(err);
                    done();
                  })             
              });
            }).catch((err) => {
              console.log(err);
              done();
            });   
          }).catch((err) => {
            console.log(err);
            done();
          })
        }).catch((err) => {
            console.log(err);
            done();
        })
    });


    describe("GET /wikis/:id/addCollaborators", () => {

        it("should render a view with the add collaborator form", (done) => {

            request.get(`${base}${this.privateWiki.id}/addCollaborators`, (err, res, body) => {
                expect(body).toContain("Wiki Author");
                done();
            });
        })
    });

    describe("POST /wikis/:id/addCollaborator", () => {

        it("should create a new collaborator for the wiki", (done) => {
            
            this.newCollaborator;

            User.create({
                name: "Collaborator Joe",
                email: "collaborator@example.com",
                password: "1333324555"
              }).then((user) => {
                User.findOne({where: {id: user.id}}).then(() => {
      
                  request.post(`${accountBase}upgrade`, (err, res, body) => {
                    User.findOne({where: {id: user.id}}).then((collaboratorUser) => {
                      this.newCollaborator = collaboratorUser;
                    }).catch((err) => {
                        console.log(err);
                        done();
                    });
                  });
                });
              });

            User.findOne({where: {role: 1, name: "Collaborator Joe"}}).then((user) => {
                this.newCollaborator = user;
    
                const options = {
                    url: `${base}${this.privateWiki.id}/addCollaborators`,
                    form: {
                        userId: this.newCollaborator.id,
                        wikiId: this.privateWiki.id,
                    }
                };
    
                request.post(options, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(res.statusCode).toBe(302);
                    done();
                })
            }).catch((err) => {
                console.log(err);
                done();
            });
        });
    });

    describe("GET /wikis/:id/removeCollaborator", () => {
        it("should render a view with the remove collaborator form", (done) => {

            request.get(`${base}${this.privateWiki.id}/removeCollaborators`, (err, res, body) => {
                expect(body).toContain("Wiki Author");
                done();
            });
        });

    });

    describe("POST /wikis/:id/removeCollaborator", () => {

        it("should remove the collaborator from the wiki collaborators", () => {
            Collaborator.findOne({where: {wikiId: this.privateWiki.id}}).then((collaborator) => {
                const options = {
                    url: `${base}${this.privateWiki.id}/removeCollaborators`,
                    form: {
                        wikiId: this.privateWiki.id,
                        userId: collaborator.userId,
                    }
                };
                request.post(options, (err, res, body) => {
                    Collaborator.findOne({where: {wikiId: this.privateWiki.id, userId: collaborator.userId}}).then((collaborator) => {
                        expect(collaborator).toBeNull();
                        done();
                    }).catch((err) => {
                        console.log(err);
                        done();
                    })
                });
            }).catch((err) => {
                console.log(err);
                done();
            })
        });
    });

});