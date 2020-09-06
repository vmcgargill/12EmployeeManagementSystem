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
AND employee.role_id=employee_role.id
AND employee_role.department_id=department.id`;

const RoleTableQuery = `SELECT employee_role.id, 
employee_role.title, employee_role.salary, 
department.name department_name
FROM employee_role, department 
WHERE employee_role.department_id=department.id`;

const ManagerTableQuery = `
SELECT employee.id, employee.first_name, employee.last_name FROM employee, employee_role, department 
WHERE department.name='Management' AND employee_role.id=employee.role_id AND department.id=employee_role.department_id 
OR department.name='Executive' AND employee_role.id=employee.role_id AND department.id=employee_role.department_id`;

const DepartmetnQueryAll = `SELECT * FROM department`;

const RoleQueryAll = `SELECT * FROM employee_role`;

const EmployeeQueryAll = `SELECT * FROM employee`;

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
            "View Roles By Department",
            "View Employees By Role",
            "View Employees by Department",
            "View Employees by Manager",
            "View Utilized Budget of a Department",
            "View Utilized Budget of a Role",
            "Add an Employee",
            "Add a Department",
            "Add a Role",
            "Update an Employee",
            "Update a Department",
            "Update a Role",
            "Delete an Employee",
            "Delete a Department",
            "Delete a Role",
            "Exit"
        ]
    }).then((response) => {
        let start = response.start;
        if (start === "Exit") Exit(); 
        else if (start === "View a Specific Employee") ViewSpecificEmployee();
        else if (start === "View All Employees") ViewAllEmployees();
        else if (start === "View All Departments") ViewAllDepartments();
        else if (start === "View All Roles") ViewAllRoles();
        else if (start === "View Roles By Department") ViewRolesByDepartment();
        else if (start === "View Employees By Role") ViewEmployeesByRole();
        else if (start === "View Employees by Department") ViewEmployeesByDepartment();
        else if (start === "View Employees by Manager") ViewEmployeesByManager();
        else if (start === "View Utilized Budget of a Department") ViewUBDepartment();
        else if (start === "View Utilized Budget of a Role") ViewUBRole();
        else if (start === "Add an Employee") AddEmployee();
        else if (start === "Add a Department") AddDepartment();
        else if (start === "Add a Role") AddRole();
        else if (start === "Update an Employee") UpdateEmployee();
        else if (start === "Update a Department") UpdateDepartment();
        else if (start === "Update a Role") UpdateRole();
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
        let next = response.next;
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
                    SelectionQuery = RoleQueryAll + ` WHERE department_id=${SelectionId}`;
                    QueryTable(SelectionQuery);
                    break;
                case "ViewEmployeesByRole":
                    SelectionQuery += ` AND employee.role_id=${SelectionId};`;
                    QueryTable(SelectionQuery);
                    break;
                case "ViewEmployeesByDepartment":
                    SelectionQuery += ` AND employee_role.department_id=${SelectionId};`;
                    QueryTable(SelectionQuery);
                    break;
                case "ViewEmployeesByManager":
                    SelectionQuery += ` AND employee.manager_id=${SelectionId};`;
                    QueryTable(SelectionQuery);
                    break;
                case "ViewUBDepartment":
                    connection.query(`SELECT employee_role.salary FROM employee, employee_role, department 
                    WHERE employee.role_id=employee_role.id AND employee_role.department_id=department.id 
                    AND employee_role.department_id=` + SelectionId, function(error, result) {
                        if (error) throw error;
                        var SumUtilizedBudget = 0;
                        result.forEach((role) => SumUtilizedBudget += role.salary)
                        console.log("Current budget for " + UserSelection + " department is: " + USDformatter.format(SumUtilizedBudget));
                        Next()
                    });
                    break;
                case "ViewUBRole":
                    connection.query(EmployeeQueryAll + ` WHERE role_id=` + SelectionId, function(error, result) {
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
    const SelectQuery = EmployeeQueryAll;
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
    QueryTable(DepartmetnQueryAll);
}

// Views all roles and details
const ViewAllRoles = () => {
    console.log("View All Roles:");
    QueryTable(RoleTableQuery);
}

// Views all roles by a specific department
const ViewRolesByDepartment = () => {
    console.log("View All Roles by Department");
    const SelectQuery = DepartmetnQueryAll;
    const PromptMsg = "Please Select a Department to View All Roles By:";
    const TableQuery = "ViewRolesByDepartment";
    ViewBy(SelectQuery, PromptMsg, TableQuery);
}

// Views all employees by a specific role
const ViewEmployeesByRole = () => {
    console.log("View All Employees by Roles");
    const SelectQuery = RoleQueryAll;
    const PromptMsg = "Please Select a Role to View All Employees By:";
    const TableQuery = "ViewEmployeesByRole";
    ViewBy(SelectQuery, PromptMsg, TableQuery);
}

// Views all employees by a specific department
const ViewEmployeesByDepartment = () => {
    console.log("View All Employees by Department");
    const SelectQuery = DepartmetnQueryAll;
    const PromptMsg = "Please Select a Department to View All Employees By:";
    const TableQuery = "ViewEmployeesByDepartment";
    ViewBy(SelectQuery, PromptMsg, TableQuery);
}

// Views all employees by a specific manager
const ViewEmployeesByManager = () => {
    console.log("View All Employees by Manager");
    const PromptMsg = "Please Select a Manager to View All Employees By:";
    const TableQuery = "ViewEmployeesByManager";
    ViewBy(ManagerTableQuery, PromptMsg, TableQuery);
}

// Views the total utilized budget for each department by adding up employee salaries for that department
const ViewUBDepartment = () => {
    console.log("View Utilized Budget of a Department");
    const SelectQuery = DepartmetnQueryAll;
    const PromptMsg = "Please Select a Department to View the Utilized Budget By:";
    const TableQuery = "ViewUBDepartment";
    ViewBy(SelectQuery, PromptMsg, TableQuery);
}

// Views the total utilized budget for each role by adding up employee salaries for that role
const ViewUBRole = () => {
    console.log("View Utilized Budget of a Role");
    const SelectQuery = RoleQueryAll;
    const PromptMsg = "Please Select a Role to View the Utilized Budget By:";
    const TableQuery = "ViewUBRole";
    ViewBy(SelectQuery, PromptMsg, TableQuery);
}

// Creates a new employee and adds it to the database
const AddEmployee = () => {
    console.log("Add an Employee");
    inquirer.prompt([
        {
            type: "input",
            message: "Please enter the first name of the employee:",
            name: "first_name"
        },
        {
            type: "input",
            message: "Please enter the last name of the employee:",
            name: "last_name"
        }
    ]).then(function(response) {
        let first_name = response.first_name;
        let last_name = response.last_name;
        connection.query(EmployeeQueryAll, function(emperr, empres) {
            if (emperr) throw emperr;
            let EmployeeArray = new Array();
            empres.forEach((employee) => {EmployeeArray.push(employee.first_name + " " + employee.last_name)});
            let CurrentEmployeeIndex = EmployeeArray.indexOf(first_name + " " + last_name);
            if (CurrentEmployeeIndex !== -1) {
                inquirer.prompt([
                    {
                        type: "list",
                        message: "Error: It looks like their is already an employee by the name of '" + first_name + 
                        " " + last_name + "'. There cannot be duplicates. Please alter the name and try again.",
                        name: "duplicate",
                        choices: [
                            "OK",
                            "Cancel"
                        ]
                    }
                ]).then(function(errResponse) {
                    let duplicate = errResponse.duplicate;
                    if (duplicate === "OK") {
                        AddEmployee();
                    } else if (duplicate === "Cancel") {
                        Next();
                    }
                });
            } else {
                connection.query(ManagerTableQuery, function(error, result) {
                    if (error) throw error;
                    let ManagerArray = new Array();
                    result.forEach((employee) => {ManagerArray.push(employee.first_name + " " + employee.last_name)});
                    connection.query(RoleQueryAll, function(err, res) {
                        if (err) throw err;
                        let RoleArray = new Array();
                        res.forEach((role) => {RoleArray.push(role.title)});
                        inquirer.prompt([
                            {
                                type: "list",
                                message: "Please select a role for the employee:",
                                name: "role",
                                choices: RoleArray
                            },
                            {
                                type: "list",
                                message: "Please select a manager for the employee:",
                                name: "manager",
                                choices: ManagerArray
                            }
                        ]).then(function(Newresponse) {
                            let role_id = res[RoleArray.indexOf(Newresponse.role)].id;
                            let manager_id = result[ManagerArray.indexOf(Newresponse.manager)].id;
                            connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) 
                            VALUES ('${first_name}', '${last_name}', ${role_id}, ${manager_id});`, 
                            function(errormsg, resultmsg) {
                                if (errormsg) throw errormsg;
                                console.log(`Your new employee ${first_name} ${last_name} has been created!`);
                                let NewEmployee = EmployeeTableQuery + ` AND employee.id=${resultmsg.insertId};`;
                                QueryTable(NewEmployee);
                            });
                        });
                    });
                });
            }
        });
    });
}

