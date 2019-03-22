const Wiki = require("../../src/db/models").Wiki;
const User = require("../../src/db/models").User;
const Collaborator = require("../../src/db/models").Collaborator;
const sequelize = require("../../src/db/models/index").sequelize;
const request = require("request");
const base = "http://localhost:8000/wikis/";
const accountBase = "http://localhost:8000/account/";
const server = require("../../src/server");

describe("routes : wikis", () => {

    beforeEach((done) => {

        this.user; 
        this.publicWiki;

        sequelize.sync({force: true}).then(() => {
            User.create({
              name: "Dorothy",
              email: "dorothyr@oz.com",
              password: "emerald445",
              role: 0
            }).then((user) => {
              this.user = user;
    
              request.get({
                url: "http://localhost:8000/auth/fake",
                form: {
                  role: this.user.role,
                  userId: this.user.id,
                  email: this.user.email
                }
              }, (err, res, body) => {
                    Wiki.create({
                        title: "Dorothy in Oz",
                        body: "Toto, I don't think we are in Kansas anymore.",
                        userId: this.user.id,
                        private: false
                    }).then((publicWiki) => {
                        this.publicWiki = publicWiki;
                        done();
                    });
              });
            }).catch((err) => {
              console.log(err);
              done();
            })
        });   
    });

    //STANDARD USER CONTEXT
    describe("standard user performing CRUD actions", () => {
    
        describe("GET /wikis", () => {
    
            it("should respond with all public wikis", (done) => {
               
                    request.get(base, (err, res, body) => {
                        Wiki.findAll({where: {private: false}}).then((wikis) => {
                            expect(body).toContain("Wiki Index");
                            expect(body).toContain("Dorothy in Oz");
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
    
            it("should create a new wiki and redirect", (done) => {

                User.findOne({where: {role: 0}}).then((user) => {
                    const options = {
                        url: `${base}create`,
                        form: {
                            title: "Get Fuzzy",
                            body: "A comic about a dog and a cat.",
                            private: false,
                            userId: user.id
                        }
                    };
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
                }).catch((err) => {
                    console.log(err);
                    done();
                }); 
            });
        });
    
        describe("GET /wikis/:id", () => {
    
            it("it should render a view with the selected wiki", (done) => {
                request.get(`${base}${this.publicWiki.id}`, (err, res, body) => {
                    expect(body).toContain("Dorothy in Oz");
                    done();
                });
            });
    
        });
    
        describe("GET /wikis/:id/edit", () => {
    
            it("should render a view with an edit wiki form", (done) => {
                request.get(`${base}${this.publicWiki.id}/edit`, (err, res, body) => {
                    expect(err).toBeNull();
                    expect(body).toContain("Edit Wiki");
                    expect(body).toContain("Dorothy in Oz");
                    done();
                });
            });
        });
    
        describe("POST /wikis/:id/update", () => {
    
            it("should update the wiki with the given values", (done) => {
                request.post({
                    url: `${base}${this.publicWiki.id}/update`,
                    form: {
                        title: "My Name is Inigo Montoya",
                        body: "You killed my father, prepare to die."
                    }
                }, (err, res, body) => {
                    Wiki.findOne({where: {id: this.publicWiki.id}}).then((wiki) => {
                        expect(wiki.title).toBe("My Name is Inigo Montoya");
                        done();
                    }).catch((err) => {
                        console.log(err);
                        done();
                    })
                });
            });
        });
    
        describe("POST /wikis/:id/destroy", () => {
    
            it("should delete the wiki with the associated id", (done) => {
    
                Wiki.findAll({where: {private: false}}).then((wikis) => {
                    const wikiCountBeforeDelete = wikis.length;
                    console.log(wikiCountBeforeDelete);
    
                    expect(wikiCountBeforeDelete).toBe(1);
    
                    request.post(`${base}${this.publicWiki.id}/destroy`, (err, res, body) => {
                        Wiki.findAll({where: {private: false}}).then((wikis) => {
                            expect(wikis.length).toBe(wikiCountBeforeDelete - 1);
                            done();
                        }).catch((err) => {
                            console.log(err);
                            done();
                        })
                    });
                });
            });
        });

    });
    ///end of standard user context

    //  ///PREMIUM USER CONTEXT
    // describe("Premium user performing CRUD actions", () => {
    //     this.premiumUser;
    //     this.privateWiki;

    //     beforeEach((done) => {
    //        User.findOne({where: {role: 1}}).then((premiumUser) => {
    //            this.premiumUser = premiumUser;

    //            Wiki.create({
    //                title: "This is a Private Wiki",
    //                body: "Shh! It's a secret.",
    //                userId: this.premiumUser.id,
    //                private: true
    //            }).then((wiki) => {
    //                this.privateWiki = wiki;
    //                done();
    //            }).catch((err) => {
    //                console.log(err);
    //                done();
    //            })
    //        }).catch((err) => {
    //            console.log(err);
    //        })
    //     });

    //     describe("GET /wikis", () => {

    //         it("should render a view with all public wikis", (done) => {
    //             request.get(base, (err, res, body) => {
    //                 Wiki.findAll({where: {private: false}}).then(() => {
    //                     expect(body).toContain("Wiki Index");
    //                     expect(body).toContain("Dorothy in Oz");
    //                     done();
    //                 })
    //                 .catch((err) => {
    //                     console.log(err);
    //                     done();
    //                 })
    //             });

    //         });

    //         it("should render a view with any private wikis that are owned by the user", (done) => {
    //             Wiki.create({
    //                 title: "Bogs and Swamps",
    //                 body: "Swampy bogs and boggy swamps!",
    //                 private: true,
    //                 userId: this.premiumUser.id
    //             }).then((privateWiki) => {
    //                 this.newWiki = privateWiki;

    //                 request.get(base, (err, res, body) => {

    //                     Wiki.findAll({where: {userId: this.premiumUser.id}}).then((wikis) => {
    //                         expect(body).toContain("Bogs and Swamps");
    //                         expect(body).toContain("This is a Private Wiki");
    //                         done();
    //                     })
    //                     .catch((err) => {
    //                         console.log(err);
    //                         done();
    //                     })
    //                 });
    //             })
    //             .catch((err) => {
    //                 console.log(err);
    //                 done();
    //             });

    //         });

    //         it("should respond with all private wikis where the user is a collaborator", (done) => {

    //             User.create({name: "Bob", email: "bob@example.com", password: "22223", role: 1}).then((newUser) => {

    //                 Wiki.create({
    //                     title: "Dogs are a National Treasure",
    //                     body: "Yes they are indeed",
    //                     private: true,
    //                     userId: newUser.id,
    //                 }).then((wiki) => {
    
    //                     Collaborator.create({
    //                         wikiId: wiki.id,
    //                         userId: this.premiumUser.id
    //                     }).then((colalborator) => {

    //                         request.get(base, (err, res, body) => {
    //                             expect(body).toContain("Wiki Index");
    //                             expect(body).toContain("Dogs are a National Treasure");
    //                             done();
    //                         })
    //                     })
    //                     .catch((err) => {
    //                         console.log(err);
    //                         done();
    //                     })
    //                 })
    //                 .catch((err) => {
    //                     console.log(err);
    //                     done();
    //                 });
    //             });

    //         });

    //     });

    //     describe("POST /wikis/create", () => {

    //         it("should create a new wiki and redirect", (done) => {
    
    //         const options = {
    //             url: `${base}create`,
    //             form: {
    //                 title: "Creating a Private Wiki",
    //                 body: "Shh! Don't tell anyone.",
    //                 private: true,
    //                 userId: this.premiumUser.id
    //             }
    //         };
    //             request.post(options, 
    //                 (err, res, body) => {
    //                     Wiki.findOne({where: {title: "Creating a Private Wiki"}}).then((wiki) => {
    //                         expect(wiki.private).toBeTruthy();
    //                         expect(wiki.body).toBe("Shh! Don't tell anyone");
    //                         done();
    //                     })
    //                     .catch((err) => {
    //                         console.log(err);
    //                         done();
    //                     })
    //                 });
    //         });  
    //     });

    //     describe("GET /wikis/:id/edit", () => {

    //         it("should render an edit form if the user is the owner", (done) => {

    //             Wiki.findOne({where: {userId: this.premiumUser.id, private: true}}).then((wiki) => {

    //                 request.get(`${base}${wiki.id}/edit`, (err, res, body) => {
    //                     expect(body).toContain("Edit Wiki");
    //                     done();
    //                 })
    //             }).catch((err) => {
    //                 console.log(err);
    //                 done();
    //             });
    //         });

    //         it("should render an edit form is the user is a collaborator", (done) => {

    //            Wiki.findOne({where: {private: true}}).then((wiki) => {
    //                Collaborator.findOne({where: {wikiId: wiki.id, userId: this.premiumUser.id}}).then((collaborator) => {
    //                    request.get(`${base}${wiki.id}/edit`, (err, res, body) => {
    //                        expect(body).toContain("Edit Wiki");
    //                        done();
    //                    })
    //                }).catch((err) => {
    //                    console.log(err);
    //                    done();
    //                })
    //            })
    //            .catch((err) => {
    //                console.log(err);
    //                done();
    //            });

    //         });

    //         it("should NOT render an edit form if the user is not the owner or a collaborator", (done) => {
    //             User.create({
    //                 name: "Buddy",
    //                 email: "buddy@example.com",
    //                 pasword: "44456",
    //                 role: 1
    //             }).then((newUser) => {

    //                 Wiki.create({
    //                     title: "You Can't See This Wiki",
    //                     body: "This is a wiki for me and me only.",
    //                     userId: newUser.id,
    //                     private: true
    //                 }).then((newWiki) => {

    //                     request.get(`${base}${newWiki.id}/edit`, (err, res, body) => {
    //                         Collaborator.findOne({where: {wikiId: newWiki.id, userId: this.premiumUser.id}}).then((collaborator) => {

    //                             done();
    //                         }).catch((err) => {
    //                             expect(err).toContain("You are not authorized to edit this wiki");
    //                             done();
    //                         });
    //                     });
    //                 }).catch((err) => {
    //                     console.log(err);
    //                     done();
    //                 })
    //             }).catch((err) => {
    //                 console.log(err);
    //                 done();
    //             })

    //         });
    //     });

    //     describe("POST wikis/:id/update", () => {


    //         it("should update the wiki if the user is the owner", (done) => {
    //             Wiki.findOne({where: {userId: this.premiumUser.id, title: "Bogs and Swamps"}}).then((wiki) => {

    //                 const options = {
    //                     url: `${base}${wiki.id}/update`,
    //                     form: {
    //                         title: "Swamps are Forever!"
    //                     }
    //                 }
    //                 request.post(options, (err, res, body) => {
    //                     expect(wiki.title).toBe("Swamps are Forever");
    //                     expect(wiki.body).toBe("Swampy bogs and boggy swamps!");
    //                     done();
    //                 })
    //             }).catch((err) => {
    //                 console.log(err);
    //                 done();
    //             })
    //         });

    //         it("should update the wiki if the user is a collaborator", (done) => {
    //             Wiki.findOne({where: {title: "Dogs are a National Treasure"}}).then((wiki) => {
    //                 Collaborator.findOne({where: {wikiId: wiki.id, userId: this.premiumUser.id}}).then((collaborator) => {
    //                     const options = {
    //                         url: `${base}${wiki.id}/update`,
    //                         form: {
    //                             title: "Facts about Dogs",
    //                             body: "Dog noses have thousands of scent receptors!"
    //                         }   
    //                     };

    //                     request.post(options, (err, res, body) => {
    //                         expect(wiki.title).toBe("Facts about Dogs");
    //                         done();
    //                     })
    //                 }).catch((err) => {
    //                     console.log(err);
    //                     done();
    //                 })
    //             }).catch((err) => {
    //                 console.log(err);
    //                 done();
    //             })

    //         })

    //         it("should not update the wiki if the user is not the owner or a collaborator", (done) => {
    //             Wiki.findOne({where: {title: "You Can't See This Wiki"}}).then((wiki) => {
    //                 const options = {
    //                     url: `${base}${wiki.id}/update`,
    //                     form: {
    //                         title: "Yes I can!"
    //                     }
    //                 };
    //                 request.post(options, (err, res, body) => {

    //                     done();
    //                 })
    //             }).catch((err) => {
    //                 expect(err).toContain("You do not have permission to edit this wiki");
    //                 done();
    //             })

    //         });
    //     });




    // });
// ///end of premium user context
    

});