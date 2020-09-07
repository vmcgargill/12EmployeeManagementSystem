const tableDiv = $('#table');

const GetAllDepartments = () => {
    return $.ajax({
      url: "/api/department",
      method: "GET",
    });
};

const GetDepartmentBudget = (id) => {
  return $.ajax({
    url: `/api/UBDepartment/${id}`,
    method: "GET",
  });
};

const DisplayDepartments = (departments) => {
    let DepartmentList = new Array();

    DepartmentList.push(`
        <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Budget</th>
        </tr>`
    )

    const CreateList = (id, name, budget) => {
      const item = `
        <tr value='${id}'>
            <td>${id}</td>
            <td>${name}</td>
            <td>${budget}</td>
        </tr>`
      return item;
    };

    let table = $('<table>');
    table.append(DepartmentList);
    departments.forEach((department) => {
      let budget = 0;
      GetDepartmentBudget(department.id).then(function(resp) {
        resp.forEach((employee) => {budget += employee.salary});
        const departmentItem = CreateList(department.id, department.name, USDformatter.format(budget));
        table.append(departmentItem);
        tableDiv.append(table);
        console.log(budget)
      });
    });
};

const USDformatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});


const GetDepartments = () => {
    return GetAllDepartments().then(DisplayDepartments);
};

GetDepartments()