// Creates a new department and adds it to the database
const AddDepartment = () => {
    console.log("Add a Department");
    inquirer.prompt([
        {
            type: "input",
            message: "Please enter the name of the department you would like to add:",
            name: "DepartmentName"
        }
    ]).then(function(response) {
        let DepartmentName = response.DepartmentName;
        connection.query(DepartmetnQueryAll, function(err, res) {
            if (err) throw err;
            let DepartmentArray = new Array();
            res.forEach((department) => {DepartmentArray.push(department.name)});
            let Department = DepartmentArray.indexOf(DepartmentName);
            if (Department !== -1) {
                const table = cTable.getTable(res[Department]);
                console.log(table);
                inquirer.prompt([
                    {
                        type: "list",
                        message: "Error: It looks like the department '" + DepartmentName + 
                        "' already exists. This cannot duplicate. Please try again with a unique name.",
                        name: "duplicate",
                        choices: [
                            "OK",
                            "Cancel"
                        ]
                    }
                ]).then(function(newResponse) {
                    if (newResponse.duplicate === "OK") {
                        AddDepartment();
                    } else if (newResponse.duplicate === "Cancel") {
                        Next();
                    }
                });
            } else {
                connection.query(`INSERT INTO department (name) VALUES ('${DepartmentName}')`, function(error, result) {
                    if (error) throw error;
                    console.log(`Your new department ${DepartmentName} has been created!`);
                    let NewDepartment = DepartmetnQueryAll + ` WHERE department.id=${result.insertId};`;
                    QueryTable(NewDepartment);
                });
            }
        });
    });
}

