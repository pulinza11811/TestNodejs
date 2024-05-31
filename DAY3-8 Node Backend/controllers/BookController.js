const express = require('express'); // เรียกใช้งานโมดูล express
const book = express.Router();

book.get('/list', (req, res) => {
    try {
        res.send('hello book list');
    } catch (e) {
        res.status(500).send({ error: e.message })
    }
})

module.exports = book;