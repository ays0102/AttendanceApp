// Clear old data and initialize fresh structure
//localStorage.clear();

// Initialize fresh data structures
//if (!localStorage.getItem('classes')) {
  //  localStorage.setItem('classes', JSON.stringify([]));
//}
//if (!localStorage.getItem('courses')) {
  //  localStorage.setItem('courses', JSON.stringify([]));
//}
//if (!localStorage.getItem('students')) {
  //  localStorage.setItem('students', JSON.stringify({}));
//}
//if (!localStorage.getItem('attendanceData')) {
  //  localStorage.setItem('attendanceData', JSON.stringify([]));
//}


// Initialize data structures
        document.addEventListener("DOMContentLoaded", function() {
            // Set default date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('attendanceDate').value = today;
            
            // Initialize data if not exists
            if (!localStorage.getItem('classes')) {
                localStorage.setItem('classes', JSON.stringify([]));
            }
            if (!localStorage.getItem('courses')) {
                localStorage.setItem('courses', JSON.stringify([]));
            }
            if (!localStorage.getItem('students')) {
                localStorage.setItem('students', JSON.stringify({}));
            }
            if (!localStorage.getItem('attendanceData')) {
                localStorage.setItem('attendanceData', JSON.stringify([]));
            }
            
            // Populate dropdowns
            populateClasses();
            updateCourseOptions();
        });

        // Data management functions
        function populateClasses() {
            const classSelector = document.getElementById('classSelector');
            const courseClassSelector = document.getElementById('courseClass');
            
            classSelector.innerHTML = '<option value="" disabled selected>Select Class</option>';
            courseClassSelector.innerHTML = '<option value="" disabled selected>Select Class</option>';
            
            const classes = JSON.parse(localStorage.getItem('classes')) || [];
            classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.name;
                option.textContent = cls.name;
                classSelector.appendChild(option.cloneNode(true));
                courseClassSelector.appendChild(option.cloneNode(true));
            });
        }

        function updateCourseOptions() {
            const classSelector = document.getElementById('classSelector');
            const courseSelector = document.getElementById('courseSelector');
            const selectedClass = classSelector.value;
            
            courseSelector.innerHTML = '<option value="" disabled selected>Select Course</option>';
            
            if (!selectedClass) return;
            
            const courses = JSON.parse(localStorage.getItem('courses')) || [];
            const classCourses = courses.filter(course => course.class === selectedClass);
            
            classCourses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.code;
                option.textContent = `${course.name} (${course.code})`;
                courseSelector.appendChild(option);
            });
            
            updateSectionOptions();
        }

        function updateSectionOptions() {
            // Sections are fixed as A and B, so we just enable the selector
            const sectionSelector = document.getElementById('sectionSelector');
            sectionSelector.disabled = !document.getElementById('courseSelector').value;
            
            showStudentsList();
        }

        function showStudentsList() {
            const courseSelector = document.getElementById('courseSelector');
            const sectionSelector = document.getElementById('sectionSelector');
            const selectedCourse = courseSelector.value;
            const selectedSection = sectionSelector.value;
            const attendanceDate = document.getElementById('attendanceDate').value;
            
            const studentsList = document.getElementById('studentsList');
            studentsList.innerHTML = '';
            
            if (!selectedCourse || !selectedSection) return;
            
            // Get students for this course-section combination
            const students = JSON.parse(localStorage.getItem('students')) || {};
            const studentKey = `${selectedCourse}-${selectedSection}`;
            const courseStudents = students[studentKey] || [];
            
            // Get attendance data for this course-section and date
            const attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];
            const dateAttendance = attendanceData.filter(record => 
                record.course === selectedCourse && 
                record.section === selectedSection &&
                record.date === attendanceDate
            );
            
            courseStudents.forEach(student => {
                const li = document.createElement('li');
                li.setAttribute('data-roll-number', student.rollNumber);
                li.innerHTML = `<strong>${student.name}</strong> (Roll No. ${student.rollNumber})`;
                
                // Check attendance status
                const studentAttendance = dateAttendance.find(a => a.rollNumber === student.rollNumber);
                if (studentAttendance) {
                    li.style.backgroundColor = getStatusColor(studentAttendance.status);
                }
                
                // Add attendance buttons
                const div = document.createElement('div');
                div.className = 'student-attendance-options';
                div.appendChild(createButton('P', 'present', () => markAttendance('present', li, selectedCourse, selectedSection)));
                div.appendChild(createButton('A', 'absent', () => markAttendance('absent', li, selectedCourse, selectedSection)));
                div.appendChild(createButton('L', 'leave', () => markAttendance('leave', li, selectedCourse, selectedSection)));
                
                li.appendChild(div);
                studentsList.appendChild(li);
            });
            
            showSummary(selectedCourse, selectedSection, attendanceDate);
        }

        // Attendance functions
        function markAttendance(status, listItem, course, section) {
            listItem.style.backgroundColor = getStatusColor(status);
            
            const rollNumber = listItem.getAttribute('data-roll-number');
            const studentName = listItem.querySelector('strong').textContent;
            const date = document.getElementById('attendanceDate').value;
            const classSelector = document.getElementById('classSelector');
            const className = classSelector.options[classSelector.selectedIndex].text;
            
            saveAttendanceRecord(studentName, rollNumber, className, course, section, status, date);
            showSummary(course, section, date);
        }

        function getStatusColor(status) {
            switch (status) {
                case 'present': return 'rgb(46, 204, 113)';
                case 'absent': return 'rgb(231, 76, 60)';
                case 'leave': return 'rgb(243, 156, 18)';
                default: return '';
            }
        }

        function saveAttendanceRecord(name, rollNumber, className, course, section, status, date) {
            const attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];
            
            // Check if record exists
            const existingIndex = attendanceData.findIndex(record => 
                record.rollNumber === rollNumber && 
                record.course === course && 
                record.section === section &&
                record.date === date
            );
            
            if (existingIndex >= 0) {
                attendanceData[existingIndex].status = status;
            } else {
                attendanceData.push({
                    name,
                    rollNumber,
                    class: className,
                    course,
                    section,
                    status,
                    date
                });
            }
            
            localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
        }

        function showSummary(course, section, date) {
            const attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];
            const courseAttendance = attendanceData.filter(record => 
                record.course === course && 
                record.section === section &&
                record.date === date
            );
            
            const students = JSON.parse(localStorage.getItem('students')) || {};
            const studentKey = `${course}-${section}`;
            const totalStudents = students[studentKey] ? students[studentKey].length : 0;
            const totalPresent = courseAttendance.filter(a => a.status === 'present').length;
            const totalAbsent = courseAttendance.filter(a => a.status === 'absent').length;
            const totalLeave = courseAttendance.filter(a => a.status === 'leave').length;
            
            document.getElementById('totalStudents').textContent = totalStudents;
            document.getElementById('totalPresent').textContent = totalPresent;
            document.getElementById('totalAbsent').textContent = totalAbsent;
            document.getElementById('totalLeave').textContent = totalLeave;
        }

        function submitAttendance() {
            const classSelector = document.getElementById('classSelector');
            const courseSelector = document.getElementById('courseSelector');
            const sectionSelector = document.getElementById('sectionSelector');
            const className = classSelector.options[classSelector.selectedIndex].text;
            const course = courseSelector.value;
            const section = sectionSelector.value;
            const date = document.getElementById('attendanceDate').value;
            
            if (!className || !course || !section || !date) {
                alert("Please fill all required fields");
                return;
            }
            
            // Show result
            const resultSection = document.getElementById('resultSection');
            const summarySection = document.getElementById('summarySection');
            
            document.getElementById('resultDate').textContent = date;
            document.getElementById('resultClass').textContent = className;
            document.getElementById('resultCourse').textContent = 
                courseSelector.options[courseSelector.selectedIndex].text;
            document.getElementById('resultSectionName').textContent = section;
            document.getElementById('resultTotalStudents').textContent = 
                document.getElementById('totalStudents').textContent;
            document.getElementById('resultPresent').textContent = 
                document.getElementById('totalPresent').textContent;
            document.getElementById('resultAbsent').textContent = 
                document.getElementById('totalAbsent').textContent;
            document.getElementById('resultLeave').textContent = 
                document.getElementById('totalLeave').textContent;
            
            resultSection.style.display = 'block';
            summarySection.style.display = 'none';
        }

        // Add new items functions
        function addStudentsByRange() {
            const startRoll = parseInt(document.getElementById('startRoll').value);
            const endRoll = parseInt(document.getElementById('endRoll').value);
            const prefix = document.getElementById('studentPrefix').value || '';
            
            if (isNaN(startRoll) || isNaN(endRoll) || startRoll > endRoll) {
                alert("Please enter valid roll numbers");
                return;
            }
            
            const courseSelector = document.getElementById('courseSelector');
            const sectionSelector = document.getElementById('sectionSelector');
            const course = courseSelector.value;
            const section = sectionSelector.value;
            
            if (!course || !section) {
                alert("Please select a course and section first");
                return;
            }
            
            const students = JSON.parse(localStorage.getItem('students')) || {};
            const studentKey = `${course}-${section}`;
            students[studentKey] = [];
            
            const studentsList = document.getElementById('studentsList');
            studentsList.innerHTML = '';
            
            for (let i = startRoll; i <= endRoll; i++) {
                const rollNumber = prefix + i;
                const studentName = `Student ${rollNumber}`;
                
                students[studentKey].push({
                    name: studentName,
                    rollNumber: rollNumber
                });
                
                const li = document.createElement('li');
                li.setAttribute('data-roll-number', rollNumber);
                li.innerHTML = `<strong>${studentName}</strong> (Roll No. ${rollNumber})`;
                
                const div = document.createElement('div');
                div.className = 'student-attendance-options';
                div.appendChild(createButton('P', 'present', () => markAttendance('present', li, course, section)));
                div.appendChild(createButton('A', 'absent', () => markAttendance('absent', li, course, section)));
                div.appendChild(createButton('L', 'leave', () => markAttendance('leave', li, course, section)));
                
                li.appendChild(div);
                studentsList.appendChild(li);
            }
            
            localStorage.setItem('students', JSON.stringify(students));
            closePopup();
            showSummary(course, section, document.getElementById('attendanceDate').value);
        }

        function addClass() {
            const className = document.getElementById('newClassName').value.trim();
            
            if (!className) {
                alert("Please enter a class name");
                return;
            }
            
            const classes = JSON.parse(localStorage.getItem('classes')) || [];
            
            // Check if class already exists
            if (classes.some(cls => cls.name === className)) {
                alert("This class already exists");
                return;
            }
            
            classes.push({
                name: className
            });
            
            localStorage.setItem('classes', JSON.stringify(classes));
            closePopup();
            populateClasses();
        }

        function addCourse() {
            const name = document.getElementById('newCourseName').value.trim();
            const code = document.getElementById('newCourseCode').value.trim();
            const className = document.getElementById('courseClass').value;
            
            if (!name || !code || !className) {
                alert("Please fill all fields");
                return;
            }
            
            const courses = JSON.parse(localStorage.getItem('courses')) || [];
            
            // Check if course code already exists
            if (courses.some(course => course.code === code)) {
                alert("A course with this code already exists");
                return;
            }
            
            courses.push({
                name: name,
                code: code,
                class: className
            });
            
            localStorage.setItem('courses', JSON.stringify(courses));
            closePopup();
            updateCourseOptions();
        }

        // Helper functions
        function createButton(text, className, onClick) {
            const button = document.createElement('button');
            button.textContent = text;
            button.className = className;
            button.onclick = onClick;
            return button;
        }

        function showAddStudentsForm() {
            document.getElementById('addStudentsPopup').style.display = 'block';
        }

        function showAddClassForm() {
            document.getElementById('addClassPopup').style.display = 'block';
        }

        function showAddCourseForm() {
            // Populate class dropdown in course form
            const courseClassSelector = document.getElementById('courseClass');
            courseClassSelector.innerHTML = '<option value="" disabled selected>Select Class</option>';
            
            const classes = JSON.parse(localStorage.getItem('classes')) || [];
            classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.name;
                option.textContent = cls.name;
                courseClassSelector.appendChild(option);
            });
            
            document.getElementById('addCoursePopup').style.display = 'block';
        }

        function closePopup() {
            document.querySelectorAll('.popup').forEach(popup => {
                popup.style.display = 'none';
            });
        }

        // Add event listener for date change
        document.getElementById('attendanceDate').addEventListener('change', function() {
            const courseSelector = document.getElementById('courseSelector');
            const sectionSelector = document.getElementById('sectionSelector');
            if (courseSelector.value && sectionSelector.value) {
                showStudentsList();
            }
        });
