const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const bcrypt = require("bcryptjs")

 
const connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'mydb'
});
 
connection.connect(function(error){
    if(!!error) console.log(error);
    else console.log('Database Connected!');
}); 
 
//set views file
const publicDirectory = path.join(__dirname, 'public');
    app.use(express.static(publicDirectory));

			
//set view engine
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
 
 
 
app.get('/user',(req, res) => {
    
    let sql = "SELECT * FROM users01";
    let query = connection.query(sql, (err, rows) => {
        if(err) throw err;
        res.render('user', {
            
            users : rows
        });
    });
});

app.get('/', (req,res) => {

    res.render('login')
});
app.get('/userMana', (req,res) => {

    res.render('userMana')
});




app.post('/login',  async (req, res ) => {
    const vote = req.body.vote;
   const { username ,password} = req.body;
    let sql ="select * from users01 where username =   ? ";
     connection.query(sql,[username], async(err,result) => {
        if(err) throw err;
        console.log(username)
        console.log(result)
       
          
          
          if(result.length <= 0  || !(await  bcrypt.compare(password, result[0].password))){
              return  res.status(400).render('login',{
                  login : "password or username is Uncorrect"
              });
          }
          if(vote == "user Management")
              res.redirect('/userMana');
         else if(vote == "Account Management"){

            res.redirect('/accountMana');
         }
      
    })
   
   
});



app.get('/register', (req, res ) => {

    res.render('register');
});
app.get('/pre-register', (req, res ) => {

    res.render('pre-register');
});
app.get('/pre-register2', (req, res ) => {

    res.render('pre-register2');
});
app.get('/deletetransfers', (req, res ) => {

    res.render('deletetransfers');
});



app.post('/add' ,(req,res) =>{

  const  {username , password ,  repassword, name , date , budget  } = req.body


                    //checkin that there is no other user with same username
    let sql0 = "select username from users01 where username =  ? ";
    connection.query(sql0, username, async (err,result)=>{
        if(err) throw err;

        if(result.length > 0 ){

           return res.render("register", {

            message : "Username already been used"

           }) 
        }else if(password != repassword){
            return res.render("register", {

                message : "password is unmatch"

        });
     
    }
    let hashcode = await bcrypt.hash(password,8);
    console.log(hashcode)

     
        let sql ="insert into  users01 SET  ? ";
        connection.query(sql ,{username:username , password :hashcode , name : name , date :date , budget : budget } , (err,result) => {
           if(err) throw err;
          // res.redirect("/register")
           res.render("register",{
               succes : "User has been added"
           })

    })

    });
});



app.get('/edit/:Username', (req,res) =>{

let Username = req.params.Username;
console.log(Username)
let sql = 'select * from users01 where username  = ?';

connection.query(sql,Username, (err,result) => {
    if(err) throw err;

    res.render("user_edit", {
        user : result[0]
   
    });
    

});
});

app.post('/update', async (req,res) =>{


const usern = req.body.username;
const password = req.body.password;



let hashcode = await bcrypt.hash(password,8);
console.log(hashcode)


let sql = "update users01 SET password= '"+hashcode +"',name = '"+ req.body.name+"',date = '"+
                                 req.body.date+ "' where username = ?" ;



connection.query(sql,usern,(err,result)=>{

    if(err) throw err;
    res.redirect("/user")

});

});

app.get('/delete/:Username', (req,res) =>{

    let Username = req.params.Username;
    
    let sql = 'delete from users01 where username  = ?';
    
    connection.query(sql,Username, (err,result) => {
        if(err) throw err;
    
        res.redirect("/user")
     });
    });

 
// Server Listening
app.listen(3000, () => {
    console.log('Server is running at port 3000');
});



// palce for second table
app.get('/incomes', (req, res ) => {

    res.render('incomes');
});

app.get('/expenses', (req, res ) => {

    res.render('expenses');
});


//account manager
app.get('/accountMana', (req, res ) => {

    const username = req.body.username;
    let sql ="select username from users01 where username =  ? ";
    connection.query(sql,[username],(err,result) => {
        if(err) throw err;
        if(result.length < 0){
            return  res.status(401).render('login',{
                login : "you entre wrong username or password"
            });
        }
       
    })

    res.render('accountMana');
});



// add data to financial table

app.post('/incomes' ,(req,res) =>{

    let fdata = { id : req.body.fid ,concept :req.body.concept, date : req.body.fdate  , amount : req.body.famount};
    let sql ="insert into  financial SET  ? ";
    console.log(fdata);
    connection.query(sql , fdata , (err,result) => {
       if(err) throw err;
       res.redirect("/accountMana")
        
    
    });


});

app.post('/expenses' ,(req,res) =>{

    let fdata = { id : req.body.fid ,concept :req.body.concept, date : req.body.fdate  , amount : (req.body.famount)*-1};
    let sql ="insert into  financial SET  ? ";
    console.log(fdata);
    connection.query(sql , fdata , (err,result) => {
       if(err) throw err;
       res.redirect("/accountMana")
        
    
    });


});
app.get('/fuser',(req, res) => {
    let sql = "SELECT * from financial";
    let sql1 = "select sum(amount) as sum from financial";
    let sql2 ="select Count(amount) as count from financial";
     connection.query(sql, (err, rows) => {
        connection.query(sql1, (err, result) => {
            connection.query(sql2, (err, result0) => {
                console.log(result0[0].count)
        res.render('fuser' ,{
            finances : rows,
            sum : result[0],
            Count : result0[0]
        })
            
        });
   });
});
});


   
//delete  transfers
app.get('/control',(req, res) => {
    let sql = "SELECT * from financial";
    let sql1 = "select sum(amount) as sum from financial";
    let sql2 ="select Count(amount) as count from financial";
     connection.query(sql, (err, rows) => {
        connection.query(sql1, (err, result) => {
            connection.query(sql2, (err, result0) => {
        res.render('deletetransfers' ,{
            finances : rows,
            sum : result[0],
            Count : result0[0]
        })
            
        });
   });
});
});

app.get('/Accdelete/:id', (req,res) =>{

    let id = req.params.id;
    
    let sql = 'delete from financial where id  = ?';
    
    connection.query(sql,id, (err,result) => {
        if(err) throw err;
    
        res.redirect("/fuser")
     });
    });

    app.get('/fdelete/:id', (req,res) =>{

        let id = req.params.id;

        let sql0 ="delete  from financial where id = ?"
        
        connection.query(sql0,id, (err, result) => {
            if(err) throw err;
               res.redirect("/fuser");
            })
                
            });
       
    
     
       
        