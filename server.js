const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.json());
app.use(express.static("public"));

const db = new sqlite3.Database("complaints.db");

/* =========================
   CITIZEN REGISTER
========================= */
app.post("/citizen/register",(req,res)=>{

const {name,email,password,ward,phone}=req.body;

db.run(
`INSERT INTO citizens(name,email,password,ward,phone)
VALUES(?,?,?,?,?)`,
[name,email,password,ward,phone],

function(err){

if(err){
console.log(err);
res.json({message:"Registration failed"});
}else{
res.json({message:"Registration successful"});
}

});

});


/* =========================
   CITIZEN LOGIN
========================= */
app.post("/citizen/login", (req, res) => {
    const { email, password } = req.body;

    db.get(
        `SELECT * FROM citizens WHERE email=? AND password=?`,
        [email, password],
        (err, row) => {
            if (row) {
                res.json(row);
            } else {
                res.json({ message: "Invalid login" });
            }
        }
    );
});


/* =========================
   SUBMIT COMPLAINT WITH DUPLICATE DETECTION
========================= */

app.post("/complaint",(req,res)=>{

const {citizen_id,category,description}=req.body;

// extract keyword
let keyword = description.split(" ")[0];

// get ward from citizens table
db.get(
`SELECT ward FROM citizens WHERE citizen_id=?`,
[citizen_id],

function(err,user){

if(err || !user){
return res.json({message:"Citizen not found"});
}

let ward = user.ward;

// check duplicate complaint
db.get(
`SELECT * FROM complaints
WHERE category=? 
AND ward=? 
AND description LIKE ?
AND complaint_date >= date('now','-7 day')`,

[category,ward,"%"+keyword+"%"],

function(err,row){

if(row){

// duplicate found → increase priority
db.run(
`UPDATE complaints
SET priority_count = priority_count + 1
WHERE complaint_id=?`,
[row.complaint_id],

function(){

res.json({
message:"Similar complaint found. Priority increased."
});

});

}else{

// insert new complaint
const date = new Date().toISOString().split("T")[0];

db.run(
`INSERT INTO complaints
(citizen_id,category,description,ward,complaint_date,priority_count)
VALUES(?,?,?,?,?,1)`,

[citizen_id,category,description,ward,date],

function(err){

if(err){
console.log(err);
res.json({message:"Complaint submission failed"});
}else{
res.json({message:"Complaint submitted successfully"});
}

});

}

});

});

});

/* =========================
   GET CITIZEN COMPLAINTS
========================= */
app.get("/complaints/:citizen_id", (req, res) => {
    const citizen_id = req.params.citizen_id;

    db.all(
        `SELECT c.*, sh.status
         FROM complaints c
         LEFT JOIN Status_History sh ON c.complaint_id = sh.complaint_id
         WHERE c.citizen_id=?`,
        [citizen_id],
        (err, rows) => {
            res.json(rows);
        }
    );
});

/* =========================
   ADMIN LOGIN
========================= */
app.post("/admin/login", (req,res)=>{

const {username,password} = req.body;

db.get(
"SELECT * FROM admins WHERE username=? AND password=?",
[username,password],
(err,row)=>{

if(row){
res.json({success:true});
}
else{
res.json({success:false});
}

});

});

/* =========================
   GET ALL COMPLAINTS (ADMIN)
========================= */
app.get("/admin/complaints", (req, res) => {
    db.all(`SELECT * FROM complaints`, [], (err, rows) => {
        res.json(rows);
    });
});

/* =========================
   GET ALL OFFICERS
========================= */
app.get("/officers", (req, res) => {
    db.all(`SELECT * FROM officers`, [], (err, rows) => {
        res.json(rows);
    });
});

