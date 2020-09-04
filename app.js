const fs = require("fs");
const inquirer = require("inquirer");
const path = require("path");
var mysql = require("mysql");
const cTable = require('console.table');

const EmployeeTableQuery = `
SELECT employee.id, CONCAT(employee.first_name , ' ' , employee.last_name) AS name, 
employee_role.title title, employee_role.salary, department.name department_name,
CONCAT(manager.first_name , ' ' , manager.last_name) AS manager_name 
FROM employee, employee manager, department, employee_role 
WHERE employee.manager_id=manager.id
AND employee.department_id=department.id
AND employee.role_id=employee_role.id`

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

// View by function that takes generic view request
const ViewBy = (SelectQuery, PromptMsg, TableQuery) => {
    connection.query(SelectQuery, function(err, res) {
        if (err) throw err;
        let ChoicesArray = new Array();

        if (TableQuery === "ViewRolesByDepartment" || TableQuery === "ViewEmployeesByDepartment" || TableQuery === "ViewUBDepartment") {
            res.forEach((department) => {ChoicesArray.push(department.name)});
        } else if (TableQuery === "ViewEmployeesByRole" || TableQuery === "ViewUBRole") {
            res.forEach((role) => {ChoicesArray.push(role.title)});
        } else if (TableQuery === "ViewEmployeesByManager" || TableQuery === "ViewSpecificEmployee") {
            res.forEach((employee) => {ChoicesArray.push(employee.first_name + " " + employee.last_name)});
        }

        inquirer.prompt({
            type: "list",
            message: PromptMsg,
            name: "selection",
            choices: ChoicesArray
        }).then(function(response) {
            let UserSelection = response.selection;
            let index = ChoicesArray.indexOf(UserSelection);
            let SelectionId = res[index].id;
            var SelectionQuery = EmployeeTableQuery;
            switch(TableQuery){
                case "ViewSpecificEmployee":
                    SelectionQuery += ` AND employee.id=${SelectionId};`;
                    QueryTable(SelectionQuery);
                    break;
                case "ViewRolesByDepartment":
                    SelectionQuery = `SELECT * FROM employee_role WHERE department_id=${SelectionId}`;
                    QueryTable(SelectionQuery);
                    break;
                case "ViewEmployeesByRole":
                    SelectionQuery += ` AND employee.role_id=${SelectionId};`;
                    QueryTable(SelectionQuery);
                    break;
                case "ViewEmployeesByDepartment":
                    SelectionQuery += ` AND employee.department_id=${SelectionId};`;
                    QueryTable(SelectionQuery);
                    break;
                case "ViewEmployeesByManager":
                    SelectionQuery += ` AND employee.manager_id=${SelectionId};`;
                    QueryTable(SelectionQuery);
                    break;
                case "ViewUBDepartment":
                    connection.query(`SELECT employee_role.salary FROM employee, employee_role 
                    WHERE employee.role_id=employee_role.id 
                    AND employee.department_id=` + SelectionId, function(error, result) {
                        if (error) throw error;
                        var SumUtilizedBudget = 0;
                        result.forEach((role) => SumUtilizedBudget += role.salary)
                        console.log("Current budget for " + UserSelection + " department is: " + USDformatter.format(SumUtilizedBudget));
                        Next()
                    });
                    break;
                case "ViewUBRole":
                    connection.query("SELECT * FROM employee WHERE role_id=" + SelectionId, function(error, result) {
                        if (error) throw error;
                        let roleSalary = res[index].salary;
                        var SumUtilizedBudget = roleSalary * result.length;
                        console.log("Current budget for " + UserSelection + " role is: " + USDformatter.format(SumUtilizedBudget))
                        Next()
                    }); 
                    break;
            }
        });
    });
}

// Views a specific employee's details
const ViewSpecificEmployee = () => {
    console.log("View A Specific Employee");
    const SelectQuery = "SELECT * FROM employee";
    const PromptMsg = "Please Select an Employee to View:";
    const TableQuery = "ViewSpecificEmployee";
    ViewBy(SelectQuery, PromptMsg, TableQuery);
}


// Views all employees and details
const ViewAllEmployees = () => {
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
    const SelectQuery = "SELECT * FROM department";
    const PromptMsg = "Please Select a Department to View All Roles By:";
    const TableQuery = "ViewRolesByDepartment";
    ViewBy(SelectQuery, PromptMsg, TableQuery);
}

// Views all employees by a specific role
const ViewEmployeesByRole = () => {
    console.log("View All Employees by Roles");
    const SelectQuery = "SELECT * FROM employee_role";
    const PromptMsg = "Please Select a Role to View All Employees By:";
    const TableQuery = "ViewEmployeesByRole";
    ViewBy(SelectQuery, PromptMsg, TableQuery);
}

// Views all employees by a specific department
const ViewEmployeesByDepartment = () => {
    console.log("View All Employees by Department");
    const SelectQuery = "SELECT * FROM department";
    const PromptMsg = "Please Select a Department to View All Employees By:";
    const TableQuery = "ViewEmployeesByDepartment";
    ViewBy(SelectQuery, PromptMsg, TableQuery);
}

// Views all employees by a specific manager
const ViewEmployeesByManager = () => {
    console.log("View All Employees by Manager");
    const SelectQuery = `
    SELECT employee.id, employee.first_name, employee.last_name FROM employee, department 
    WHERE department.name='Management' AND department.id=employee.department_id 
    OR department.name='Executive' AND department.id=employee.department_id;`;
    const PromptMsg = "Please Select a Manager to View All Employees By:";
    const TableQuery = "ViewEmployeesByManager";
    ViewBy(SelectQuery, PromptMsg, TableQuery);

}

// Views the total utilized budget for each department by adding up employee salaries for that department
const ViewUBDepartment = () => {
    console.log("View Utilized Budget of a Department");
    const SelectQuery = "SELECT * FROM department";
    const PromptMsg = "Please Select a Department to View the Utilized Budget By:";
    const TableQuery = "ViewUBDepartment";
    ViewBy(SelectQuery, PromptMsg, TableQuery);
}

// Views the total utilized budget for each role by adding up employee salaries for that role
const ViewUBRole = () => {
    console.log("View Utilized Budget of a Role");
    const SelectQuery = "SELECT * FROM employee_role";
    const PromptMsg = "Please Select a Role to View the Utilized Budget By:";
    const TableQuery = "ViewUBRole";
    ViewBy(SelectQuery, PromptMsg, TableQuery);
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