const API_URL = "https://localhost:7202/api/freelancersapi";

// Load existing freelancers
async function loadFreelancers() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        const tbody = document.querySelector("#freelancerTable tbody");
        tbody.innerHTML = ""; // clear existing rows

        data.forEach(f => {
            const row = `<tr>
                <td>${f.username}</td>
                <td>${f.email}</td>
                <td>${f.phoneNum}</td>
            </tr>`;
            tbody.innerHTML += row;
        });
    } catch (err) {
        console.error("Error fetching freelancers:", err);
    }
}

// Handle form submission
document.getElementById("createForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const freelancer = {
        username: document.getElementById("username").value,
        email: document.getElementById("email").value,
        phoneNum: document.getElementById("phone").value,
        skillsets: [],
        hobbies: []
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(freelancer)
        });

        const msgDiv = document.getElementById("message");
        if (response.ok) {
            msgDiv.innerText = "Freelancer created successfully!";
            loadFreelancers(); // refresh table
        } else {
            msgDiv.innerText = "Error: " + response.status;
        }
    } catch (err) {
        document.getElementById("message").innerText = "Request failed: " + err;
    }
});

// Initial load
loadFreelancers();
