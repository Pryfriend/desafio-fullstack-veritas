package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

var tarefas = []Tarefa{}
const arquivoDados = "tasks.json"

func loadFromFile() {
	file, err := os.ReadFile(arquivoDados)
	if err != nil {
		// Dados iniciais caso o arquivo não exista
		tarefas = []Tarefa{
			{ID: 1, Titulo: "Configurar Go API", Descricao: "Subir servidor REST na porta 8080", Status: "todo"},
		}
		saveToFile()
		return
	}
	json.Unmarshal(file, &tarefas)
}

func saveToFile() {
	data, _ := json.MarshalIndent(tarefas, "", "  ")
	os.WriteFile(arquivoDados, data, 0644)
}

func main() {
	loadFromFile()

	// Rota correta em inglês /tasks padronizada
	http.HandleFunc("/tasks", taskHandler)
	http.HandleFunc("/tasks/", taskHandler)

	fmt.Println("Servidor Go rodando em :8080")
	http.ListenAndServe(":8080", nil)
}