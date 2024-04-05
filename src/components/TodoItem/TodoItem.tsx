import React, { useEffect, useRef, useState } from 'react';
import cn from 'classnames';
import { Todo } from '../../types/Todo';
import { useTodos } from '../TodosProvider';
import { errorMessages } from '../ErrorNotification';

type Props = {
  todo: Todo;
};

export const TodoItem: React.FC<Props> = ({ todo }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(todo.title);
  const [inputFocused, setInputFocused] = useState(false);

  const { deleteTodo, selectedTodoIds, setErrorMessage, updateTodo } =
    useTodos();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current && inputFocused) {
      inputRef.current.focus();
    }
  }, [isEditing, inputFocused]);

  const handleToggleTodo = async () => {
    try {
      const updatedTodo = { ...todo, completed: !todo.completed };

      await updateTodo(updatedTodo);
    } catch (error) {
      setErrorMessage(errorMessages.unableToUpdateTodo);
    }
  };

  const handleUpdateOrDelete = async (action: 'update' | 'delete') => {
    const trimmedTitle = editedTitle.trim();
    const actionFunctions = {
      update: async () => {
        const updatedTodo = { ...todo, title: trimmedTitle };

        try {
          await updateTodo(updatedTodo);
          setIsEditing(false);
        } catch (error) {
          setIsEditing(true);
          setErrorMessage(errorMessages.unableToUpdateTodo);
        }
      },

      delete: async () => {
        try {
          await deleteTodo(todo.id);
          setIsEditing(false);
        } catch (error) {
          setIsEditing(true);
          setErrorMessage(errorMessages.unableToDeleteTodo);
        }
      },
    };

    await actionFunctions[action]();
  };

  const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const trimmedTitle = editedTitle.trim();

    if (event.key === 'Enter') {
      event.preventDefault();
      if (trimmedTitle === todo.title) {
        setIsEditing(false);
      } else if (trimmedTitle !== '') {
        handleUpdateOrDelete('update');
      } else {
        handleUpdateOrDelete('delete');
      }
    } else if (event.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = editedTitle.trim();

    if (isEditing && trimmedTitle !== '' && trimmedTitle !== todo.title) {
      await handleUpdateOrDelete('update');
    } else if (!isEditing) {
      await handleUpdateOrDelete('delete');
    }
  };

  const handleEditTodoOnBlur = () => {
    const trimmedTitle = editedTitle.trim();

    if (trimmedTitle !== '') {
      setIsEditing(false);
      handleUpdateOrDelete('update');
    } else {
      setIsEditing(true);
      handleUpdateOrDelete('delete');
    }
  };

  const handleDoubleClick = () => {
    setInputFocused(true);
    setIsEditing(true);
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
      {isEditing && inputFocused ? (
        <>
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
              onBlur={() => handleEditTodoOnBlur()}
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
          {/* <label className="todo__status-label">
            <input
              data-cy="TodoStatus"
              type="checkbox"
              className="todo__status"
              checked={todo.completed}
              onChange={handleToggleTodo}
              aria-label="Todo status"
            />
          </label> */}
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
