//packages
const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");
const art = require("ascii-art");

//setup db
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Tkfkdgo)118',
    database: 'emptrack_db'
},
    console.log("Connected to DB")
);

//this function prompts the user for input from the console
const getUserInput = () => {
    inquirer.prompt(
        [
            {
                type: "list",
                message: "What would you like to do?",
                name: "userInput",
                choices: [
                    "View All Departments",
                    "View All Roles",
                    "View All Employees",
                    "Add A Department",
                    "Add A Role",
                    "Add An Employee",
                    "Update Employee Role",
                    "View Total Utilized Budget By Department",
                    "Quit"
                ]
            }
        ]).then((response) => {
            handleResponse(response.userInput);
        }).catch((error) => {
            console.log(error);
        });
};

//this function handles the prompt for adding a new department
const createNewDepartment = () => {
    inquirer.prompt(
        [
            {
                type: "input",
                message: "Enter the department name",
                name: "name"
            }
        ]
    ).then((response) => {
        addDepartmentToDB(response.name);
    }).catch((error) => {
        console.log(error);
    });
};

//this function handles the prompt for adding a new role
const createNewRole = async () => {
    inquirer.prompt(
        [
            {
                type: "input",
                message: "Enter the title of the role",
                name: "title",
            },
            {
                type: "input",
                message: "Enter the salary for the role",
                name: "salary",
            },
            {
                type: "list",
                message: "Which department does this role belong to?",
                name: "department",
                choices: await getDepartmentNames()
            }
        ]
    ).then((response) => {
        addNewRoleToDB(response.title, response.salary, response.department);
    }).catch((error) => {
        console.log(error);
    });
};

//this function handles the prompt for adding a new employee
const createNewEmployee = async () => {
    inquirer.prompt(
        [
            {
                type: "input",
                message: "Enter the employee's first name",
                name: "firstName",
            },
            {
                type: "input",
                message: "Enter the employee's last name",
                name: "lastName",
            },
            {
                type: "list",
                message: "Enter the employee's role",
                name: "role",
                choices: await getEmployeeRoles()
            },
            {
                type: "list",
                message: "Enter the employee's manager",
                name: "manager",
                choices: await getManagerNames()
            }
        ]
    ).then((response) => {
        addNewEmployeeToDB(response.firstName, response.lastName, response.role, response.manager);
    }).catch((error) => {
        console.log(error);
    });
};

//this function handles the prompt for updating an employee's role
const updateEmployeeRole = async () => {
    inquirer.prompt(
        [
            {
                type: "list",
                message: "Which employee to update?",
                name: "employee",
                choices: await getEmployeeNames()
            },
            {
                type: "list",
                message: "What is the employee's new role?",
                name: "role",
                choices: await getEmployeeRoles()
            }
        ]
    ).then((response) => {
        handleUpdateEmployeeRole(response.employee, response.role);
    }).catch((error) => {
        console.log(error);
    });
};

//shows the combined salaries for a user selected department
const viewBudget = async () => {
    inquirer.prompt(
        [
            {
                type: "list",
                message: "Please select a department to view their total utilized budget",
                name: "department",
                choices: await getDepartmentNames()
            }
        ]
    ).then((response) => {
        showBudget(response.department);
    }).catch((error) => {
        console.log(error);
    });
}
//this function selects what to do based on the users response
const handleResponse = (response) => {
    switch (response) {
        case "View All Departments": showDepartmentNames();
            break;
        case "View All Roles": showRoles();
            break;
        case "View All Employees": showEmployees();
            break;
        case "Add A Department": createNewDepartment();
            break;
        case "Add A Role": createNewRole();
            break;
        case "Add An Employee": createNewEmployee();
            break;
        case "Update Employee Role": updateEmployeeRole();
            break;
        case "View Total Utilized Budget By Department": viewBudget();
            break;
        default:
            db.end();
            process.exit();//goodbye
    }
};

//handles the sql commands to add a new department
const addDepartmentToDB = (name) => {
    db.promise().query(`insert into department (name) values (?)`, name)
        .then((response) => {
            console.info(`${name} department added to the db`);
            getUserInput();
        }).catch(console.log());
};

//uses sql to return all department names from the database in an array
const getDepartmentNames = () => {
    return new Promise(resolve => {
        let names = [];
        db.promise().query(`select * from department`)
            .then((response) => {
                for (let i = 0; i < response[0].length; i++) {
                    names.push(response[0][i].name);
                }
                resolve(names);
            }).catch(console.log());
    });
};

//adds a new role to the role table
const addNewRoleToDB = (title, salary, department) => {
    db.promise().query(`select department.id from department where department.name = ?`, department)
        .then((response) => {
            department = response[0][0].id;
            db.promise().query(`insert into role (title, salary, department_id) values (?, ?, ?)`, [title, salary, department])
                .then((response) => {
                    console.info(`${title} role with ${salary} salary in department ${department} added to the db`);
                    getUserInput();
                }).catch(console.log());
        }).catch(console.log());
};

