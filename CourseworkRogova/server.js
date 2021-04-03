const express = require('express');
const path = require('path');
//const request = require('request');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const _ = require("lodash");

const app = express();

process.env['PATH'] = path.join(__dirname, 'client/') + ';' + process.env['PATH'];

// We avoid port 3000 which is by default used by create-react-app
const port = 5000;

app.use(express.json());

app.listen(port, () => console.log(`Server started on port ${port}`));
//console.log(process.env.PORT);

// export NLS_LANG=.AL32UTF8
// export NLS_DATE_FORMAT='YYYY-MM-DD'

function doRelease(connection) {
    connection.close(
        function (err) {
            if (err)
                console.error(err.message);
        }
    );
}

app.get('/api/projects', (req, res) => {
    oracledb.getConnection(
        {
            user: "C##KSENIA",
            password: "123",
            connectString: "localhost:49161/xe"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            connection.execute(
                `SELECT 
                    PROJECTS.ID as ID,
                    PROJECTS.NAME as NAME,
                    PROJECTS.COST as COST,
                    DEPARTMENTS.NAME as DEPARTMENT_ID,
                    PROJECTS.DATE_BEG as DATE_BEG, 
                    PROJECTS.DATE_END as DATE_END, 
                    PROJECTS.DATE_END_REAL AS DATE_END_REAL
                 FROM PROJECTS
                    LEFT JOIN DEPARTMENTS ON DEPARTMENTS.ID = PROJECTS.DEPARTMENT_ID`,
                [],
                {
                    outFormat: oracledb.OBJECT
                }, 
                function (err, result) {
                    if (err) {
                        doRelease(connection);
                        return;
                    }
                    res.json(result.rows);
                    doRelease(connection);
                });
        });
});

app.get('/api/project/cursor', (req, res) => {
    oracledb.getConnection(
        {
            user: "C##KSENIA",
            password: "123",
            connectString: "localhost:49161/xe"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            connection.execute(
                `BEGIN
                    GET_PROFIT(:cursor);
                END;`,
                {
                    cursor: {
                      type: oracledb.CURSOR,
                      dir: oracledb.BIND_OUT
                    }
                }, 
                function (err, result) {
                    if (err) {
                        console.log(err);
                        doRelease(connection);
                        return;
                    }
                    const cursor = result.outBinds.cursor;
                    const rows = cursor.getRows();
                    res.json(rows);
                    doRelease(connection);
                });
        });
}); 

app.get('/api/departments', (req, res) => {
    oracledb.getConnection(
        {
            user: "C##KSENIA",
            password: "123",
            connectString: "localhost:49161/xe"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            connection.execute(
                `SELECT * FROM DEPARTMENTS`,
                [],
                {
                    outFormat: oracledb.OBJECT
                }, 
                function (err, result) {
                    if (err) {
                        doRelease(connection);
                        return;
                    }
                    res.json(result.rows);
                    doRelease(connection);
                });
        });
});

app.post('/api/login', (req, res) => {
    oracledb.getConnection(
        {
            user: "C##KSENIA",
            password: "123",
            connectString: "localhost:49161/xe"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            connection.execute(
                `SELECT COUNT(*) AS result FROM USERS WHERE LOGIN = :login AND PASSWORD = :password`,
                [req.body.login,req.body.password],
                {
                    outFormat: oracledb.OBJECT
                },
                function (err, result) {
                    if (err) {
                        console.log(err)
                        doRelease(connection);
                        return;
                    }
                    console.log(result.rows)
                    res.json(result.rows);
                    doRelease(connection);
                });
        });
});

app.post('/api/projects/create', (req, res) => {
    oracledb.getConnection(
        {
            user: "C##KSENIA",
            password: "123",
            connectString: "localhost:49161/xe"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            const params = {
                name: req.body.name,
                cost: parseInt(req.body.cost),
                department: parseInt(req.body.department),
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                realEndDate: req.body.realEndDate
            }
            connection.execute(
                "INSERT INTO PROJECTS (NAME, COST, DEPARTMENT_ID, DATE_BEG, DATE_END, DATE_END_REAL) VALUES (:name, :cost, :department, :startDate, :endDate, :realEndDate)",
                params,
                {
                    autoCommit: true,
                    bindDefs: [
                        { type: oracledb.VARCHAR2 },
                        { type: oracledb.NUMBER },
                        { type: oracledb.NUMBER },
                        { type: oracledb.DATE },
                        { type: oracledb.DATE },
                        { type: oracledb.DATE },
                    ]
                }, 
                function (err, result) {
                    if (err) {
                        console.log(params);
                        console.log(err);
                        res.status(500).send({statusText: err});
                        doRelease(connection);
                        return;
                    }
                    res.status(200);
                    res.json(result.rowsAffected);
                    doRelease(connection);
                });
        });
});

