require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
app.use(express.json());

const users = []; //storesponse users 

//array of movies
const movies = [
    {
        name: "Deborah Emeni",
        title: "Citation Movie",
        year_of_production: "2020",
        producer: "Temi Otedola",
        genre: "Thriller",
        length: "120 minutes"
    },
    {
        name: "Mike Sam",
        title: "Girlfriends Movie",
        year_of_production: "2020",
        producer: "Mike",
        genre: "Thriller",
        length: "120 minutes"
    },
    {
        name: "John Doe",
        title: "The Queen's Gambit Movie",
        year_of_production: "2020",
        producer: "John",
        genre: "Thriller",
        length: "120 minutes"
    },
    {
        name: "Grace Ifan",
        title: "Grand Army Movie",
        year_of_production: "2020",
        producer: "Francis",
        genre: "Thriller",
        length: "120 minutes"
    },
];

//gets all users
app.get('/users', (request, response) => {
    response.status(200).send(users); //responds with all users
});

//creates the user
app.post('/users/signup', async(request, response) => {
    try {
        //hash users password
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(request.body.password, salt);
        console.log(salt); 
        console.log(hashedPassword);
        const user = { name: request.body.name, password: hashedPassword };
        users.push(user);
        response.status(200).send(users);
    } catch(error) {
        response.status(201).send(error);
    }
});


//Login the user
app.post('/users/login', async(request, response) => {
        //find a user with the name
        const user = users.find(user => user.name = request.body.name);
        //checks if user exists
        if(user == null) {
            return response.status(404).send("User does not exist");
        };
        //comparesponse users password with hashed password
        try {
            if(await bcrypt.compare(request.body.password, user.password)) {
                // console.log(request.body.password);
                // console.log(user.password);
                const name = request.body.name;
                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
                response.json({ accessToken: accessToken });
                response.send("success");
            }
        } catch(error) {
            response.status(500).send("User not allowed");
        }
});

//Allows a user rent a movie
app.get('/users/rentals', authenticateToken, (request, response) => {
    const {name} = request.user;
    const movieRenter = movies.filter(movie => movie.name === name);
    if (!movieRenter) {
        return response.send("User can not rent a movie");
    }
    response.json(movieRenter);
});


//Authenticate Token
function authenticateToken(request, response, next) {
    //gets the token from the headers
    const authHeader = request.headers['authorization'];
    //checks if token exists
    if (authHeader == null) {
        return response.sendStatus(401);
    };

    //verifies token
    jwt.verify(authHeader, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) {
            console.log(error);
            return response.sendStatus(403);
        }
        request.user = user;

        next();
    });
}

//Port
app.listen(3000);