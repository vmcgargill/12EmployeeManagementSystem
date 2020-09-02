const fs = require("fs");
const inquirer = require("inquirer");
const path = require("path");
const { timeStamp } = require("console");

const Start = () => {
    inquirer.prompt({
        type: "list",
        message: "What would you like to do?",
        name: "start",
        choices: [
            "View a Specific Employee",
            "View All Employees",
            "View All Departments",
            "View All Roles",
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
        let start = response.start;

        if (start === "Exit") Exit(); 
        else if (start === "View a Specific Employee") ViewSpecificEmployee();
        else if (start === "View All Employees") ViewAllEmployees();
        else if (start === "View All Departments") ViewAllDepartments();
        else if (start === "View All Roles") ViewAllRoles();
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
        else if (start === "Delete a Role") DeletRole();
    })
}

console.log("Welcome to the Employee Management System")
Start();

const Exit = () => {
    console.log("Goodbye");
}

const ViewSpecificEmployee = () => {
    console.log("View a Specific Employee");
}

const ViewAllEmployees = () => {
    console.log("View All Employees");
}

const ViewAllDepartments = () => {
    console.log("View All Departments");
}

const ViewAllRoles = () => {
    console.log("View All Roles");
}

const ViewEmployeesByRole = () => {
    console.log("View All Employees by Roles");
}

const ViewEmployeesByDepartment = () => {
    console.log("View All Employees by Department");
}

const ViewEmployeesByManager = () => {
    console.log("View All Employees by Manager");
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

const DeletRole = () => {
    console.log("Delete a Role");
}