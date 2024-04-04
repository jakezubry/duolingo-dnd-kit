// word bank
import {Container, Word} from "@/ui/example/exercise";
import {UniqueIdentifier, useDraggable, useDroppable} from "@dnd-kit/core";
import {Item} from "@/ui/example/item";
import {v4} from "uuid";

export function WordBank({container}: { container: Container }) {
  const {setNodeRef} = useDroppable({
    id: container.id,
    data: {type: "container"}
  });
  return (
    <div
      ref={setNodeRef}
      className="border border-purple-900 flex min-h-16">
      {container.items.map((item) => {
        return (
          <DroppableWord key={item.id} id={item.id} word={item.word}/>
        );
      })}
    </div>
  )
}

export function DroppableWord({id, word}: { id: UniqueIdentifier, word: string }) {
  const {setNodeRef} = useDroppable({id: `droppable-${id}`});
  return (
    <div className="bg-zinc-300 w-fit h-fit rounded-xl p-2" ref={setNodeRef}>
      <DraggableWord id={id} word={word}/>
    </div>
  )
}

export function DraggableWord({id, word}: { id: UniqueIdentifier, word: string }) {
  const {setNodeRef, attributes, listeners, transform, isDragging} = useDraggable({
    id,
    data: {type: "item"}
  })
  return (
    <Item
      dragOverlay={false}
      ref={setNodeRef}
      value={word}
      dragging={isDragging}
      transform={transform}
      listeners={listeners}
    />
  )
}

