import React, { useState, useEffect } from "react";

const App = () => {
  const [students, setStudents] = useState([]);
  const [newStudent, setNewStudent] = useState({ idstudents: "", name: "", age: "", grade: "", gpa: "", major: "", gender: "" });
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [editingStudent, setEditingStudent] = useState(null);
  const [updatedStudent, setUpdatedStudent] = useState({idstudents: "", name: "", age: "", grade: "", gpa: "", major: "", gender: "" });
  const [showEditForm, setShowEditForm] = useState(false);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState({idstudents: "", name: "", age: "", grade: "", gpa: "", major: "", gender: ""});
  const [columnValues, setColumnValues] = useState({idstudents: [], name: [], age: [], grade: [], gpa: [], major: [], gender: []});
  const [showFilterForm, setFilterForm] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [summaryResult, setSummaryResult] = useState(null);
  const [selectedStat, setSelectedStat] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("");
  const [availableColumns, setAvailableColumns] = useState([]);
  const columns = ["idstudents", "name", "age", "grade", "gpa", "major", "gender"]
  const [groupByColumn, setGroupByColumn] = useState("");
  useEffect(() => {
    fetchStudents();
  }, []);

  const getCurrentFilters = () => {
    let filters = [];
    if (filterCriteria.name === ""){
      filters.push('name is not null');
    }
    else{
      filters.push(`"name = '${filterCriteria.name}'"`)
    }
    if (filterCriteria.age === ""){
      filters.push('age is not null');
    }
    else{
      filters.push(`"age = '${filterCriteria.age}'"`)
    }
    if (filterCriteria.grade === ""){
      filters.push('grade is not null');
    }
    else{
      filters.push(`"grade = '${filterCriteria.grade}'"`)
    }
    if (filterCriteria.gpa === ""){
      filters.push('gpa is not null');
    }
    else{
      filters.push(`"gpa = '${filterCriteria.gpa}'"`)
    }
    if (filterCriteria.major === ""){
      filters.push('major is not null');
    }
    else{
      filters.push(`"major = '${filterCriteria.major}'"`)
    }
    if (filterCriteria.gender === ""){
      filters.push('gender is not null');
    }
    else{
      filters.push(`"gender = '${filterCriteria.gender}'"`)
    }

    return filters; // Default to "1=1" if no filters are selected
};
  const handleGroupByChange = (e) => {
    setGroupByColumn(e.target.value);
  };
  const addStudent = async () => {
    const response = await fetch("http://localhost:5000/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStudent),
    });
  
    if (response.ok) {
      const createdStudent = await response.json();
      setStudents((prev) => [...prev, createdStudent]); // Append new student
      setNewStudent({ idstudents: "", name: "", age: "", grade: "", gpa: "", major: "", gender: "" }); // Reset form
    } else {
      console.error("Failed to add student");
    }
  };
  const deleteStudent = async (id) => {
    const response = await fetch(`http://localhost:5000/students/${id}`, {
      method: "DELETE",
    });
  
    if (response.ok) {
      setStudents((prev) => prev.filter((student) => student.idstudents !== id)); // Remove deleted student
      setSelectedStudentId(""); // Reset dropdown selection
      setUpdatedStudent({ idstudents: "", name: "", age: "", grade: "", gpa: "", major: "", gender: "" }); // Clear input fields
    } else {
      console.error("Failed to delete student");
    }
    
  };

  const handleEditStudentsClick = () => {
    setShowEditForm(true);
    fetchStudents(); // Ensure the list is up to date
  };

  const handleStudentSelect = (e) => {
    const studentId = e.target.value;
    setSelectedStudentId(studentId);

    if (studentId) {
      const student = students.find((s) => s.idstudents.toString() === studentId);
      setEditingStudent(student);
      setUpdatedStudent(student ? { ...student } : { idstudents: "", name: "", age: "", grade: "", gpa: "", major: "", gender: "" });
    } else {
      setEditingStudent(null);
      setUpdatedStudent({ idstudents: "", name: "", age: "", grade: "", gpa: "", major: "", gender: "" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setShowEditForm(false); // Hide the form
    setFilterForm(false);
    setShowStudents(false); 
    setUpdatedStudent({ idstudents: "", name: "", age: "", grade: "", gpa: "", major: "", gender: "" }); // Clear fields
    setFilterCriteria({ idstudents: "", name: "", age: "", grade: "", gpa: "", major: "", gender: "" }); // Clear fields
    setSelectedStudentId(""); // Reset dropdown selection
  };
  
  const updateStudent = async () => {
    if (!updatedStudent.idstudents) return;
  
    const response = await fetch(`http://localhost:5000/students/${updatedStudent.idstudents}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedStudent),
    });
  
    if (response.ok) {
      await fetchStudents();
      setShowEditForm(false); // Hide the form
      setUpdatedStudent({ idstudents: "", name: "", age: "", grade: "", gpa: "", major: "", gender: "" }); // Clear input fields
      setSelectedStudentId(""); // Reset dropdown selection
    } else {
      console.error("Failed to update student");
    }
  };
  
  
  // Fetch all students and distinct column values for filtering
  const fetchStudents = async () => {
    try {
      // Fetch student data
      const studentRes = await fetch("http://localhost:5000/students");
      const studentData = await studentRes.json();
      setStudents(studentData);
      setFilteredStudents(studentData);

      // Fetch distinct values for each column (for dropdowns)
      const columnRes = await fetch("http://localhost:5000/students/columns");
      const columnData = await columnRes.json();
      setColumnValues(columnData);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const handleFilterStudentsClick = async () => {
    if (!showStudents) {
      await fetchStudents();
    }
    setFilterForm(!showFilterForm)
    if (!showFilterForm)
      setShowStudents(false)
  };
  // Handle filtering changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilterCriteria((prev) => ({ ...prev, [name]: value }));
  };

  // Filter students based on selected criteria
  const applyFilters = () => {
    
    const filtered = students.filter((student) => {
      return (
        (filterCriteria.idstudents ? student.idstudents === filterCriteria.idstudents : true) &&
        (filterCriteria.name ? student.name.includes(filterCriteria.name) : true) &&
        (filterCriteria.age ? student.age === parseInt(filterCriteria.age) : true) &&
        (filterCriteria.grade ? student.grade.includes(filterCriteria.grade) : true) &&
        (filterCriteria.gpa ? student.gpa === parseFloat(filterCriteria.gpa) : true) &&
        (filterCriteria.major ? student.major.includes(filterCriteria.major) : true) &&
        (filterCriteria.gender ? student.gender === filterCriteria.gender : true)
      );
    });
    setFilteredStudents(filtered);
    setShowStudents(!showStudents); 
  };
  // Handle Summary Statistic selection change
  const handleSummaryStatChange = (e) => {
    const statType = e.target.value;
    setSelectedStat(statType);

    // Set available columns based on selected statistic type
    if (statType === "count") {
      setAvailableColumns(["name", "age", "grade", "gpa", "major", "gender"]); // All columns for Count
    } else if ("avg".includes(statType)) {
      setAvailableColumns(["gpa", "age"]); // Only GPA and Age for avg
    }
  };

  // Fetch summary statistics
  const fetchSummary = async () => {
    const filters = getCurrentFilters();
    console.log(filters)
    try {
      const response = await fetch("http://localhost:5000/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stat_type: selectedStat, column: selectedColumn, groupByColumn: groupByColumn, name:filters[0], age:filters[1], grade:filters[2],gpa:filters[3],major:filters[4],gender:filters[5] }),
        
      });

      const data = await response.json();
      setSummaryResult(data);
      console.log(data);
    } catch (err) {
      console.error("Error fetching summary statistics:", err);
    }
  };
  return (
    <div>
      <h1>Student Management</h1>
      <input type="number" placeholder="ID" value={newStudent.idstudents} onChange={(e) => setNewStudent({ ...newStudent, idstudents: e.target.value })} />
      <input type="text" placeholder="Name" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
      <input type="number" placeholder="Age" value={newStudent.age} onChange={(e) => setNewStudent({ ...newStudent, age: e.target.value })} />
      <input type="text" placeholder="Grade" value={newStudent.grade} onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })} />
      <input type="number" step="0.1" placeholder="GPA" value={newStudent.gpa} onChange={(e) => setNewStudent({ ...newStudent, gpa: e.target.value })} />
      <input type="text" placeholder="Major" value={newStudent.major} onChange={(e) => setNewStudent({ ...newStudent, major: e.target.value })} />
      <input type="text" placeholder="Gender" value={newStudent.gender} onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value })} />
      <button onClick={addStudent}>Add Student</button>
      <button onClick={handleEditStudentsClick}>Edit Student</button>

      {/* View Students Button */}
      <button onClick={handleFilterStudentsClick}>
        {showStudents ? "Hide Students" : "Filter Students"}
      </button>

      {/* Filter Form */}
      {showFilterForm && (
      <div>
        <h3>Filter Students</h3>
        

        <div>
          <label>Name:</label>
          <select name="name" value={filterCriteria.name} onChange={handleFilterChange}>
            <option value="">All</option>
            {columnValues.name.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Age:</label>
          <select name="age" value={filterCriteria.age} onChange={handleFilterChange}>
            <option value="">All</option>
            {columnValues.age.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Grade:</label>
          <select name="grade" value={filterCriteria.grade} onChange={handleFilterChange}>
            <option value="">All</option>
            {columnValues.grade.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>GPA:</label>
          <select name="gpa" value={filterCriteria.gpa} onChange={handleFilterChange}>
            <option value="">All</option>
            {columnValues.gpa.map((gpa) => (
              <option key={gpa} value={gpa}>
                {gpa}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Major:</label>
          <select name="major" value={filterCriteria.major} onChange={handleFilterChange}>
            <option value="">All</option>
            {columnValues.major.map((major) => (
              <option key={major} value={major}>
                {major}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Gender:</label>
          <select name="gender" value={filterCriteria.gender} onChange={handleFilterChange}>
            <option value="">All</option>
            {columnValues.gender.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
        </div>
        <button onClick={applyFilters}>Apply</button>
        <button onClick={handleCancel}>Cancel</button>
      </div>
      )}
      {/* Display filtered students */}
      {showStudents && (
      <div>
        <h3>Student List</h3>
        <ul>
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <li key={student.idstudents}>
                {student.idstudents} - {student.name}, Age: {student.age}, Grade: {student.grade}, GPA: {student.gpa}, Major: {student.major}, Gender: {student.gender}
              </li>
            ))
          ) : (
            <p>No students match the selected criteria.</p>
          )}
        </ul>
      </div>
      )}
      
       {/* Summary Statistics */}
       {showStudents && (
        <div>
          <h3>Summary Statistics</h3>
          <label>Choose Statistic:</label>
          <select onChange={handleSummaryStatChange}>
            <option value="">Select</option>
            <option value="count">Count</option>
            <option value="avg">Average</option>
          </select>

          <label>Choose Column:</label>
          <select onChange={(e) => setSelectedColumn(e.target.value)}>
            <option value="">Select</option>
            {availableColumns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
          <label>Group By:</label>
          <select value={groupByColumn} onChange={handleGroupByChange}>
            <option value="">None</option>
            {columns.map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>

          <button onClick={fetchSummary}>Get Summary</button>
        </div>
      )}

      {/* Display Summary Result */}
      {summaryResult && (
        <div>
          <h3>Summary Results</h3>
          <ul>
            {summaryResult.map((row, index) => (
              <li key={index}>
                {row.category}: {row.result}
              </li>
            ))}
          </ul>
        </div>
      )}


      {showEditForm && (
        <div>
          <h3>Edit Student</h3>
          <label>Select Student ID:</label>
          <select value={selectedStudentId} onChange={handleStudentSelect}>
            <option value="">Select a student</option>
            {students.map((student) => (
              <option key={student.idstudents} value={student.idstudents}>
                {student.idstudents}
              </option>
            ))}
          </select>

          {editingStudent && (
            <div>
              <input type="text" name="name" value={updatedStudent.name} onChange={handleInputChange} placeholder="Name" />
              <input type="number" name="age" value={updatedStudent.age} onChange={handleInputChange} placeholder="Age" />
              <input type="text" name="grade" value={updatedStudent.grade} onChange={handleInputChange} placeholder="Grade" />
              <input type="number" step="0.1" name="gpa" value={updatedStudent.gpa} onChange={handleInputChange} placeholder="GPA" />
              <input type="text" name="major" value={updatedStudent.major} onChange={handleInputChange} placeholder="Major" />
              <input type="text" name="gender" value={updatedStudent.gender} onChange={handleInputChange} placeholder="Gender" />
              <button onClick={updateStudent}>Save</button>
            
              <button onClick={() => deleteStudent(editingStudent.idstudents)}>Delete</button>
              <button onClick={handleCancel}>Cancel</button>
            </div>
          )}
        </div>
      )}
      
      
    </div>
  );
};

export default App;
