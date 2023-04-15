# useCollection

This code defines a custom React Hook called `useCollection` which can be used to manage a collection of items in a React component.

## Installation

This code is written in TypeScript and uses React Hooks. To use it in your project, you will need to have TypeScript and React installed. You can install the package using npm:

```
npm install --save use-collection
```

## API

To use the `useCollection` hook in your React component, first import it:

```
import useCollection from 'use-collection';
```

Then, call the hook in your component:

```
const { create, remove, update, reset, items, createdItems, updatedItems, removedItems, dirty } = useCollection<MyType>(initial);
```

The hook takes an optional initial collection of items of type `MyType[]`. The hook returns an object with the following properties:

- `create(itemOrItems: MyType | MyType[]): void`: A function to create one or more new items in the collection.

- `remove(index: number): void`: A function to remove an item from the collection by its index.

- `update(index: number, key: keyof MyType, value: any): void`: A function to update a specific property of an item in the collection.

- `reset(): void`: A function to reset the collection to its initial state.

- `items: MyType[]`: An array of all the items in the collection.

- `createdItems: MyType[]`: An array of items that have been added to the collection since its creation or the last reset.

- `updatedItems: MyType[]`: An array of items that have been updated since the collection was created or last reset.

- `removedItems: MyType[]`: An array of items that have been removed from the collection since its creation or the last reset.

- `dirty: boolean`: A boolean value indicating whether the collection has been modified since its creation or the last reset.

## Use case
Here's an example of a TODO app using `useCollection`:

```
import React, { useState } from 'react';
import useCollection from 'use-collection';

interface Todo {
  content: string;
  completed: boolean;
  completedDate?: Date;
}

const initialTodos: Todo[] = [
  { content: 'Buy groceries', completed: false },
  { content: 'Do laundry', completed: false },
  { content: 'Clean room', completed: false },
];

const TodoList: React.FC = () => {
  const [newTodo, setNewTodo] = useState<Todo>({ content: '', completed: false });
  const { create, remove, update, reset, items } = useCollection<Todo>(initialTodos);

  const handleCreate = () => {
    create(newTodo);
    setNewTodo({ content: '', completed: false });
  };

  const handleRemove = (index: number) => {
    remove(index);
  };

  const handleUpdateContent = (index: number, content: string) => {
    update(index, 'content', content);
  };

  const handleUpdateCompleted = (index: number, completed: boolean) => {
    update(index, 'completed', completed);
    update(index, 'completedDate', completed ? new Date() : undefined);
  };

  return (
    <div>
      <h2>TODO List</h2>
      <ul>
        {items.map((todo, index) => (
          <li key={index}>
            <input type="text" value={todo.content} onChange={e => handleUpdateContent(index, e.target.value)} />
            <label>
              Completed:
              <input type="checkbox" checked={todo.completed} onChange={e => handleUpdateCompleted(index, e.target.checked)} />
            </label>
            <button onClick={() => handleRemove(index)}>Delete</button>
            {todo.completedDate && <p>Completed on: {todo.completedDate.toLocaleString()}</p>}
          </li>
        ))}
      </ul>
      <h3>Add TODO</h3>
      <input type="text" value={newTodo.content} onChange={e => setNewTodo({ ...newTodo, content: e.target.value })} />
      <button onClick={handleCreate}>Create</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
};
```

* In this example, we define an interface for a `Todo` object with a `content` string property, a `completed` boolean property, and an optional `completedDate` property of type `Date`.
* We define an initial collection of `Todo` objects and call the `useCollection` hook with the initial collection and de-structure the returned properties.
* We define several functions to handle creating, updating, and removing `Todo` objects from the collection. We also define a state variable `newTodo` to hold the values of a new `Todo` being added to the collection.
* In the JSX, we map over the `items` array to display the list of `Todo` objects in the collection. We also render a form to add new `Todo` objects to the collection.
* At the bottom of the component, we render buttons to reset the collection and call the corresponding `reset` function. If a `Todo` object has been completed, we display the `completedDate` property.


## Contributing

If you find a bug or have a suggestion for improvement, please submit an issue or pull request. 

## License

This code is released under the MIT License.