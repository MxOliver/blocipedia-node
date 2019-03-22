const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:8000/users/";
const accountBase = "http://localhost:8000/account/";

const User = require("../../src/db/models").User;
const sequelize = require("../../src/db/models/index").sequelize;
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

describe("routes : users", () => {

  beforeEach((done) => {

    sequelize.sync({force: true}).then(() => {
       done();
    }).catch((err) => {
      console.log(err);
      done();
    })
  
    });

    ///standard user context
    describe("Standard user performing CRUD actions", () => {

      beforeEach((done) => {
        User.create({
          name: "Ephrum",
          email: "standardUser@example.com",
          password: "124445",
          role: 0
        }).then((standardUser) => {
          this.standardUser = standardUser;

          request.get({
            url: "http://localhost:8000/auth/fake",
            form: {
              role: this.standardUser.role,
              userId: this.standardUser.id,
              email: this.standardUser.email
            }
          }, (err, res, body) => {
            done();
          });
        }).catch((err) => {
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

          const options = {
                url: base,
                form: {
                  email: "no",
                  password: "123456789"
                }
          }
    
          request.post(options, (err, res, body) => {
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
              expect(body).toContain("Upgrade to Premium");
              done();
            });
        });
      });
    
      describe("POST /account/upgrade", () => {
    
        it("should change the associated users role to 1", (done) => {
          User.findOne({where: {id: this.standardUser.id}}).then((user) => {

              request.post(`${accountBase}upgrade`, (err, res, body) => {
                User.findOne({where: {id: this.standardUser.id}}).then((standardUser) => {
                  expect(standardUser.role).toBe(1);
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
    ///end of standard user context

    //PREMIUM USER CONTEXT
    describe("Premium user performing CRUD actions", () => {

      beforeEach((done) => {

        this.premiumUser;

        User.create({
          name: "Prem User",
          email: "premiumUser@example.com",
          password: "1333324"
        }).then((user) => {
          User.findOne({where: {id: user.id}}).then(() => {

            request.post(`${accountBase}upgrade`, (err, res, body) => {
              User.findOne({where: {id: user.id}}).then((premiumdUser) => {
                this.premiumUser = premiumdUser;
                done();
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

      describe("GET /account/downgrade", () => {

        it("should render a view with the downgrade account form", (done) => {

          User.findOne({where: {role: 1}}).then((premiumUser) => {
            request.get(`${accountBase}downgrade`, (err, res, body) => {
                  expect(body).toContain("Return to Standard");
                  expect(err).toBeNull();
                  done();
            });
          }).catch((err) => {
            console.log(err);
            done();
          });
        });
      });

      describe("POST /account/downgrade", () => {
        
        it("should change the user role from 1 to 0", (done) => {
          User.findOne({where: {role: 1}}).then((user) => {

            request.post(`${accountBase}downgrade`, (err, res, body) => {
                User.findOne({where: {id: user.id}}).then((user) => {
                  expect(user.role).toBe(0);
                  expect(err).toBeNull();
                  done();
                }).catch((err) => {
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

    });
 ///end of premium user context
});