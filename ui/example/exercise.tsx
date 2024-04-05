'use client'
import {
  closestCenter, closestCorners,
  DndContext,
  DragEndEvent, DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
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
          isItemInBank: false,
        },
        {
          id: `${v4()}`,
          word: `Item 8`,
          isItemInBank: false,
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
    if (type === 'answers' || type === "wordbank") {
      return containers.find((container: Container) => container.id === id);
    }
    
    if (type === 'item') {
      // replaces "item-" to "" to compare ids like "item-xxx-xxx-xxx-xxx" to "xxx-xxx-xxx-xxx"
      const itemId = id.toString().replace("item-", "");
      return containers.find((container: Container) =>
        container.items.find((item: Word) => item.id === itemId),
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
  const onDragMove = (event: DragMoveEvent) => {
    const {active, over} = event;
    console.log(active.id, over?.id);
    if (over) {
      // Adding item to the Answers
      if (over.id.toString().includes("answers")) {
        // Find the active container and over container
        const activeContainer = findValueOfItems(active.id, 'item');
        const overContainer = findValueOfItems(over.id, 'answers');
        // If the active or over container is not found, return
        if (!activeContainer || !overContainer) return;
        
        // Find the index of the active and over item
        const activeItemIndex = activeContainer.items.findIndex(
          (item) => item.id === active.id.toString().replace("item-", ""),
        );
        console.log(activeItemIndex, active.id)
        const answersContainerIndex = 0;
        const wordbankContainerIndex = 1;
        const newItems = [...containers];
        const item = newItems[wordbankContainerIndex].items[activeItemIndex];
        // remove item from wordbank
        item.isItemInBank = false;
        // add item to the answers if it's not there
        if (!newItems[answersContainerIndex].items.includes(item)) {
          console.log("adding", item);
          newItems[answersContainerIndex].items.push(item);
          setContainers(newItems);
        }
        return;
      }
      // Returning items to its initial position
      // if (over.id.toString().includes("answers"))
      
    }
    
    
    // // Handle Items Sorting
    // if (
    //   active.id.toString().includes('item') &&
    //   over?.id.toString().includes('item') &&
    //   !over?.id?.toString().includes('droppable') &&
    //   active &&
    //   over &&
    //   active.id !== over.id
    // ) {
    //   console.log("handle item sorting")
    //   // Find the active container and over container
    //   const activeContainer = findValueOfItems(active.id, 'item');
    //   const overContainer = findValueOfItems(over.id, 'item');
    //
    //   // If the active or over container is not found, return
    //   if (!activeContainer || !overContainer) return;
    //
    //   // Find the index of the active and over container
    //   const activeContainerIndex = containers.findIndex(
    //     (container) => container.id === activeContainer.id,
    //   );
    //   const overContainerIndex = containers.findIndex(
    //     (container) => container.id === overContainer.id,
    //   );
    //
    //   // Find the index of the active and over item
    //   const activeItemIndex = activeContainer.items.findIndex(
    //     (item) => item.id === active.id,
    //   );
    //   const overitemIndex = overContainer.items.findIndex(
    //     (item) => item.id === over.id,
    //   );
    //   // In the same container
    //   if (activeContainerIndex === overContainerIndex) {
    //     let newItems = [...containers];
    //     newItems[activeContainerIndex].items = arrayMove(
    //       newItems[activeContainerIndex].items,
    //       activeItemIndex,
    //       overitemIndex,
    //     );
    //
    //     setContainers(newItems);
    //   } else {
    //     // In different containers
    //     let newItems = [...containers];
    //     const [removedItem] = newItems[activeContainerIndex].items.splice(
    //       activeItemIndex,
    //       1,
    //     );
    //     newItems[overContainerIndex].items.splice(
    //       overitemIndex,
    //       0,
    //       removedItem,
    //     );
    //     setContainers(newItems);
    //   }
    // }
  
  };
  const onDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    
  };
  
  const onDragCancel = () => {
    setActiveId(null);
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  return (
    <DndContext
      autoScroll={false}
      id={dndContextId}
      sensors={sensors}
      // collisionDetection={rectangleIntersection} is set by default
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="flex flex-col gap-2">
        
        <Answers container={{...containers[0]}}/>
        <WordBank container={{...containers[1]}}/>
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




