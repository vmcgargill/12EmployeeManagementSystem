const inquirer = require("inquirer");
var mysql = require("mysql");
const cTable = require('console.table');

// An SQL table query specifically for displaying an employee's manager name, 
// role title, salary and department name instead of their respective IDs.
const EmployeeTableQuery = `
SELECT employee.id, CONCAT(employee.first_name , ' ' , employee.last_name) AS name, 
employee_role.title title, employee_role.salary, department.name department_name,
CONCAT(manager.first_name , ' ' , manager.last_name) AS manager_name 
FROM employee, employee manager, department, employee_role 
WHERE employee.manager_id=manager.id
AND employee.role_id=employee_role.id
AND employee_role.department_id=department.id`;

// An SQL table query specifically for displaying a role's department name instead of the ID.
const RoleTableQuery = `
SELECT employee_role.id, 
employee_role.title, employee_role.salary, 
department.name department_name
FROM employee_role, department 
WHERE employee_role.department_id=department.id`;

// This Query returns all employees who are in either the manager or executive department.
// This query is no long in use, but I would still like to use it for something.
const ManagerExecutiveQuery = `
SELECT employee.id, employee.first_name, employee.last_name FROM employee, employee_role, department 
WHERE department.name='Management' AND employee_role.id=employee.role_id AND department.id=employee_role.department_id 
OR department.name='Executive' AND employee_role.id=employee.role_id AND department.id=employee_role.department_id`;

// This query returns all employees who have an id that is assigned to another employee's manager ID.
// This query WILL return duplicates if a manager is assigned to more than 1 employee. 
// So to fix this and make the array list a manager only once, we will have to use a map function to remove the duplicates.
// This query is added to prevent future bugs from happening in case a manager switches roles/departments,
// or if the manager is not actually a part of the management/executive department.
// This query enables the feature of making any emplyee into a manager.
const ManagerTableQuery = `
SELECT manager.id, manager.first_name, manager.last_name 
FROM employee manager, employee WHERE employee.manager_id=manager.id;`;

// Queries all information for all departments. Used for general purposes.
const DepartmetnQueryAll = `SELECT * FROM department`;

// Queries all information for all roles. Used for general purposes.
const RoleQueryAll = `SELECT * FROM employee_role`;

// Queries all information for all employees. Used for general purposes.
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
        } else if (TableQuery === "ViewSpecificEmployee") {
            res.forEach((employee) => {ChoicesArray.push(employee.first_name + " " + employee.last_name)});
        } else if (TableQuery === "ViewEmployeesByManager") {
            //  This is a map function that removes duplicate managers from the manager array
            res = [...new Map(res.map(manager => [manager.id, manager])).values()];
            res.forEach((manager) => {ChoicesArray.push(manager.first_name + " " + manager.last_name)});
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
                            choices: EmployeeArray
                        }
                    ]).then(function(Newresponse) {
                        let role_id = res[RoleArray.indexOf(Newresponse.role)].id;
                        let manager_id = empres[EmployeeArray.indexOf(Newresponse.manager)].id;
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

                // Query Update function that takes in the requested changes and submits them to the database.
                const QueryUpdate = (ColumnUpdate, ValueUpdate, employe_id) => {
                    connection.query(`UPDATE employee SET employee.${ColumnUpdate}=` + ValueUpdate + 
                    ` WHERE employee.id=${employe_id};`, function(error) {
                        if (error) throw error;
                        console.log("Employee has been updated!");
                        QueryTable(EmployeeTableQuery + ` AND employee.id=` + employe_id);
                    });
                }

                // Update function that passes in an employee's ID.
                const Update = (employe_id) => {
                    // If statments that determines what the user is going to update and then passes it through the QueryUpdate() function.
                    if (update === "First Name" || update === "Last Name") {
                        inquirer.prompt(
                            {
                                type: "input",
                                message: "Please Enter the Employee's New " + update + ":",
                                name: "name"
                            }
                        ).then(function(nameResponse) {
                            let ValueUpdate = `'${nameResponse.name}'`;
                            let ColumnUpdate;
                            let NewName;
                            if (update === "First Name") {
                                ColumnUpdate = `first_name`;
                                let last_name = res[index].last_name;
                                NewName = nameResponse.name + " " + last_name;
                            } else if (update === "Last Name") {
                                ColumnUpdate = `last_name`;
                                let first_name = res[index].first_name;
                                NewName =  first_name + " " + nameResponse.name;
                            }

                            let CheckNameIndex = EmployeeArray.indexOf(NewName);

                            if (CheckNameIndex !== -1) {
                                inquirer.prompt(
                                    {
                                        type: "list",
                                        message: "Error: It looks like their is already an employee by the name of '" + NewName + 
                                       "'. There cannot be duplicates. Please alter the name and try again.",
                                        name: "duplicate",
                                        choices: [
                                            "OK",
                                            "Cancel"
                                        ]
                                    }
                                ).then(function(duplicateResponse) {
                                    let duplicate = duplicateResponse.duplicate;
                                    if (duplicate === "OK") {
                                        Update(employe_id);
                                    } else if (duplicate === "Cancel") {
                                        Next();
                                    }
                                });
                            } else {
                                QueryUpdate(ColumnUpdate, ValueUpdate, employe_id);
                            }
                        });
                    } else if (update === "Role/Title") {
                        let ColumnUpdate = `role_id`
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
                                let ValueUpdate = resRole[RoleArray.indexOf(NewRole)].id
                                QueryUpdate(ColumnUpdate, ValueUpdate, employe_id);
                            })
                        });
                    // Lets the user update their manager to any employee in the database. 
                    // This is intentional incase the employee's manager is not in the management/executive department.
                    // Or if the emplyee's manager is assigned to themselves like the defult CEO of this company. 
                    } else if (update === "Manager") {
                        let ColumnUpdate = `manager_id`;
                        inquirer.prompt({
                            type: "list",
                            message: "Please Select a New Manager:",
                            name: "manager",
                            choices: EmployeeArray
                        }).then(function(managerResponse) {
                            let ValueUpdate = res[EmployeeArray.indexOf(managerResponse.manager)].id
                            QueryUpdate(ColumnUpdate, ValueUpdate, employe_id);
                        });
                    }
                }
                Update(employe_id);
            });

        });
    });
}

