const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;
const Collaborator = require("../../src/db/models").Collaborator;
const sequelize = require("../../src/db/models/index").sequelize;
const request = require("request");
const base = "http://localhost:8000/wikis/";
const server = require("../../src/server");

describe("routes : collaborators", () => {

    beforeEach((done) => {

        sequelize.sync({force: true}).then(() => {

            User.create({
                name: "Bird",
                email: "bird@flock.com",
                password: "birdsofafeather"
            }).then((newUser) => {
                request.get({
                    url: "http://localhost:8000/auth/fake",
                    form: {
                    role: this.standardUser.role,
                    userId: this.standardUser.id,
                    email: this.standardUser.email
                    }
                })
            })
        })
    });


    describe("GET /wikis/:id/addCollaborators", () => {

        it("should render a view with the add collaborator form", (done) => {

            request.get(`${base}${this.wiki.id}/addCollaborators`, (err, res, body) => {
                expect(body).toContain("Wiki Author");
                done();
            });
        })
    });

    describe("POST /wikis/:id/addCollaborator", () => {

        it("should create a new collaborator for the wiki", (done) => {

            this.newCollaborator;

            User.findOne({where: {role: 1, name: "Collaborator Joe"}}).then((user) => {
                this.newCollaborator = user;
    
                const options = {
                    url: `${base}${this.wiki.id}/addCollaborators`,
                    form: {
                        userId: this.newCollaborator.id,
                        wikiId: this.wiki.id,
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

    });

    describe("POST /wikis/:id/removeCollaborator", () => {

    })
})