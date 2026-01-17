const bcrypt = require('bcrypt');

async function generateHashes() {
    const password = 'admin';
    const hash = await bcrypt.hash(password, 10);
    console.log('Password Hash for "admin":', hash);
}

generateHashes();
