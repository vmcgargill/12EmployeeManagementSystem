const tableDiv = $('#table');

const GetAllRoles = () => {
    return $.ajax({
      url: "/api/role",
      method: "GET",
    });
};

const DisplayRoles = (roles) => {
    let RoleList = new Array();

    RoleList.push(`
        <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Salary</th>
            <th>Department</th>
        </tr>`
    )

    const CreateList = (id, title, salary, department) => {
      const item = `
        <tr value='${id}'>
            <td>${id}</td>
            <td>${title}</td>
            <td>${salary}</td>
            <td>${department}</td>
        </tr>`
      return item;
    };

    roles.forEach((role) => {
      const roleItem = CreateList(role.id, role.title, USDformatter.format(role.salary), role.department_name);
      RoleList.push(roleItem);
    });

    let table = $('<table>');
    table.append(RoleList);
    tableDiv.append(table);
};

const USDformatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

const GetRoles = () => {
    return GetAllRoles().then(DisplayRoles);
};

GetRoles()