// Creates a new role and adds it to the database
const AddRole = () => {
    console.log("Add a Role");
    inquirer.prompt([
        {
            type: "input",
            message: "Please enter the name of your new role:",
            name: "RoleName"
        }
    ]).then(function(response) {
        let RoleName = response.RoleName;
        connection.query(RoleQueryAll, function(err, res) {
            if (err) throw err;
            let RoleArray = new Array();
            res.forEach((role) => {RoleArray.push(role.title)});
            let Role = RoleArray.indexOf(RoleName);
            if (Role !== -1) {
                const table = cTable.getTable(res[Role]);
                console.log(table);
                inquirer.prompt([
                    {
                        type: "list",
                        message: "Error: It looks like the role '" + RoleName + 
                        "' already exists. This cannot duplicate. Please try again with a unique name.",
                        name: "duplicate",
                        choices: [
                            "OK",
                            "Cancel"
                        ]
                    }
                ]).then(function(newResponse) {
                    if (newResponse.duplicate === "OK") {
                        AddRole();
                    } else if (newResponse.duplicate === "Cancel") {
                        Next();
                    }
                });
            } else {
                const EnterSalary = () => {
                    inquirer.prompt([
                        {
                            type: "number",
                            message: "Please enter a salary amount for this new role:",
                            name: "salary"
                        }
                    ]).then(function(salaryResponse) {
                        let salary = salaryResponse.salary;
                        if (salary === NaN) {
                            inquirer.prompt([
                                {
                                    type: "list",
                                    message: "It looks like '" + salary + 
                                    "' is not an integer. The salary value must be an integer. Please try again.",
                                    name: "duplicate",
                                    choices: [
                                        "OK",
                                        "Cancel"
                                    ]
                                }
                            ]).then(function(newResponse) {
                                if (newResponse.duplicate === "OK") {
                                    EnterSalary();
                                } else if (newResponse.duplicate === "Cancel") {
                                    Next();
                                }
                            });
                        } else {
                            connection.query(DepartmetnQueryAll, function(error, result) {
                                if (error) throw error;
                                let DepartmentArray = new Array();
                                result.forEach((department) => {DepartmentArray.push(department.name)});
                                inquirer.prompt([
                                    {
                                        type: "list",
                                        message: "Please assign a department for this role:",
                                        name: "department",
                                        choices: DepartmentArray
                                    }
                                ]).then(function(departmentResponse) {
                                    let department = departmentResponse.department;
                                    let department_id = result[DepartmentArray.indexOf(department)].id;
                                    connection.query(`INSERT INTO employee_role (title, salary, department_id)
                                    VALUES ('${RoleName}', ${salary}, ${department_id});`, function(errormsg, resultmsg) {
                                        if (errormsg) throw errormsg;
                                        console.log(`Your new role ${RoleName} has been created!`);
                                        let NewRole = RoleTableQuery + ` AND employee_role.id=${resultmsg.insertId};`;
                                        QueryTable(NewRole);
                                    });
                                });
                            });
                        }
                    });
                }
                EnterSalary();
            }
        });
    });
}

