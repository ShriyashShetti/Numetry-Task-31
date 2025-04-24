const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const app = express();
const PORT = 8080;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "shriyash27@",
  database: "contact_book",
  multipleStatements: true
});

// Create contact with tags
app.post("/contacts", (req, res) => {
  const { name, phone, email, tags, user_id } = req.body;
  db.query("INSERT INTO contacts (name, phone, email, user_id) VALUES (?, ?, ?, ?)",
    [name, phone, email, user_id],
    (err, result) => {
      if (err) return res.status(500).send(err);
      const contactId = result.insertId;
      const tagValues = tags.map(tag_id => [contactId, tag_id]);
      if (tags.length === 0) return res.send("Created");
      db.query("INSERT INTO contact_tags (contact_id, tag_id) VALUES ?", [tagValues], (err2) => {
        if (err2) return res.status(500).send(err2);
        res.send("Contact Created");
      });
    });
});

// Get all contacts with tags
app.get("/contacts/:user_id", (req, res) => {
  const { user_id } = req.params;
  const sql = `
    SELECT c.id, c.name, c.phone, c.email, JSON_ARRAYAGG(JSON_OBJECT('id', t.id, 'name', t.name)) AS tags
    FROM contacts c
    LEFT JOIN contact_tags ct ON c.id = ct.contact_id
    LEFT JOIN tags t ON ct.tag_id = t.id
    WHERE c.user_id = ?
    GROUP BY c.id
    ORDER BY c.id DESC`;
  db.query(sql, [user_id], (err, result) => {
    if (err) return res.status(500).send(err);
    result.forEach(r => r.tags = JSON.parse(r.tags));
    res.json(result);
  });
});

// Update contact
app.put("/contacts/:id", (req, res) => {
  const { name, phone, email, tags } = req.body;
  const { id } = req.params;
  db.query("UPDATE contacts SET name=?, phone=?, email=? WHERE id=?", [name, phone, email, id],
    (err) => {
      if (err) return res.status(500).send(err);
      db.query("DELETE FROM contact_tags WHERE contact_id=?", [id], (err2) => {
        if (err2) return res.status(500).send(err2);
        if (tags.length === 0) return res.send("Updated");
        const tagValues = tags.map(tag_id => [id, tag_id]);
        db.query("INSERT INTO contact_tags (contact_id, tag_id) VALUES ?", [tagValues], (err3) => {
          if (err3) return res.status(500).send(err3);
          res.send("Contact Updated");
        });
      });
    });
});

// Delete contact
app.delete("/contacts/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM contacts WHERE id=?", [id], (err) => {
    if (err) return res.status(500).send(err);
    db.query("DELETE FROM contact_tags WHERE contact_id=?", [id], () => {});
    res.send("Deleted");
  });
});

// Get all tags
app.get("/tags", (req, res) => {
  db.query("SELECT * FROM tags", (err, result) => {
    if (err) return res.status(500).send(err);
    res.json(result);
  });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
