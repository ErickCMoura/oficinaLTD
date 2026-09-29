const path = require('path');
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const tarefas =[ 
    {id: 1, titulo: "Aprender Backend"},
    {id: 2, titulo: "Aprender Frontend"}
];

app.get("/api/tarefas", (req, res) =>{
    res.json(tarefas);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post("/api/tarefas", (req, res) => {
    const titulo = req.body && req.body.titulo;

    if (!titulo || titulo.trim() === "") {
        return res.status(400).json({
            erro: "O titulo da tarefa e obrigatorio."
        });
    }

    const novaTarefa = {
        id: tarefas.length + 1,
        titulo: titulo.trim()
    };

    tarefas.push(novaTarefa);
    res.status(201).json(novaTarefa);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});