import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost', 
    user: 'root', 
    password: 'admin', 
    database: 'online_exam',
    connectionLimit: 10,
});

export { pool };