const UpdateEmployee = () => {
    console.log("Update an Employee");
    connection.query(EmployeeQueryAll, function(err, res) {
        if (err) throw err;
        let EmployeeArray = new Array();
        res.forEach((employee) => {EmployeeArray.push(employee.first_name + " " + employee.last_name)});
        inquirer.prompt({
            type: "list",
            message: "Please Select an Employee to Update",
            name: "employee",
            choices: EmployeeArray
        }).then(function(response) {
            let employee = response.employee;
            let index = EmployeeArray.indexOf(employee);
            let employe_id = res[index].id;

            // Update function that passes in an employee's ID.
            const Update = (employe_id) => {
                inquirer.prompt(
                    {
                        type: "list",
                        message: "Please Select an Option to Update the Employee '" + employee + "' on",
                        name: "UpdateEmployee",
                        choices: [
                            "First Name",
                            "Last Name",
                            "Role/Title",
                            "Manager"
                        ]
                    }
                ).then(function(UpdateResponse) {
                    let update = UpdateResponse.UpdateEmployee;
                    let Change;
                    let ColumnUpdate;

                    // Query Update function that tkaes in the requested changes and submits them to the database.
                    const QueryUpdate = (ColumnUpdate, Change) => {
                        connection.query(`UPDATE employee SET employee.${ColumnUpdate}=` + Change + 
                        ` WHERE employee.id=${employe_id};`, function(error) {
                            if (error) throw error;
                            console.log("Employee has been updated!");
                            QueryTable(EmployeeTableQuery + ` AND employee.id=` + employe_id);
                        });
                    }

                    // If statments that determines what the user is going to update and then passes it through the QueryUpdate() function.
                    if (update === "First Name" || update === "Last Name") {
                        inquirer.prompt(
                            {
                                type: "input",
                                message: "Please Enter the Employee's New " + update + ":",
                                name: "name"
                            }
                        ).then(function(nameResponse) {
                            Change = `'${nameResponse.name}'`;
                            if (update === "First Name") {
                                ColumnUpdate = `first_name`;
                                QueryUpdate(ColumnUpdate, Change);
                            } else if (update === "Last Name") {
                                ColumnUpdate = `last_name`;
                                QueryUpdate(ColumnUpdate, Change);
                            }
                        });
                    } else if (update === "Role/Title") {
                        ColumnUpdate = `role_id`
                        connection.query(RoleQueryAll, function(errRole, resRole) {
                            let RoleArray = new Array();
                            resRole.forEach((role) => {RoleArray.push(role.title)});
                            if (errRole) throw errRole;
                            inquirer.prompt({
                                type: "list",
                                message: "Please Select a New Role:",
                                name: "role",
                                choices: RoleArray
                            }).then(function(roleResponse) {
                                let NewRole = roleResponse.role;
                                Change = resRole[RoleArray.indexOf(NewRole)].id
                                QueryUpdate(ColumnUpdate, Change);
                            })
                        });
                    } else if (update === "Manager") {
                        ColumnUpdate = `manager_id`;
                        inquirer.prompt({
                            type: "list",
                            message: "Please Select a New Role:",
                            name: "manager",
                            choices: EmployeeArray
                        }).then(function(managerResponse) {
                            Change = res[EmployeeArray.indexOf(managerResponse.manager)].id
                            QueryUpdate(ColumnUpdate, Change);
                        });
                    }
                });
            }
            Update(employe_id);
        });
    });
}

const UpdateDepartment = () => {
    console.log("Update a Department");
}

const UpdateRole = () => {
    console.log("Update a Role");
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