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

    // Load officers and complaints
    fetch(server + "/officers")
        .then(res => res.json())
        .then(officers => {

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
                                <button onclick="assignOfficer(${c.complaint_id})">Assign</button>
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

    fetch(server + "/assign-officer", {   // <-- FIXED URL
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
            // Update status cell dynamically
            document.getElementById("status" + id).innerText = "In Progress";
        });
}