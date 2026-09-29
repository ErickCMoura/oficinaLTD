const express = require("express");
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const tarefa =[ 
    {id: 1, titulo: "Aprender Backend"},
    {id: 2, titulo: "Aprender Frontend"}
];

app.get("/api/tarefas", (req, res) =>{
    res.json(tarefa);
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost${PORT}`);
});