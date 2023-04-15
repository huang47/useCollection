import { act, render as rtlRender, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement, useCallback } from 'react';
import useCollection from './useCollection';

type Item = {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
};
type Props = {
  initial?: Item[];
  createItems?: Item[];
  removeIndexes?: number[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateCommands?: [number, keyof Item, any][];
};

const TestItemCollection = ({
  initial = [],
  createItems = [],
  updateCommands = [],
  removeIndexes = [],
}: Props) => {
  const {
    create,
    remove,
    update,
    reset,
    items,
    dirty,
    createdItems,
    updatedItems,
    removedItems,
  } = useCollection<Item>(initial);
  const handleCreate = useCallback(
    () => create(createItems),
    [createItems, create]
  );
  const handleUpdate = useCallback(
    () => updateCommands.forEach((command) => update(...command)),
    [updateCommands, update]
  );
  const handleRemove = useCallback(
    () => removeIndexes.forEach((i) => remove(i)),
    [removeIndexes, remove]
  );
  const handleReset = useCallback(() => reset(), [reset]);
  return (
    <>
      <div data-testid="data">
        {JSON.stringify({
          items,
          createdItems,
          updatedItems,
          removedItems,
          dirty,
        })}
      </div>
      <button type="submit" data-testid="create" onClick={handleCreate}>
        create
      </button>
      <button type="submit" data-testid="update" onClick={handleUpdate}>
        update
      </button>
      <button type="submit" data-testid="remove" onClick={handleRemove}>
        remove
      </button>
      <button type="submit" data-testid="reset" onClick={handleReset}>
        reset
      </button>
    </>
  );
};

async function render(component: ReactElement) {
  const { getByTestId } = rtlRender(component);
  return {
    genData: async () => {
      const data = await waitFor(() => getByTestId('data'));
      return JSON.parse(data.innerHTML);
    },
    fireCreate: async () => {
      const button = await waitFor(() => getByTestId('create'));
      await act(async () => userEvent.click(button));
    },
    fireUpdate: async () => {
      const button = await waitFor(() => getByTestId('update'));
      await act(async () => userEvent.click(button));
    },
    fireRemove: async () => {
      const button = await waitFor(() => getByTestId('remove'));
      await act(async () => userEvent.click(button));
    },
    fireReset: async () => {
      const button = await waitFor(() => getByTestId('reset'));
      await act(async () => userEvent.click(button));
    },
  };
}

describe('useCollection', () => {
  describe('initial', () => {
    it('should initialize with default value', async () => {
      const { genData } = await render(<TestItemCollection />);
      const data = await genData();
      expect(data).toEqual({
        items: [],
        createdItems: [],
        updatedItems: [],
        removedItems: [],
        dirty: false,
      });
    });
  });
  describe('create', () => {
    it('should create a new item', async () => {
      const { genData, fireCreate } = await render(
        <TestItemCollection createItems={[{ name: 'foo', value: 'foo' }]} />
      );

      await fireCreate();
      const data = await genData();
      expect(data).toEqual({
        items: [{ name: 'foo', value: 'foo' }],
        createdItems: [{ name: 'foo', value: 'foo' }],
        updatedItems: [],
        removedItems: [],
        dirty: true,
      });
    });

    it('should create a new item and add to original items', async () => {
      const { genData, fireCreate } = await render(
        <TestItemCollection
          initial={[{ name: 'original', value: 'original' }]}
          createItems={[{ name: 'foo', value: 'foo' }]}
        />
      );

      await fireCreate();
      const data = await genData();
      expect(data).toEqual({
        items: [
          { name: 'original', value: 'original' },
          { name: 'foo', value: 'foo' },
        ],
        createdItems: [{ name: 'foo', value: 'foo' }],
        updatedItems: [],
        removedItems: [],
        dirty: true,
      });
    });
  });
  describe('remove', () => {
    it('should remove items with given index', async () => {
      const { genData, fireRemove } = await render(
        <TestItemCollection
          initial={[
            { name: 'original', value: 'original' },
            { name: 'original2', value: 'original2' },
          ]}
          removeIndexes={[1]}
        />
      );
      const dataBeforeRemove = await genData();
      expect(dataBeforeRemove).toEqual({
        items: [
          { name: 'original', value: 'original' },
          { name: 'original2', value: 'original2' },
        ],
        createdItems: [],
        updatedItems: [],
        removedItems: [],
        dirty: false,
      });

      await fireRemove();
      const dataAfterRemove = await genData();
      expect(dataAfterRemove).toEqual({
        items: [{ name: 'original', value: 'original' }],
        createdItems: [],
        updatedItems: [],
        removedItems: [{ name: 'original2', value: 'original2' }],
        dirty: true,
      });
    });

    it('should remove items with given indexes', async () => {
      const { genData, fireRemove } = await render(
        <TestItemCollection
          initial={[
            { name: 'original', value: 'original' },
            { name: 'original2', value: 'original2' },
          ]}
          // first remove original2, then original
          removeIndexes={[1, 0]}
        />
      );
      const dataBeforeRemove = await genData();
      expect(dataBeforeRemove).toEqual({
        items: [
          { name: 'original', value: 'original' },
          { name: 'original2', value: 'original2' },
        ],
        createdItems: [],
        updatedItems: [],
        removedItems: [],
        dirty: false,
      });

      await fireRemove();
      const dataAfterRemove = await genData();
      expect(dataAfterRemove).toEqual({
        items: [],
        createdItems: [],
        updatedItems: [],
        removedItems: [
          { name: 'original', value: 'original' },
          { name: 'original2', value: 'original2' },
        ],
        dirty: true,
      });
    });
  });
  describe('update', () => {
    it('should update item with given index, key, and value', async () => {
      const { genData, fireUpdate } = await render(
        <TestItemCollection
          initial={[
            { name: 'original', value: 'original' },
            { name: 'original2', value: 'original2' },
          ]}
          updateCommands={[[1, 'value', 'updated']]}
        />
      );
      const dataBeforeUpdate = await genData();
      expect(dataBeforeUpdate).toEqual({
        items: [
          { name: 'original', value: 'original' },
          { name: 'original2', value: 'original2' },
        ],
        createdItems: [],
        updatedItems: [],
        removedItems: [],
        dirty: false,
      });

      await fireUpdate();
      const dataAfterUpdate = await genData();
      expect(dataAfterUpdate).toEqual({
        items: [
          { name: 'original', value: 'original' },
          { name: 'original2', value: 'updated' },
        ],
        createdItems: [],
        updatedItems: [{ name: 'original2', value: 'updated' }],
        removedItems: [],
        dirty: true,
      });
    });

    it('should update multiple items with given index, key, and value', async () => {
      const { genData, fireUpdate } = await render(
        <TestItemCollection
          initial={[
            { name: 'original', value: 'original' },
            { name: 'original2', value: 'original2' },
          ]}
          updateCommands={[
            [1, 'value', 'updated'],
            [0, 'value', 'updated'],
          ]}
        />
      );

      await fireUpdate();
      const dataAfterUpdate = await genData();
      expect(dataAfterUpdate).toEqual({
        items: [
          { name: 'original', value: 'updated' },
          { name: 'original2', value: 'updated' },
        ],
        createdItems: [],
        updatedItems: [
          { name: 'original', value: 'updated' },
          { name: 'original2', value: 'updated' },
        ],
        removedItems: [],
        dirty: true,
      });
    });
  });
  describe('reset', () => {
    it('should reset created / updated / removed items', async () => {
      const { genData, fireCreate, fireUpdate, fireRemove, fireReset } =
        await render(
          <TestItemCollection
            initial={[
              { name: 'original', value: 'original' },
              { name: 'original2', value: 'original2' },
            ]}
            createItems={[{ name: 'foo', value: 'foo' }]}
            updateCommands={[[0, 'value', 'updated']]}
            removeIndexes={[1]}
          />
        );
      await fireCreate();
      await fireUpdate();
      await fireRemove();
      await fireReset();
      const data = await genData();
      expect(data).toEqual({
        items: [
          { name: 'original', value: 'original' },
          { name: 'original2', value: 'original2' },
        ],
        createdItems: [],
        updatedItems: [],
        removedItems: [],
        dirty: false,
      });
    });
  });
  describe('generic', () => {
    type DifferentItem = {
      foo: string;
      bar: number;
      baz: boolean;
    };
    type DifferentProps = {
      initial?: DifferentItem[];
      createItems?: DifferentItem[];
      removeIndexes?: number[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateCommands?: [number, keyof DifferentItem, any][];
    };
    const TestDifferentItemCollection = ({
      initial = [],
      createItems = [],
      updateCommands = [],
      removeIndexes = [],
    }: DifferentProps) => {
      const {
        create,
        remove,
        update,
        reset,
        items,
        dirty,
        createdItems,
        updatedItems,
        removedItems,
      } = useCollection<DifferentItem>(initial);
      const handleCreate = useCallback(
        () => create(createItems),
        [createItems, create]
      );
      const handleUpdate = useCallback(
        () => updateCommands.forEach((command) => update(...command)),
        [updateCommands, update]
      );
      const handleRemove = useCallback(
        () => removeIndexes.forEach((i) => remove(i)),
        [removeIndexes, remove]
      );
      const handleReset = useCallback(() => reset(), [reset]);
      return (
        <>
          <div data-testid="data">
            {JSON.stringify({
              items,
              createdItems,
              updatedItems,
              removedItems,
              dirty,
            })}
          </div>
          <button type="submit" data-testid="create" onClick={handleCreate}>
            create
          </button>
          <button type="submit" data-testid="update" onClick={handleUpdate}>
            update
          </button>
          <button type="submit" data-testid="remove" onClick={handleRemove}>
            remove
          </button>
          <button type="submit" data-testid="reset" onClick={handleReset}>
            reset
          </button>
        </>
      );
    };

    it('should work with different item type', async () => {
      const { genData, fireCreate, fireUpdate, fireRemove, fireReset } =
        await render(
          <TestDifferentItemCollection
            initial={[
              { foo: 'hello', bar: 1, baz: true },
              { foo: 'world', bar: 2, baz: false },
            ]}
            createItems={[{ foo: 'created', bar: 3, baz: true }]}
            updateCommands={[
              [0, 'bar', 4],
              [2, 'baz', false],
            ]}
            // remove the 3rd item and then 2nd item
            removeIndexes={[2, 1]}
          />
        );
      const dataOriginal = await genData();
      expect(dataOriginal).toEqual({
        items: [
          { foo: 'hello', bar: 1, baz: true },
          { foo: 'world', bar: 2, baz: false },
        ],
        createdItems: [],
        updatedItems: [],
        removedItems: [],
        dirty: false,
      });

      await fireCreate();
      const dataAfterCreate = await genData();
      expect(dataAfterCreate).toEqual({
        items: [
          { foo: 'hello', bar: 1, baz: true },
          { foo: 'world', bar: 2, baz: false },
          { foo: 'created', bar: 3, baz: true },
        ],
        createdItems: [{ foo: 'created', bar: 3, baz: true }],
        updatedItems: [],
        removedItems: [],
        dirty: true,
      });

      await fireUpdate();
      const dataAfterCreateAndUpdate = await genData();
      expect(dataAfterCreateAndUpdate).toEqual({
        items: [
          { foo: 'hello', bar: 4, baz: true },
          { foo: 'world', bar: 2, baz: false },
          { foo: 'created', bar: 3, baz: false },
        ],
        createdItems: [{ foo: 'created', bar: 3, baz: false }],
        updatedItems: [{ foo: 'hello', bar: 4, baz: true }],
        removedItems: [],
        dirty: true,
      });

      await fireRemove();
      const dataAfterCreateAndUpdateAndRemove = await genData();
      expect(dataAfterCreateAndUpdateAndRemove).toEqual({
        items: [{ foo: 'hello', bar: 4, baz: true }],
        createdItems: [],
        updatedItems: [{ foo: 'hello', bar: 4, baz: true }],
        removedItems: [{ foo: 'world', bar: 2, baz: false }],
        dirty: true,
      });

      await fireReset();
      const dataAfterReset = await genData();
      expect(dataAfterReset).toEqual({
        items: [
          { foo: 'hello', bar: 1, baz: true },
          { foo: 'world', bar: 2, baz: false },
        ],
        createdItems: [],
        updatedItems: [],
        removedItems: [],
        dirty: false,
      });
    });
  });
});
