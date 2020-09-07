const TotalUtilizedBudget = $('#TotalUtilizedBudget');

const GetAllEmployees = () => {
    return $.ajax({
      url: "/api/TotalBudget",
      method: "GET",
    });
};

const GetTotalUtilizedBudget = () => {
    GetAllEmployees().then(function(response) {
        var SumUtilizedBudget = 0;
        response.forEach((employee) => SumUtilizedBudget += employee.salary);
        TotalUtilizedBudget.text(`The total utilized budget for the entire company is: ${USDformatter.format(SumUtilizedBudget)}`);
    })
}

const USDformatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
})

GetTotalUtilizedBudget();