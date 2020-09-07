const PORT = process.env.PORT || 8080;
const username = process.env.username;
const password = process.env.password;
const database = process.env.database;
const host = process.env.host;
const express = require("express");
const EmployeeMGMTServer = express();
const path = require("path");
const mysql = require("mysql");
EmployeeMGMTServer.use(express.static('public'));
EmployeeMGMTServer.use(express.urlencoded({ extended: true }));
EmployeeMGMTServer.use(express.json());

const EmployeeTableQuery = `
SELECT employee.id, CONCAT(employee.first_name , ' ' , employee.last_name) AS name, 
employee_role.title title, employee_role.salary, department.name department_name,
CONCAT(manager.first_name , ' ' , manager.last_name) AS manager_name 
FROM employee, employee manager, department, employee_role 
WHERE employee.manager_id=manager.id
AND employee.role_id=employee_role.id
AND employee_role.department_id=department.id`;

const RoleTableQuery = `
SELECT employee_role.id, 
employee_role.title, employee_role.salary, 
department.name department_name
FROM employee_role, department 
WHERE employee_role.department_id=department.id`;

const ManagerTableQuery = `
SELECT manager.id, manager.first_name, manager.last_name 
FROM employee manager, employee WHERE employee.manager_id=manager.id;`;

const DepartmetnQueryAll = `SELECT * FROM department`;

const TotalUtilizedBudget = `SELECT employee_role.salary FROM employee_role, employee 
WHERE employee_role.id=employee.role_id`;

const UtilizedBudgetDepartment = `SELECT employee_role.salary FROM employee, employee_role, department 
WHERE employee.role_id=employee_role.id AND employee_role.department_id=department.id 
AND employee_role.department_id=`

// For heroku deployment
// Creates connection to MySQL database
const connection = mysql.createConnection({
    host: host,
    port: PORT,
    user: username,
    password: password,
    database: database
});

// For testing purposes only
// const connection = mysql.createConnection({
//     host: "localhost",
//     port: 3306,
//     user: "root",
//     password: "password",
//     database: "employee_db"
// });

// Connects to MySQL database and initializes the start of the app
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected to the database!");
});

// Load home page
EmployeeMGMTServer.get("/", function(req, res) {
  res.sendFile(path.join(req.url + ".html"));
});

// Load home page
EmployeeMGMTServer.get("/employee", function(req, res) {
    res.sendFile(path.join(__dirname, "public" + req.url));
});

  // Load home page
EmployeeMGMTServer.get("/department", function(req, res) {
    res.sendFile(path.join(__dirname, "public" + req.url + ".html"));
  });

  // Load home page
EmployeeMGMTServer.get("/role", function(req, res) {
    res.sendFile(path.join(__dirname, "public" + req.url + ".html"));
});

// API request that gets all employees
EmployeeMGMTServer.get("/api/TotalBudget", function(req, res) {
    connection.query(TotalUtilizedBudget, function(err, results) {
        if (err) throw err;
        return res.json(results);
    });
});

// API request that gets all employees
EmployeeMGMTServer.get("/api/employee", function(req, res) {
    connection.query(EmployeeTableQuery, function(err, results) {
        if (err) throw err;
        return res.json(results);
    });
});

// API request that gets all departments
EmployeeMGMTServer.get("/api/department", function(req, res) {
    connection.query(DepartmetnQueryAll, function(err, results) {
        if (err) throw err;
        return res.json(results);
    });
});

// API request that gets all roles
EmployeeMGMTServer.get("/api/role", function(req, res) {
    connection.query(RoleTableQuery, function(err, results) {
        if (err) throw err;
        return res.json(results);
    });
});

// API request that gets all employee's manager names
EmployeeMGMTServer.get("/api/manager", function(req, res) {
  connection.query(ManagerTableQuery, function(err, results) {
      if (err) throw err;
      return res.json(results);
  });
});

// API request that filters employees by a specific role
EmployeeMGMTServer.get("/api/EmployeesByRole/:id", function(req, res) {
  connection.query(EmployeeTableQuery + ` AND employee_role.id=${req.params.id}`, function(err, results) {
      if (err) throw err;
      return res.json(results);
  });
});

// API request that filters employees by a specific department
EmployeeMGMTServer.get("/api/EmployeesByDepartment/:id", function(req, res) {
  connection.query(EmployeeTableQuery + ` AND department.id=${req.params.id}`, function(err, results) {
      if (err) throw err;
      return res.json(results);
  });
});

// API request that filters employees by a specific manager
EmployeeMGMTServer.get("/api/EmployeesByManager/:id", function(req, res) {
  connection.query(EmployeeTableQuery + ` AND manager.id=${req.params.id}`, function(err, results) {
      if (err) throw err;
      return res.json(results);
  });
});

// API request that filters employees by a specific manager
EmployeeMGMTServer.get("/api/UBDepartment/:id", function(req, res) {
    connection.query(UtilizedBudgetDepartment + req.params.id, function(err, results) {
        if (err) throw err;
        return res.json(results);
    });
  });

// Start server listener
EmployeeMGMTServer.listen(PORT, function() {
    console.log("Server is listening on http://localhost:" + PORT);
});