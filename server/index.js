const express = require('express');

const app=express();
app.use("/Images", express.static("./Images"));
const multer = require('multer');

const path =require('path');
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'Images')
    },

    filename: (req, file, cb) =>{
        console.log(file)
       cb(null, file.originalname)
       //cb(null,Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({storage: storage})

const cors= require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const db=mysql.createPool({
    host: "localhost",
    user: "root",
    password: 'compl3x#' ,
    database:  'movies' ,
});


app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));




app.post("/upload",upload.single("image"), (req,res) => {
  
       console.log("Image Uploaded");
});


app.get("/api/get", (req,res) =>{
    
    const stmt ="SELECT * FROM books;";
    db.query(stmt, (err,result)=>{
        res.send(result);
    })

});

app.get("/api/getreq", (req,res) =>{
    const stmt =`SELECT * FROM requests;`;
    db.query(stmt, (err,result)=>{
        res.send(result);
    })

});

app.get("/api/getlikes", (req,res) =>{
    const stmt =`SELECT * FROM likes;`;
    db.query(stmt, (err,result)=>{
        res.send(result);
    })

});

app.get("/api/getsearch/:bname", (req,res) =>{
    const bname=req.params.bname;
    db.query(`SELECT * FROM books where bname like '${bname}%' ; `,  (err,result)=>{
        res.send(result);
        console.log(result);
       console.log(err);
    })

});


app.delete("/api/accept/:bookid", (req,res) =>{

    const bookid=req.params.bookid;
    db.query("DELETE FROM requests where bookid=?", bookid, (err,result)=>{
        res.send(result);
       console.log(result);
       console.log(err);
    })

});

app.post("/api/postlike", (req,res) =>{
    const bookid=req.body.bookid;
    const senuid=req.body.senuid;
    const recuid=req.body.recuid;
    
    const stmt =`INSERT INTO likes (senuid, recuid, accepted, bookid) VALUES (?,?,0,?);`;
    db.query(stmt, [senuid,recuid,bookid], (err,result)=>{
   //     console.log(result);
    })

});

app.put("/api/postlikeaccept", (req,res) =>{
    const senuid=req.body.senuid;
    const recuid=req.body.recuid;
    const bookid=req.body.bookid;

    db.query("Update likes set accepted=1 where senuid=? and recuid=? and bookid=?", [senuid,recuid,bookid], (err,result)=>{
    res.send(result);   
    console.log(result);
    console.log(err);
    })

});


app.post("/api/like", (req,res) =>{
    const bookid=req.body.bookid;
    const senuid=req.body.senuid;
    const recuid=req.body.recuid;
    
    const stmt =`INSERT INTO requests (recuid,senuid,bookid) VALUES (?,?,?);`;
    db.query(stmt, [recuid,senuid,bookid], (err,result)=>{
   //     console.log(result);
    })

});


app.post("/api/insert", (req,res) =>{
    const name=req.body.name;
    const uid=req.body.uid;
    const key=req.body.key;
    
    const stmt =`INSERT INTO users (uname, uid, password, signed) VALUES (?,?,?,0);`;
    db.query(stmt, [name,uid,key], (err,result)=>{
   //     console.log(result);
    })

});

app.post("/api/bookinsert", (req,res) =>{
    const uid=req.body.Uid;
    const bname=req.body.Title;
    const author=req.body.Author;
    const genre=req.body.Genre;
    const pubyear=req.body.Year;
    const lang=req.body.Lang;
    const price=req.body.Price;
    const desc=req.body.Desc;
    const bid=uid[0]+uid[1]+uid[2]+bname[0]+bname[1]+author[0]+author[0]+pubyear[0]+pubyear[1];
    const imgsrc=req.body.Imgsrc;
    let pdate = new Date().toISOString().slice(0, 10)

    
    const stmt =`INSERT INTO books (uid, bookid, bname, author, genre, pubyear, lang, price, description, imsrc, pdate) VALUES (?,?,?,?,?,?,?,?,?,?,?);`;
    db.query(stmt, [uid,bid,bname,author,genre,pubyear,lang,price,desc,imgsrc,pdate], (err,result)=>{
       console.log(err);
    })

    const fs = require('fs');
    fs.copyFile(`./Images/${imgsrc}`, `../client/src/Uploads/${imgsrc}`, (err) => {
  if (err) throw err;
  console.log('source.txt was copied to destination.txt');
});

});



app.post("/api/signin", (req,res) =>{
    const uid=req.body.uid;
    const key=req.body.key;
    
    const stmt =`SELECT * FROM  users WHERE uid = ? AND password = ? ;`;
    db.query(stmt, [uid,key], (err,result)=>{
          if(err)
          res.send({err: err});
          if(result)
          res.send(result);
          else
          res.send({msg: "Invalid userid or password"});
    });

});


app.listen(3002, ()=> {
    console.log("Listening on port 3002");

});