const path = require('path');
const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const tarefas =[];

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

app.delete("/api/tarefas/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = tarefas.findIndex(tarefa => tarefa.id === id);
    
    if (index === -1) {
        return res.status(404).json({
            erro: "Tarefa não encontrada."
        });
    }

    tarefas.splice(index, 1);
    res.status(200).json({
        mensagem: "Tarefa removida com sucesso."
    });
});

app.delete("/api/tarefas", (req, res) => {
    tarefas.length = 0;
    res.status(200).json({
        mensagem: "Todas as tarefas foram removidas com sucesso."
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});