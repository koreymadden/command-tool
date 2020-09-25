const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const courses = [
    {id: 1, name: "Course 1"},
    {id: 2, name: "Course 2"},
    {id: 3, name: "Course 3"}
];


app.get('/', (req, res) => {
    res.send("You are Home!");
});

app.get('/api/courses', (req, res) => {
    res.send(courses);
});

app.get('/api/courses/:id', (req, res) => {
    const course = courses.find(course => {
        return course.id === parseInt(req.params.id);
    })
    if (!course) return res.status(404).send('The course with the given ID was not found.');
    res.send(course);
});

app.post('/api/courses', (req, res) => {
    if(!req.body.name) {
        res.status(400).send('name is required');
        return;
    }

    const course = {
        id: courses.length++,
        name: req.body.name
    };
    courses.push(course);
    res.send(course);
});

app.put('/api/courses/:id', (req, res) => {
    const course = courses.find(course => {
        return course.id === parseInt(req.params.id);
    })
    if (!course) return res.status(404).send('The course with the given ID was not found.');
    
    if (!req.body.name) {
        res.status(400).send('name is required');
        return;
    }

    course.name = req.body.name;
    res.send(course);
});

app.delete('/api/courses/:id', (req, res) => {
    const course = courses.find(course => {
        return course.id === parseInt(req.params.id);
    })
    if (!course) return res.status(404).send('The course with the given ID was not found.');

    let index = courses.indexOf(course);
    courses.splice(index, 1);

    res.send(course);
});

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}.`);
});