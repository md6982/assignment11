const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const session = require("express-session");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "secretkey",
    resave: false,
    saveUninitialized: true
}));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "assignment10"
});

db.connect(err => {
    if(err) throw err;
    console.log("MySQL Connected");
});

app.post("/register", (req, res) => {

    const {
        first_name,
        last_name,
        email,
        password,
        contact,
        gender,
        qualification,
        role,
        state,
        city
    } = req.body;

    const sql = `
        INSERT INTO users 
        (first_name,last_name,email,password,contact,gender,qualification,role,state,city)
        VALUES (?,?,?,?,?,?,?,?,?,?)
    `;

    db.query(sql, [
        first_name,
        last_name,
        email,
        password,
        contact,
        gender,
        qualification,
        role,
        state,
        city
    ], (err, result) => {
        if (err) {
            console.log(err);
            res.send("Registration failed 👽");
        } else {
            res.redirect("/");
        }
    });

});

app.post("/login", (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], (err, result) => {

        if (err) throw err;

        if (result.length > 0) {

            if (result[0].password === password) {

                req.session.user = result[0];
                res.redirect("/");

            } else {
                res.send("Wrong password 👺");
            }

        } else {
            res.send("User not found 👽");
        }

    });

});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/");
    });
});

app.get("/", (req, res) => {

    const user = req.session.user;
    
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <style>
    *{
    box-sizing:border-box;
    }

    body{
    font-family: Arial;
    margin:0;
    padding:0;
    min-height:100vh;
    display:flex;
    flex-direction:column;
    }

    nav{
    background:#333;
    color:white;
    padding:15px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    flex-wrap:wrap;
    gap:10px;
    }

    nav button, nav a{
    padding:8px 12px;
    font-size:14px;
    }

    .container{
    max-width:900px;
    margin:auto;
    padding:20px;
    width:100%;
    flex:1;
    }

    footer{
    background:#333;
    color:white;
    text-align:center;
    padding:15px;
    margin-top:auto;
    }

    .modal{
    display:none;
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background:rgba(0,0,0,0.5);
    justify-content:center;
    align-items:center;
    padding:10px;
    }

    .modal-content{
    background:white;
    padding:20px;
    width:100%;
    max-width:400px;
    border-radius:8px;
    max-height:90vh;
    overflow:auto;
    }

    form{
    display:flex;
    flex-direction:column;
    gap:10px;
    }

    input,select,button{
    padding:12px;
    font-size:16px;
    width:100%;
    }

    button{
    background:#007BFF;
    color:white;
    border:none;
    cursor:pointer;
    border-radius:4px;
    }

    /* Tablet */
    @media(max-width:768px){
    nav{
    flex-direction:column;
    align-items:flex-start;
    }

    nav div:last-child{
    width:100%;
    display:flex;
    gap:10px;
    flex-wrap:wrap;
    }

    .modal-content{
    max-width:90%;
    }
    }

    /* Mobile */
    @media(max-width:480px){
    nav{
    padding:10px;
    }

    button{
    font-size:14px;
    padding:10px;
    }

    .modal-content{
    padding:15px;
    }

    .container{
    padding:15px;
    }
    }
    </style>
    </head>
    
    <body>
    
    <nav>
    <div>Assignment 11</div>
    <div>
    ${user ? `
    Welcome ${user.first_name}
    <a href="/logout" style="color:white;margin-left:10px;text-decoration:none;">Logout</a>
    ` :
    `
    <button onclick="showLogin()">Login</button>
    <button onclick="showRegister()">Register</button>
    `}
    </div>
    </nav>
    
    <div class="container">
    
    <div id="login" class="modal">
    <div class="modal-content">
    <h2>Login</h2>
    <form method="POST" action="/login">
    <input name="email" placeholder="Email" required>
    <input type="password" name="password" placeholder="Password" required>
    <button>Login</button>
    </form>
    </div>
    </div>
    
    <div id="register" class="modal">
    <div class="modal-content">
    <h2>Register</h2>
    <form method="POST" action="/register">
    <input name="first_name" placeholder="First Name" required>
    <input name="last_name" placeholder="Last Name" required>
    <input name="email" placeholder="Email" required>
    <input type="password" name="password" placeholder="Password" required>
    <input name="contact" placeholder="Contact">
    <select name="gender">
    <option>Male</option>
    <option>Female</option>
    <option>Trans</option>
    </select>
    <input name="qualification" placeholder="Qualification">
    <select name="role">
    <option>Student</option>
    <option>Faculty</option>
    </select>
    <input name="state" placeholder="State">
    <input name="city" placeholder="City">
    <button>Register</button>
    </form>
    </div>
    </div>
    
    </div>

    <footer>
    🥳 Made by Md Aquib,(24U021021) 🥳
    </footer>
    
    <script>
    function showLogin(){
    document.getElementById("login").style.display="flex";
    document.getElementById("register").style.display="none";
    }

    function showRegister(){
    document.getElementById("register").style.display="flex";
    document.getElementById("login").style.display="none";
    }

    window.onclick = function(e){
    if(e.target.classList.contains("modal")){
    e.target.style.display="none";
    }
    }
    </script>
    
    </body>
    </html>
    `);
    
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));
