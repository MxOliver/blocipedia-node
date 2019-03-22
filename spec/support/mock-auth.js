module.exports = {
    
    fakeIt(app){
        let role, id, email;

        function middleware(req, res, next){

            role = req.body.role || role;
            id = req.body.userId || id;
            email = req.body.email || email;

            console.log("mock-auth middleware was called for user with ID " + id);

            if(id && id != 0){
                req.user = {
                    "id": id,
                    "email": email,
                    "role": role
                };
                console.log(req.user);
            } else if(id == 0){
                console.log("Deleted req.user");
                delete req.user;
            }

            if(next){ next() }
        }

        function route(req,res){
            res.redirect("/")
        }

        app.use(middleware)
        app.get("/auth/fake", route)
    }
}