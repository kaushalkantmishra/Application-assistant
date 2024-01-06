// models.js
const mysql = require("mysql2");
const config = require("./config"); // Adjust the path accordingly
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
});

const promisePool = pool.promise();

const addCompany = async (companyData) => {
  const { id, company_name, expected_date } = companyData;
  const query = `
    INSERT INTO company (id, company_name, expected_date)
    VALUES (?, ?, ?)
  `;
  const values = [id, company_name, expected_date];

  try {
    await promisePool.query(query, values);
  } catch (error) {
    throw error;
  }
};

const getAllCompanies = async () => {
  const query = `SELECT * FROM company`;

  try {
    const [rows] = await promisePool.query(query);
    return rows;
  } catch (error) {
    throw error;
  }
};

const addUser = async (userData) => {
  const { id, company_name, role, applied_date, email, status } = userData;
  const query = `
    INSERT INTO user (id, company_name, role, applied_date, email, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [id, company_name, role, applied_date, email, status];

  try {
    await promisePool.query(query, values);

    const [user] = await promisePool.query('SELECT * FROM user WHERE id = ?', [id]);
    console.log("New user added:", user[0]);

    return user[0];
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

const getAllUsers = async () => {
  const query = `SELECT * FROM user`;

  try {
    const [rows] = await promisePool.query(query);
    return rows;
  } catch (error) {
    throw error;
  }
};

module.exports = { addCompany, getAllCompanies, addUser, getAllUsers, promisePool };
