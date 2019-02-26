const request = require("request");
const server = require("../../src/server");
const base = "http://localhost:3000/";

describe("routes : static", () => {

    describe("GET /", () => {
        
        it("should return a status code of 200 and have 'Blocipedia' in tthe body of the response", (done) => {

            request.get(base, (err, res, body) => {
                expect(res.statusCode).toBe(200);
                expect(body).toContain("Blocipedia");
                done();
            });
        });
    });
});