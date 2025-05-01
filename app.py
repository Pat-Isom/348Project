from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"], supports_credentials=True)
# Database connection function
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="Belvew717",
        database="classes"
    )

# Get all students
@app.route('/students', methods=['GET'])
def get_students():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM students")
    students = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(students)


@app.route('/students/columns', methods=['GET'])
def get_column_values():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    columns = ["idstudents", "name", "age", "grade", "gpa", "major", "gender"]
    column_values = {}

    for column in columns:
        query = f"SELECT DISTINCT {column} FROM students"  # Replace with your actual table name
        cursor.execute(query)
        column_values[column] = [row[column] for row in cursor.fetchall()]

    conn.close()
    return jsonify(column_values)
# Add a student
@app.route('/students', methods=['POST'])
def add_student():
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO students (idstudents, name, age, grade, gpa, major, gender) VALUES (%s, %s, %s, %s, %s, %s, %s)",
                   (data['idstudents'], data['name'], data['age'], data['grade'], data['gpa'], data['major'], data['gender']))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Student added successfully"}), 201

# Update a student
@app.route('/students/<int:id>', methods=['PUT'])
def update_student(id):
    try:
        data = request.json
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            UPDATE students 
            SET idstudents = %s, name = %s, age = %s, grade = %s, gpa = %s, major = %s, gender = %s 
            WHERE idstudents = %s
        """, (data["idstudents"], data["name"], data["age"], data["grade"], data["gpa"], data["major"], data["gender"], id))

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Student updated successfully"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Delete a student
@app.route('/students/<int:id>', methods=['DELETE'])
def delete_student(id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("DELETE FROM students WHERE idstudents=%s", (id,))
        conn.commit()
        cursor.close()
        conn.close()
        
        print(f"Deleted student with ID {id}")  # Debugging
        return jsonify({"message": "Student deleted successfully"})
    
    except Exception as e:
        print(f"Error deleting student: {e}")  # Debugging
        return jsonify({"error": str(e)}), 500

# Fetch summary statistics dynamically
@app.route('/summary', methods=['POST'])
def get_summary():
    try:
        data = request.json
        print(data)
        stat_type = data.get("stat_type")  # 'count', 'avg', 'min', 'max'
        column_name = data.get("column")
        group_by_column = data.get("groupByColumn")
        
        name=data.get("name")
        age=data.get("age")
        grade=data.get("grade")
        gpa=data.get("gpa")
        major=data.get("major")
        gender=data.get("gender")
        
        if not stat_type or not column_name:
            return jsonify({"error": "Missing stat_type or column"}), 400
        print(name)
        procedure_map = {
            "count": "GetCounts",
            "avg": "GetAVG"
        }

        if stat_type not in procedure_map:
            return jsonify({"error": "Invalid stat_type"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        if (group_by_column == ''):
            callstring = "CALL "+procedure_map[stat_type]+"('"+column_name+"'"
        else:
            callstring = "CALL "+procedure_map[stat_type]+"('"+column_name+"', '"+group_by_column+"'"
        callstring = callstring + ",'" +name+ "'" if name == "name is not null" else callstring + "," + name
        callstring = callstring + ",'" +age+ "'" if age == "age is not null" else callstring + "," + age 
        callstring = callstring + ",'" +grade+ "'" if grade == "grade is not null" else callstring + "," + grade 
        callstring = callstring + ",'" +gpa+ "'" if gpa == "gpa is not null" else callstring + "," + gpa 
        callstring = callstring + ",'" +major+ "'" if major == "major is not null" else callstring + "," + major 
        callstring = callstring + ",'" +gender+ "')" if gender == "gender is not null" else callstring + "," + gender + ")"     

        print(callstring)
        cursor.execute(callstring)
        
        counts = cursor.fetchall()
         
        cursor.close()
        conn.close()
        return jsonify(counts)

    except Exception as e:
        return jsonify({"error": str(e)})
if __name__ == '__main__':
    app.run(debug=True)
