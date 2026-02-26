const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('niitm', 10);
console.log(hash);
