package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
)

type Task struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	Description string `json:"description"`
	Status      string `json:"status"` // 'todo', 'inprogress', 'done'
}

var (
	tasks    = []Task{}
	mu       sync.Mutex
	filePath = "tasks.json"
)

func saveToFile() {
	data, _ := json.MarshalIndent(tasks, "", "  ")
	ioutil.WriteFile(filePath, data, 0644)
}

func loadFromFile() {
	if _, err := os.Stat(filePath); err == nil {
		data, _ := ioutil.ReadFile(filePath)
		json.Unmarshal(data, &tasks)
	}
}

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" { return }
		next(w, r)
	}
}

func taskHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	// GET /tasks
	if r.Method == http.MethodGet {
		json.NewEncoder(w).Encode(tasks)
		return
	}

	// POST /tasks
	if r.Method == http.MethodPost {
		var t Task
		json.NewDecoder(r.Body).Decode(&t)
		if t.Title == "" {
			http.Error(w, "Título é obrigatório", http.StatusBadRequest)
			return
		}
		t.ID = len(tasks) + 1
		tasks = append(tasks, t)
		saveToFile()
		json.NewEncoder(w).Encode(t)
		return
	}

	// PUT /tasks/{id} e DELETE /tasks/{id}
	if strings.HasPrefix(r.URL.Path, "/tasks/") {
		idStr := strings.TrimPrefix(r.URL.Path, "/tasks/")
		id, _ := strconv.Atoi(idStr)
		
		mu.Lock()
		defer mu.Unlock()

		idx := -1
		for i, t := range tasks { if t.ID == id { idx = i; break } }

		if idx == -1 {
			http.Error(w, "Tarefa não encontrada", http.StatusNotFound)
			return
		}

		if r.Method == http.MethodPut {
			var updated Task
			json.NewDecoder(r.Body).Decode(&updated)
			
			// Validação de status
			validStatus := map[string]bool{"todo": true, "inprogress": true, "done": true}
			if !validStatus[updated.Status] {
				http.Error(w, "Status inválido", http.StatusBadRequest)
				return
			}
			
			updated.ID = id
			tasks[idx] = updated
			saveToFile()
			json.NewEncoder(w).Encode(updated)
		} else if r.Method == http.MethodDelete {
			tasks = append(tasks[:idx], tasks[idx+1:]...)
			saveToFile()
			w.WriteHeader(http.StatusNoContent)
		}
	}
}

func main() {
	loadFromFile()
	http.HandleFunc("/tasks", corsMiddleware(taskHandler))
	http.HandleFunc("/tasks/", corsMiddleware(taskHandler))
	
	fmt.Println("Servidor Go rodando em :8080")
	http.ListenAndServe(":8080", nil)
}