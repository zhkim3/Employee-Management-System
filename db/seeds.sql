USE emptrack_db;

INSERT INTO department (name)
VALUES
    ('Sales'),
    ('Software'),
    ('Finance'),
    ('Legal');

INSERT INTO role (title, salary, department_id)
VALUES
    ('Sales Mgr', 100000, 1),
    ('Sales Rep', 80000, 1),
    ('Legal Project Manager', 250000, 4),
    ('Lawyer', 190000, 4),
    ('Junior Software Dev', 120000, 2),
    ('Senior Software Dev', 150000, 2),
    ('Account Manager', 160000, 3),
    ('Payroll', 125000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
    ('Cristiano', 'Ronaldo', 7, 2),
    ('Lionel', 'Messi', 1, 5),
    ('Kylian', 'Mbappé', 4, 3),
    ('Robert', 'Lewandowski', 3, 6),
    ('Mohamed', 'Salah', 2, 1),
    ('Kevin', 'De Bruyne', 6, 5),
    ('Erling', 'Haaland', 8, 7),
    ('Heung-min', 'Son', 5, 4);