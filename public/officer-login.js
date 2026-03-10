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
alert("Invalid officer login");
}

});

}