import React, { useState, useEffect } from 'react';
import './App.css';
import { getTasks, createTask, updateTask, deleteTask as apiDeleteTask } from './services/api';
import { TaskForm } from './components/TaskForm';
import { KanbanColumn } from './components/KanbanColumn';

function App() {
  const [tarefas, setTarefas] = useState([]);
  const [erroApi, setErroApi] = useState(null);

  const salvarLocalOuRemoto = (novasTarefas) => {
    setTarefas(novasTarefas);
    if (erroApi) {
      localStorage.setItem('minikanban_tarefas', JSON.stringify(novasTarefas));
    }
  };

  useEffect(() => {
    getTasks()
      .then((data) => {
        setTarefas(data || []);
        setErroApi(null);
      })
      .catch(() => {
        setErroApi('API Go desconectada — Usando armazenamento local (Mock)');
        const salvo = localStorage.getItem('minikanban_tarefas');
        if (salvo) {
          setTarefas(JSON.parse(salvo));
        } else {
          const iniciais = [
            { id: 1, titulo: 'Configurar Go API', descricao: 'Subir servidor REST na porta 8080', status: 'todo' }
          ];
          setTarefas(iniciais);
          localStorage.setItem('minikanban_tarefas', JSON.stringify(iniciais));
        }
      });
  }, []);

  const adicionarTarefa = (novaTarefa) => {
    createTask(novaTarefa)
      .then((criada) => {
        salvarLocalOuRemoto([...tarefas, criada]);
        setErroApi(null);
      })
      .catch(() => {
        const criadaMock = { id: Date.now(), ...novaTarefa };
        salvarLocalOuRemoto([...tarefas, criadaMock]);
      });
  };

  const deletarTarefa = (id) => {
    apiDeleteTask(id)
      .catch(() => {})
      .finally(() => {
        salvarLocalOuRemoto(tarefas.filter((t) => t.id !== id));
      });
  };

  const mudarStatus = (id, novoStatus) => {
    const tarefa = tarefas.find((t) => t.id === id);
    if (!tarefa) return;

    const atualizada = { ...tarefa, status: novoStatus };

    updateTask(id, atualizada)
      .catch(() => {})
      .finally(() => {
        salvarLocalOuRemoto(tarefas.map((t) => (t.id === id ? atualizada : t)));
      });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6">
      <h1 className="text-2xl sm:text-4xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent px-2">
        Desafio-Fullstack-Veritas
      </h1>

      {erroApi && (
        <div className="bg-yellow-600/20 border border-yellow-500 text-yellow-300 px-3 py-2 rounded text-xs sm:text-sm text-center mb-6 max-w-xl mx-auto">
          ⚠️ {erroApi}
        </div>
      )}

      <TaskForm onSubmit={adicionarTarefa} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
        <KanbanColumn 
          titulo="A Fazer" 
          statusKey="todo" 
          corTexto="text-blue-400" 
          corBadge="bg-blue-600" 
          tarefas={tarefas} 
          mudarStatus={mudarStatus} 
          deletarTarefa={deletarTarefa} 
        />
        <KanbanColumn 
          titulo="Em Progresso" 
          statusKey="doing" 
          corTexto="text-yellow-400" 
          corBadge="bg-yellow-600" 
          tarefas={tarefas} 
          mudarStatus={mudarStatus} 
          deletarTarefa={deletarTarefa} 
        />
        <KanbanColumn 
          titulo="Concluídas" 
          statusKey="done" 
          corTexto="text-green-400" 
          corBadge="bg-green-600" 
          tarefas={tarefas} 
          mudarStatus={mudarStatus} 
          deletarTarefa={deletarTarefa} 
        />
      </div>
    </div>
  );
}

export default App;