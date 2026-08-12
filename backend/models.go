package main

// Tarefa representa a estrutura de uma tarefa no Mini Kanban
type Tarefa struct {
	ID        int    `json:"id"`
	Titulo    string `json:"titulo"`
	Descricao string `json:"descricao"`
	Status    string `json:"status"` // Valores esperados: "todo", "inprogress", "done"
}