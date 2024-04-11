import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'; 
import dotenv from 'dotenv';
dotenv.config({ path: './cred.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new pg.Client({
  user: process.env.DB_USER, 
  host: process.env.DB_HOST, 
  database: process.env.DB_DATABASE, 
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const app = express();
const port = 3000;

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// GET home page
app.get("/", async (req, res) => {
  res.sendFile(join(__dirname, 'index.html')); 
});

app.get("/contact.html", async (req, res) => {
  res.sendFile(join(__dirname, 'contact.html')); 
});

app.post("/submit", async (req, res) => {
  const ans_mailid = req.body.mailid;
  const ans_msg = req.body.msg;

  try {
    const result = await db.query('INSERT INTO usermsg (email, message) VALUES ($1, $2) RETURNING id', [ans_mailid, ans_msg]);
    
    const insertedId = result.rows[0].id;

    res.send(`Message with ID ${insertedId} stored successfully.`);
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).send("Internal Server Error");
  }
});



app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
