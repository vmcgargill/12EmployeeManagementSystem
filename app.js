const fs = require("fs");
const inquirer = require("inquirer");
const path = require("path");
const { timeStamp } = require("console");
var mysql = require("mysql");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employee_db"
});

connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    Start();
});

const Start = () => {
    console.log("Welcome to the Employee Management System");
    MainMenu();
}

const MainMenu = () => {
    inquirer.prompt({
        type: "list",
        message: "What would you like to do?",
        name: "start",
        choices: [
            "View a Specific Employee",
            "View All Employees",
            "View All Departments",
            "View All Roles",
            "View All Roles by Department",
            "View All Employees by Roles",
            "View All Employees by Department",
            "View All Employees by Manager",
            "View Utilized Budget of a Department",
            "View Utilized Budget of a Role",
            "Add an Employee",
            "Add a Department",
            "Add a Role",
            "Update an Employee",
            "Delete an Employee",
            "Delete a Department",
            "Delete a Role",
            "Exit"
        ]
    }).then((response) => {
        var start = response.start;

        if (start === "Exit") Exit(); 
        else if (start === "View a Specific Employee") ViewSpecificEmployee();
        else if (start === "View All Employees") ViewAllEmployees();
        else if (start === "View All Departments") ViewAllDepartments();
        else if (start === "View All Roles") ViewAllRoles();
        else if (start === "View All Roles by Department") ViewRolesByDepartment();
        else if (start === "View All Employees by Roles") ViewEmployeesByRole();
        else if (start === "View All Employees by Department") ViewEmployeesByDepartment();
        else if (start === "View All Employees by Manager") ViewEmployeesByManager();
        else if (start === "View Utilized Budget of a Department") ViewUBDepartment();
        else if (start === "View Utilized Budget of a Role") ViewUBRole();
        else if (start === "Add an Employee") AddEmployee();
        else if (start === "Add a Department") AddDepartment();
        else if (start === "Add a Role") AddRole();
        else if (start === "Update an Employee") UpdateEmployee();
        else if (start === "Delete an Employee") DeleteEmployee();
        else if (start === "Delete a Department") DeleteDepartment();
        else if (start === "Delete a Role") DeleteRole();
    })
}

const Next = () => {
    inquirer.prompt({
        type: "list",
        message: "Would you like to return to the main menu?",
        name: "next",
        choices: [
            "Return to Main Menu",
            "Exit"
        ]
    }).then((response) => {
        var next = response.next;

        if (next === "Return to Main Menu") {
            MainMenu();
        } else if (next === "Exit") {
            Exit();
        }
    })
}

const Exit = () => {
    console.log("Goodbye");
    connection.end();
}

const ViewSpecificEmployee = () => {
    connection.query("SELECT * FROM employee", function(err, res) {
        if (err) throw err;
        
        let EmployeeArray = new Array();
        res.forEach((employee) => {
            var NameString = employee.first_name + " " + employee.last_name
            EmployeeArray.push(NameString)
        });

        inquirer.prompt({
            type: "list",
            message: "Please select an employee to view",
            name: "employee",
            choices: EmployeeArray
        }).then(function(response) {
            let employee = response.employee;
            let index = EmployeeArray.indexOf(employee)
            let emplyeeId = res[index].id;
            connection.query("SELECT * FROM employee WHERE id=" + emplyeeId, function(error, result) {
                if (error) throw error;
                console.log(result)
                Next()
            })
        });

    });
}

const ViewAllEmployees = () => {
    console.log("View All Employees:");
    connection.query("SELECT * FROM employee", function(err, res) {
        if (err) throw err;
        console.log(res);
        Next()
    });
}

const ViewAllDepartments = () => {
    console.log("View All Departments:");
    connection.query("SELECT * FROM department", function(err, res) {
        if (err) throw err;
        console.log(res);
        Next()
    });
}

const ViewAllRoles = () => {
    console.log("View All Roles:");
    connection.query("SELECT * FROM employee_role", function(err, res) {
        if (err) throw err;
        console.log(res);
        Next()
    });
}

