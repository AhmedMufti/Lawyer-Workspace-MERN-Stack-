const dotenv = require('dotenv');
dotenv.config();
console.log('Testing Node execution...');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Start with ' + process.env.MONGODB_URI.substring(0, 10) : 'UNDEFINED');
console.log('Done.');
