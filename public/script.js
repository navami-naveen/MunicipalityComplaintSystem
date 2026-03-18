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

document.addEventListener("DOMContentLoaded", () => {

  const inputs = document.querySelectorAll("input");

  inputs.forEach((input, index) => {

    input.addEventListener("keypress", function(e){

      if(e.key === "Enter"){

        e.preventDefault();

        if(index < inputs.length - 1){
          inputs[index + 1].focus(); // go next
        } else {
          register(); // last field → submit
        }

      }

    });

  });

});


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
.then(res => res.json())   // ✅ THIS WAS MISSING
.then(data=>{

showPopup(data.message);

// ✅ Redirect for BOTH success and already registered
if(data.message === "Registration successful" || 
   data.message === "User already registered"){

    setTimeout(()=>{
        window.location = "login.html";
    },1500);
}

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

showPopup("Invalid email or password");

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

showToast(data.message);

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

console.log(data); // ✅ MUST be INSIDE here

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
<td>${c.status || "Pending"}</td>
</tr>
`;

table.innerHTML+=row;

});

}); // ✅ data exists ONLY till here

}
/* =========================
   TOAST FUNCTION
========================= */

function showToast(message){
  let t = document.getElementById("toast");

  if(!t) return; // safety check

  t.innerText = message;
  t.className = "show";

  setTimeout(()=>{
    t.className = "";
  },3000);
}
window.onload = function(){

    // run ONLY on dashboard page
    if(window.location.href.includes("dashboard.html")){

        let citizen_id = localStorage.getItem("citizen_id");

        if(!citizen_id){
            window.location = "login.html";
            return;
        }

        loadComplaints(); // ✅ THIS WAS MISSING
    }

};