const sql = require('mysql');
const db = sql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "koesio"
});

db.connect(function(err) {
    if (err) throw err;
    console.log("Connecté à la base de données MySQL!");
});

module.exports = db;