const express = require('express');
const path = require('path');
const database = require('./public/database.json')
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    res.send(JSON.stringify(database, null, 2))
})
app.get('/add/:key/:val?', (req, res) => {
    writeToDatabaseAsync(req.params.key, parseInt(req.params.val) || 0)
    res.send('updated')
})
app.post('/update', (req, res) => {
    let { theName, theScore } = req.body;
    theScore = parseInt(theScore, 10);
    writeToDatabaseAsync(theName, theScore)
    console.log(req.body)
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

function writeToDatabaseAsync(key, val, file = './public/database.json') {
    console.log('key', key)
    console.log('val', val)
    database[key] = val;
    const dataFormatted = JSON.stringify(database, null, 2)
    fs.writeFile(file, dataFormatted, finished);
}

function finished(err) {
    console.log('write finished')
}

app.use(express.static(path.join(__dirname, 'public')))
app.listen(PORT, () => console.log(`server has started on port ${PORT}`));