app.post('/api/projects/:id/modify', (req, res) => {
    oracledb.getConnection(
        {
            user: "C##KSENIA",
            password: "123",
            connectString: "localhost:49161/xe"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            const params = {
                name: req.body.name,
                cost: parseInt(req.body.cost),
                department: parseInt(req.body.department),
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                realEndDate: req.body.realEndDate,
                id: parseInt(req.body.id)
            }
            connection.execute(
                "UPDATE PROJECTS SET NAME = :name, COST = :cost, DEPARTMENT_ID = :department, DATE_BEG = :startDate, DATE_END = :endDate, DATE_END_REAL = :realEndDate where ID = :id",
                params,
                {
                    autoCommit: true
                }, 
                function (err, result) {
                    if (err) {
                        console.log(params);
                        console.log(err);
                        res.status(500).send(`${err}`);
                        doRelease(connection);
                        return;
                    }
                    console.log(params);
                    console.log(result.rowsAffected);
                    res.status(200);
                    res.json(result.rowsAffected);
                    doRelease(connection);
                });
        });
});

app.delete('/api/projects/:id/delete', (req, res) => {
    oracledb.getConnection(
        {
            user: "C##KSENIA",
            password: "123",
            connectString: "localhost:49161/xe"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            const params = {
                id: parseInt(req.body.id)
            }
            connection.execute(
                "DELETE FROM PROJECTS WHERE PROJECTS.ID = :id",
                params,
                {
                    autoCommit: true
                }, 
                function (err, result) {
                    if (err) {
                        res.status(500).send(`${err}`);
                        doRelease(connection);
                        return;
                    }
                    console.log(result.rowsAffected);
                    res.status(200);
                    res.json(result.rowsAffected);
                    doRelease(connection);
                });
        });
});

app.get('/api/employees', (req, res) => {
    oracledb.getConnection(
        {
            user: "C##KSENIA",
            password: "123",
            connectString: "localhost:49161/xe"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            connection.execute(
                `SELECT * FROM EMPLOYEES`,
                [],
                {
                    outFormat: oracledb.OBJECT
                }, 
                function (err, result) {
                    if (err) {
                        doRelease(connection);
                        return;
                    }
                    res.json(result.rows);
                    doRelease(connection);
                });
        });
});

app.post('/api/employees/create', (req, res) => {
    oracledb.getConnection(
        {
            user: "C##KSENIA",
            password: "123",
            connectString: "localhost:49161/xe"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            const params = {
                firstName: req.body.firstName,
                patherName: req.body.patherName,
                lastName: req.body.lastName,
                position: req.body.position,
                salary: parseInt(req.body.salary)
            }
            connection.execute(
                "INSERT INTO EMPLOYEES (FIRST_NAME, PATHER_NAME, LAST_NAME, POSITION, SALARY) VALUES (:firstName, :patherName, :lastName, :position, :salary)",
                params,
                {
                    autoCommit: true,
                    bindDefs: [
                        { type: oracledb.VARCHAR2 },
                        { type: oracledb.VARCHAR2 },
                        { type: oracledb.VARCHAR2 },
                        { type: oracledb.VARCHAR2 },
                        { type: oracledb.NUMBER },
                    ]
                }, 
                function (err, result) {
                    if (err) {
                        console.log(err);
                        res.status(500).send({statusText: err});
                        doRelease(connection);
                        return;
                    }
                    res.status(200);
                    res.json(result.rowsAffected);
                    doRelease(connection);
                });
        });
});

