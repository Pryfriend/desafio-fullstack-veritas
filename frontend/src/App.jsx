import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:8080/tarefas';

function App() {
  const [tarefas, setTarefas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);
  const [usandoFallback, setUsandoFallback] = useState(false);

  // Estados do formulário de criação/edição
  const [modoEdicao, setModoEdicao] = useState(false);
  const [tarefaIdEditando, setTarefaIdEditando] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState('todo');

  useEffect(() => {
    buscarTarefas();
  }, []);

  // Tenta buscar da API, se falhar, usa o localStorage
  const buscarTarefas = async () => {
    setLoading(true);
    setErro(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('API indisponível');
      const dados = await response.json();
      setTarefas(dados);
      setUsandoFallback(false);
    } catch (err) {
      console.warn('API Go indisponível. Usando localStorage como fallback.');
      setUsandoFallback(true);
      const tarefasSalvas = localStorage.getItem('minikanban_tarefas');
      if (tarefasSalvas) {
        setTarefas(JSON.parse(tarefasSalvas));
      } else {
        // Dados iniciais de exemplo caso esteja vazio
        const iniciais = [
          { id: 1, titulo: 'Configurar Go API', descricao: 'Subir servidor REST na porta 8080', status: 'todo' }
        ];
        setTarefas(iniciais);
        localStorage.setItem('minikanban_tarefas', JSON.stringify(iniciais));
      }
    } finally {
      setLoading(false);
    }
  };

  // Função auxiliar para atualizar o estado e o localStorage se estiver em fallback
  const atualizarTarefasLocal = (novasTarefas) => {
    setTarefas(novasTarefas);
    if (usandoFallback) {
      localStorage.setItem('minikanban_tarefas', JSON.stringify(novasTarefas));
    }
  };

  // Salvar (Criar ou Atualizar) Tarefa
  const salvarTarefa = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) return;

    setLoading(true);
    setErro(null);

    const payload = { titulo, descricao, status };

    if (usandoFallback) {
      // Simulação local via LocalStorage
      setTimeout(() => {
        if (modoEdicao) {
          const atualizadas = tarefas.map((t) => (t.id === tarefaIdEditando ? { ...t, ...payload } : t));
          atualizarTarefasLocal(atualizadas);
        } else {
          const nova = { id: Date.now(), ...payload };
          atualizarTarefasLocal([...tarefas, nova]);
        }
        cancelarEdicao();
        setLoading(false);
      }, 300);
      return;
    }

    try {
      if (modoEdicao) {
        const response = await fetch(`${API_URL}/${tarefaIdEditando}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Erro ao atualizar a tarefa na API.');
        const tarefaAtualizada = await response.json();
        setTarefas(tarefas.map((t) => (t.id === tarefaIdEditando ? tarefaAtualizada : t)));
        cancelarEdicao();
      } else {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('Erro ao criar a tarefa na API.');
        const novaTarefa = await response.json();
        setTarefas([...tarefas, novaTarefa]);
        limparFormulario();
      }
    } catch (err) {
      setErro(err.message + ' (Verifique se a API Go está rodando)');
    } finally {
      setLoading(false);
    }
  };

  // Remover tarefa
  const removerTarefa = async (id) => {
    setLoading(true);
    setErro(null);

    if (usandoFallback) {
      setTimeout(() => {
        atualizarTarefasLocal(tarefas.filter((t) => t.id !== id));
        setLoading(false);
      }, 200);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Erro ao excluir a tarefa.');
      setTarefas(tarefas.filter((t) => t.id !== id));
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Mover tarefa entre colunas
  const mudarStatus = async (id, novoStatus) => {
    const tarefaParaAtualizar = tarefas.find((t) => t.id === id);
    if (!tarefaParaAtualizar) return;

    const payload = { ...tarefaParaAtualizar, status: novoStatus };

    if (usandoFallback) {
      const atualizadas = tarefas.map((t) => (t.id === id ? payload : t));
      atualizarTarefasLocal(atualizadas);
      return;
    }

    setLoading(true);
    setErro(null);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Erro ao mover a tarefa.');
      const tarefaAtualizada = await response.json();
      setTarefas(tarefas.map((t) => (t.id === id ? tarefaAtualizada : t)));
    } catch (err) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicao = (tarefa) => {
    setModoEdicao(true);
    setTarefaIdEditando(tarefa.id);
    setTitulo(tarefa.titulo);
    setDescricao(tarefa.descricao || '');
    setStatus(tarefa.status);
  };

  const cancelarEdicao = () => {
    setModoEdicao(false);
    setTarefaIdEditando(null);
    limparFormulario();
  };

  const limparFormulario = () => {
    setTitulo('');
    setDescricao('');
    setStatus('todo');
  };

  const filtrarPorStatus = (statusFiltro) => tarefas.filter((t) => t.status === statusFiltro);

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center py-10 px-4 font-sans">
      <h1 className="text-4xl font-extrabold mb-2 tracking-wide bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
        Mini Kanban
      </h1>

      {/* Indicador de modo Offline / LocalStorage */}
      {usandoFallback && (
        <span className="mb-4 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-400 px-3 py-1 rounded-full">
          ⚠️ API Go desconectada — Usando armazenamento local (Mock)
        </span>
      )}

      {/* Feedbacks Visuais: Loading e Erro */}
      {loading && (
        <div className="mb-4 text-amber-400 text-sm animate-pulse font-medium">
          Processando requisição...
        </div>
      )}
      {erro && (
        <div className="mb-4 bg-red-950/80 border border-red-800 text-red-300 px-4 py-2 rounded-lg text-sm max-w-xl text-center">
          <strong>Aviso:</strong> {erro}
        </div>
      )}

      {/* Formulário de Adição / Edição */}
      <form onSubmit={salvarTarefa} className="bg-[#18181b] border border-neutral-800 p-4 rounded-xl shadow-xl flex flex-col gap-3 mb-10 w-full max-w-xl">
        <h2 className="text-sm font-semibold text-neutral-300">
          {modoEdicao ? 'Editar Tarefa' : 'Nova Tarefa'}
        </h2>
        <input
          type="text"
          placeholder="Título da tarefa..."
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="bg-[#1e1e1e] border border-neutral-800 text-neutral-200 px-3 py-2 rounded-lg outline-none focus:border-amber-500 text-sm"
          required
        />
        <textarea
          placeholder="Descrição opcional..."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="bg-[#1e1e1e] border border-neutral-800 text-neutral-200 px-3 py-2 rounded-lg outline-none focus:border-amber-500 text-sm resize-none h-20"
        />
        <div className="flex gap-2 items-center justify-between">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-[#1e1e1e] border border-neutral-800 text-neutral-300 px-3 py-2 rounded-lg outline-none focus:border-amber-500 text-sm cursor-pointer"
          >
            <option value="todo">A Fazer</option>
            <option value="inprogress">Em Progresso</option>
            <option value="done">Concluídas</option>
          </select>
          <div className="flex gap-2">
            {modoEdicao && (
              <button
                type="button"
                onClick={cancelarEdicao}
                className="bg-neutral-700 hover:bg-neutral-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-neutral-950 font-bold px-5 py-2 rounded-lg shadow-md text-sm transition-all"
            >
              {modoEdicao ? 'Salvar Alterações' : 'Adicionar Tarefa'}
            </button>
          </div>
        </div>
      </form>

      {/* Grade de 3 Colunas Fixas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        <ColunaKanban
          titulo="A Fazer"
          corBadge="bg-blue-600"
          tarefas={filtrarPorStatus('todo')}
          onRemove={removerTarefa}
          onEdit={iniciarEdicao}
          onMudarStatus={mudarStatus}
        />
        <ColunaKanban
          titulo="Em Progresso"
          corBadge="bg-amber-500 text-neutral-950"
          tarefas={filtrarPorStatus('inprogress')}
          onRemove={removerTarefa}
          onEdit={iniciarEdicao}
          onMudarStatus={mudarStatus}
        />
        <ColunaKanban
          titulo="Concluídas"
          corBadge="bg-emerald-500 text-neutral-950"
          tarefas={filtrarPorStatus('done')}
          onRemove={removerTarefa}
          onEdit={iniciarEdicao}
          onMudarStatus={mudarStatus}
        />
      </div>
    </div>
  );
}

function ColunaKanban({ titulo, corBadge, tarefas, onRemove, onEdit, onMudarStatus }) {
  return (
    <div className="bg-[#18181b] border border-neutral-800/80 rounded-xl p-4 flex flex-col shadow-xl min-h-[400px]">
      <div className={`px-4 py-2.5 rounded-lg font-semibold flex justify-between items-center shadow-md mb-4 text-sm ${corBadge.includes('text-') ? corBadge : 'text-white ' + corBadge}`}>
        <span>{titulo}</span>
        <span className="bg-black/30 text-xs w-6 h-6 flex items-center justify-center rounded-full font-bold">
          {tarefas.length}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {tarefas.map((tarefa) => (
          <CartaoTarefa
            key={tarefa.id}
            tarefa={tarefa}
            onRemove={onRemove}
            onEdit={onEdit}
            onMudarStatus={onMudarStatus}
          />
        ))}
        {tarefas.length === 0 && (
          <p className="text-neutral-500 text-xs text-center py-10">Nenhuma tarefa aqui</p>
        )}
      </div>
    </div>
  );
}

function CartaoTarefa({ tarefa, onRemove, onEdit, onMudarStatus }) {
  return (
    <div className="bg-[#242428] border border-neutral-700/50 p-3.5 rounded-lg flex flex-col gap-2 shadow hover:border-neutral-600 transition-all">
      <div className="flex justify-between items-start gap-2">
        <span className="text-sm font-semibold text-neutral-100 break-words">{tarefa.titulo}</span>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => onEdit(tarefa)}
            className="text-neutral-400 hover:text-amber-400 p-1 text-xs"
            title="Editar"
          >
            ✏️
          </button>
          <button
            onClick={() => onRemove(tarefa.id)}
            className="text-neutral-400 hover:text-red-400 p-1 text-xs font-bold"
            title="Excluir"
          >
            ✕
          </button>
        </div>
      </div>

      {tarefa.descricao && (
        <p className="text-xs text-neutral-400 break-words">{tarefa.descricao}</p>
      )}

      <div className="flex gap-1 pt-2 border-t border-neutral-700/40 text-[10px] mt-1">
        {tarefa.status !== 'todo' && (
          <button
            onClick={() => onMudarStatus(tarefa.id, 'todo')}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-1 rounded"
          >
            ← A Fazer
          </button>
        )}
        {tarefa.status !== 'inprogress' && (
          <button
            onClick={() => onMudarStatus(tarefa.id, 'inprogress')}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-1 rounded"
          >
            Em Progresso
          </button>
        )}
        {tarefa.status !== 'done' && (
          <button
            onClick={() => onMudarStatus(tarefa.id, 'done')}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-1 rounded ml-auto"
          >
            Concluir →
          </button>
        )}
      </div>
    </div>
  );
}

export default App;