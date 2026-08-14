import React from 'react';
import { TaskCard } from './TaskCard';

export function KanbanColumn({ titulo, statusKey, corTexto, corBadge, tarefas, mudarStatus, deletarTarefa }) {
  const tarefasFiltradas = tarefas.filter((t) => t.status === statusKey);

  return (
    <div className="bg-gray-800/50 border border-gray-700 p-3 sm:p-4 rounded-xl">
      <h3 className={`${corTexto} font-bold mb-4 flex justify-between items-center text-sm sm:text-base`}>
        {titulo} 
        <span className={`${corBadge} text-white px-2 py-0.5 rounded-full text-xs sm:text-sm`}>
          {tarefasFiltradas.length}
        </span>
      </h3>
      {tarefasFiltradas.map((t) => (
        <TaskCard key={t.id} tarefa={t} mudarStatus={mudarStatus} deletarTarefa={deletarTarefa} />
      ))}
    </div>
  );
}