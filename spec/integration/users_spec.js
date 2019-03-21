const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:8000/users/";
const accountBase = "http://localhost:8000/account/";
const User = require("../../src/db/models").User;
const sequelize = require("../../src/db/models/index").sequelize;
const stripe = require("stripe")(process.env.STRIPE_TEST_API_KEY);

describe("routes : users", () => {

  beforeEach((done) => {

    sequelize.sync({force: true})
    .then(() => {
      done();
    })
    .catch((err) => {
      console.log(err);
      done();
    });

  });
  ///standard user context
    describe("Standard user performing CRUD actions", () => {

      beforeEach((done) => {

        this.user;

        sequelize.sync({force: true})
        .then(() => {
          User.create({
            name: "Bob",
            email: "bob@example.com",
            password: "bobspass123",
            role: 0
          }).then((user) => {
            this.user = user;
            expect(this.user.name).toBe("Bob");
            expect(this.user.email).toBe("bob@example.com");
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
        });
    
      });
    
      describe("GET /users/sign_up", () => {
    
        it("should render a view with a sign up form", (done) => {
          request.get(`${base}sign_up`, (err, res, body) => {
            expect(err).toBeNull();
            expect(body).toContain("Wikology");
            done();
          });
        });
    
      });
    
      describe("POST /users", () => {
    
        it("should create a new user with valid values and redirect", (done) => {
    
          const options = {
            url: base,
            form: {
                name: "User",
                email: "user@example.com",
                password: "123456789"
            }
        }
        
        request.post(options, 
            (err, res, body) => {
    
                User.findOne({where: {email: "user@example.com"}})
                .then((user) => {
                    expect(user.email).toBe("user@example.com");
                    expect(user.role).toBe(0);  ///check for default value
                    done();
                })
                .catch((err) => {
                    console.log(err);
                    done();
                });
            });
        });
    
        it("should not create a new user with invalid attributes and redirect", (done) => {
    
          request.post(
              {
                  url: base,
                  form: {
                      email: "no",
                      password: "123456789"
                  }
              },
              (err, res, body) => {
                  User.findOne({where: {email: "no"}})
                  .then((user) => {
                      
                      done();
                  })
                  .catch((err) => {
                      expect(err).toContain("must be a valid email");
                      done();
                  });
              }
          );
      });
    
      });
    
      describe("GET /users/sign_in", () => {
    
        it("should render a view with a sign in form", (done) => {
          request.get(`${base}sign_in`, (err, res, body) => {
            expect(err).toBeNull();
            expect(body).toContain("Sign in");
            done();
          });
        });
    
      });
    
      describe("GET /account/upgrade", () => {
    
        it("should render a view with a upgrade account form", (done) => {
          request.get(`${accountBase}upgrade`, (err, res, body) => {
            expect(err).toBeNull();
            expect(body).toContain("Upgrade to Premium");
            done();
          });
          done();
        });
      });
    
      describe("POST /account/upgrade", () => {
    
        it("should change the associated users role to 1", (done) => {
           User.create({
             email: 'bob@example.com',
             password: "1222222",
             role: 0
           }).then((user) => {
              this.user = user;
    
            request.post(`${accountBase}upgrade`, (err, res, body) => {
                  let options = {
                    amount: 1500,
                    source: "pk_test_qEYTjcbaOZo2Uj5FGEA7dKnQ", ///test key not sensitive information
                    currency: 'usd',
                    description: "Upgrade Account",
                    name: this.user.name,
                }
              stripe.charges.create(options, (err, charge) => {
                
              }).then((charge) => {
                expect(this.user.role).toBe(1);
                done();
              }).catch((err) => {
                console.log(err);
                done();
              });
            });
           })
           .catch((err) => {
             console.log(err);
             done();
           })
           done();
        });
    
      });

      // describe("GET /account/downgrade", () => {

      //   it("should redirect to a view with the upgrade account form", (done) => {

      //     User.findOne({where: {role: 0}}).then((standardUser) => {

      //       request.get(`${accountBase}downgrade`, (err, res, body) => {

      //         expect(body).toContain("Upgrade to Premium");
      //         done();
      //       });
      //     })
      //     .catch((err) => {
      //       console.log(err);
      //       done();
      //     })
      //   });
      // });
    
    })
    ///end of standard user context

    describe("Premium user performing CRUD actions", () => {

      this.user;

      beforeEach((done) => {
        User.create({
          name: "Shirley",
          email: "shirley@temple.com",
          password: "1333345",
          role: 0
        }).then((user) => {
          const options = {
            amount: 1500,
            source: "pk_test_qEYTjcbaOZo2Uj5FGEA7dKnQ", ///test key not sensitive information
            currency: 'usd',
            description: "Upgrade Account",
            name: user.name
          }

          request.post(`${accountBase}upgrade`, (err, res, body) => {

            stripe.charges.create(options, (err, charge) => {
              expect(user.role).toBe(1);
              done();
            })
          })
        }).catch((err) => {
          console.log(err);
          done();
        })
        
      
      });

      describe("GET /users/sign_in", () => {
    
        it("should render a view with a sign in form", (done) => {
          request.get(`${base}sign_in`, (err, res, body) => {
            expect(err).toBeNull();
            expect(body).toContain("Sign in");
            done();
          });
        });
    
      });

      // describe("GET /account/downgrade", () => {

      //   it("should render a view with the downgrade account form", (done) => {

      //     request.get(`${accountBase}downgrade`, (err, res, body) => {

      //       expect(body).toContain("Return to Standard");
      //       expect(err).toBeNull();
      //       done();
      //     })
      //   });
      // });

      // describe("POST /account/downgrade", () => {
        
      //   it("should change the user role from 1 to 0", (done) => {
      //     User.findOne({where: {role: 1}}).then((premiumUser) => {

      //       request.post(`${accountBase}downgrade`, (err, res, body) => {
      //         expect(premiumUser.role).toBe(0);
      //         done();
      //       })
      //     })
      //     .catch((err) => {
      //       console.log(err);
      //       done();
      //     })
      //   });
      // });

      describe("GET /account/upgrade", () => {

        it("should redirect to a view with the downgrade account form", (done) => {

          User.findOne({where: {role: 1}}).then((premiumUser) => {

            request.get(`${accountBase}upgrade`, (err, res, body) => {

              expect(body).toContain("Return to Standard");
              done();
            })
          })
          .catch((err) => {
            console.log(err);
            done();
          })
        })
      });

    });
    ///end of premium user context
});