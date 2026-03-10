const server = "http://localhost:3000";

/* =========================
   CITIZEN REGISTER
========================= */

function register(){

fetch(server + "/citizen/register",{

method:"POST",
headers:{'Content-Type':'application/json'},

body:JSON.stringify({

name:document.getElementById("name").value,
email:document.getElementById("email").value,
password:document.getElementById("password").value,
ward:document.getElementById("ward").value,
phone:document.getElementById("phone").value

})

})
.then(res=>res.json())
.then(data=>{

alert(data.message);
window.location="login.html";

});

}

/* =========================
   CITIZEN LOGIN
========================= */

function login(){

fetch(server + "/citizen/login",{

method:"POST",
headers:{'Content-Type':'application/json'},

body:JSON.stringify({

email:document.getElementById("email").value,
password:document.getElementById("password").value

})

})
.then(res=>res.json())
.then(data=>{

if(data.citizen_id){

localStorage.setItem("citizen_id",data.citizen_id);

window.location="dashboard.html";

}else{

alert("Invalid email or password");

}

});

}

/* =========================
   SUBMIT COMPLAINT
========================= */

function submitComplaint(){

fetch(server + "/complaint",{

method:"POST",
headers:{'Content-Type':'application/json'},

body:JSON.stringify({

citizen_id:localStorage.getItem("citizen_id"),
category:document.getElementById("category").value,
description:document.getElementById("description").value

})

})
.then(res=>res.json())
.then(data=>{

alert(data.message);

loadComplaints();

});

}

/* =========================
   LOAD CITIZEN COMPLAINTS
========================= */

function loadComplaints(){

fetch(server + "/complaints/" + localStorage.getItem("citizen_id"))

.then(res=>res.json())

.then(data=>{

let table=document.getElementById("complaintsTable");

if(!table) return;

table.innerHTML=`
<tr>
<th>ID</th>
<th>Category</th>
<th>Description</th>
<th>Status</th>
</tr>
`;

data.forEach(c=>{

let row=`
<tr>
<td>${c.complaint_id}</td>
<td>${c.category}</td>
<td>${c.description}</td>
<td>${c.status}</td>
</tr>
`;

table.innerHTML+=row;

});

});

}

/* AUTO LOAD COMPLAINTS WHEN DASHBOARD OPENS */

if(window.location.pathname.includes("dashboard.html")){

if(!localStorage.getItem("citizen_id")){
window.location="login.html";
}

loadComplaints();

}