//adds a new employee to the employee table
const addNewEmployeeToDB = (firstName, lastName, role, manager) => {
    const managerDetails = getName(manager);
    db.promise().query(`select employee.id from employee where employee.first_name=? and employee.last_name=?`, [managerDetails[0], managerDetails[1]])
        .then((responseMan) => {
            db.promise().query(`select role.id from role where role.title=?`, role)
                .then((responseRole) => {
                    let id = 0;
                    let roleID = responseRole[0][0].id;
                    if (manager !== "None") {
                        id = responseMan[0][0].id;
                        db.promise().query(`insert into employee (first_name, last_name, role_id, manager_id) values (?, ?, ?, ?)`, [firstName, lastName, roleID, id])
                            .then((responseEE) => {
                                console.info(`${firstName} ${lastName} RoleID: ${roleID} ManagerID: ${id} added to the db`);
                                getUserInput();
                            }).catch(console.log());
                    }
                    else {
                        db.promise().query(`insert into employee (first_name, last_name, role_id) values (?, ?, ?)`, [firstName, lastName, roleID])
                            .then((responseEE) => {
                                console.info(`${firstName} ${lastName} RoleID: ${roleID} ManagerID: ${manager} added to the db`);
                                getUserInput();
                            }).catch(console.log());
                    }
                }).catch(console.log());
        }).catch(console.log());
};

//returns all roles as an array
const getEmployeeRoles = () => {
    return new Promise(resolve => {
        let roles = [];
        db.promise().query(`select * from role`)
            .then((response) => {
                for (let i = 0; i < response[0].length; i++) {
                    roles.push(response[0][i].title);
                }
                resolve(roles);
            }).catch(console.log);
    });
};

//returns an array of all the managers
const getManagerNames = () => {
    return new Promise(resolve => {
        let names = [];
        names.push("None");
        db.promise().query(`select distinct b.first_name, b.last_name from employee as a, employee as b where a.manager_id = b.id`)
            .then((response) => {
                for (let i = 0; i < response[0].length; i++) {
                    names.push(response[0][i].first_name + " " + response[0][i].last_name);
                }
                resolve(names);
            }).catch(console.log);
    });
};

//returns all employees's names
const getEmployeeNames = () => {
    return new Promise(resolve => {
        db.promise().query("select * from employee")
            .then((response) => {
                let names = [];
                for (let i = 0; i < response[0].length; i++) {
                    names.push(response[0][i].first_name + " " + response[0][i].last_name);
                }
                resolve(names);
            }).catch(console.log());
    });
};

//updates an employee to have a new role
const handleUpdateEmployeeRole = async (employee, role) => {
    let roleID = await getRoleID(role);
    let name = getName(employee);
    db.promise().query(`update employee set role_id=? where employee.first_name=? and employee.last_name=?`, [roleID, name[0], name[1]])
        .then((response) => {
            console.info(`Employee ${employee} updated to role ${role}`);
        }).catch(console.log());
    getUserInput();
};

//helper function to get a role id from role name
const getRoleID = (role) => {
    return new Promise(resolve => {
        db.promise().query(`select role.id from role where role.title=?`, role)
            .then((response) => {
                resolve(response[0][0].id);
            }).catch(console.log());
    });
};

//simply splits a string based on a space
const getName = (employee) => {
    return employee.split(" ");
};

//displays all departments in table
const showDepartmentNames = async () => {
    await db.promise().query(`select * from department`)
        .then((response) => {
            console.table(response[0]);
        }).catch(console.log);
    getUserInput();
};

//displays all roles in table
const showRoles = async () => {
    await db.promise().query(`select r.id, r.title, d.name as department, r.salary from role as r join department as d on r.department_id=d.id order by r.id asc`)
        .then((response) => {
            console.table(response[0]);
        }).catch(console.log);
    getUserInput();
};

//displays all employees in table uses join-ception along with union to get all the data in one sql statement
const showEmployees = async () => {
    let queryInner = `(select e.id, e.first_name, e.last_name, e.role_id, concat(f.first_name, ' ', f.last_name) as manager from employee as e join employee as f on e.manager_id=f.id)`;
    queryInner += `union`;
    queryInner += `(select e.id, e.first_name, e.last_name, e.role_id, concat('none') as manager from employee as e where manager_id is null)`;
    let query = `select a.id, a.first_name, a.last_name, t.title, t.name as department, t.salary, a.manager
    from (` + queryInner + `) as a join (select r.id as id, r.title, d.name, r.salary from role as r join department as d on r.department_id=d.id) as t on a.role_id=t.id`;
    query += ` order by a.id asc`;
    await db.promise().query(query)
        .then((response) => {
            console.table(response[0]);
        }).catch(console.log);
    getUserInput();
};

//shows the budget for a specified department
const showBudget = async (department) => {
    let query = "";
    query += `select role.id, role.salary from role where department_id=(`;
    query += `select department.id from department where department.name="${department}")`;
    await db.promise().query(query)
        .then((response1) => {
            db.promise().query("select * from employee")
                .then((response2) => {
                    let employees = [];
                    for (let i = 0; i < response2[0].length; i++) {
                        for (let x = 0; x < response1[0].length; x++) {
                            if (response1[0][x].id === response2[0][i].role_id) {
                                employees.push(response2[0][i]);
                            }
                        }
                    }
                    let total = 0;
                    for (let i = 0; i < response1[0].length; i++) {
                        for (let x = 0; x < employees.length; x++) {
                            if (employees[x].role_id === response1[0][i].id) {
                                total += parseInt(response1[0][i].salary);
                            }
                        }
                    }
                    let values = [[`Total_Utilized_Budget_for_department_${department}`, total]];
                    console.table(['Title', 'Total'], values);
                    getUserInput();
                }).catch(console.log);
        }).catch(console.log);
};

//logo stuff
art.font("emptrack_db", "doom")
    .then((rendered) => {
        console.info(rendered);
    }).catch((err) => {
        console.log(err);
    })
//initialize app after 3 seconds to show logo
setTimeout(() => { getUserInput() }, 3000);