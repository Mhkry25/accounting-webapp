const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const ExcelJS = require('exceljs');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./accounting.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    amount REAL,
    receipt_no TEXT,
    entity TEXT,
    statement_no TEXT,
    date TEXT
  )`);
});

app.get('/api/transactions', (req, res) => {
  db.all('SELECT * FROM transactions', (err, rows) => {
    res.json(rows);
  });
});

app.post('/api/transactions', (req, res) => {
  const { type, amount, receipt_no, entity, statement_no, date } = req.body;
  db.run(
    'INSERT INTO transactions (type, amount, receipt_no, entity, statement_no, date) VALUES (?, ?, ?, ?, ?, ?)',
    [type, amount, receipt_no, entity, statement_no, date],
    function (err) {
      res.json({ id: this.lastID });
    }
  );
});

app.put('/api/transactions/:id', (req, res) => {
  const { type, amount, receipt_no, entity, statement_no, date } = req.body;
  db.run(
    'UPDATE transactions SET type=?, amount=?, receipt_no=?, entity=?, statement_no=?, date=? WHERE id=?',
    [type, amount, receipt_no, entity, statement_no, date, req.params.id],
    function (err) {
      res.json({ changed: this.changes });
    }
  );
});

app.delete('/api/transactions/:id', (req, res) => {
  db.run('DELETE FROM transactions WHERE id=?', req.params.id, function (err) {
    res.json({ deleted: this.changes });
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

