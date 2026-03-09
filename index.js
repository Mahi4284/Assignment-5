// Protect route – redirect to login if not authenticated
if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

const BASE_URL = 'https://phi-lab-server.vercel.app/api/v1/lab';
let allIssues = [];

const issuesGrid = document.getElementById('issuesGrid');
const loading = document.getElementById('loading');
const issueCountEl = document.getElementById('issueCount');
const tabs = document.querySelectorAll('.tab');
const searchInput = document.getElementById('searchInput');

// Fetch all issues..............
async function fetchIssues() {
    loading.classList.remove('hidden');
    issuesGrid.innerHTML = '';

    try {
        const res = await fetch(`${BASE_URL}/issues`);
        const result = await res.json();

        if (result.status === 'success') {
            allIssues = result.data || [];
            renderIssues(allIssues);
        } else {
            issuesGrid.innerHTML = '<p class="text-error text-center col-span-full">Failed to load issues</p>';
        }
    } catch (err) {
        issuesGrid.innerHTML = '<p class="text-error text-center col-span-full">Network error</p>';
    } finally {
        loading.classList.add('hidden');
    }
}

// No Found issues.............
function renderIssues(issues) {
    issuesGrid.innerHTML = '';
    issueCountEl.textContent = issues.length;

    if (issues.length === 0) {
        issuesGrid.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center py-2 text-center">
        <img class="h-50 rounded-full pb-3" src="./assets/sad.jpg" alt="">
        <p class="text-3xl text-red-700 font-bold mb-4">No Issues Found</p>
    </div>
    `;
        return;
    }


    // issuesGrid..............
    issues.forEach(issue => {

        let priorityColor = "bg-gray-200";

        if (issue.priority?.toLowerCase() === "high") {
            priorityColor = "bg-green-300 text-black";
        }
        else if (issue.priority?.toLowerCase() === "low") {
            priorityColor = "bg-red-300 text-black";
        }

        const card = document.createElement('div');
        card.className = `card bg-base-100 shadow-md hover:shadow-lg transition issue-card ${issue.status}`;

        const statusIcon = issue.status === 'open'
            ? '<img src="./assets/Open-Status.png" class="w-6 h-6">'
            : '<img src="./assets/Closed- Status .png" class="w-6 h-6">';

        card.innerHTML = `
        <div class="card-body p-5">
        <div class="flex justify-between">    
        <div class="badge mb-4 font-bold pl-0">
        ${statusIcon}
        </div>

        <div class="px-2 rounded-md ${priorityColor} mb-4">
        ${issue.priority || 'N/A'}
        </div>
        </div>
        
    
        <h2 class="card-title text-lg">${issue.title}</h2>
        <p class="text-sm text-base-content/70 line-clamp-2">${issue.description || 'No description'}</p>


        
        <div class="mt-3 flex flex-wrap gap-1">
    
    
    ${issue.labels?.map(l => {

            let labelColor = "bg-yellow-200 text-yellow-800";

            if (l === "bug") {
                labelColor = "bg-red-200 text-red-800";
            }
            else if (l === "enhancement") {
                labelColor = "bg-green-200 text-green-800";
            }

            return `<div class="${labelColor} px-2 py-1 rounded-md text-[10px] font-bold">
                ${l.toUpperCase()}
            </div>`

        }).join('') || ''}
        </div>


        <div class="mt-4 text-sm opacity-70 flex justify-between">
            <span>#1 by ${issue.author || 'Unknown'}</span>
            <span>${new Date(issue.createdAt).toLocaleDateString()}</span>
        </div>
        </div>
        `;

        card.addEventListener('click', () => showModal(issue));
        issuesGrid.appendChild(card);
    });
}



// Show issue details in modal
function showModal(issue) {
    document.getElementById('modalTitle').textContent = issue.title;
    document.getElementById('modalDesc').textContent = issue.description || 'No description provided.';
    document.getElementById('modalStatus').textContent = issue.status?.toUpperCase() || 'N/A';
    document.getElementById('modalPriority').textContent = issue.priority || 'N/A';
    document.getElementById('modalLabels').textContent = issue.labels?.join(', ') || 'None';
    document.getElementById('modalAuthor').textContent = issue.author || 'Unknown';
    document.getElementById('modalCreated').textContent = new Date(issue.createdAt).toLocaleString();

    document.getElementById('issueModal').showModal();
}


// Tab switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('tab-active'));
        tab.classList.add('tab-active');

        const filter = tab.dataset.tab;

        let filtered = allIssues;
        if (filter === 'open') filtered = allIssues.filter(i => i.status?.toLowerCase() === 'open');
        if (filter === 'closed') filtered = allIssues.filter(i => i.status?.toLowerCase() === 'closed');

        renderIssues(filtered);
    });
});


// Search bar.................
searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();

    if (!q) {
        const activeTab = document.querySelector('.tab-active')?.dataset.tab || 'all';
        let filtered = allIssues;
        if (activeTab === 'open') filtered = allIssues.filter(i => i.status?.toLowerCase() === 'open');
        if (activeTab === 'closed') filtered = allIssues.filter(i => i.status?.toLowerCase() === 'closed');
        renderIssues(filtered);
        return;
    }

    const searched = allIssues.filter(issue =>
        issue.title?.toLowerCase().includes(q) ||
        issue.description?.toLowerCase().includes(q) ||
        issue.author?.toLowerCase().includes(q)
    );

    renderIssues(searched);
});

// Initial load
fetchIssues();