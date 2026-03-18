const server = "http://localhost:3000";
function showPopup(message){
  let popup = document.getElementById("popup");
  let msg = document.getElementById("popupMessage");

  if(!popup) return;

  msg.innerText = message;
  popup.style.display = "flex";

  setTimeout(()=>{
    popup.style.display = "none";
  },1500);
}
/* =========================
   ADMIN LOGIN
========================= */



function adminLogin(){

let username = document.getElementById("username").value;
let password = document.getElementById("password").value;

fetch(server + "/admin/login", {

method: "POST",

headers: {
"Content-Type": "application/json"
},

body: JSON.stringify({
username: username,
password: password
})

})

.then(res => res.json())

.then(data => {

if(data.success){

showPopup("Login successful");

window.location.href = "admin.html";

}

else{

showPopup("Invalid credentials");

}

})

.catch(err => {

console.log(err);
showPopup("Server error");

});

}
/* =========================
   LOAD ALL COMPLAINTS
========================= */

function loadComplaints(){

fetch(server + "/admin/complaints")

.then(res => res.json())

.then(data => {

let table = document.getElementById("complaintsTable");

if(!table) return;

table.innerHTML = `
<tr>
<th>ID</th>
<th>Category</th>
<th>Description</th>
<th>Ward</th>
<th>Status</th>
<th>Priority</th>
<th>Assign Officer</th>
</tr>
`;

data.forEach(c => {

let row = `
<tr>
<td>${c.complaint_id}</td>
<td>${c.category}</td>
<td>${c.description}</td>
<td>${c.ward}</td>
<td>${c.status || "Pending"}</td>
<td>${c.priority_count}</td>

<td>
<select id="officerSelect${c.complaint_id}" onchange="this.setAttribute('data-selected', this.value)">
<option value="">Select Officer</option>
</select>

<button onclick="assignOfficer(${c.complaint_id})">
Assign
</button>
</td>

</tr>
`;

table.innerHTML += row;

});

loadOfficersForDropdown(data);

});

}



/* =========================
   LOAD OFFICERS FOR DROPDOWN
========================= */

function loadOfficersForDropdown(data){

fetch(server + "/officers")
.then(res => res.json())
.then(officers => {

data.forEach(c => {

let select = document.getElementById("officerSelect" + c.complaint_id);
if(!select) return;

officers.forEach(o => {

let option = document.createElement("option");
option.value = o.officer_id;
option.text = o.name + " (" + o.department + ")";

select.appendChild(option);

// ✅ SET SELECTED OFFICER
if(c.officer_id && c.officer_id == o.officer_id){
    select.value = o.officer_id;
}

});

});

});

}

/* =========================
   ASSIGN OFFICER
========================= */

function assignOfficer(complaint_id){

let officer_id = document.getElementById(
"officerSelect" + complaint_id
).value;

if(!officer_id){
showPopup("Please select an officer");
return;
}

fetch(server + "/assign-officer",{

method:"POST",
headers:{'Content-Type':'application/json'},

body:JSON.stringify({

complaint_id:complaint_id,
officer_id:officer_id

})

})

.then(res=>res.json())

.then(data=>{

showPopup(data.message);

loadComplaints();

});

}



/* =========================
   LOAD OFFICERS TABLE
========================= */

function loadOfficers(){

fetch(server + "/officers")

.then(res => res.json())

.then(data => {

let table = document.getElementById("officersTable");

if(!table) return;

table.innerHTML = `
<tr>
<th>ID</th>
<th>Name</th>
<th>Department</th>
<th>Action</th>
</tr>
`;

data.forEach(o => {

let row = `
<tr>
<td>${o.officer_id}</td>
<td>${o.name}</td>
<td>${o.department}</td>

<td>
<button onclick="deleteOfficer(${o.officer_id})">
Delete
</button>
</td>

</tr>
`;

table.innerHTML += row;

});

});

}



/* =========================
   ADD OFFICER
========================= */

function addOfficer(){

fetch(server + "/admin/add-officer",{

method:"POST",
headers:{'Content-Type':'application/json'},

body:JSON.stringify({

name:document.getElementById("officerName").value,
email:document.getElementById("officerEmail").value,
password:document.getElementById("officerPassword").value,
department:document.getElementById("officerDept").value

})

})

.then(res=>res.json())

.then(data=>{

showPopup(data.message);

loadOfficers();

});

}



/* =========================
   DELETE OFFICER
========================= */

function deleteOfficer(id){

if(!confirm("Delete this officer?")) return;

fetch(server + "/admin/delete-officer",{

method:"POST",
headers:{'Content-Type':'application/json'},

body:JSON.stringify({

officer_id:id

})

})

.then(res=>res.json())

.then(data=>{

showPopup(data.message);

loadOfficers();

});

}



/* =========================
   AUTO LOAD DATA
========================= */

window.onload = function(){

loadComplaints();
loadOfficers();

};
document.addEventListener("DOMContentLoaded", () => {

  const inputs = document.querySelectorAll("input");

  inputs.forEach((input, index) => {

    input.addEventListener("keypress", function(e){

      if(e.key === "Enter"){

        e.preventDefault();

        if(index < inputs.length - 1){
          inputs[index + 1].focus();
        } else {
          addOfficer(); // for admin add officer form
        }

      }

    });

  });

});