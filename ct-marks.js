// Sample data storage
let classes = [
    { id: 1, name: "Class A", section: "A", subject: "Mathematics" },
    { id: 2, name: "Class B", section: "B", subject: "Physics" }
];

let students = [
    { id: 1, name: "Student 101", roll: "101", classId: 1 },
    { id: 2, name: "Student 102", roll: "102", classId: 1 },
    { id: 3, name: "Student 201", roll: "201", classId: 2 },
    { id: 4, name: "Student 202", roll: "202", classId: 2 }
];

let ctMarks = [
    { studentId: 1, ct1: 18, ct2: 16, ct3: 15, ct4: 17 },
    { studentId: 2, ct1: 15, ct2: 14, ct3: 16, ct4: 18 },
    { studentId: 3, ct1: 12, ct2: 14, ct3: 13, ct4: 15 },
    { studentId: 4, ct1: 14, ct2: 16, ct3: 15, ct4: 17 }
];

// Current state
let currentStudentEdit = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    populateClassSelector();
    populateStudentsClassSelector();
    document.getElementById('academicYear').textContent = new Date().getFullYear();
    
    // Toggle between range and list input methods
    document.querySelectorAll('input[name="addMethod"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('rangeMethod').style.display = 
                this.value === 'range' ? 'block' : 'none';
            document.getElementById('listMethod').style.display = 
                this.value === 'list' ? 'block' : 'none';
        });
    });
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

// Populate class selector in add students form
function populateStudentsClassSelector() {
    const selector = document.getElementById('studentsClass');
    selector.innerHTML = '<option value="">Select Class</option>';
    
    classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls.id;
        option.textContent = `${cls.name} - ${cls.section}`;
        selector.appendChild(option);
    });
}

