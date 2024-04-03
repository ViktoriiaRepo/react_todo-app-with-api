import React, { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { Todo } from '../../types/Todo';
import { useTodos } from '../TodosProvider';
import { errorMessages } from '../ErrorNotification';

type Props = {
  todo: Todo;
};

export const TodoItem: React.FC<Props> = ({ todo }) => {
  const [editing, setEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const { deleteTodo, selectedTodoIds, setErrorMessage, updateTodo } =
    useTodos();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleDoubleClick = () => {
    setEditing(true);
  };

  const handleToggleTodo = async () => {
    try {
      const updatedTodo = {
        ...todo,
        completed: !todo.completed,
      };

      updateTodo(updatedTodo);
    } catch (error) {
      setErrorMessage(errorMessages.unableToUpdateTodo);
    }
  };

  const handleUpdateTodo = async () => {
    const updatedTodo = { ...todo, title: editedTitle.trim() };

    try {
      await updateTodo(updatedTodo);
      setEditing(false);
    } catch (error) {
      setErrorMessage(errorMessages.unableToUpdateTodo);
    }
  };

  const handleDeleteTodo = () => {
    deleteTodo(todo.id);
    setEditing(false);
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const trimmedTitle = editedTitle.trim();

    if (event.key === 'Enter') {
      if (trimmedTitle === todo.title) {
        setEditing(false);
      } else if (trimmedTitle !== '') {
        handleUpdateTodo();
      } else {
        handleDeleteTodo();
      }
    } else if (event.key === 'Escape') {
      setEditing(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = editedTitle.trim();

    if (trimmedTitle === todo.title) {
      setEditing(false);
    } else if (trimmedTitle !== '') {
      handleUpdateTodo();
    } else {
      handleDeleteTodo();
    }
  };

  const handleEditTodoOnBlur = (todoId: number) => {
    const trimmedTitle = editedTitle.trim();

    if (trimmedTitle !== '') {
      handleUpdateTodo();
    } else {
      handleDeleteTodo();
    }
  };

  return (
    <div
      data-cy="Todo"
      className={cn('todo', {
        completed: todo.completed,
      })}
      key={todo.id}
      onDoubleClick={handleDoubleClick}
    >
      {editing ? (
        <>
          <label className="todo__status-label">
            <input
              data-cy="TodoStatus"
              type="checkbox"
              className="todo__status"
              checked={todo.completed}
              onChange={handleToggleTodo}
              aria-label="Todo status"
              onBlur={() => handleEditTodoOnBlur(todo.id)}
            />
          </label>
          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              data-cy="TodoTitleField"
              type="text"
              value={editedTitle}
              className="todo__title-field"
              placeholder="Empty todo will be deleted"
              onChange={e => setEditedTitle(e.target.value)}
              onKeyUp={handleKeyUp}
            />
          </form>
          <div
            data-cy="TodoLoader"
            className={cn('modal overlay', {
              'is-active': selectedTodoIds.includes(todo.id),
            })}
          >
            <div className="modal-background has-background-white-ter" />
            <div className="loader" />
          </div>
        </>
      ) : (
        <>
          <label className="todo__status-label">
            <input
              data-cy="TodoStatus"
              type="checkbox"
              className="todo__status"
              checked={todo.completed}
              onChange={handleToggleTodo}
              aria-label="Todo status"
            />
          </label>
          <span data-cy="TodoTitle" className="todo__title">
            {todo.title}
          </span>
          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={() => deleteTodo(todo.id)}
          >
            ×
          </button>
          <div
            data-cy="TodoLoader"
            className={cn('modal overlay', {
              'is-active': selectedTodoIds.includes(todo.id),
            })}
          >
            <div className="modal-background has-background-white-ter" />
            <div className="loader" />
          </div>
        </>
      )}
    </div>
  );
};