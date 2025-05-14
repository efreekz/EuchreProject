const redis = require('redis');

const client = redis.createClient({
    socket: {
        host: 'localhost',
        port: 6379
    },
    password: 'mypassword' // Add your Redis password here
});

client.on('error', (err) => {
    console.error('Error:', err);
});

client.connect().then(() => console.log('Connected to Redis'))
    .catch((err) => console.error('Redis connection error:', err));;

module.exports = client;
