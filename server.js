const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./database/config');
const app = express();
const cors = require('cors');
const session = require('express-session');
const port = process.env.PORT || 4242;  

app.set('view engine, ejs');

app.use(express.json());
app.use(cors());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
}));

//-------------- REGISTER --------------------
app.post('/api/register', function (req, res) {

    // parcer les donner envoyer par react 
    var pseudo = req.body.pseudo;
    var email = req.body.email;
    var password = req.body.password;
    var cpassword = req.body.cpassword;
    
    // faire les test sur les donner 
    
    // check si le password est bon
    if (password.length >= 8 && password === cpassword) {
        
        // check si l'email existe deja
        var query = "SELECT * FROM user WHERE email LIKE ?;";
        db.query(query,[email], function (err, result) {
            if(err) throw err;
            
            if (result.length === 0) {

                // faire le Hash du password
                var hashPassWord = bcrypt.hashSync(password, 10);
                var query = "INSERT INTO user (pseudo, email, password) VALUES (?,?,?);"
    
                // les envoyer a la base de donner 
                db.query(query,[pseudo, email, hashPassWord], function (err, result) {
                    if (err) throw err;
                    app.get('/api/log', function (req, res) {
                        res.send('{"title": "REGISTER"}');
                    });
                    console.log("Inscription reussi");
                });
            }else app.get('/errEmail', function (req, res) {res.send("l'email est déja utilisé")});
        });
    }else app.get('/errPassword', function (req, res) {res.send('le mot de passe est incorrect')});
});



// --------------- LOGIN -------------------
app.post('/api/login', function (req, res) {

    // recuperer les donnés du react
    var email = req.body.email;
    var password = req.body.password;

    // recuperer les donnés de la bdd
    var query = "SELECT email FROM user WHERE email LIKE ?;";
    db.query(query,[email], function (err, result) {
        if (err) throw err;
        
        // check l'email
        if(result.length === 1) {
            
            var query = "SELECT password FROM user WHERE email LIKE ?;";
            db.query(query,[email], function (err, result) {
                if (err) throw err;
                
                // check le password
                if (bcrypt.compareSync(password, result[0].password)) {
                    req.session.email = email;
                    app.get('/api/log', function (req, res) {
                        res.send('{"title": "HOME"}');
                    });
                    console.log('Vous etes connecter !');
                };
            });
        }else app.get('/errLogin', function (req, res) {res.send('le mot de passe ou email sont incorrect')});
    });
});

// faire le logout
app.get('/api/logout', function (req, res) {
    if (req.session.email) {
        req.session.destroy();
    };
    res.send('{"title": "OUT"}');
    console.log('Vous etes out !');
});


// ---------en cour-------------
app.get('/api/user/:id', function (req, res) {

    // email viens de l'email dans la session
    var email = req.body.email;
    
    var query = "SELECT * FROM user WHERE email LIKE ?;";
    db.query(query,[email], function (err, result) {
        if (err) throw err;

        res.send(result); 
    });
});

app.listen(port, () => {
    console.log('Server app listening on port ' + port);
});
