# Wikology

A node based application for creating and sharing wikis.

Stack: Node.js, Express, Sequelize (Postgres)

---

## Set Up

This app is available in production [here](https://mxoliver-wikology.herokuapp.com) but if you would like to run it in a development setting and need help on how to get it from this repository to your computer, check out this handy guide [here](#app-configuration)

## WIKOLOGY 

Wikology is a node based application for creating and sharing wikis. As a user with a free account you can create as many wikis as you'd like, as well as edit other user's wikis. You can also upgrade to a premium account (using the Stripe API client) and create private wikis that are only visible by you and your chosen collaborators (who must also be premium users). 

To start, click sign up to create an account and then you are ready to start making and collaborating on all the public wikis. 


## App Configuration

1. CLICK `clone or download` and COPY the link

2. OPEN terminal and run `git clone <link> + (optional <custom-filename-of-your-choosing>)`

3. THEN `cd` into the folder containing the source code and run `npm start`

you should see something like this in your terminal:

```
> bloccodechallenge@1.0.0 start <path/to/sourcecode>
> node src/server.js

server listening for requests on port 3000
```

4. Once that third line appears (server is listening...) you can go ahead and open your favorite web browser and go to localhost:3000

---

