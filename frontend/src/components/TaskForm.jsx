import React, { useState } from 'react';

export function TaskForm({ onSubmit }) {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescdescricao] = useState('');
  const [status, setStatus] = useState('todo');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    onSubmit({ titulo, descricao, status });
    setTitulo('');
    setDescdescricao('');
    setStatus('todo');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 sm:p-6 rounded-xl max-w-xl mx-auto mb-8 shadow-lg">
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">Nova Tarefa</h2>
      <input
        type="text"
        placeholder="Título da tarefa..."
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="w-full bg-gray-900 border border-gray-700 rounded p-2 mb-3 text-sm sm:text-base text-white"
        required
      />
      <textarea
        placeholder="Descrição opcional..."
        value={descricao}
        onChange={(e) => setDescdescricao(e.target.value)}
        className="w-full bg-gray-900 border border-gray-700 rounded p-2 mb-3 text-sm sm:text-base text-white resize-none h-20"
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full bg-gray-900 border border-gray-700 rounded p-2 mb-4 text-sm sm:text-base text-white"
      >
        <option value="todo">A Fazer</option>
        <option value="doing">Em Progresso</option>
        <option value="done">Concluídas</option>
      </select>
      <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 font-bold py-2 rounded transition text-sm sm:text-base text-white">
        Adicionar Tarefa
      </button>
    </form>
  );
}