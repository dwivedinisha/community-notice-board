class DataStorage {
            constructor() {
                this.storageKey = 'communityBoardData';
                this.data = this.loadData();
            }

            loadData() {
                try {
                    // Try to load from localStorage if available
                    if (typeof(Storage) !== "undefined") {
                        const savedData = localStorage.getItem(this.storageKey);
                        if (savedData) {
                            return JSON.parse(savedData);
                        }
                    }
                } catch (e) {
                    console.log('localStorage not available, using session data');
                }

                // Default data if no saved data exists
                return {
                    notices: [
                        {
                            id: 1,
                            title: "Society Meeting",
                            content: "Monthly society meeting scheduled for this weekend. All residents are requested to attend.",
                            author: "Society Secretary",
                            date: new Date().toLocaleDateString(),
                            timestamp: Date.now()
                        },
                        {
                            id: 2,
                            title: "Water Supply Interruption",
                            content: "Water supply will be interrupted on Saturday from 10 AM to 2 PM for maintenance work.",
                            author: "Maintenance Team",
                            date: new Date().toLocaleDateString(),
                            timestamp: Date.now()
                        }
                    ],
                    residents: [
                        {
                            id: 1,
                            name: "John Doe",
                            flat: "A-101",
                            phone: "+91 9876543210",
                            email: "john.doe@email.com",
                            family: 4,
                            timestamp: Date.now()
                        },
                        {
                            id: 2,
                            name: "Jane Smith",
                            flat: "B-205",
                            phone: "+91 9876543211",
                            email: "jane.smith@email.com",
                            family: 2,
                            timestamp: Date.now()
                        }
                    ],
                    problems: [
                        {
                            id: 1,
                            title: "Elevator Not Working",
                            description: "The elevator in Block A has been out of order for 3 days.",
                            priority: "high",
                            reporter: "Alice Johnson",
                            status: "open",
                            date: new Date().toLocaleDateString(),
                            timestamp: Date.now(),
                            solutions: [
                                {
                                    author: "Maintenance Head",
                                    solution: "We have contacted the elevator service company. They will arrive tomorrow morning.",
                                    timestamp: Date.now()
                                }
                            ]
                        }
                    ],
                    nextNoticeId: 3,
                    nextResidentId: 3,
                    nextProblemId: 2
                };
            }

            saveData() {
                try {
                    if (typeof(Storage) !== "undefined") {
                        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
                        return true;
                    }
                } catch (e) {
                    console.log('localStorage not available');
                }
                return false;
            }

            // Export data as JSON file
            exportData() {
                const dataStr = JSON.stringify(this.data, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `community-data-${new Date().toISOString().split('T')[0]}.json`;
                link.click();
                URL.revokeObjectURL(url);
            }

            // Import data from JSON file
            importData(file) {
                return new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const importedData = JSON.parse(e.target.result);
                            // Validate data structure
                            if (importedData.notices && importedData.residents && importedData.problems) {
                                this.data = importedData;
                                this.saveData();
                                resolve(true);
                            } else {
                                reject('Invalid data format');
                            }
                        } catch (error) {
                            reject('Error parsing file: ' + error.message);
                        }
                    };
                    reader.onerror = () => reject('Error reading file');
                    reader.readAsText(file);
                });
            }

            // Getters
            getNotices() { return this.data.notices; }
            getResidents() { return this.data.residents; }
            getProblems() { return this.data.problems; }
            getNextNoticeId() { return this.data.nextNoticeId++; }
            getNextResidentId() { return this.data.nextResidentId++; }
            getNextProblemId() { return this.data.nextProblemId++; }

            // Add methods
            addNotice(notice) {
                notice.id = this.getNextNoticeId();
                notice.timestamp = Date.now();
                this.data.notices.unshift(notice); // Add to beginning
                this.saveData();
                return notice;
            }

            addResident(resident) {
                resident.id = this.getNextResidentId();
                resident.timestamp = Date.now();
                this.data.residents.push(resident);
                this.saveData();
                return resident;
            }

            addProblem(problem) {
                problem.id = this.getNextProblemId();
                problem.timestamp = Date.now();
                problem.solutions = problem.solutions || [];
                this.data.problems.unshift(problem); // Add to beginning
                this.saveData();
                return problem;
            }

            // Update methods
            updateProblem(problemId, updates) {
                const problemIndex = this.data.problems.findIndex(p => p.id === problemId);
                if (problemIndex !== -1) {
                    this.data.problems[problemIndex] = { ...this.data.problems[problemIndex], ...updates };
                    this.saveData();
                    return this.data.problems[problemIndex];
                }
                return null;
            }

            addSolution(problemId, solution) {
                const problem = this.data.problems.find(p => p.id === problemId);
                if (problem) {
                    solution.timestamp = Date.now();
                    problem.solutions.push(solution);
                    this.saveData();
                    return true;
                }
                return false;
            }

            // Delete methods
            deleteNotice(noticeId) {
                this.data.notices = this.data.notices.filter(n => n.id !== noticeId);
                this.saveData();
            }

            deleteResident(residentId) {
                this.data.residents = this.data.residents.filter(r => r.id !== residentId);
                this.saveData();
            }

            deleteProblem(problemId) {
                this.data.problems = this.data.problems.filter(p => p.id !== problemId);
                this.saveData();
            }

            // Clear all data
            clearAllData() {
                this.data = {
                    notices: [],
                    residents: [],
                    problems: [],
                    nextNoticeId: 1,
                    nextResidentId: 1,
                    nextProblemId: 1
                };
                this.saveData();
            }
        }

        // Initialize storage system
        const storage = new DataStorage();
        
        // Create references for backward compatibility
        let notices = storage.getNotices();
        let residents = storage.getResidents();
        let problems = storage.getProblems();

        // Tab switching functionality
        function showTab(tabName) {
            // Hide all tabs
            const tabs = document.querySelectorAll('.tab-content');
            tabs.forEach(tab => tab.classList.remove('active'));

            // Remove active class from all buttons
            const buttons = document.querySelectorAll('.tab-btn');
            buttons.forEach(btn => btn.classList.remove('active'));

            // Show selected tab
            document.getElementById(tabName).classList.add('active');
            event.target.classList.add('active');

            // Update dashboard if dashboard tab is selected
            if (tabName === 'dashboard') {
                updateDashboard();
            }
        }

        // Notice functionality
        function addNotice() {
            const title = document.getElementById('noticeTitle').value.trim();
            const content = document.getElementById('noticeContent').value.trim();
            const author = document.getElementById('noticeAuthor').value.trim();

            if (title && content && author) {
                const notice = {
                    title: title,
                    content: content,
                    author: author,
                    date: new Date().toLocaleDateString()
                };

                storage.addNotice(notice);
                notices = storage.getNotices(); // Update local reference
                displayNotices();
                updateDashboard();
                
                // Clear form
                document.getElementById('noticeTitle').value = '';
                document.getElementById('noticeContent').value = '';
                document.getElementById('noticeAuthor').value = '';

                alert('✅ Notice posted successfully and saved permanently!');
                showTab('notices');
            } else {
                alert('❌ Please fill all fields');
            }
        }

        function deleteNotice(noticeId) {
            if (confirm('Are you sure you want to delete this notice?')) {
                storage.deleteNotice(noticeId);
                notices = storage.getNotices();
                displayNotices();
                updateDashboard();
                alert('✅ Notice deleted successfully!');
            }
        }

        function displayNotices() {
            const noticeBoard = document.getElementById('noticeBoard');
            noticeBoard.innerHTML = '';

            notices.forEach(notice => {
                const noticeCard = document.createElement('div');
                noticeCard.className = 'notice-card';
                noticeCard.innerHTML = `
                    <div class="notice-header">
                        <div class="notice-title">${notice.title}</div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div class="notice-date">${notice.date}</div>
                            <button onclick="deleteNotice(${notice.id})" style="background: #f56565; padding: 5px 10px; font-size: 12px; border-radius: 4px;">🗑️ Delete</button>
                        </div>
                    </div>
                    <div class="notice-content">${notice.content}</div>
                    <div class="notice-author">- ${notice.author}</div>
                    <div style="font-size: 0.8em; color: #a0aec0; margin-top: 10px;">
                        📌 Permanently stored • ID: ${notice.id}
                    </div>
                `;
                noticeBoard.appendChild(noticeCard);
            });
        }

        function searchNotices() {
            const searchTerm = document.getElementById('noticeSearch').value.toLowerCase();
            const noticeCards = document.querySelectorAll('.notice-card');

            noticeCards.forEach(card => {
                const title = card.querySelector('.notice-title').textContent.toLowerCase();
                const content = card.querySelector('.notice-content').textContent.toLowerCase();
                
                if (title.includes(searchTerm) || content.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        // Resident functionality
        function addResident() {
            const name = document.getElementById('residentName').value.trim();
            const flat = document.getElementById('residentFlat').value.trim();
            const phone = document.getElementById('residentPhone').value.trim();
            const email = document.getElementById('residentEmail').value.trim();
            const family = document.getElementById('residentFamily').value.trim();

            if (name && flat && phone && email && family) {
                // Check for duplicate flat number
                const existingResident = residents.find(r => r.flat.toLowerCase() === flat.toLowerCase());
                if (existingResident) {
                    alert('❌ A resident with this flat number already exists!');
                    return;
                }

                const resident = {
                    name: name,
                    flat: flat,
                    phone: phone,
                    email: email,
                    family: parseInt(family)
                };

                storage.addResident(resident);
                residents = storage.getResidents(); // Update local reference
                displayResidents();
                updateDashboard();
                
                // Clear form
                document.getElementById('residentName').value = '';
                document.getElementById('residentFlat').value = '';
                document.getElementById('residentPhone').value = '';
                document.getElementById('residentEmail').value = '';
                document.getElementById('residentFamily').value = '';

                alert('✅ Resident added successfully and saved permanently!');
            } else {
                alert('❌ Please fill all fields');
            }
        }

        function deleteResident(residentId) {
            if (confirm('Are you sure you want to delete this resident?')) {
                storage.deleteResident(residentId);
                residents = storage.getResidents();
                displayResidents();
                updateDashboard();
                alert('✅ Resident deleted successfully!');
            }
        }

        function displayResidents() {
            const residentList = document.getElementById('residentList');
            residentList.innerHTML = '';

            residents.forEach(resident => {
                const residentItem = document.createElement('div');
                residentItem.className = 'resident-item';
                residentItem.innerHTML = `
                    <div class="resident-info">
                        <div class="resident-name">${resident.name}</div>
                        <div class="resident-details">Flat: ${resident.flat} | Phone: ${resident.phone} | Email: ${resident.email} | Family: ${resident.family} members</div>
                        <div style="font-size: 0.8em; color: #a0aec0; margin-top: 5px;">
                            📌 Permanently stored • ID: ${resident.id}
                        </div>
                    </div>
                    <button onclick="deleteResident(${resident.id})" style="background: #f56565; padding: 8px 12px; font-size: 12px; border-radius: 4px;">🗑️ Delete</button>
                `;
                residentList.appendChild(residentItem);
            });
        }

        // Problem reporting functionality
        function reportProblem() {
            const title = document.getElementById('problemTitle').value.trim();
            const description = document.getElementById('problemDesc').value.trim();
            const priority = document.getElementById('problemPriority').value;
            const reporter = document.getElementById('problemReporter').value.trim();

            if (title && description && reporter) {
                const problem = {
                    title: title,
                    description: description,
                    priority: priority,
                    reporter: reporter,
                    status: 'open',
                    date: new Date().toLocaleDateString()
                };

                storage.addProblem(problem);
                problems = storage.getProblems(); // Update local reference
                displayProblems();
                updateDashboard();
                
                // Clear form
                document.getElementById('problemTitle').value = '';
                document.getElementById('problemDesc').value = '';
                document.getElementById('problemReporter').value = '';

                alert('✅ Problem reported successfully and saved permanently!');
            } else {
                alert('❌ Please fill all required fields');
            }
        }

        function deleteProblem(problemId) {
            if (confirm('Are you sure you want to delete this problem?')) {
                storage.deleteProblem(problemId);
                problems = storage.getProblems();
                displayProblems();
                updateDashboard();
                alert('✅ Problem deleted successfully!');
            }
        }

        function displayProblems() {
            const problemsList = document.getElementById('problemsList');
            problemsList.innerHTML = '';

            problems.forEach(problem => {
                const problemCard = document.createElement('div');
                problemCard.className = `problem-card priority-${problem.priority}`;
                
                let solutionsHtml = '';
                if (problem.solutions.length > 0) {
                    solutionsHtml = `
                        <div class="solutions">
                            <h4>💡 Proposed Solutions:</h4>
                            ${problem.solutions.map(solution => `
                                <div class="solution-item">
                                    <div class="solution-author">${solution.author}:</div>
                                    <div>${solution.solution}</div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }

                problemCard.innerHTML = `
                    <div class="problem-header">
                        <div class="problem-title">${problem.title}</div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div class="problem-status status-${problem.status}">${problem.status}</div>
                            <button onclick="deleteProblem(${problem.id})" style="background: #f56565; padding: 5px 10px; font-size: 12px; border-radius: 4px;">🗑️</button>
                        </div>
                    </div>
                    <div class="problem-content">
                        <p><strong>Description:</strong> ${problem.description}</p>
                        <p><strong>Priority:</strong> ${problem.priority.toUpperCase()}</p>
                        <p><strong>Reported by:</strong> ${problem.reporter}</p>
                        <p><strong>Date:</strong> ${problem.date}</p>
                        <p style="font-size: 0.8em; color: #a0aec0;">📌 Permanently stored • ID: ${problem.id}</p>
                    </div>
                    ${solutionsHtml}
                    <div style="margin-top: 15px;">
                        <input type="text" id="solution-${problem.id}" placeholder="Propose a solution..." style="margin-bottom: 10px;">
                        <input type="text" id="solver-${problem.id}" placeholder="Your name..." style="margin-bottom: 10px;">
                        <button onclick="proposeSolution(${problem.id})" style="margin-right: 10px;">💡 Propose Solution</button>
                        ${problem.status === 'open' ? `<button onclick="markSolved(${problem.id})" style="background: #48bb78;">✅ Mark as Solved</button>` : ''}
                    </div>
                `;
                problemsList.appendChild(problemCard);
            });
        }

        function proposeSolution(problemId) {
            const solutionInput = document.getElementById(`solution-${problemId}`);
            const solverInput = document.getElementById(`solver-${problemId}`);
            const solution = solutionInput.value.trim();
            const solver = solverInput.value.trim();

            if (solution && solver) {
                const solutionObj = {
                    author: solver,
                    solution: solution
                };

                storage.addSolution(problemId, solutionObj);
                problems = storage.getProblems(); // Update local reference
                displayProblems();
                alert('✅ Solution proposed successfully and saved permanently!');
            } else {
                alert('❌ Please fill both solution and your name');
            }
        }

        function markSolved(problemId) {
            storage.updateProblem(problemId, { status: 'solved' });
            problems = storage.getProblems(); // Update local reference
            displayProblems();
            updateDashboard();
            alert('✅ Problem marked as solved and saved permanently!');
        }

        // Dashboard functionality
        function updateDashboard() {
            document.getElementById('totalResidents').textContent = residents.length;
            document.getElementById('totalNotices').textContent = notices.length;
            document.getElementById('totalProblems').textContent = problems.filter(p => p.status === 'open').length;
            document.getElementById('solvedProblems').textContent = problems.filter(p => p.status === 'solved').length;
        }

        // Initialize the page
        function init() {
            displayNotices();
            displayResidents();
            displayProblems();
            updateDashboard();
        }

        // Run initialization
        init();