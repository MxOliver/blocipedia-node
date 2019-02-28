const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;
const sequelize = require("../../src/db/models/index").sequelize;
const request = require("request");
const base = "http://localhost:3000/wikis/";
const server = require("../../src/server");

describe("routes : wikis", () => {

    beforeEach((done) => {
        this.wiki;
        this.user;

        sequelize.sync({force: true}).then(() => {
            User.findOne().then((user) => {
                this.user = user;
    
                Wiki.create({
                    title: "A Wiki About Wikis",
                    body: "Ever wondered what a wiki is? This is a wiki.",
                    private: false,
                    userId: this.user.id
                }).then((wiki) => {
                    this.wiki = wiki;
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                })
            })
            .catch((err) => {
                console.log(err);
                done();
            })
        })
        .catch((err) => {
            console.log(err);
            done();
        })
    });

    describe("GET /wikis", () => {

        it("should respond with all public wikis", (done) => {
           
                request.get(base, (err, res, body) => {
                    Wiki.findAll({where: {private: false}}).then(() => {
                        expect(body).toContain("Public Wiki List");
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    })
                });
        });
    });

    describe("GET /wikis/new", () => {

        it("should render a new wiki form", (done) => {
            request.get(`${base}new`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("New Wiki");
                done();
            });
        });
    });

    describe("POST /wikis/create", () => {

        const options = {
            url: `${base}create`,
            form: {
                title: "Get Fuzzy",
                body: "A comic about a dog and a cat.",
                private: false
            }
        };

        it("should create a new wiki and redirect", (done) => {
            request.post(options, 
                (err, res, body) => {
                    Wiki.findOne({where: {title: "Get Fuzzy"}}).then((wiki) => {
                        expect(wiki).toBeDefined();
                        expect(wiki.title).toBe("Get Fuzzy");
                        done();
                    })
                    .catch((err) => {
                        console.log(err);
                        done();
                    })
                });
        });
    });

    describe("GET /wikis/:id", () => {

        it("it should render a view with the selected wiki", (done) => {
            request.get(`${base}${this.wiki.id}`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).Contain("A Wiki About Wikis");
                done();
            });
        });

    });

    describe("GET /wikis/:id/edit", () => {

        it("should render a view with an edit wiki form", (done) => {
            request.get(`${base}${this.wiki.id}/edit`, (err, res, body) => {
                expect(err).toBeNull();
                expect(body).toContain("Edit Wiki");
                expect(body).toContain("A Wiki About Wikis");
                done();
            });
        });
    });

    describe("POST /wikis/:id/update", () => {

        it("should update the wiki with the given values", (done) => {
            request.post({
                url: `${base}${this.wiki.id}/update`,
                form: {
                    title: "My Name is Inigo Montoya",
                    body: "You killed my father, prepare to die."
                }
            }, (err, res, body) => {
                expect(err).toBeNull();
                Wiki.findOne({where: {id: this.wiki.id}}).then((wiki) => {
                    expect(wiki.title).toBe("My Name is Inigo Montoya");
                    done();
                });
            });
        });
    });

    describe("POST /wikis/:id/destroy", () => {

        it("should delete the wiki with the associated id", (done) => {

            Wiki.findAll().then((wikis) => {
                const wikiCountBeforeDelete = wikis.length;

                expect(wikiCountBeforeDelete).toBe(1);

                request.post(`${base}${this.wiki.id}/destroy`, (err, res, body) => {
                    Wiki.findAll().then((wikis) => {
                        expect(err).toBeNull();
                        expect(wikis.length).toBe(wikiCountBeforeDelete - 1);
                        done();
                    });
                });
            });
        });
    });

});