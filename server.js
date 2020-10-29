const express = require('express');
const path = require('path');
const database = require('./public/database.json')
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})
app.get('/info/:id', (req, res) => {
    console.log(req.params.id)
    res.sendFile(path.join(__dirname, 'public', 'info.html'))
})
app.get('/info', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'info.html'))
})
app.get('/all', (req, res) => {
    res.send(database)
})
app.get('/add/:key/:val?', (req, res) => {
    database[req.params.key] = parseInt(req.params.val) || 0 ;
    writeToDatabaseAsync(database)
    res.send('updated')
})

function writeToDatabaseAsync(data, file = './public/database.json') {
    const dataFormatted = JSON.stringify(data, null, 2)
    fs.writeFile(file, dataFormatted, finished);
}

function finished(err) {
    console.log('write finished')
}

app.use(express.static(path.join(__dirname, 'public')))
app.listen(PORT, () => console.log(`server has started on port ${PORT}`));