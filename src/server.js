const express = require('express');
const cors = require('cors');
const morgan = require('morgan')
const server = express();
const env = require('./environment') // Get data from environment.js file.

server.set('port', env.port || 4000);

// MIDDLEWARES:
server.use(cors()); // Allow server to be accesible from other applications.
server.use(morgan('dev')) // Get and print all requests method and URI.
server.use(express.json()); // Get the API to manage JSON objects for requests and responses.

// MAIN ROUTES (each file has it's own subroutes):
server.use('/api/table_test', require('./routes/table_tests.router'));
server.use('/api/users', require('./routes/users.router'));
server.use('/', (req, res) => res.send("Hello world! We're finally online!"));

console.log("Connected to database:", env.DB_NAME)
module.exports = server;