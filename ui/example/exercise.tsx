'use client'
import {
  closestCenter, closestCorners,
  DndContext,
  DragEndEvent, DragMoveEvent, DragOverEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor, Sensor, TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {arrayMove, sortableKeyboardCoordinates} from '@dnd-kit/sortable';
import {useId, useState} from "react";
import SortableItem, {Answers} from "@/ui/example/answers";
import {Item} from "@/ui/example/item";
import {v4} from "uuid";
import {WordBank} from "@/ui/example/word-bank";
import {customCollisionDetectionAlgorithm} from "@/ui/example/customCollisionDetection";

// data
export type Word = {
  id: UniqueIdentifier;
  word: string;
  isItemInBank: boolean;
}

export type Container = {
  id: UniqueIdentifier;
  items: Word[];
};

const duoContainers: Container[] = [
  {
    id: `answers-${v4()}`,
    items:
      [],
  },
  {
    id: `wordbank-${v4()}`,
    items:
      [
        {
          id: `${v4()}`,
          word: `Item 1`,
          isItemInBank: true,
        },
        {
          id: `${v4()}`,
          word: `Item 2`,
          isItemInBank: true,
        },
        {
          id: `${v4()}`,
          word: `Item 3`,
          isItemInBank: true,
        },
        {
          id: `${v4()}`,
          word: `Item 4`,
          isItemInBank: true,
        },
        {
          id: `${v4()}`,
          word: `Item 5`,
          isItemInBank: true,
        },
        {
          id: `${v4()}`,
          word: `Item 6`,
          isItemInBank: true,
        },
        {
          id: `${v4()}`,
          word: `Item 7`,
          isItemInBank: true,
        },
        {
          id: `${v4()}`,
          word: `Item 8`,
          isItemInBank: true,
        },
        {
          id: `${v4()}`,
          word: `Item 9`,
          isItemInBank: true,
        },
      ],
  }
]

// main component
export function Exercise() {
  const dndContextId = useId();
  const [containers, setContainers] = useState<Container[]>(duoContainers);
  const [activeId, setActiveId] =
    useState<UniqueIdentifier | null>(null);
  
  // helpers
  function findValueOfItems(id: UniqueIdentifier, type: string): Container | undefined {
    if (type === 'container') {
      return containers.find((container: Container) => container.id === id);
    }
    if (type === 'item' || 'droppable') {
      // replacing "item-" to "" to compare ids like "item-xxx-xxx-xxx-xxx" to "xxx-xxx-xxx-xxx"
      const itemId = id.toString().replace(`${type}-`, "");
      return containers.find((container: Container) => {
          // if it's droppable, preventing looking for the item in the answers container
          if (type === 'droppable' && container.id.toString().includes("answers")) return false
          return container.items.find((item: Word) => item.id === itemId)
        }
      );
    }
  }
  
  const findWord = (id: UniqueIdentifier) => {
    // return "word"
    const container = findValueOfItems(id, 'item');
    if (!container) return '';
    const itemId = id.toString().replace("item-", "");
    const item = container.items.find((item) => item.id === itemId);
    if (!item) return '';
    return item.word;
  };
  
  // event handlers
  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active?.id);
  };
  const onDragOver = (event: DragOverEvent) => {
    const {active, over} = event;
    if (over && active) {
      // Find the active item and over container
      const activeContainer = findValueOfItems(active.id, 'item'); // active.id is always an item as we don't drag containers
      let overContainer = findValueOfItems(over.id, 'container'); // doesn't matter if it's answer or wordbank, they are type of container
      
      // If the over container is null, maybe it's droppable
      if (!overContainer) overContainer = findValueOfItems(over.id, 'droppable')
      // if it's not droppable, then it's over item
      const overItem = findValueOfItems(over.id, 'item');
      
      // Handle items sorting
      if (overItem && activeContainer && active.id !== over.id) {
        // Find the index of the active and over item
        const activeItemIndex = activeContainer.items.findIndex(
          (item) => item.id === active.id.toString().replace("item-", ""),
        );
        const overItemIndex = activeContainer.items.findIndex(
          (item) => item.id === over.id.toString().replace("item-", ""),
        );
        
        let newItems = JSON.parse(JSON.stringify(containers)); // copy array with objects
        const answerContainerIndex = 0;
        // Swap the items
        newItems[answerContainerIndex].items = arrayMove(
          newItems[answerContainerIndex].items,
          activeItemIndex,
          overItemIndex,
        );
        setContainers(newItems);
      }
      
      // If the active or over container is not found or overItem is found, return
      if (!activeContainer || !overContainer || overItem) return;
      // Adding item to the Answers from Wordbank
      if (overContainer.id.toString().includes("answers") && activeContainer?.id.toString().includes("wordbank")) {
        
        
        // Find the index of the active and over item
        const activeItemIndex = activeContainer.items.findIndex(
          (item) => item.id === active.id.toString().replace("item-", ""),
        );
        const answersContainerIndex = 0;
        const wordbankContainerIndex = 1;
        const newItems = JSON.parse(JSON.stringify(containers))
        const item = newItems[wordbankContainerIndex].items[activeItemIndex];
        // remove item from wordbank
        item.isItemInBank = false;
        // adding item to the answers if it's not there
        if (!newItems[answersContainerIndex].items.includes(item)) {
          newItems[answersContainerIndex].items.push(item);
          setContainers(newItems);
        }
        return;
      }
      // Dropping item inside Wordbank from Answers
      if (activeContainer.id.toString().includes("answers") &&
        overContainer.id.toString().includes("wordbank")) {
        
        // Find the index of the active and over item
        const activeItemIndex = activeContainer.items.findIndex(
          (item) => item.id === active.id.toString().replace("item-", ""),
        );
        const overItemIndex = overContainer.items.findIndex(
          (item) => item.id === active.id.toString().replace("item-", ""),
        );
        const answersContainerIndex = 0;
        const wordbankContainerIndex = 1;
        let newItems = JSON.parse(JSON.stringify(containers));
        // Deleting the item from Answers
        const [item] = newItems[answersContainerIndex].items.splice(activeItemIndex, 1);
        // Changing isInBank property of the item
        newItems[wordbankContainerIndex].items[overItemIndex].isItemInBank = true;
        // Updating the state
        setContainers(newItems);
      }
    }
  };
  const onDragEnd = (event: DragEndEvent) => {
    onDragOver(event);
  };
  
  const onDragCancel = () => {
    setActiveId(null);
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 2,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        distance: 2,
      },
    })
  )
  
  function handleItemClick(id: UniqueIdentifier) {
    const container = findValueOfItems(id, 'item');
    if (!container) return
    const answersContainerIndex = 0;
    const wordbankContainerIndex = 1;
    if (container.id.toString().includes("answers")) {
      // move from answers to word bank
      let newItems: Container[] = JSON.parse(JSON.stringify(containers));
      let wordBankContainer:Container = newItems[wordbankContainerIndex];
      const answersItemIndex = container.items.findIndex(
        (item) => item.id === id.toString().replace("item-", ""),
      );
      const wordBankItemIndex = wordBankContainer.items.findIndex(
        (item: Word) => item.id === id.toString().replace("item-", ""),
      );
      const [item] = newItems[answersContainerIndex].items.splice(answersItemIndex, 1);
      newItems[wordbankContainerIndex].items[wordBankItemIndex].isItemInBank = true;
      setContainers(newItems)
    } else {
      // move from word bank to answers
      let newItems: Container[] = JSON.parse(JSON.stringify(containers));
      const wordBankItemIndex = container.items.findIndex(
        (item: Word) => item.id === id.toString().replace("item-", ""),
      );
      newItems[wordbankContainerIndex].items[wordBankItemIndex].isItemInBank = false;
      newItems[answersContainerIndex].items.push(newItems[wordbankContainerIndex].items[wordBankItemIndex]);
      setContainers(newItems);
      
    }
  }
  
  return (
    <DndContext
      autoScroll={false}
      id={dndContextId}
      sensors={sensors}
      collisionDetection={customCollisionDetectionAlgorithm}
      onDragStart={onDragStart}
      onDragMove={onDragOver}
      onDragCancel={onDragCancel}
    >
      <div className="flex flex-col gap-4">
        
        <Answers container={{...containers[0]}} handleItemClick={handleItemClick}/>
        <WordBank container={{...containers[1]}} handleItemClick={handleItemClick}/>
        <DragOverlay>
          {activeId && activeId.toString().includes('item') && (
            <Item
              value={findWord(activeId)}/>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}




