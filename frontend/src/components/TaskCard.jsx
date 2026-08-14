import React from 'react';

export function TaskCard({ tarefa, mudarStatus, deletarTarefa }) {
  const isDone = tarefa.status === 'done';

  return (
    <div className={`bg-gray-800 p-3 sm:p-4 rounded-lg mb-3 border border-gray-700 shadow ${isDone ? 'opacity-80' : ''}`}>
      <h4 className={`font-bold text-base sm:text-lg break-words text-white ${isDone ? 'line-through' : ''}`}>{tarefa.titulo}</h4>
      <p className="text-gray-400 text-xs sm:text-sm mb-3 break-words">{tarefa.descricao}</p>
      
      <div className="flex flex-wrap justify-between gap-2">
        {tarefa.status === 'todo' && (
          <button onClick={() => mudarStatus(tarefa.id, 'doing')} className="text-xs bg-yellow-600 text-white px-2.5 py-1.5 rounded hover:bg-yellow-500 flex-1 sm:flex-none">
            Progresso &rarr;
          </button>
        )}

        {tarefa.status === 'doing' && (
          <>
            <button onClick={() => mudarStatus(tarefa.id, 'todo')} className="text-xs bg-gray-600 text-white px-2 py-1.5 rounded">
              &larr; Voltar
            </button>
            <button onClick={() => mudarStatus(tarefa.id, 'done')} className="text-xs bg-green-600 text-white px-2 py-1.5 rounded hover:bg-green-500">
              Concluir &rarr;
            </button>
          </>
        )}

        {tarefa.status === 'done' && (
          <button onClick={() => mudarStatus(tarefa.id, 'doing')} className="text-xs bg-gray-600 text-white px-2.5 py-1.5 rounded">
            &larr; Reabrir
          </button>
        )}

        <button onClick={() => deletarTarefa(tarefa.id)} className="text-xs bg-red-600 text-white px-2.5 py-1.5 rounded hover:bg-red-500">
          Excluir
        </button>
      </div>
    </div>
  );
}