app.post('/api/employees/:id/modify', (req, res) => {
    oracledb.getConnection(
        {
            user: "C##KSENIA",
            password: "123",
            connectString: "localhost:49161/xe"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            const params = {
                firstName: req.body.firstName,
                patherName: req.body.patherName,
                lastName: req.body.lastName,
                position: req.body.position,
                salary: parseInt(req.body.salary),
                id: parseInt(req.body.id)
            }
            connection.execute(
                "UPDATE EMPLOYEES SET FIRST_NAME = :firstName, PATHER_NAME = :patherName, LAST_NAME = :lastName, POSITION = :position, SALARY = :salary where ID = :id",
                params,
                {
                    autoCommit: true
                }, 
                function (err, result) {
                    if (err) {
                        console.log(params);
                        console.log(err);
                        res.status(500).send(`${err}`);
                        doRelease(connection);
                        return;
                    }
                    console.log(params);
                    console.log(result.rowsAffected);
                    res.status(200);
                    res.json(result.rowsAffected);
                    doRelease(connection);
                });
        });
});

app.delete('/api/employees/:id/delete', (req, res) => {
    oracledb.getConnection(
        {
            user: "C##KSENIA",
            password: "123",
            connectString: "localhost:49161/xe"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            const params = {
                id: parseInt(req.body.id)
            }
            connection.execute(
                `BEGIN
                    DELETE FROM DEPARTMENTS_EMPLOYEES WHERE EMPLOYEE_ID = :id;
                    DELETE FROM EMPLOYEES WHERE EMPLOYEES.ID = :id;
                 END;`,
                params,
                {
                    autoCommit: true
                }, 
                function (err, result) {
                    if (err) {
                        console.log(err)
                        res.status(500).send(`${err}`);
                        doRelease(connection);
                        return;
                    }
                    console.log(result.rowsAffected);
                    res.status(200);
                    res.json(result.rowsAffected);
                    doRelease(connection);
                });
        });
});

app.get('/api/departments_employees', (req, res) => {
    oracledb.getConnection(
        {
            user: "C##KSENIA",
            password: "123",
            connectString: "localhost:49161/xe"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            connection.execute(
                `SELECT * FROM DEPARTMENTS_EMPLOYEES`,
                [],
                {
                    outFormat: oracledb.OBJECT
                }, 
                function (err, result) {
                    if (err) {
                        doRelease(connection);
                        return;
                    }
                    res.json(result.rows);
                    doRelease(connection);
                });
        });
});

app.post('/api/departments/create', (req, res) => {
    oracledb.getConnection(
        {
            user: "C##KSENIA",
            password: "123",
            connectString: "localhost:49161/xe"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            const params = {
                name: req.body.name
            }
            connection.execute(
                "INSERT INTO DEPARTMENTS (NAME) VALUES (:name)",
                params,
                {
                    autoCommit: true,
                    bindDefs: [
                        { type: oracledb.VARCHAR2 }
                    ]
                }, 
                function (err, result) {
                    if (err) {
                        console.log(err);
                        res.status(500).send({statusText: err});
                        doRelease(connection);
                        return;
                    }
                    res.status(200);
                    res.json(result.rowsAffected);
                    doRelease(connection);
                });
        });
});

app.post('/api/departments/:id/modify', (req, res) => {
    oracledb.getConnection(
        {
            user: "C##KSENIA",
            password: "123",
            connectString: "localhost:49161/xe"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            const params = {
                name: req.body.name,
                departmentID: parseInt(req.body.departmentID)
            }
            connection.execute(
                `UPDATE DEPARTMENTS SET NAME = :name where ID = :departmentID`,
                params,
                {
                    autoCommit: true
                }, 
                function (err, result) {
                    if (err) {
                        console.log(err)
                        res.status(500).send(`${err}`);
                        doRelease(connection);
                        return;
                    }
                    console.log(params);
                    console.log(result.rowsAffected);
                    res.status(200);
                    res.json(result.rowsAffected);
                    doRelease(connection);
                });
        });
});

app.post('/api/departments_employees/modify', (req, res) => {
    oracledb.getConnection(
        {
            user: "C##KSENIA",
            password: "123",
            connectString: "localhost:49161/xe"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            const params = {
                departmentID: parseInt(req.body.departmentID),
                employeeID: parseInt(req.body.employeeID)
            }
            connection.execute(
                `INSERT INTO DEPARTMENTS_EMPLOYEES (DEPARTMENT_ID, EMPLOYEE_ID) VALUES (:departmentID, :employeeID)`,
                params,
                {
                    autoCommit: true
                }, 
                function (err, result) {
                    if (err) {
                        console.log(err)
                        res.status(500).send({error: `${err}`});
                        doRelease(connection);
                        return;
                    }
                    console.log(params);
                    console.log(result.rowsAffected);
                    res.status(200);
                    res.json(result.rowsAffected);
                    doRelease(connection);
                });
        });
});

