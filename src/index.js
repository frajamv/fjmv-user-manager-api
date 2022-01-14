require('dotenv').config();
require('./db/db.config');

const server = require('./server');

server.listen(server.get('port'), () => {
    console.log('Server on port ' + server.get('port'))
});