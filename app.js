const fs = require("fs");
const inquirer = require("inquirer");
const path = require("path");
var mysql = require("mysql");
const cTable = require('console.table');

// Creates connection to MySQL database
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employee_db"
});

// Connects to MySQL database and initializes the start of the app
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    Start();
});

// Starts the app with a welcome message and then initializes the main menu
const Start = () => {
    console.log("Welcome to the Employee Management System");
    MainMenu();
}

// Displays the main menu with all of the options to view, add, update, and delete database information
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

// Next prompt that allows the user to either return to the main menu or exit the app
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

// Exit the app displays a Goodbye message and ends the connection with the database
const Exit = () => {
    console.log("Goodbye");
    connection.end();
}

// Function that takes in a query request and displays a table to the user
const QueryTable = (queryTable) => {
    connection.query(queryTable, function(err, res) {
        if (err) throw err;
        const table = cTable.getTable(res)
        console.log(table);
        Next();
    });
}

// Views a specific employee's details
const ViewSpecificEmployee = () => {
    connection.query("SELECT * FROM employee", function(err, res) {
        if (err) throw err;
        let EmployeeArray = new Array();
        res.forEach((employee) => {EmployeeArray.push(employee.first_name + " " + employee.last_name)});
        inquirer.prompt({
            type: "list",
            message: "Please Select an Employee to View",
            name: "employee",
            choices: EmployeeArray
        }).then(function(response) {
            let employee = response.employee;
            let index = EmployeeArray.indexOf(employee)
            let emplyeeId = res[index].id;
            connection.query("SELECT * FROM employee WHERE id=" + emplyeeId, function(error, result) {
                if (error) throw error;
                const EmployeeTableQuery = `
                SELECT employee.id, CONCAT(employee.first_name , ' ' , employee.last_name) AS name, 
                employee_role.title title, employee_role.salary, department.name department_name,
                CONCAT(manager.first_name , ' ' , manager.last_name) AS manager_name 
                FROM employee, employee manager, department, employee_role 
                WHERE employee.id=${result[0].id}
                AND employee.manager_id=manager.id
                AND employee.department_id=department.id
                AND employee.role_id=employee_role.id;`
                QueryTable(EmployeeTableQuery);
            })
        });

    });
}

// Views all employees and details
const ViewAllEmployees = () => {
    const EmployeeTableQuery = `
    SELECT employee.id, CONCAT(employee.first_name , ' ' , employee.last_name) AS name, 
    employee_role.title title, employee_role.salary, department.name department_name,
    CONCAT(manager.first_name , ' ' , manager.last_name) AS manager_name 
    FROM employee, employee manager, department, employee_role 
    WHERE employee.manager_id=manager.id
    AND employee.department_id=department.id
    AND employee.role_id=employee_role.id;`
    console.log("View All Employees:");
    QueryTable(EmployeeTableQuery);
}

// Views all departments and details
const ViewAllDepartments = () => {
    console.log("View All Departments:");
    QueryTable("SELECT * FROM department");
}

// Views all roles and details
const ViewAllRoles = () => {
    const RoleTableQuery = `
    SELECT employee_role.id, employee_role.title, employee_role.salary, 
    department.name department_name
    FROM employee_role, department 
    WHERE employee_role.department_id=department.id`;
    console.log("View All Roles:");
    QueryTable(RoleTableQuery);
}

// Views all roles by a specific department
const ViewRolesByDepartment = () => {
    console.log("View All Roles by Department");
    connection.query("SELECT * FROM department", function(err, res) {
        if (err) throw err;
        let DepartmentArray = new Array();
        res.forEach((department) => {DepartmentArray.push(department.name)});
        inquirer.prompt({
            type: "list",
            message: "Please Select a Department to View All Roles By:",
            name: "department",
            choices: DepartmentArray
        }).then(function(response) {
            let department = response.department;
            let index = DepartmentArray.indexOf(department)
            let departmentId = res[index].id;
            let RoleTableQuery = `SELECT * FROM employee_role WHERE department_id=${departmentId}`
            QueryTable(RoleTableQuery)
        });
    });

}

// Views all employees by a specific role
const ViewEmployeesByRole = () => {
    console.log("View All Employees by Roles");
    connection.query("SELECT * FROM employee_role", function(err, res) {
        if (err) throw err;
        let RoleArray = new Array();
        res.forEach((role) => {RoleArray.push(role.title)});
        inquirer.prompt({
            type: "list",
            message: "Please Select a Role to View All Employees By:",
            name: "role",
            choices: RoleArray
        }).then(function(response) {
            let role = response.role;
            let index = RoleArray.indexOf(role)
            let roleId = res[index].id;
            const EmployeeTableQuery = `
            SELECT employee.id, CONCAT(employee.first_name , ' ' , employee.last_name) AS name, 
            employee_role.title title, employee_role.salary, department.name department_name,
            CONCAT(manager.first_name , ' ' , manager.last_name) AS manager_name 
            FROM employee, employee manager, department, employee_role 
            WHERE employee.manager_id=manager.id
            AND employee.department_id=department.id
            AND employee.role_id=employee_role.id
            AND employee.role_id=${roleId};`
            QueryTable(EmployeeTableQuery)
        });
    });
}

