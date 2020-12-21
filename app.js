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
        id: 1,
        title: "Citation Movie",
        year_of_production: "2020",
        producer: "Temi Otedola",
        genre: "Thriller",
        length: "120 minutes"
    },
    {
        id: 2,
        title: "Girlfriends Movie",
        year_of_production: "2020",
        producer: "Mike",
        genre: "Thriller",
        length: "120 minutes"
    },
    {
        id: 3,
        title: "The Queen's Gambit Movie",
        year_of_production: "2020",
        producer: "John",
        genre: "Thriller",
        length: "120 minutes"
    },
    {
        id: 4,
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


//Allow users rent movie(s)
app.post('/users/rentals', authenticateToken, (request, response) => {
    const rent = {
        id: request.body.id,
        title: request.body.title,
        year_of_production: request.body.year_of_production,
        producer: request.body.producer,
        genre: request.body.genre,
        length: request.body.length
    };
    movies.push(rent);
    response.send(rent);
});


//Allows users view rented movie(s)
app.get('/users/rentals/:id', authenticateToken, (request, response) => {
    const movieId = request.params.id;
    console.log(movieId);
    // const {name} = request.user;
    const renter = movies.find(movie => movie.id === parseInt(movieId));
    if (!renter) {
        return response.send("User can not rent a movie");
    }
    response.json(renter);
});

//Allows users update movie(s)
app.put('/users/rentals/:id', (request, response) => {
    const updateMovies = movies.find(movie => movie.id === parseInt(request.params.id));
    if(!updateMovies) return response.status(404).send("movie can not be updated");

    const updatedMovies = {
        id: request.body.id,
        title: request.body.title,
        year_of_production: request.body.year_of_production,
        producer: request.body.producer,
        genre: request.body.genre,
        length: request.body.length
    };
    response.send(updatedMovies);
});


//Allows users delete movie(s)
app.delete('/users/rentals/:id', (request, response) => {
    const deleteMovie = movies.find(movie => movie.id === parseInt(request.params.id));
    if(!deleteMovie) return response.status(404).send("movie cannot be deleted");

    const index = movies.indexOf(deleteMovie);
    movies.splice(index, 1);

    response.send(deleteMovie);
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