// Server URL
const server = "http://localhost:3000";

// =========================
// ADMIN LOGIN
// =========================
function adminLogin() {
    fetch(server + "/admin/login", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: document.getElementById("username").value,
            password: document.getElementById("password").value
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data.admin_id) {
                localStorage.setItem("admin_id", data.admin_id);
                window.location = "admin.html";
            } else {
                alert("Invalid login");
            }
        });
}

// =========================
// LOAD ADMIN DASHBOARD
// =========================
if (window.location.pathname.includes("admin.html")) {

    // LOAD OFFICERS LIST (for officer management table)
    fetch(server + "/officers")
        .then(res => res.json())
        .then(officers => {

            // Populate officer management table
            let officersTable = document.getElementById("officersTable");

            if (officersTable) {

                officersTable.innerHTML = `
                <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Action</th>
                </tr>
                `;

                officers.forEach(o => {

                    let row = document.createElement("tr");

                    row.innerHTML = `
                        <td>${o.officer_id}</td>
                        <td>${o.name}</td>
                        <td>${o.department || ""}</td>
                        <td>
                        <button onclick="deleteOfficer(${o.officer_id})">
                        Delete
                        </button>
                        </td>
                    `;

                    officersTable.appendChild(row);

                });

            }

            // LOAD COMPLAINTS
            fetch(server + "/admin/complaints")
                .then(res => res.json())
                .then(data => {

                    let table = document.getElementById("complaintsTable");

                    table.innerHTML = `
                        <tr>
                        <th>ID</th>
                        <th>Category</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Assign Officer</th>
                        </tr>
                    `;

                    data.forEach(c => {

                        let officerOptions = "";

                        officers.forEach(o => {
                            officerOptions += `<option value="${o.officer_id}">${o.name}</option>`;
                        });

                        let row = document.createElement("tr");

                        row.innerHTML = `
                            <td>${c.complaint_id}</td>
                            <td>${c.category}</td>
                            <td>${c.description}</td>
                            <td id="status${c.complaint_id}">${c.status || "Pending"}</td>
                            <td>
                                <select id="officer${c.complaint_id}">
                                    ${officerOptions}
                                </select>

                                <button onclick="assignOfficer(${c.complaint_id})">
                                Assign
                                </button>
                            </td>
                        `;

                        table.appendChild(row);

                    });

                });

        });
}

// =========================
// ASSIGN OFFICER FUNCTION
// =========================
function assignOfficer(id) {

    let officer = document.getElementById("officer" + id).value;

    fetch(server + "/assign-officer", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({
            complaint_id: id,
            officer_id: officer
        })

    })
        .then(res => res.json())
        .then(data => {

            alert(data.message);

            // Update status instantly
            document.getElementById("status" + id).innerText = "In Progress";

        });

}

// =========================
// ADD OFFICER
// =========================
function addOfficer(){

fetch(server+"/admin/add-officer",{

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

alert(data.message);
location.reload();

});

}

// =========================
// DELETE OFFICER
// =========================
function deleteOfficer(id){

if(!confirm("Are you sure you want to delete this officer?"))
return;

fetch(server+"/admin/delete-officer",{

method:"POST",
headers:{'Content-Type':'application/json'},

body:JSON.stringify({
officer_id:id
})

})
.then(res=>res.json())
.then(data=>{

alert(data.message);
location.reload();

});

}