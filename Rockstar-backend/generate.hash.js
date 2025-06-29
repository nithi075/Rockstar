// generate_hash.js
const bcrypt = require('bcryptjs'); // Or 'bcrypt'
const plaintextPassword = '9884973235'; // <--- CONFIRM THIS IS THE PASSWORD YOU WILL TYPE IN FRONTEND
const saltRounds = 10; // <--- CONFIRM THIS MATCHES YOUR USER MODEL

async function generateHash() {
    try {
        const hash = await bcrypt.hash(plaintextPassword, saltRounds);
        console.log('----------------------------------------------------');
        console.log('COPY THIS NEW HASH:');
        console.log(hash);
        console.log('----------------------------------------------------');
        process.exit(0);
    } catch (error) {
        console.error('Error generating hash:', error);
        process.exit(1);
    }
}
generateHash();