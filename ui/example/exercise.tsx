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
}

export type Container = {
  id: UniqueIdentifier;
  items: Word[];
};

const duoContainers: Container[] = [
  {
    id: `container-${v4()}`,
    items:
      [
        {
          id: `item-${v4()}`,
          word: `Item 1`,
        },
        {
          id: `item-${v4()}`,
          word: `Item 2`,
        },
      ],
  },
  {
    id: `container-${v4()}`,
    items:
      [
        {
          id: `item-${v4()}`,
          word: `Item 3`,
        }, {
        id: `item-${v4()}`,
        word: `Item 4`,
      }, {
        id: `item-${v4()}`,
        word: `Item 5`,
      }, {
        id: `item-${v4()}`,
        word: `Item 6`,
      }, {
        id: `item-${v4()}`,
        word: `Item 7`,
      }, {
        id: `item-${v4()}`,
        word: `Item 8`,
      },
        {
          id: `item-${v4()}`,
          word: `Item 9`,
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
  function findValueOfItems(id: UniqueIdentifier | undefined, type: string): Container | undefined {
    if (type === 'container') {
      return containers.find((container: Container) => container.id === id);
    }
    if (type === 'item') {
      return containers.find((container: Container) =>
        container.items.find((item: Word) => item.id === id),
      );
    }
  }
  
  const findWord = (id: UniqueIdentifier | undefined) => {
    const container = findValueOfItems(id, 'item');
    if (!container) return '';
    const item = container.items.find((item) => item.id === id);
    if (!item) return '';
    return item.word;
  };
  
  // event handlers
  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active?.id);
  };
  const onDragMove = (event: DragMoveEvent) => {
    const {active, over} = event;
    
    // Handle Items Sorting
    if (
      active.id.toString().includes('item') &&
      over?.id.toString().includes('item') &&
      active &&
      over &&
      active.id !== over.id
    ) {
      // Find the active container and over container
      const activeContainer = findValueOfItems(active.id, 'item');
      const overContainer = findValueOfItems(over.id, 'item');
      
      // If the active or over container is not found, return
      if (!activeContainer || !overContainer) return;
      
      // Find the index of the active and over container
      const activeContainerIndex = containers.findIndex(
        (container) => container.id === activeContainer.id,
      );
      const overContainerIndex = containers.findIndex(
        (container) => container.id === overContainer.id,
      );
      
      // Find the index of the active and over item
      const activeitemIndex = activeContainer.items.findIndex(
        (item) => item.id === active.id,
      );
      const overitemIndex = overContainer.items.findIndex(
        (item) => item.id === over.id,
      );
      // In the same container
      if (activeContainerIndex === overContainerIndex) {
        let newItems = [...containers];
        newItems[activeContainerIndex].items = arrayMove(
          newItems[activeContainerIndex].items,
          activeitemIndex,
          overitemIndex,
        );
        
        setContainers(newItems);
      } else {
        // In different containers
        let newItems = [...containers];
        const [removeditem] = newItems[activeContainerIndex].items.splice(
          activeitemIndex,
          1,
        );
        newItems[overContainerIndex].items.splice(
          overitemIndex,
          0,
          removeditem,
        );
        setContainers(newItems);
      }
    }
    
    // Handling Item Drop Into a Container
    if (
      active.id.toString().includes('item') &&
      over?.id.toString().includes('container') &&
      active &&
      over &&
      active.id !== over.id
    ) {
      // Find the active and over container
      const activeContainer = findValueOfItems(active.id, 'item');
      const overContainer = findValueOfItems(over.id, 'container');
      
      // If the active or over container is not found, return
      if (!activeContainer || !overContainer) return;
      
      // Find the index of the active and over container
      const activeContainerIndex = containers.findIndex(
        (container) => container.id === activeContainer.id,
      );
      const overContainerIndex = containers.findIndex(
        (container) => container.id === overContainer.id,
      );
      
      // Find the index of the active and over item
      const activeitemIndex = activeContainer.items.findIndex(
        (item) => item.id === active.id,
      );
      
      // Remove the active item from the active container and add it to the over container
      let newItems = [...containers];
      const [removeditem] = newItems[activeContainerIndex].items.splice(
        activeitemIndex,
        1,
      );
      newItems[overContainerIndex].items.push(removeditem);
      setContainers(newItems);
    }
  };
  const onDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    // console.log(active.id, over?.id);
    // if (over && active.id !== over.id) {
    //   setAnswers((answers) => {
    //     let oldIndex = answers.findIndex(answer => answer.id === active.id);
    //     let newIndex = answers.findIndex(answer => answer.id === over?.id);
    //
    //     return arrayMove(answers, oldIndex, newIndex);
    //   });
    // }
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
        
        <Answers container={containers[0]}/>
        
        <WordBank container={containers[1]}/>
        
        <DragOverlay>
          {activeId && activeId.toString().includes('item') && (
            <Item
              // id={activeId}
              value={findWord(activeId)}/>
          )}
        </DragOverlay>
      </div>
    </DndContext>
  );
}




