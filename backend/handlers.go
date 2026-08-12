package main

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"
)

// Listar e Criar (/tasks e /tasks/)
func taskHandler(w http.ResponseWriter, r *http.Request) {
	// Configurar CORS
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	path := r.URL.Path

	// GET /tasks
	if r.Method == http.MethodGet && (path == "/tasks" || path == "/tasks/") {
		json.NewEncoder(w).Encode(tarefas)
		return
	}

	// POST /tasks
	if r.Method == http.MethodPost && (path == "/tasks" || path == "/tasks/") {
		var nova Tarefa
		err := json.NewDecoder(r.Body).Decode(&nova)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		nova.ID = len(tarefas) + 1
		if nova.Status == "" {
			nova.Status = "todo"
		}
		tarefas = append(tarefas, nova)
		saveToFile()

		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(nova)
		return
	}

	// Rotas com ID (/tasks/{id})
	if strings.HasPrefix(path, "/tasks/") {
		parts := strings.Split(path, "/")
		if len(parts) < 3 {
			http.NotFound(w, r)
			return
		}

		idStr := parts[2]
		id, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "ID inválido", http.StatusBadRequest)
			return
		}

		idx := -1
		for i, t := range tarefas {
			if t.ID == id {
				idx = i
				break
			}
		}

		if idx == -1 {
			http.NotFound(w, r)
			return
		}

		// PUT /tasks/{id} (Atualizar)
		if r.Method == http.MethodPut {
			var atualizada Tarefa
			err := json.NewDecoder(r.Body).Decode(&atualizada)
			if err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			atualizada.ID = id
			tarefas[idx] = atualizada
			saveToFile()
			json.NewEncoder(w).Encode(atualizada)
			return
		}

		// DELETE /tasks/{id} (Deletar)
		if r.Method == http.MethodDelete {
			tarefas = append(tarefas[:idx], tarefas[idx+1:]...)
			saveToFile()
			w.WriteHeader(http.StatusNoContent)
			return
		}
	}

	http.NotFound(w, r)
}