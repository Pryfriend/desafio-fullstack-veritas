import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:8080/tasks';

function App() {
  const [tarefas, setTarefas] = useState([]);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('todo');
  const [erroApi, setErroApi] = useState(null);

  // Buscar tarefas ao carregar
  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('API indisponível');
        return res.json();
      })
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

  const salvarLocalOuRemoto = (novasTarefas) => {
    setTarefas(novasTarefas);
    if (erroApi) {
      localStorage.setItem('minikanban_tarefas', JSON.stringify(novasTarefas));
    }
  };

  // Adicionar Tarefa
  const adicionarTarefa = (e) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    const novaTarefa = { titulo, descricao, status };

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(novaTarefa),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Erro ao criar');
        return res.json();
      })
      .then((criada) => {
        salvarLocalOuRemoto([...tarefas, criada]);
        setTitulo('');
        setDescricao('');
        setErroApi(null);
      })
      .catch(() => {
        // Fallback local caso a API caia na hora de criar
        const criadaMock = { id: Date.now(), ...novaTarefa };
        salvarLocalOuRemoto([...tarefas, criadaMock]);
        setTitulo('');
        setDescricao('');
      });
  };

  // Deletar Tarefa
  const deletarTarefa = (id) => {
    fetch(`${API_URL}/${id}`, { method: 'DELETE' })
      .then(() => {
        salvarLocalOuRemoto(tarefas.filter((t) => t.id !== id));
      })
      .catch(() => {
        salvarLocalOuRemoto(tarefas.filter((t) => t.id !== id));
      });
  };

  // Mudar Status (Fluidez entre colunas)
  const mudarStatus = (id, novoStatus) => {
    const tarefa = tarefas.find((t) => t.id === id);
    if (!tarefa) return;

    const atualizada = { ...tarefa, status: novoStatus };

    fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(atualizada),
    })
      .then(() => {
        salvarLocalOuRemoto(tarefas.map((t) => (t.id === id ? atualizada : t)));
      })
      .catch(() => {
        salvarLocalOuRemoto(tarefas.map((t) => (t.id === id ? atualizada : t)));
      });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
        Mini Kanban
      </h1>

      {erroApi && (
        <div className="bg-yellow-600/20 border border-yellow-500 text-yellow-300 px-4 py-2 rounded text-center mb-6 max-w-xl mx-auto">
          ⚠️ {erroApi}
        </div>
      )}

      {/* Formulário */}
      <form onSubmit={adicionarTarefa} className="bg-gray-800 p-6 rounded-xl max-w-xl mx-auto mb-8 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Nova Tarefa</h2>
        <input
          type="text"
          placeholder="Título da tarefa..."
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded p-2 mb-3 text-white"
          required
        />
        <textarea
          placeholder="Descrição opcional..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded p-2 mb-3 text-white"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full bg-gray-900 border border-gray-700 rounded p-2 mb-4 text-white"
        >
          <option value="todo">A Fazer</option>
          <option value="doing">Em Progresso</option>
          <option value="done">Concluídas</option>
        </select>
        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 font-bold py-2 rounded transition">
          Adicionar Tarefa
        </button>
      </form>

      {/* Colunas do Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* A Fazer */}
        <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl">
          <h3 className="text-blue-400 font-bold mb-4 flex justify-between items-center">
            A Fazer <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-sm">{tarefas.filter(t => t.status === 'todo').length}</span>
          </h3>
          {tarefas.filter(t => t.status === 'todo').map(t => (
            <div key={t.id} className="bg-gray-800 p-4 rounded-lg mb-3 border border-gray-700 shadow">
              <h4 className="font-bold text-lg">{t.titulo}</h4>
              <p className="text-gray-400 text-sm mb-3">{t.descricao}</p>
              <div className="flex justify-between gap-2">
                <button onClick={() => mudarStatus(t.id, 'doing')} className="text-xs bg-yellow-600 px-2 py-1 rounded hover:bg-yellow-500">Progresso &rarr;</button>
                <button onClick={() => deletarTarefa(t.id)} className="text-xs bg-red-600 px-2 py-1 rounded hover:bg-red-500">Excluir</button>
              </div>
            </div>
          ))}
        </div>

        {/* Em Progresso */}
        <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl">
          <h3 className="text-yellow-400 font-bold mb-4 flex justify-between items-center">
            Em Progresso <span className="bg-yellow-600 text-white px-2 py-0.5 rounded-full text-sm">{tarefas.filter(t => t.status === 'doing').length}</span>
          </h3>
          {tarefas.filter(t => t.status === 'doing').map(t => (
            <div key={t.id} className="bg-gray-800 p-4 rounded-lg mb-3 border border-gray-700 shadow">
              <h4 className="font-bold text-lg">{t.titulo}</h4>
              <p className="text-gray-400 text-sm mb-3">{t.descricao}</p>
              <div className="flex justify-between gap-2">
                <button onClick={() => mudarStatus(t.id, 'todo')} className="text-xs bg-gray-600 px-2 py-1 rounded">&larr; Voltar</button>
                <button onClick={() => mudarStatus(t.id, 'done')} className="text-xs bg-green-600 px-2 py-1 rounded hover:bg-green-500">Concluir &rarr;</button>
              </div>
            </div>
          ))}
        </div>

        {/* Concluídas */}
        <div className="bg-gray-800/50 border border-gray-700 p-4 rounded-xl">
          <h3 className="text-green-400 font-bold mb-4 flex justify-between items-center">
            Concluídas <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-sm">{tarefas.filter(t => t.status === 'done').length}</span>
          </h3>
          {tarefas.filter(t => t.status === 'done').map(t => (
            <div key={t.id} className="bg-gray-800 p-4 rounded-lg mb-3 border border-gray-700 shadow opacity-80">
              <h4 className="font-bold text-lg line-through">{t.titulo}</h4>
              <p className="text-gray-400 text-sm mb-3">{t.descricao}</p>
              <div className="flex justify-between gap-2">
                <button onClick={() => mudarStatus(t.id, 'doing')} className="text-xs bg-gray-600 px-2 py-1 rounded">&larr; Reabrir</button>
                <button onClick={() => deletarTarefa(t.id)} className="text-xs bg-red-600 px-2 py-1 rounded hover:bg-red-500">Excluir</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;