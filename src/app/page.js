'use client';
import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

export default function Home() {
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState({
    todo: [{ id: 1, name: 'Task 1', notes: 'Some notes', category: 'todo' }],
    inProgress: [],
    completed: [],
  });

  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState('');

  const handleAddTask = () => {
    if (newTask.trim()) {
      const newId = Date.now();
      setTasks((prev) => ({
        ...prev,
        todo: [...prev.todo, { id: newId, name: newTask, notes: '', category: 'todo' }],
      }));
      setNewTask('');
    }
  };

  const handleUpdateNote = (id, updatedNote) => {
    setTasks((prev) => {
      const updatedTasks = { ...prev };
      for (const category in updatedTasks) {
        updatedTasks[category] = updatedTasks[category].map(task =>
          task.id === id ? { ...task, notes: updatedNote } : task
        );
      }
      return updatedTasks;
    });
    setEditingNote(null);
    setNewNote('');
  };

  const handleDeleteTask = (id, category) => {
    setTasks((prev) => ({
      ...prev,
      [category]: prev[category].filter(task => task.id !== id),
    }));
  };

  const moveTask = (task, toCategory) => {
    setTasks((prev) => {
      const newTasks = { ...prev };

      if (!newTasks[task.category]) newTasks[task.category] = [];
      if (!newTasks[toCategory]) newTasks[toCategory] = [];

      const filteredFromCategory = newTasks[task.category].filter(
        (t) => t.id !== task.id
      );

      const updatedToCategory = [
        ...newTasks[toCategory],
        { ...task, category: toCategory },
      ];

      return {
        ...newTasks,
        [task.category]: filteredFromCategory,
        [toCategory]: updatedToCategory,
      };
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-black flex flex-col items-center py-10">
        <h1 className="text-4xl font-bold mb-8 text-slate-200">DaoHui To-Do List</h1>

        <div className="mb-6 flex space-x-4">
          <input
            className="p-2 border border-gray-300 rounded-lg"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="新增代辦事項"
          />
          <button
            className="p-2 bg-gray-50 text-black rounded-lg"
            onClick={handleAddTask}
          >
            加入代辦
          </button>
        </div>

        <div className="flex space-x-6 w-full max-w-4xl">
          {['todo', 'inProgress', 'completed'].map((category) => (
            <TaskColumn
              key={category}
              category={category}
              tasks={tasks[category]}
              moveTask={moveTask}
              updateNote={handleUpdateNote}
              editingNote={editingNote}
              newNote={newNote}
              setEditingNote={setEditingNote}
              setNewNote={setNewNote}
              deleteTask={handleDeleteTask} // 傳遞刪除任務的函數
            />
          ))}
        </div>
      </div>
    </DndProvider>
  );
}

function TaskColumn({ category, tasks, moveTask, updateNote, editingNote, newNote, setEditingNote, setNewNote, deleteTask }) {
  const [, drop] = useDrop({
    accept: 'task',
    drop: (item) => moveTask(item, category),
  });

  return (
    <div
      ref={drop}
      className="bg-black border border-slate-300 text-center w-1/3 p-4 shadow-lg rounded-lg"
    >
      <h2 className="text-slate-200 text-2xl font-semibold mb-4">
        {category === 'todo'
          ? '代辦'
          : category === 'inProgress'
          ? '進行'
          : '完成'}
      </h2>
      <div className="space-y-4">
        {tasks.map((task) => (
          <Task
            key={task.id}
            task={task}
            updateNote={updateNote}
            setEditingNote={setEditingNote}
            setNewNote={setNewNote}
            editingNote={editingNote}
            newNote={newNote}
            deleteTask={deleteTask} // 傳遞刪除任務的函數
            category={category} // 傳遞任務所在分類
          />
        ))}
      </div>
    </div>
  );
}

function Task({ task, updateNote, setEditingNote, setNewNote, editingNote, newNote, deleteTask, category }) {
  const [{ isDragging }, drag] = useDrag({
    type: 'task',
    item: task,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  const handleEditClick = () => {
    setNewNote(task.notes);
    setEditingNote(task.id);
  };

  const handleNoteChange = (e) => {
    setNewNote(e.target.value);
  };

  const handleSaveClick = () => {
    updateNote(task.id, newNote);
    setEditingNote(null);
  };

  const handleDeleteClick = () => {
    deleteTask(task.id, category);
  };

  return (
    <div
      ref={drag}
      className={`p-4 bg-blue-50 border border-blue-200 rounded-lg ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold">{task.name}</h3>
        <div className="flex space-x-2">
          <button
            className="text-blue-500"
            onClick={handleEditClick}
          >
            <PencilIcon className="w-6 h-6" />
          </button>
          <button
            className="text-red-500"
            onClick={handleDeleteClick}
          >
            <TrashIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
      {task.id === editingNote ? (
        <div className="mt-2">
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg"
            value={newNote}
            onChange={handleNoteChange}
            placeholder="添加備註"
          />
          <button
            className="mt-2 p-2 bg-blue-500 text-white rounded-lg"
            onClick={handleSaveClick}
          >
            儲存
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-600 mt-2">{task.notes}</p>
      )}
    </div>
  );
}