const UpdateDepartment = () => {
    console.log("Update a Department Name");
    connection.query(DepartmetnQueryAll, function(err, res) {
        if (err) throw err;
        let DepartmentArray = new Array();
        res.forEach((department) => {DepartmentArray.push(department.name)});
        inquirer.prompt({
            type: "list",
            message: "Please Select a Department to Update",
            name: "department",
            choices: DepartmentArray
        }).then(function(response) {
            let department = response.department;
            let index = DepartmentArray.indexOf(department);
            let department_id = res[index].id;
            const Update = (department_id) => {
                inquirer.prompt(
                    {
                        type: "input",
                        message: "Please enter a new name for the department",
                        name: "UpdateDepartmentName"
                    }
                ).then(function(UpdateResponse) {
                    let updateName = UpdateResponse.UpdateDepartmentName;
                    let CheckIndex = DepartmentArray.indexOf(updateName);
                    if (CheckIndex !== -1) {
                        inquirer.prompt([
                            {
                                type: "list",
                                message: "Error: It looks like the department '" + updateName + 
                                "' already exists. This cannot duplicate. Please try again with a unique name.",
                                name: "duplicate",
                                choices: [
                                    "OK",
                                    "Cancel"
                                ]
                            }
                        ]).then(function(newResponse) {
                            if (newResponse.duplicate === "OK") {
                                Update(department_id);
                            } else if (newResponse.duplicate === "Cancel") {
                                Next();
                            }
                        });
                    } else {
                        connection.query(`UPDATE department SET department.name='${updateName}' 
                        WHERE department.id=${department_id};`, function(error) {
                            if (error) throw error;
                            console.log("Department has been updated!");
                            QueryTable(`SELECT * FROM department WHERE department.id=` + department_id);
                        });
                    }
                });
            }
            Update(department_id);
        });
    });
}

const UpdateRole = () => {
    console.log("Update a Role");
}

const DeleteEmployee = () => {
    console.log("Delete an Employee");
    connection.query(EmployeeQueryAll, function(err, res) {
        if (err) throw err;
        let EmployeeArray = new Array();
        res.forEach((employee) => {EmployeeArray.push(employee.first_name + " " + employee.last_name)});
        inquirer.prompt({
            type: "list",
            message: "Please Select an Employee to Delete",
            name: "employee",
            choices: EmployeeArray
        }).then(function(response) {
            let employee = response.employee;
            let index = EmployeeArray.indexOf(employee);
            let employe_id = res[index].id;
            connection.query(`SELECT employee.id, CONCAT(employee.first_name , ' ' , employee.last_name) AS name,
            CONCAT(manager.first_name , ' ' , manager.last_name) AS manager_name FROM employee, employee manager
            WHERE employee.manager_id=manager.id AND employee.manager_id=` + employe_id, function(error, result){
                if (error) throw error;
                if (result.length > 0) {
                    const table = cTable.getTable(result)
                    console.log(table);
                    inquirer.prompt(
                        {
                            type: "list",
                            message: "It looks like the employee '" + employee + 
                            "' is a manager for 1 or more person. You will have to reassign " 
                            + "managers for each employee first before deleting.",
                            name: "ReassignManager",
                            choices: [
                                "OK"
                            ]
                        }
                    ).then(function(){
                        Next();
                    })
                } else {
                    inquirer.prompt(
                        {
                            type: "list",
                            message: "Are you sure you want to permanently delete the employee'" +
                            employee + "'? This cannot be undone.",
                            name: "ConfirmDelete",
                            choices: [
                                "Yes, delete employee",
                                "No"
                            ]
                        }
                    ).then(function(confirm) {
                        let ConfirmDelete = confirm.ConfirmDelete;
                        if (ConfirmDelete === "Yes, delete employee") {
                            connection.query(`DELETE FROM employee WHERE employee.id=${employe_id}`, 
                            function(deleteErr) {
                                if (deleteErr) throw deleteErr;
                                console.log(`Employee '${employee}' has been deleted!`);
                                Next();
                            })
                        } else if (ConfirmDelete === "No") {
                            console.log(`Employee '${employee}' has not been deleted!`);
                            Next();
                        }
                    })
                }
            });
        });
    });
}

