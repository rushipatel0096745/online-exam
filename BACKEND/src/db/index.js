import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost', 
    user: 'root', 
    password: 'Root@123', 
    database: 'online_exam',
    connectionLimit: 10,
});

export { pool };
