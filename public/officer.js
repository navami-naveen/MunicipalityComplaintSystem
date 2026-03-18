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
const server="http://localhost:3000";

function officerLogin(){

fetch(server+"/officer/login",{

method:"POST",
headers:{'Content-Type':'application/json'},

body:JSON.stringify({

email:document.getElementById("email").value,
password:document.getElementById("password").value

})

})
.then(res=>res.json())
.then(data=>{

if(data.officer_id){

localStorage.setItem("officer_id",data.officer_id);
window.location="officer.html";

}else{

alert("Invalid login");

}

});

}

/* LOAD OFFICER COMPLAINTS */

if(window.location.pathname.includes("officer.html")){

let id=localStorage.getItem("officer_id");

fetch(server+"/officer/complaints/"+id)

.then(res=>res.json())

.then(data=>{

let table=document.getElementById("complaintsTable");

data.forEach(c=>{

let row=`
<tr>
<td>${c.complaint_id}</td>
<td>${c.category}</td>
<td>${c.description}</td>
<td>${c.location || "-"}</td>

<td>
<select onchange="updateStatus(${c.complaint_id},this.value)">
<option value="In Progress" ${c.status==="In Progress"?"selected":""}>In Progress</option>
<option value="Resolved" ${c.status==="Resolved"?"selected":""}>Resolved</option>
</select>
</td>

</tr>
`;

table.innerHTML+=row;

});

});

}

function updateStatus(id,status){

fetch(server+"/update-status",{

method:"POST",
headers:{'Content-Type':'application/json'},

body:JSON.stringify({
complaint_id:id,
status:status
})

})
.then(res=>res.json())
.then(data=>{
    showPopup(data.message); // instead of alert
});

}
document.addEventListener("DOMContentLoaded", () => {

  const inputs = document.querySelectorAll("input");

  inputs.forEach((input, index) => {

    input.addEventListener("keypress", function(e){

      if(e.key === "Enter"){

        e.preventDefault();

        if(index < inputs.length - 1){
          inputs[index + 1].focus();
        }

      }

    });

  });

});