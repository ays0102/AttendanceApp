// Sample data storage
        let classes = [
            { id: 1, name: "Class A", section: "A", subject: "Mathematics", students: [] },
            { id: 2, name: "Class B", section: "B", subject: "Physics", students: [] }
        ];
        
        let students = [
            { id: 1, name: "Rahul Sharma", roll: "101", classId: 1 },
            { id: 2, name: "Priya Patel", roll: "102", classId: 1 },
            { id: 3, name: "Amit Singh", roll: "201", classId: 2 },
            { id: 4, name: "Neha Gupta", roll: "202", classId: 2 }
        ];
        
        let cts = [
            { 
                id: 1, 
                name: "CT 1", 
                classId: 1, 
                date: "2023-10-15", 
                maxMarks: 20, 
                description: "First class test", 
                marks: [
                    { studentId: 1, marksObtained: 18 },
                    { studentId: 2, marksObtained: 15 }
                ] 
            },
            { 
                id: 2, 
                name: "CT 2", 
                classId: 1, 
                date: "2023-11-20", 
                maxMarks: 20, 
                description: "Second class test", 
                marks: [
                    { studentId: 1, marksObtained: 16 },
                    { studentId: 2, marksObtained: 17 }
                ] 
            },
            { 
                id: 3, 
                name: "CT 1", 
                classId: 2, 
                date: "2023-10-18", 
                maxMarks: 15, 
                description: "First class test", 
                marks: [
                    { studentId: 3, marksObtained: 12 },
                    { studentId: 4, marksObtained: 14 }
                ] 
            }
        ];

        // Current state
        let currentCT = null;
        let currentStudentEdit = null;

        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            populateClassSelector();
            populateNewStudentClassSelector();
            populateNewCTClassSelector();
            document.getElementById('academicYear').textContent = new Date().getFullYear();
        });

        // Populate class selector dropdown
        function populateClassSelector() {
            const selector = document.getElementById('classSelector');
            selector.innerHTML = '<option value="">Select a Class</option>';
            
            classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.id;
                option.textContent = `${cls.name} - ${cls.section} (${cls.subject})`;
                selector.appendChild(option);
            });
        }

        // Load CTs for the selected class
        function loadCTsForClass() {
            const classId = document.getElementById('classSelector').value;
            const ctSelector = document.getElementById('ctSelector');
            ctSelector.innerHTML = '<option value="">Select a CT</option>';
            
            if (!classId) {
                document.getElementById('marksEntrySection').style.display = 'none';
                document.getElementById('summarySection').style.display = 'none';
                document.getElementById('allCTsSummary').style.display = 'none';
                return;
            }
            
            // Filter CTs for this class
            const classCTs = cts.filter(ct => ct.classId == classId);
            
            classCTs.forEach(ct => {
                const option = document.createElement('option');
                option.value = ct.id;
                option.textContent = `${ct.name} - ${ct.date} (Max: ${ct.maxMarks})`;
                ctSelector.appendChild(option);
            });
            
            // Show all CTs summary for this class
            showAllCTsSummary(classId);
        }

        // Show marks for the selected CT
        function showCTMarks() {
            const ctId = document.getElementById('ctSelector').value;
            
            if (!ctId) {
                document.getElementById('marksEntrySection').style.display = 'none';
                document.getElementById('summarySection').style.display = 'none';
                return;
            }
            
            currentCT = cts.find(ct => ct.id == ctId);
            const classInfo = classes.find(cls => cls.id == currentCT.classId);
            
            // Update CT info
            document.getElementById('ctTitle').textContent = `${currentCT.name} Marks`;
            document.getElementById('ctDetails').textContent = 
                `Date: ${currentCT.date} | Max Marks: ${currentCT.maxMarks} | ${classInfo.subject}`;
            
            // Get students for this class
            const classStudents = students.filter(student => student.classId == currentCT.classId);
            
            // Populate marks table
            const tableBody = document.getElementById('marksTableBody');
            tableBody.innerHTML = '';
            
            classStudents.forEach(student => {
                const row = document.createElement('tr');
                
                // Find marks for this student
                const marksEntry = currentCT.marks.find(m => m.studentId == student.id);
                const marksObtained = marksEntry ? marksEntry.marksObtained : '';
                
                row.innerHTML = `
                    <td>${student.roll}</td>
                    <td>${student.name}</td>
                    <td>${marksObtained}</td>
                    <td>
                        <button onclick="editMarks(${student.id}, '${student.name}', '${student.roll}', ${marksObtained || 0})">
                            Edit
                        </button>
                    </td>
                `;
                
                tableBody.appendChild(row);
            });
            
            // Show the sections
            document.getElementById('marksEntrySection').style.display = 'block';
            document.getElementById('summarySection').style.display = 'block';
            
            // Calculate and show summary
            calculateSummary();
        }

        // Calculate and display summary statistics
        function calculateSummary() {
            if (!currentCT) return;
            
            const classStudents = students.filter(student => student.classId == currentCT.classId);
            const marks = currentCT.marks.map(m => m.marksObtained);
            
            const totalStudents = classStudents.length;
            const totalMarks = marks.reduce((sum, mark) => sum + mark, 0);
            const average = totalMarks / marks.length || 0;
            const highest = Math.max(...marks);
            const lowest = Math.min(...marks);
            
            document.getElementById('summaryTotalStudents').textContent = totalStudents;
            document.getElementById('summaryAverage').textContent = average.toFixed(2);
            document.getElementById('summaryHighest').textContent = highest;
            document.getElementById('summaryLowest').textContent = lowest;
        }

        // Show all CTs summary for the class
        function showAllCTsSummary(classId) {
            const classCTs = cts.filter(ct => ct.classId == classId);
            const tableBody = document.getElementById('allCTsTableBody');
            tableBody.innerHTML = '';
            
            if (classCTs.length === 0) {
                document.getElementById('allCTsSummary').style.display = 'none';
                return;
            }
            
            classCTs.forEach(ct => {
                const marks = ct.marks.map(m => m.marksObtained);
                const totalMarks = marks.reduce((sum, mark) => sum + mark, 0);
                const average = totalMarks / marks.length || 0;
                const highest = Math.max(...marks);
                const lowest = Math.min(...marks);
                
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${ct.name}</td>
                    <td>${ct.date}</td>
                    <td>${ct.maxMarks}</td>
                    <td>${average.toFixed(2)}</td>
                    <td>${highest}</td>
                    <td>${lowest}</td>
                    <td>
                        <button onclick="loadCTForEdit(${ct.id})">Edit</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
            
            document.getElementById('allCTsSummary').style.display = 'block';
        }

        // Edit marks for a student
        function editMarks(studentId, studentName, studentRoll, marksObtained) {
            currentStudentEdit = { studentId, marksObtained };
            
            document.getElementById('editStudentInfo').textContent = 
                `Student: ${studentName} (Roll: ${studentRoll})`;
            document.getElementById('editMarksObtained').value = marksObtained;
            
            showPopup('editMarksPopup');
        }

        // Save edited marks
        function saveEditedMarks() {
            const marksObtained = parseInt(document.getElementById('editMarksObtained').value);
            
            if (isNaN(marksObtained) || marksObtained < 0 || marksObtained > currentCT.maxMarks) {
                alert(`Please enter a valid mark between 0 and ${currentCT.maxMarks}`);
                return;
            }
            
            // Find or create marks entry
            const marksEntry = currentCT.marks.find(m => m.studentId == currentStudentEdit.studentId);
            
            if (marksEntry) {
                marksEntry.marksObtained = marksObtained;
            } else {
                currentCT.marks.push({
                    studentId: currentStudentEdit.studentId,
                    marksObtained: marksObtained
                });
            }
            
            closePopup();
            showCTMarks(); // Refresh the view
        }

        // Save all CT marks
        function saveCTMarks() {
            // In this implementation, marks are saved immediately when edited
            // This function could be used for bulk save if needed
            alert('CT marks saved successfully!');
        }

        // Show add student form
        function showAddStudentForm() {
            populateNewStudentClassSelector();
            showPopup('addStudentPopup');
        }

        // Show add class form
        function showAddClassForm() {
            showPopup('addClassPopup');
        }

        // Show add CT form
        function showAddCTForm() {
            populateNewCTClassSelector();
            showPopup('addCTPopup');
        }

        // Populate class selector in add student form
        function populateNewStudentClassSelector() {
            const selector = document.getElementById('newStudentClass');
            selector.innerHTML = '<option value="">Select Class</option>';
            
            classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.id;
                option.textContent = `${cls.name} - ${cls.section}`;
                selector.appendChild(option);
            });
        }

        // Populate class selector in add CT form
        function populateNewCTClassSelector() {
            const selector = document.getElementById('newCTClass');
            selector.innerHTML = '<option value="">Select Class</option>';
            
            classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.id;
                option.textContent = `${cls.name} - ${cls.section}`;
                selector.appendChild(option);
            });
        }

        // Update max students count when class is selected in CT form
        function updateMaxStudents() {
            const classId = document.getElementById('newCTClass').value;
            if (!classId) return;
            
            const studentCount = students.filter(student => student.classId == classId).length;
            document.getElementById('studentCountInfo').textContent = 
                `This class has ${studentCount} students.`;
        }

        // Add a new student
        function addStudent() {
            const name = document.getElementById('newStudentName').value.trim();
            const roll = document.getElementById('newStudentRoll').value.trim();
            const classId = document.getElementById('newStudentClass').value;
            
            if (!name || !roll || !classId) {
                alert('Please fill all required fields');
                return;
            }
            
            // Check if roll number already exists in this class
            const rollExists = students.some(student => 
                student.roll === roll && student.classId == classId);
            
            if (rollExists) {
                alert('A student with this roll number already exists in this class');
                return;
            }
            
            // Add new student
            const newStudent = {
                id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1,
                name: name,
                roll: roll,
                classId: parseInt(classId)
            };
            
            students.push(newStudent);
            
            // Refresh the class selector if we're on the same class
            const currentClass = document.getElementById('classSelector').value;
            if (currentClass == classId) {
                loadCTsForClass();
            }
            
            closePopup();
            alert('Student added successfully!');
            
            // Clear form
            document.getElementById('newStudentName').value = '';
            document.getElementById('newStudentRoll').value = '';
        }

        // Add a new class
        function addClass() {
            const name = document.getElementById('newClassName').value.trim();
            const section = document.getElementById('newClassSection').value.trim();
            const subject = document.getElementById('newClassSubject').value.trim();
            
            if (!name) {
                alert('Class name is required');
                return;
            }
            
            // Add new class
            const newClass = {
                id: classes.length > 0 ? Math.max(...classes.map(c => c.id)) + 1 : 1,
                name: name,
                section: section || 'A',
                subject: subject || 'General',
                students: []
            };
            
            classes.push(newClass);
            
            // Refresh selectors
            populateClassSelector();
            populateNewStudentClassSelector();
            populateNewCTClassSelector();
            
            closePopup();
            alert('Class added successfully!');
            
            // Clear form
            document.getElementById('newClassName').value = '';
            document.getElementById('newClassSection').value = '';
            document.getElementById('newClassSubject').value = '';
        }

        // Create a new CT
        function createNewCT() {
            const classId = document.getElementById('newCTClass').value;
            const name = document.getElementById('newCTName').value.trim();
            const date = document.getElementById('newCTDate').value;
            const maxMarks = parseInt(document.getElementById('newCTMaxMarks').value);
            const description = document.getElementById('newCTDescription').value.trim();
            
            if (!classId || !name || !date || isNaN(maxMarks) || maxMarks <= 0) {
                alert('Please fill all required fields with valid values');
                return;
            }
            
            // Check if CT with this name already exists for this class
            const ctExists = cts.some(ct => 
                ct.classId == classId && ct.name.toLowerCase() === name.toLowerCase());
            
            if (ctExists) {
                alert('A CT with this name already exists for this class');
                return;
            }
            
            // Get students for this class
            const classStudents = students.filter(student => student.classId == classId);
            
            // Create new CT with empty marks
            const newCT = {
                id: cts.length > 0 ? Math.max(...cts.map(ct => ct.id)) + 1 : 1,
                classId: parseInt(classId),
                name: name,
                date: date,
                maxMarks: maxMarks,
                description: description,
                marks: [] // Start with no marks entered
            };
            
            cts.push(newCT);
            
            // Refresh CT selector and show this CT
            populateClassSelector();
            document.getElementById('classSelector').value = classId;
            loadCTsForClass();
            document.getElementById('ctSelector').value = newCT.id;
            showCTMarks();
            
            closePopup();
            
            // Clear form
            document.getElementById('newCTName').value = '';
            document.getElementById('newCTDate').value = '';
            document.getElementById('newCTMaxMarks').value = '20';
            document.getElementById('newCTDescription').value = '';
        }

        // Show a popup
        function showPopup(popupId) {
            document.getElementById(popupId).style.display = 'block';
            document.getElementById('overlay').classList.add('active-overlay');
        }

        // Close all popups
        function closePopup() {
            document.querySelectorAll('.popup').forEach(popup => {
                popup.style.display = 'none';
            });
            document.getElementById('overlay').classList.remove('active-overlay');
        }

        // Load CT for editing (not fully implemented in this example)
        function loadCTForEdit(ctId) {
            alert('Edit CT functionality would be implemented here');
            // This would open a popup to edit CT details (name, date, max marks, etc.)
        }