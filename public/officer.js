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

<td>
<select onchange="updateStatus(${c.complaint_id},this.value)">
<option>In Progress</option>
<option>Resolved</option>
</select>
</td>

</tr>
`;

table.innerHTML+=row;

});

});

}

function updateStatus(id,status){

fetch(server+"/complaint/update",{

method:"POST",
headers:{'Content-Type':'application/json'},

body:JSON.stringify({
complaint_id:id,
status:status
})

})
.then(res=>res.json())
.then(data=>{
alert(data.message);
});

}