/* =========================
   ASSIGN OR REASSIGN OFFICER
========================= */
app.post("/assign-officer", (req, res) => {
    const { complaint_id, officer_id } = req.body;
    const date = new Date().toISOString().split("T")[0];

    if(!complaint_id || !officer_id){
        return res.json({ message: "Complaint ID and Officer ID are required" });
    }

    // Check if already assigned
    db.get(
        `SELECT * FROM Complaint_Assignment WHERE complaint_id=?`,
        [complaint_id],
        (err, row) => {
            if(err){
                return res.json({ message: "DB error", error: err });
            }

            if(row){
                // Already assigned → update officer
                db.run(
                    `UPDATE Complaint_Assignment SET officer_id=?, assigned_date=? WHERE complaint_id=?`,
                    [officer_id, date, complaint_id],
                    function(err){
                        if(err){
                            return res.json({ message: "Reassignment failed", error: err });
                        }
                        // Update status to In Progress
                        db.run(
                            `INSERT INTO Status_History (complaint_id,status,updated_date) VALUES (?,?,?)`,
                            [complaint_id, "In Progress", date],
                            function(err){
                                if(err) return res.json({ message: "Status update failed", error: err });
                                res.json({ message: "Officer reassigned successfully" });
                            }
                        );
                    }
                );
            } else {
                // First time assignment
                db.run(
                    `INSERT INTO Complaint_Assignment (complaint_id,officer_id,assigned_date) VALUES (?,?,?)`,
                    [complaint_id, officer_id, date],
                    function(err){
                        if(err){
                            return res.json({ message: "Assignment failed", error: err });
                        }
                        // Status In Progress
                        db.run(
                            `INSERT INTO Status_History (complaint_id,status,updated_date) VALUES (?,?,?)`,
                            [complaint_id, "In Progress", date],
                            function(err){
                                if(err) return res.json({ message: "Status update failed", error: err });
                                res.json({ message: "Officer assigned successfully" });
                            }
                        );
                    }
                );
            }
        }
    );
});

/* =========================
   OFFICER LOGIN
========================= */
app.post("/officer/login", (req, res) => {
    const { email, password } = req.body;

    db.get(
        `SELECT * FROM officers WHERE email=? AND password=?`,
        [email, password],
        (err, row) => {
            if (row) {
                res.json(row);
            } else {
                res.json({ message: "Invalid login" });
            }
        }
    );
});

/* =========================
   OFFICER COMPLAINTS
========================= */
app.get("/officer/complaints/:officer_id", (req, res) => {
    const officer_id = req.params.officer_id;

    db.all(
        `SELECT c.*, 
                (SELECT status FROM Status_History WHERE complaint_id=c.complaint_id ORDER BY updated_date DESC LIMIT 1) AS status
         FROM complaints c
         JOIN Complaint_Assignment ca ON c.complaint_id = ca.complaint_id
         WHERE ca.officer_id=?`,
        [officer_id],
        (err, rows) => {
            if(err) return res.json({ message: "DB error", error: err });
            res.json(rows);
        }
    );
});

/* =========================
   UPDATE STATUS (OFFICER)
========================= */
app.post("/update-status", (req, res) => {
    const { complaint_id, status } = req.body;
    const date = new Date().toISOString().split("T")[0];

    db.run(
        `INSERT INTO Status_History (complaint_id,status,updated_date) VALUES (?,?,?)`,
        [complaint_id, status, date],
        (err) => {
            if (err) {
                res.json({ message: "Status update failed" });
            } else {
                res.json({ message: "Status updated" });
            }
        }
    );
});

/* =========================
   ADD NEW OFFICER
========================= */
app.post("/admin/add-officer", (req, res) => {

    const { name, email, password, department } = req.body;

    db.run(
        `INSERT INTO officers (name,email,password,department) VALUES (?,?,?,?)`,
        [name, email, password, department],
        function(err){
            if(err){
                console.log(err);
                res.json({message:"Failed to add officer"});
            }else{
                res.json({message:"Officer added successfully"});
            }
        }
    );

});

/* =========================
   DELETE OFFICER
========================= */
app.post("/admin/delete-officer", (req, res) => {

    const { officer_id } = req.body;

    db.run(
        `DELETE FROM officers WHERE officer_id=?`,
        [officer_id],
        function(err){
            if(err){
                console.log(err);
                res.json({message:"Failed to delete officer"});
            }else{
                res.json({message:"Officer deleted successfully"});
            }
        }
    );

});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});