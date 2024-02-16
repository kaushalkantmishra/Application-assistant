require('dotenv').config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");
const { addCompany, getAllCompanies, addUser, getAllUsers, promisePool } = require("./models");



const config = {
  port: process.env.PORT || 8080,
  database: {
    host: process.env.DB_HOST,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
};

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// first route

app.get("/", (req, res) => {
  res.render("welcome.ejs");
});

// login route

app.get("/login", (req, res) => {
  res.render("login_page.ejs");
});

app.post("/login", async (req, res) => {
  const { name, email } = req.body;


  // Fetch user registration data from the registration table
  try {
    const [user] = await promisePool.query('SELECT * FROM registration WHERE name = ? AND email = ?', [name, email]);

    if (user[0]) {
      // User found, redirect to "/home" or another route
      res.redirect("/home");
    } else {
      // User not found, handle accordingly (e.g., show an error message)
      res.redirect("/login");
    }
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send("Error logging in");
  }
});


app.get("/register", (req, res) => {
  res.render("register_page.ejs");
});

app.post("/register", async (req, res) => {
  const { name, email } = req.body;

  // Insert registration data into the registration table
  try {
    const registrationId = uuidv4();
    await promisePool.query('INSERT INTO registration (id, name, email) VALUES (?, ?, ?)', [registrationId, name, email]);
    res.redirect("/login");
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send("Error registering user");
  }
});

// home page code

app.get("/home", async (req, res) => {
  try {
    const companies = await getAllCompanies();
    res.render("home.ejs", { companies });
  } catch (error) {
    console.error("Error retrieving companies:", error);
    res.status(500).send("Internal Server Error");
  }
});



app.get("/company", async (req, res) => {
  try {
    const companies = await getAllCompanies();
    res.render("company.ejs", { companies });
  } catch (error) {
    console.error("Error retrieving companies:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/company", async (req, res) => {
  const { company_name, expected_date, company_url } = req.body;
  const companyId = uuidv4();

  const companyData = {
    id: companyId,
    company_name,
    expected_date,
    company_url,
  };

  try {
    await addCompany(companyData);
    res.redirect("/company");
  } catch (error) {
    console.error("Error adding company:", error.message);
    res.status(500).send("Error adding company: " + error.message);
  }
});


// applied vacancy route

app.get("/applied_vacancy", (req, res) => {
  res.render("applied_vacancy.ejs");
});

app.post("/applied_vacancy", async (req, res) => {
  const { company_name, role, applied_date, email, status } = req.body;
  const userId = uuidv4();

  const userData = {
    id: userId,
    company_name,
    role,
    applied_date,
    email,
    status,
  };

  try {
    await addUser(userData);
    res.redirect("/user_table");
  } catch (error) {
    console.error("Error adding user:", error.message);
    res.status(500).send("Error adding user: " + error.message);
  }
});

app.get("/user_table/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const [user] = await promisePool.query('SELECT * FROM user WHERE id = ?', [userId]);

    if (user[0]) {
      res.render("user_table.ejs", { user: user[0] });
    } else {
      res.render("user_table.ejs", { user: null });
    }
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).send("Error retrieving user data");
  }
});

app.get("/user_table", async (req, res) => {
  try {
    const users = await getAllUsers();
    res.render("user_table.ejs", { users: users || [] });
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).send("Error retrieving user data");
  }
});

app.delete("/company/:companyId", async (req, res) => {
  const companyId = req.params.companyId;

  try {
    // Delete company from the database
    await promisePool.query('DELETE FROM company WHERE id = ?', [companyId]);
    res.redirect("/company");
  } catch (error) {
    console.error("Error deleting company:", error);
    res.status(500).send("Error deleting company");
  }
});

app.delete("/user_table/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    // Delete user from the database
    await promisePool.query('DELETE FROM user WHERE id = ?', [userId]);
    res.redirect("/user_table");
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Error deleting user");
  }
});

app.get("/company/edit/:companyId", async (req, res) => {
  const companyId = req.params.companyId;

  try {
    const [company] = await promisePool.query('SELECT * FROM company WHERE id = ?', [companyId]);

    if (company[0]) {
      res.render("edit_company.ejs", { company: company[0] });
    } else {
      res.render("edit_company.ejs", { company: null });
    }
  } catch (error) {
    console.error("Error retrieving company data:", error);
    res.status(500).send("Error retrieving company data");
  }
});

// Add this route to handle updating a company
app.put("/company/:companyId", async (req, res) => {
  const companyId = req.params.companyId;
  const { company_name, expected_date } = req.body;

  try {
    // Update company in the database using companyId
    await promisePool.query('UPDATE company SET company_name=?, expected_date=? WHERE id = ?', [company_name, expected_date, companyId]);
    res.redirect("/company");
  } catch (error) {
    console.error("Error updating company data:", error);
    res.status(500).send("Error updating company data");
  }
});

// edit route

app.get("/user_table/edit/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const [user] = await promisePool.query('SELECT * FROM user WHERE id = ?', [userId]);

    if (user[0]) {
      res.render("edit_user.ejs", { user: user[0] });
    } else {
      res.render("edit_user.ejs", { user: null });
    }
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).send("Error retrieving user data");
  }
});

app.put("/user_table/:userId", async (req, res) => {
  const userId = req.params.userId;
  const { company_name, role, applied_date, email, status } = req.body;

  try {
    // Update user in the database using userId
    await promisePool.query('UPDATE user SET company_name=?, role=?, applied_date=?, email=?, status=? WHERE id = ?', [company_name, role, applied_date, email, status, userId]);
    res.redirect("/user_table");
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).send("Error updating user data");
  }
});


app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port}`);
});
