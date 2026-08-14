const API_URL = 'http://localhost:8080/tasks';

export const getTasks = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('API indisponível');
  return res.json();
};

export const createTask = async (taskData) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  if (!res.ok) throw new Error('Erro ao criar');
  return res.json();
};

export const updateTask = async (id, taskData) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData),
  });
  if (!res.ok) throw new Error('Erro ao atualizar');
  return res.json();
};

export const deleteTask = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao deletar');
  return true;
};