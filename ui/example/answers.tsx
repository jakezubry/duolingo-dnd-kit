'use client'
// answers
import {horizontalListSortingStrategy, rectSortingStrategy, SortableContext, useSortable} from "@dnd-kit/sortable";
import {UniqueIdentifier, useDroppable} from "@dnd-kit/core";
import {forwardRef, memo, ReactNode} from "react";
import {CSS} from "@dnd-kit/utilities";
import {Container, Word} from "@/ui/example/exercise";
import {Item} from "@/ui/example/item";

export function Answers({container}: { container: Container}) {
  return (
    <SortableContext
      items={container.items}
      strategy={horizontalListSortingStrategy}>
      <div className="relative border border-blue-900">
        {/* lines */}
        <div className="overflow-hidden h-full w-full absolute">
          <div className="w-full h-16 border-t-2 border-zinc-300"></div>
          <div className="w-full h-16 border-t-2 border-zinc-300"></div>
          <div className="w-full h-16 border-t-2 border-zinc-300"></div>
          <div className="w-full h-16 border-t-2 border-zinc-300"></div>
          <div className="w-full h-16 border-t-2 border-zinc-300"></div>
        </div>
        {/*  draggable items */}
        <div className="flex w-full border-zinc-300 min-h-16">
          <DroppableContainer
            id={container.id}
            items={container.items}>
            {container.items.map((item) => {
              return <SortableItem key={item.id} value={item.word} id={item.id}/>;
            })}
          </DroppableContainer>
        </div>
      </div>
    </SortableContext>
  )
}


export function DroppableContainer({id, children}: {
  id: UniqueIdentifier,
  children?: ReactNode,
  items: Word[]
}) {
  const {over, isOver, setNodeRef} = useDroppable({
    id, // answers-xxx-xxx-xxx-xxx...
    data: {type: "container"}
  })
  return (
    <div
      ref={setNodeRef}
      className="flex gap-4 py-2 h-full w-full flex-wrap"
    >
      {children ? (
        children
      ) : (
        <div className="h-full w-full flex">
          &nbsp;
        </div>
      )}
    </div>
  )
}

export const SORTABLE_TRANSITION_DURATION = 250;
export default function SortableItem({id, value}: { id: UniqueIdentifier, value: string }) {
  const {
    setNodeRef,
    listeners,
    isDragging,
    transform,
    transition
  } = useSortable({
    id: `item-${id}`,
    data: {type: "item"},
    transition: {
      duration: SORTABLE_TRANSITION_DURATION,
      easing: "ease"
    }
  });
  
  return (
    <Item
      dragOverlay={false}
      ref={setNodeRef}
      value={value}
      dragging={isDragging}
      transition={transition}
      transform={transform}
      listeners={listeners}
    />
  );
}