// Views all employees by a specific department
const ViewEmployeesByDepartment = () => {
    console.log("View All Employees by Department");
    connection.query("SELECT * FROM department", function(err, res) {
        if (err) throw err;
        let DepartmentArray = new Array();
        res.forEach((department) => {DepartmentArray.push(department.name)});
        inquirer.prompt({
            type: "list",
            message: "Please Select a Department to View All Employees By:",
            name: "department",
            choices: DepartmentArray
        }).then(function(response) {
            let department = response.department;
            let index = DepartmentArray.indexOf(department)
            let departmentId = res[index].id;
            const EmployeeTableQuery = `
            SELECT employee.id, CONCAT(employee.first_name , ' ' , employee.last_name) AS name, 
            employee_role.title title, employee_role.salary, department.name department_name,
            CONCAT(manager.first_name , ' ' , manager.last_name) AS manager_name 
            FROM employee, employee manager, department, employee_role 
            WHERE employee.manager_id=manager.id
            AND employee.department_id=department.id
            AND employee.role_id=employee_role.id
            AND employee.department_id=${departmentId};`
            QueryTable(EmployeeTableQuery)
        });
    });
}

// Views all employees by a specific manager
const ViewEmployeesByManager = () => {
    console.log("View All Employees by Manager");
    // To prevent future bugs, I made it so the ViewEmployeesByManager function checks which department rows are Management
    // or Executive. This makes it so the id's used to find all managers is always correct.
    let ManagerQueryString = `
    SELECT employee.id, employee.first_name, employee.last_name FROM employee, department 
    WHERE department.name='Management' AND department.id=employee.department_id 
    OR department.name='Executive' AND department.id=employee.department_id;`
    connection.query(ManagerQueryString, function(err, res) {
        if (err) throw err;
        let ManagerArray = new Array();
        res.forEach((manager) => {ManagerArray.push(manager.first_name + " " + manager.last_name)});
        inquirer.prompt({
            type: "list",
            message: "Please select a Manager to View All Employees By:",
            name: "manager",
            choices: ManagerArray
        }).then(function(response) {
            let manager = response.manager;
            let index = ManagerArray.indexOf(manager);
            let managerId = res[index].id;
            let EmployeeTableQuery = `
            SELECT employee.id, CONCAT(employee.first_name , ' ' , employee.last_name) AS name, 
            employee_role.title title, employee_role.salary, department.name department_name,
            CONCAT(manager.first_name , ' ' , manager.last_name) AS manager_name 
            FROM employee, employee manager, department, employee_role 
            WHERE employee.manager_id=manager.id
            AND employee.department_id=department.id
            AND employee.role_id=employee_role.id
            AND employee.manager_id=${managerId};`
            QueryTable(EmployeeTableQuery);
        });
    });
}

// Views the total utilized budget for each department by adding up employee salaries for that department
const ViewUBDepartment = () => {
    console.log("View Utilized Budget of a Department");
    connection.query("SELECT * FROM department", function(err, res) {
        if (err) throw err;
        let DepartmentArray = new Array();
        res.forEach((department) => {DepartmentArray.push(department.name)});
        inquirer.prompt({
            type: "list",
            message: "Please select a Department to View the Utilized Budget By:",
            name: "department",
            choices: DepartmentArray
        }).then(function(response) {
            let department = response.department;
            let index = DepartmentArray.indexOf(department)
            let departmentId = res[index].id;
            connection.query("SELECT salary FROM employee_role WHERE department_id=" + departmentId, function(error, result) {
                if (error) throw error;
                var SumUtilizedBudget = 0;
                result.forEach((role) => SumUtilizedBudget += role.salary)
                console.log("Current budget for " + department + " department is: " + USDformatter.format(SumUtilizedBudget))
                Next()
            })
        });
    })
}

// Views the total utilized budget for each role by adding up employee salaries for that role
const ViewUBRole = () => {
    console.log("View Utilized Budget of a Role");
    connection.query("SELECT * FROM employee_role", function(err, res) {
        if (err) throw err;
        let RoleArray = new Array();
        res.forEach((role) => {RoleArray.push(role.title)});
        inquirer.prompt({
            type: "list",
            message: "Please Select a Role to View the Utilized Budget By:",
            name: "role",
            choices: RoleArray
        }).then(function(response) {
            let role = response.role;
            let index = RoleArray.indexOf(role)
            let roleId = res[index].id;
            let roleSalary = res[index].salary
            connection.query("SELECT * FROM employee WHERE role_id=" + roleId, function(error, result) {
                if (error) throw error;
                var SumUtilizedBudget = roleSalary * result.length;
                console.log("Current budget for " + role + " role is: " + USDformatter.format(SumUtilizedBudget))
                Next()
            })
        });
    })
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

const USDformatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
})