const DeleteDepartment = () => {
    console.log("Delete a Department");
    connection.query(DepartmetnQueryAll, function(err, res) {
        if (err) throw err;
        let DepartmentArray = new Array();
        res.forEach((department) => {DepartmentArray.push(department.name)});
        inquirer.prompt({
            type: "list",
            message: "Please Select a Department to Delete",
            name: "department",
            choices: DepartmentArray
        }).then(function(response) {
            let department = response.department;
            let index = DepartmentArray.indexOf(department);
            let department_id = res[index].id;
            connection.query(`SELECT employee_role.id, employee_role.title, employee_role.salary, department.name 
            FROM employee_role, department WHERE employee_role.department_id=${department_id} 
            AND department.id=employee_role.department_id`, function(error, result){
                if (error) throw error;
                if (result.length > 0) {
                    const table = cTable.getTable(result)
                    console.log(table);
                    inquirer.prompt(
                        {
                            type: "list",
                            message: "It looks like the department '" + department + 
                            "' is assigned to 1 or more role/title. You will have to reassign these roles " + 
                            "to a different department first before deleting.",
                            name: "ReassignDepartment",
                            choices: [
                                "OK"
                            ]
                        }
                    ).then(function(){
                        Next();
                    })
                } else {
                    inquirer.prompt(
                        {
                            type: "list",
                            message: "Are you sure you want to permanently delete the department'" +
                            department + "'? This cannot be undone.",
                            name: "ConfirmDelete",
                            choices: [
                                "Yes, delete department",
                                "No"
                            ]
                        }
                    ).then(function(confirm) {
                        let ConfirmDelete = confirm.ConfirmDelete;
                        if (ConfirmDelete === "Yes, delete department") {
                            connection.query(`DELETE FROM department WHERE department.id=${department_id}`, 
                            function(deleteErr) {
                                if (deleteErr) throw deleteErr;
                                console.log(`Department '${department}' has been deleted!`);
                                Next();
                            })
                        } else if (ConfirmDelete === "No") {
                            console.log(`Department '${department}' has not been deleted!`);
                            Next();
                        }
                    })
                }
            });
        });
    });
}

const DeleteRole = () => {
    console.log("Delete a Role");
    connection.query(RoleQueryAll, function(err, res) {
        if (err) throw err;
        let RoleArray = new Array();
        res.forEach((role) => {RoleArray.push(role.title)});
        inquirer.prompt({
            type: "list",
            message: "Please Select a Role to Delete",
            name: "role",
            choices: RoleArray
        }).then(function(response) {
            let role = response.role;
            let index = RoleArray.indexOf(role);
            let role_id = res[index].id;
            connection.query(EmployeeTableQuery + ` AND employee.role_id=${role_id};`, function(error, result){
                if (error) throw error;
                if (result.length > 0) {
                    const table = cTable.getTable(result)
                    console.log(table);
                    inquirer.prompt(
                        {
                            type: "list",
                            message: "It looks like the role '" + role + 
                            "' is assigned to 1 or more employee. You will have to reassign these employees " + 
                            "to a different role first before deleting.",
                            name: "ReassignRole",
                            choices: [
                                "OK"
                            ]
                        }
                    ).then(function(){
                        Next();
                    })
                } else {
                    inquirer.prompt(
                        {
                            type: "list",
                            message: "Are you sure you want to permanently delete the role'" +
                            role + "'? This cannot be undone.",
                            name: "ConfirmDelete",
                            choices: [
                                "Yes, delete role",
                                "No"
                            ]
                        }
                    ).then(function(confirm) {
                        let ConfirmDelete = confirm.ConfirmDelete;
                        if (ConfirmDelete === "Yes, delete role") {
                            connection.query(`DELETE FROM employee_role WHERE employee_role.id=${role_id}`, 
                            function(deleteErr) {
                                if (deleteErr) throw deleteErr;
                                console.log(`Role '${role}' has been deleted!`);
                                Next();
                            })
                        } else if (ConfirmDelete === "No") {
                            console.log(`Role '${role}' has not been deleted!`);
                            Next();
                        }
                    })
                }
            });
        });
    });
}

const USDformatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
})