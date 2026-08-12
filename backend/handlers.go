package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
)

// Banco de dados em memória temporário para o Mini Kanban
var tarefas = []Tarefa{
	{ID: 1, Titulo: "Configurar Go API", Descricao: "Subir servidor REST na porta 8080", Status: "todo"},
}

// GetTarefas lida com GET /tarefas (Retorna todas as tarefas)
func GetTarefas(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(tarefas)
}

// CreateTarefa lida com POST /tarefas (Cria uma nova tarefa)
func CreateTarefa(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	var novaTarefa Tarefa
	if err := json.NewDecoder(r.Body).Decode(&novaTarefa); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	novaTarefa.ID = len(tarefas) + 1
	tarefas = append(tarefas, novaTarefa)

	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(novaTarefa)
}

// UpdateTarefa lida com PUT /tarefas/{id} (Atualiza uma tarefa existente)
func UpdateTarefa(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 3 {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(parts[len(parts)-1])
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	var tarefaAtualizada Tarefa
	if err := json.NewDecoder(r.Body).Decode(&tarefaAtualizada); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	for i, t := range tarefas {
		if t.ID == id {
			tarefaAtualizada.ID = id
			tarefas[i] = tarefaAtualizada
			json.NewEncoder(w).Encode(tarefaAtualizada)
			return
		}
	}

	http.Error(w, "Tarefa não encontrada", http.StatusNotFound)
}

// DeleteTarefa lida com DELETE /tarefas/{id} (Remove uma tarefa)
func DeleteTarefa(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")

	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 3 {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	id, err := strconv.Atoi(parts[len(parts)-1])
	if err != nil {
		http.Error(w, "ID inválido", http.StatusBadRequest)
		return
	}

	for i, t := range tarefas {
		if t.ID == id {
			tarefas = append(tarefas[:i], tarefas[i+1:]...)
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{"mensagem": "Tarefa removida com sucesso"})
			return
		}
	}

	http.Error(w, "Tarefa não encontrada", http.StatusNotFound)
}