// Load students with their CT marks for selected class
function loadStudentsWithCTMarks() {
    const classId = document.getElementById('classSelector').value;
    const tableBody = document.getElementById('marksTableBody');
    tableBody.innerHTML = '';
    
    if (!classId) return;
    
    // Get students for this class
    const classStudents = students.filter(student => student.classId == classId);
    
    if (classStudents.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8">No students found in this class</td></tr>';
        return;
    }
    
    // Display all students with their CT marks
    classStudents.forEach(student => {
        const row = document.createElement('tr');
        
        // Get CT marks for this student
        const marks = ctMarks.find(m => m.studentId == student.id) || {};
        
        // Calculate total marks
        const total = (marks.ct1 || 0) + (marks.ct2 || 0) + (marks.ct3 || 0) + (marks.ct4 || 0);
        
        row.innerHTML = `
            <td>${student.roll}</td>
            <td>${student.name}</td>
            <td><input type="number" value="${marks.ct1 || ''}" min="0" max="20" 
                onchange="updateStudentMarks(${student.id}, 'ct1', this.value)"></td>
            <td><input type="number" value="${marks.ct2 || ''}" min="0" max="20" 
                onchange="updateStudentMarks(${student.id}, 'ct2', this.value)"></td>
            <td><input type="number" value="${marks.ct3 || ''}" min="0" max="20" 
                onchange="updateStudentMarks(${student.id}, 'ct3', this.value)"></td>
            <td><input type="number" value="${marks.ct4 || ''}" min="0" max="20" 
                onchange="updateStudentMarks(${student.id}, 'ct4', this.value)"></td>
            <td class="total-column">${total}</td>
            <td>
                <button onclick="editStudentMarks(${student.id}, '${student.name}', '${student.roll}')">
                    Edit All
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Update individual CT marks
function updateStudentMarks(studentId, ctNumber, value) {
    let marksEntry = ctMarks.find(m => m.studentId == studentId);
    
    if (!marksEntry) {
        marksEntry = { studentId: studentId };
        ctMarks.push(marksEntry);
    }
    
    marksEntry[ctNumber] = value ? parseInt(value) : 0;
    updateTotalDisplay(studentId);
}

// Update the total display for a student
function updateTotalDisplay(studentId) {
    const marksEntry = ctMarks.find(m => m.studentId == studentId) || {};
    const total = (marksEntry.ct1 || 0) + (marksEntry.ct2 || 0) + 
                 (marksEntry.ct3 || 0) + (marksEntry.ct4 || 0);
    
    // Find the row and update the total
    const rows = document.querySelectorAll('#marksTableBody tr');
    rows.forEach(row => {
        if (row.cells[0].textContent == students.find(s => s.id == studentId).roll) {
            row.cells[6].textContent = total;
        }
    });
}

// Edit all CT marks for a student
function editStudentMarks(studentId, studentName, studentRoll) {
    currentStudentEdit = studentId;
    const marks = ctMarks.find(m => m.studentId == studentId) || {};
    
    document.getElementById('editStudentInfo').textContent = 
        `Student: ${studentName} (Roll: ${studentRoll})`;
    
    document.getElementById('editCT1').value = marks.ct1 || '';
    document.getElementById('editCT2').value = marks.ct2 || '';
    document.getElementById('editCT3').value = marks.ct3 || '';
    document.getElementById('editCT4').value = marks.ct4 || '';
    
    showPopup('editMarksPopup');
}

// Save edited marks
function saveEditedMarks() {
    const ct1 = parseInt(document.getElementById('editCT1').value) || 0;
    const ct2 = parseInt(document.getElementById('editCT2').value) || 0;
    const ct3 = parseInt(document.getElementById('editCT3').value) || 0;
    const ct4 = parseInt(document.getElementById('editCT4').value) || 0;
    
    let marksEntry = ctMarks.find(m => m.studentId == currentStudentEdit);
    
    if (!marksEntry) {
        marksEntry = { studentId: currentStudentEdit };
        ctMarks.push(marksEntry);
    }
    
    marksEntry.ct1 = ct1;
    marksEntry.ct2 = ct2;
    marksEntry.ct3 = ct3;
    marksEntry.ct4 = ct4;
    
    closePopup();
    loadStudentsWithCTMarks(); // Refresh the view
}

// Save all marks
function saveAllMarks() {
    alert('All CT marks saved successfully!');
    // In a real application, you would send this data to a server
}

// Show add students form
function showAddStudentsForm() {
    populateStudentsClassSelector();
    showPopup('addStudentsPopup');
}

// Show add class form
function showAddClassForm() {
    showPopup('addClassPopup');
}

// Add students by range or list
function addStudents() {
    const classId = document.getElementById('studentsClass').value;
    const namePrefix = document.getElementById('namePrefix').value.trim() || 'Student';
    const addMethod = document.querySelector('input[name="addMethod"]:checked').value;
    
    if (!classId) {
        alert('Please select a class');
        return;
    }
    
    let rollNumbers = [];
    
    if (addMethod === 'range') {
        const startRoll = parseInt(document.getElementById('startRoll').value);
        const endRoll = parseInt(document.getElementById('endRoll').value);
        
        if (isNaN(startRoll)) {
            alert('Please enter a valid start roll number');
            return;
        }
        
        if (isNaN(endRoll)) {
            alert('Please enter a valid end roll number');
            return;
        }
        
        if (startRoll > endRoll) {
            alert('Start roll number must be less than or equal to end roll number');
            return;
        }
        
        for (let i = startRoll; i <= endRoll; i++) {
            rollNumbers.push(i.toString());
        }
    } else {
        const rollNumbersInput = document.getElementById('rollNumbers').value.trim();
        if (!rollNumbersInput) {
            alert('Please enter at least one roll number');
            return;
        }
        
        rollNumbers = rollNumbersInput.split(',')
            .map(roll => roll.trim())
            .filter(roll => roll !== '');
    }
    
    if (rollNumbers.length === 0) {
        alert('No valid roll numbers provided');
        return;
    }
    
    // Check for existing roll numbers in this class
    const existingRolls = students
        .filter(student => student.classId == classId)
        .map(student => student.roll);
    
    const newStudents = [];
    
    rollNumbers.forEach(roll => {
        if (!existingRolls.includes(roll)) {
            const newStudent = {
                id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1,
                name: `${namePrefix} ${roll}`,
                roll: roll,
                classId: parseInt(classId)
            };
            students.push(newStudent);
            newStudents.push(newStudent);
        }
    });
    
    if (newStudents.length === 0) {
        alert('All specified roll numbers already exist in this class');
    } else {
        alert(`Added ${newStudents.length} new students to the class`);
        
        // Refresh the view if we're on the same class
        const currentClass = document.getElementById('classSelector').value;
        if (currentClass == classId) {
            loadStudentsWithCTMarks();
        }
    }
    
    closePopup();
    
    // Clear form
    document.getElementById('startRoll').value = '';
    document.getElementById('endRoll').value = '';
    document.getElementById('rollNumbers').value = '';
    document.getElementById('namePrefix').value = '';
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
        subject: subject || 'General'
    };
    
    classes.push(newClass);
    
    // Refresh selectors
    populateClassSelector();
    populateStudentsClassSelector();
    
    closePopup();
    alert('Class added successfully!');
    
    // Clear form
    document.getElementById('newClassName').value = '';
    document.getElementById('newClassSection').value = '';
    document.getElementById('newClassSubject').value = '';
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
