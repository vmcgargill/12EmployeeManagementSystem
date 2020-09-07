const tableDiv = $('#table');
const SelectFilter = $('#SelectFilter');

const GetAllEmployees = () => {
    return $.ajax({
      url: "/api/employee",
      method: "GET",
    });
};

const GetEmployeesByRole = (id) => {
  return $.ajax({
    url: `/api/EmployeesByRole/${id}`,
    method: "GET",
  });
};

const GetEmployeesByDepartment = (id) => {
  return $.ajax({
    url: `/api/EmployeesByDepartment/${id}`,
    method: "GET",
  });
};

const GetEmployeesManager = (id) => {
  return $.ajax({
    url: `/api/EmployeesByManager/${id}`,
    method: "GET",
  });
};

const GetAllRoles = () => {
    return $.ajax({
      url: "/api/role",
      method: "GET",
    });
};

const GetAllDepartments = () => {
    return $.ajax({
      url: "/api/department",
      method: "GET",
    });
};

const GetAllManagers = () => {
  return $.ajax({
    url: "/api/manager",
    method: "GET",
  });
};

const USDformatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

// Displays all employees in table
const DisplayEmployees = (employees) => {
    tableDiv.empty();
    let EmployeeList = new Array();

    EmployeeList.push(`
        <tr>
            <th>Name</th>
            <th>Title</th>
            <th>Department</th>
            <th>Salary</th>
            <th>Manager Name</th>
        </tr>`
    )

    const CreateList = (id, name, title, department, salary, manager) => {
      const item = `
        <tr value='${id}'>
            <td>${name}</td>
            <td>${title}</td>
            <td>${department}</td>
            <td>${USDformatter.format(salary)}</td>
            <td>${manager}</td>
        </tr>`
      return item;
    };

    employees.forEach((employee) => {
      const employeeItem = CreateList(employee.id, employee.name, employee.title,
        employee.department_name, employee.salary, employee.manager_name);
      EmployeeList.push(employeeItem);
    });

    let table = $('<table>');
    table.append(EmployeeList);
    tableDiv.append(table);
};

// Displays all roles in filter box
const DisplayRoleFilter = (roles) => {
  SelectFilter.attr('class', 'dropdown')
  console.log(roles);
  let RoleList = new Array();

  let title = `
  <a class="btn dropdown-toggle" href="#" role="button" id="FilterByRole" 
      data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Select Role
  </a>`

  RoleList.push(title);

  const CreateTitleList = (id, title) => {
    const item = `<a class="dropdown-item role-item" value='${id}' title='${title}'>${title}</a>`
    return item;
  };

  let menu = $('<div>');
  menu.attr('class', 'dropdown-menu');
  menu.attr('aria-labelledby', 'FilterByRole');
  
  roles.forEach((role) => {
    const roleItem = CreateTitleList(role.id, role.title);
    menu.append(roleItem);
  });

  RoleList.push(menu);
  SelectFilter.append(RoleList);

  $('.role-item').on('click', function() {
    let RoleTitle = $(this).attr('title');
    $('#FilterByRole').text(RoleTitle);
    let RoleId = $(this).attr('value');
    GetEmployeesByRole(RoleId).then(DisplayEmployees);
  });
};

// Displays all departments in filter box
const DisplayDepartmentFilter = (departments) => {
  SelectFilter.attr('class', 'dropdown')
  console.log(departments);
  let DepartmentList = new Array();

  let title = `
  <a class="btn dropdown-toggle" href="#" role="button" id="FilterByDepartment" 
      data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Select Department
  </a>`

  DepartmentList.push(title);

  const CreateTitleList = (id, title) => {
    const item = `<a class="dropdown-item department-item" value='${id}' title='${title}'>${title}</a>`
    return item;
  };

  let menu = $('<div>');
  menu.attr('class', 'dropdown-menu');
  menu.attr('aria-labelledby', 'FilterByDepartment');
  
  departments.forEach((department) => {
    const departmentItem = CreateTitleList(department.id, department.name);
    menu.append(departmentItem);
  });

  DepartmentList.push(menu);
  SelectFilter.append(DepartmentList);

  $('.department-item').on('click', function() {
    let DepartmentTitle = $(this).attr('title');
    $('#FilterByDepartment').text(DepartmentTitle);
    let DepartmentId = $(this).attr('value');
    GetEmployeesByDepartment(DepartmentId).then(DisplayEmployees);
  });
};

const DisplayManagerFilter = (managers) => {
  SelectFilter.attr('class', 'dropdown');
  managers = [...new Map(managers.map(manager => [manager.id, manager])).values()];
  let ManagerList = new Array();

  let title = `
  <a class="btn dropdown-toggle" href="#" role="button" id="FilterByManager" 
      data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Select a Manager
  </a>`

  ManagerList.push(title);

  const CreateTitleList = (id, name) => {
    const item = `<a class="dropdown-item manager-item" value='${id}' title='${name}'>${name}</a>`
    return item;
  };

  let menu = $('<div>');
  menu.attr('class', 'dropdown-menu');
  menu.attr('aria-labelledby', 'FilterByManager');
  
  managers.forEach((manager) => {
    const managerItem = CreateTitleList(manager.id, manager.first_name + " " + manager.last_name);
    menu.append(managerItem);
  });

  ManagerList.push(menu);
  SelectFilter.append(ManagerList);

  $('.manager-item').on('click', function() {
    let ManagerName = $(this).attr('title');
    $('#FilterByManager').text(ManagerName);
    let ManagerId = $(this).attr('value');
    GetEmployeesManager(ManagerId).then(DisplayEmployees);
  });
};

const FilterAllEmployees = () => {
  SelectFilter.empty();
  return GetAllEmployees().then(DisplayEmployees);
};

const FilterEmployeesByRole = () => {
  SelectFilter.empty();
  return GetAllRoles().then(DisplayRoleFilter);
};

const FilterEmployeesByDepartment = () => {
  SelectFilter.empty();
  return GetAllDepartments().then(DisplayDepartmentFilter);
};

const FilterEmployeesByManager = () => {
  SelectFilter.empty();
  return GetAllManagers().then(DisplayManagerFilter);
};

$('#FilterAllEmployees').on('click', function() {
    FilterAllEmployees();
});

$('#FilterEmployeesByRole').on('click', function() {
  FilterEmployeesByRole();
});

$('#FilterEmployeesByDepartment').on('click', function() {
    FilterEmployeesByDepartment();
});

$('#FilterEmployeesByManager').on('click', function() {
    FilterEmployeesByManager();
});

FilterAllEmployees();
  