app.delete('/api/departments/:id/delete', (req, res) => {
    oracledb.getConnection(
        {
            user: "C##KSENIA",
            password: "123",
            connectString: "localhost:49161/xe"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            const params = {
                id: parseInt(req.body.id)
            }
            connection.execute(
                `BEGIN
                    DELETE FROM DEPARTMENTS_EMPLOYEES WHERE DEPARTMENT_ID = :id;
                    DELETE FROM DEPARTMENTS WHERE DEPARTMENTS.ID = :id;
                 END;`,
                params,
                {
                    autoCommit: true
                }, 
                function (err, result) {
                    if (err) {
                        console.log(err)
                        res.status(500).send(`${err}`);
                        doRelease(connection);
                        return;
                    }
                    console.log(result.rowsAffected);
                    res.status(200);
                    res.json(result.rowsAffected);
                    doRelease(connection);
                });
        });
});

app.delete('/api/departments_employees/delete', (req, res) => {
    oracledb.getConnection(
        {
            user: "C##KSENIA",
            password: "123",
            connectString: "localhost:49161/xe"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            const params = {
                departmentID: parseInt(req.body.departmentID),
                employeeID: parseInt(req.body.employeeID)
            }
            connection.execute(
                `DELETE FROM DEPARTMENTS_EMPLOYEES WHERE DEPARTMENT_ID = :departmentID AND EMPLOYEE_ID = :employeeID`,
                params,
                {
                    autoCommit: true
                }, 
                function (err, result) {
                    if (err) {
                        console.log(err)
                        res.status(500).send(`${err}`);
                        doRelease(connection);
                        return;
                    }
                    console.log(result.rowsAffected);
                    res.status(200);
                    res.json(result.rowsAffected);
                    doRelease(connection);
                });
        });
});


app.get('/api/projects/cursor', (req, res) => {
    oracledb.getConnection(
        {
            user: "C##KSENIA",
            password: "123",
            connectString: "localhost:49161/xe"
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }
            connection.execute(
                `SELECT 
                    PROJECTS.ID, 
                    MAX(PROJECTS.NAME) AS NAME, 
                    ROUND(MAX(PROJECTS.COST) - NVL(SUM(EMPLOYEES.SALARY * MONTHS_BETWEEN(PROJECTS.DATE_END, PROJECTS.DATE_BEG)), 0), 2) AS PROFIT
                FROM PROJECTS
                    LEFT JOIN DEPARTMENTS  ON (DEPARTMENTS.ID = PROJECTS.DEPARTMENT_ID)
                    LEFT JOIN DEPARTMENTS_EMPLOYEES ON (DEPARTMENTS_EMPLOYEES.DEPARTMENT_ID = DEPARTMENTS.ID)
                    LEFT JOIN EMPLOYEES ON (EMPLOYEES.ID = DEPARTMENTS_EMPLOYEES.EMPLOYEE_ID)
                    WHERE PROJECTS.DATE_END_REAL IS NULL
                    GROUP BY PROJECTS.ID
                `,
                [],
                {
                    outFormat: oracledb.OBJECT
                }, 
                function (err, result) {
                    if (err) {
                        console.log(err);
                        doRelease(connection);
                        return;
                    }
                    res.json(result.rows);
                    doRelease(connection);
                });
        });
});

// const executePLSQL = (statement, params = []) => {
//     return new Promise((resolve, reject) => {
//         oracledb.getConnection(
//             {
//                 user: 'C##KSENIA',
//                 password: '123',
//                 connectString: 'localhost/xe' // TODO
//             }
//         ).then(connection => {
//             return connection.execute(
//                 statement, params
//             ).then(result => {
//                 resolve(result);
//                 return connection.release();
//             }).catch(err => {
//                 reject(err);
//                 return connection.release();
//             })
//         }).catch(err => reject(err));
//     });
// }

function formatDate(date) {
    const [year, month, day] = _.split(date, '-');
    return `${day}.${month}.${year}`;
}