const ViewRolesByDepartment = () => {
    console.log("View All Roles by Department");
    connection.query("SELECT * FROM department", function(err, res) {
        if (err) throw err;
        
        let DepartmentArray = new Array();
        res.forEach((department) => {
            var NameString = department.name;
            DepartmentArray.push(NameString)
        });
        
        inquirer.prompt({
            type: "list",
            message: "Please select a Department to View All Roles By:",
            name: "department",
            choices: DepartmentArray
        }).then(function(response) {
            let department = response.department;
            let index = DepartmentArray.indexOf(department)
            let departmentId = res[index].id;
            connection.query("SELECT * FROM employee_role WHERE department_id=" + departmentId, function(error, result) {
                if (error) throw error;
                console.log(result)
                Next()
            })
        });
    });
}

const ViewEmployeesByRole = () => {
    console.log("View All Employees by Roles");
    connection.query("SELECT * FROM employee_role", function(err, res) {
        if (err) throw err;
        
        let RoleArray = new Array();
        res.forEach((role) => {
            var NameString = role.title;
            RoleArray.push(NameString)
        });
        
        inquirer.prompt({
            type: "list",
            message: "Please select a Role to View All Employees By:",
            name: "role",
            choices: RoleArray
        }).then(function(response) {
            let role = response.role;
            let index = RoleArray.indexOf(role)
            let roleId = res[index].id;
            connection.query("SELECT * FROM employee WHERE role_id=" + roleId, function(error, result) {
                if (error) throw error;
                console.log(result)
                Next()
            })
        });
    });
}

const ViewEmployeesByDepartment = () => {
    console.log("View All Employees by Department");
    connection.query("SELECT * FROM department", function(err, res) {
        if (err) throw err;
        
        let DepartmentArray = new Array();
        res.forEach((department) => {
            var NameString = department.name;
            DepartmentArray.push(NameString)
        });
        
        inquirer.prompt({
            type: "list",
            message: "Please select a Department to View All Employees By:",
            name: "department",
            choices: DepartmentArray
        }).then(function(response) {
            let department = response.department;
            let index = DepartmentArray.indexOf(department)
            let departmentId = res[index].id;
            connection.query("SELECT * FROM employee WHERE department_id=" + departmentId, function(error, result) {
                if (error) throw error;
                console.log(result)
                Next()
            })
        });
    });
}

const ViewEmployeesByManager = () => {
    console.log("View All Employees by Manager");
    connection.query("SELECT * FROM department WHERE name='Management'", function(err, res) {
        if (err) throw err;
        let ManagementDepartmentId = res[0].id
        connection.query("SELECT * FROM employee WHERE department_id=" + ManagementDepartmentId, function(error, result) {
            if (error) throw error;
            
            let ManagerArray = new Array();
            result.forEach((manager) => {
                var NameString = manager.first_name + " " + manager.last_name;
                ManagerArray.push(NameString)
            });

            inquirer.prompt({
                type: "list",
                message: "Please select a Manager to View All Employees By:",
                name: "manager",
                choices: ManagerArray
            }).then(function(response) {
                let manager = response.manager;
                let index = ManagerArray.indexOf(manager)
                let managerId = result[index].id;
                connection.query("SELECT * FROM employee WHERE manager_id=" + managerId, function(errormsg, resultmsg) {
                    if (errormsg) throw errormsg;
                    console.log(resultmsg)
                    Next()
                })
            });
        })
    });
}

const ViewUBDepartment = () => {
    console.log("View Utilized Budget of a Department");
}

const ViewUBRole = () => {
    console.log("View Utilized Budget of a Role");
}

const AddEmployee = () => {
    console.log("Add an Employee");
}

const AddDepartment = () => {
    console.log("Add a Department");
}

const AddRole = () => {
    console.log("Add a Role");
}

const UpdateEmployee = () => {
    console.log("Update an Employee");
}

const DeleteEmployee = () => {
    console.log("Delete an Employee");
}

const DeleteDepartment = () => {
    console.log("Delete a Department");
}

const DeleteRole = () => {
    console.log("Delete a Role");
}

