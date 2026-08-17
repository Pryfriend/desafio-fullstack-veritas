import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

export function KanbanColumn({ titulo, statusKey, corTexto, corBadge, tarefas, mudarStatus, deletarTarefa }) {
  const tarefasDaColuna = tarefas.filter((t) => t.status === statusKey);

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className={`font-semibold ${corTexto}`}>{titulo}</h2>
        <span className={`${corBadge} text-xs px-2 py-0.5 rounded-full text-white`}>
          {tarefasDaColuna.length}
        </span>
      </div>

      <Droppable droppableId={statusKey}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="flex-1 min-h-[200px]"
          >
            {tarefasDaColuna.map((tarefa, index) => (
              <Draggable key={tarefa.id} draggableId={String(tarefa.id)} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{ ...provided.draggableProps.style }}
                    className="bg-gray-800 border border-gray-700 p-4 rounded-xl mb-3 shadow"
                  >
                    {/* Título e Descrição */}
                    <h3 className="font-bold text-white text-lg">{tarefa.titulo}</h3>
                    {tarefa.descricao && (
                      <p className="text-gray-400 text-sm mt-1 mb-4">{tarefa.descricao}</p>
                    )}

                    {/* Botões com o design idêntico ao original */}
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {tarefa.status === 'doing' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            mudarStatus(tarefa.id, 'todo');
                          }}
                          className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
                        >
                          ← Voltar
                        </button>
                      )}

                      {tarefa.status === 'done' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            mudarStatus(tarefa.id, 'doing');
                          }}
                          className="bg-gray-700 hover:bg-gray-600 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
                        >
                          ← Reabrir
                        </button>
                      )}

                      {tarefa.status === 'todo' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            mudarStatus(tarefa.id, 'doing');
                          }}
                          className="bg-yellow-600 hover:bg-yellow-500 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
                        >
                          Progresso →
                        </button>
                      )}

                      {tarefa.status === 'doing' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            mudarStatus(tarefa.id, 'done');
                          }}
                          className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
                        >
                          Concluir →
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletarTarefa(tarefa.id);
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors ml-auto"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}