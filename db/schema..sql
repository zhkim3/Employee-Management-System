DROP DATABASE IF EXISTS `emptrack_db`;

CREATE DATABASE emptrack_db;
USE emptrack_db;

CREATE TABLE role (
    id int primary key auto_increment,
    title varchar(30),
    salary decimal,
    department_id int
);

CREATE TABLE department (
    id int primary key auto_increment,
    name varchar(30)
);


CREATE TABLE employee (
    id int primary key auto_increment,
    first_name varchar(30),
    last_name varchar(30),
    role_id int,
    manager_id int
);