import { useCallback, useMemo, useState } from 'react';

function notNull<T>(value: T | null): value is T {
  return value !== null;
}

const useCollection = <T>(initial: T[] = []) => {
  const [items, setItems] = useState<T[]>(initial);

  const create = useCallback(
    (itemOrItems: T | T[]) => {
      const createdItems = Array.isArray(itemOrItems)
        ? itemOrItems
        : [itemOrItems];
      setItems((prevItems) => [...prevItems, ...createdItems]);
    },
    [setItems]
  );

  const remove = useCallback(
    (index: number) => {
      setItems((prevItems) => {
        const item = prevItems[index];
        if (!item) {
          throw new Error(`Index: ${index} out of bounds`);
        }
        return prevItems.slice(0, index).concat(prevItems.slice(index + 1));
      });
    },
    [setItems]
  );

  const update = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (index: number, key: keyof T, value: any) => {
      setItems((prevItems) => {
        const prevItem = prevItems[index];
        if (!prevItem) {
          throw new Error(`Index: ${index} out of bounds`);
        }
        return prevItems
          .slice(0, index)
          .concat({ ...prevItem, [key]: value }, prevItems.slice(index + 1));
      });
    },
    [setItems]
  );

  const reset = useCallback(() => {
    setItems(initial);
  }, [initial, setItems]);

  const createdItems = items.slice(initial.length);
  const updatedItems = initial
    .map((initialItem, index) =>
      items[index] && initialItem !== items[index] ? items[index] : null
    )
    .filter(notNull);
  const removedItems = initial.filter(
    (initialItem, index) => initialItem && !items[index]
  );
  const dirty =
    createdItems.length > 0 ||
    updatedItems.length > 0 ||
    removedItems.length > 0;

  return useMemo(
    () => ({
      create,
      remove,
      update,
      reset,
      items,
      createdItems,
      updatedItems,
      removedItems,
      dirty,
    }),
    [
      create,
      remove,
      update,
      reset,
      items,
      createdItems,
      updatedItems,
      removedItems,
      dirty,
    ]
  );
};

export default useCollection;
