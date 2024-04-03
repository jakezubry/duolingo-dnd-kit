'use client'
import {
  closestCenter,
  DndContext, DragOverlay, DragStartEvent, KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy, rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable
} from '@dnd-kit/sortable';
import {forwardRef, memo, ReactNode, useId, useState} from "react";
import {SiTeratail} from "react-icons/si";
import {CSS} from "@dnd-kit/utilities";


export function Exercise() {
  const [items, setItems] = useState(["word1", "word2"]);
  const [answers, setAnswers] = useState(["answer1", "answer2", "answer3", "answer4", "answer5", "answer6", "answer7", "answer8", "answer9", "answer10",]);
  const [activeId, setActiveId] = useState<any>(null);
  
  
  // find the blank/droppableContainer that an item is in
  const onDragStart = (event: DragStartEvent) => {
    console.log(event.active.id);
    setActiveId(event.active.id);
  };
  
  const onDragEnd = ({active, over}) => {
    if (active.id !== over.id) {
      setAnswers((answers) => {
        const oldIndex = answers.findIndex(answer => answer === active.id);
        const newIndex = answers.findIndex(answer => answer === over.id);
        
        return arrayMove(answers, oldIndex, newIndex);
      });
    }
  };
  
  const onDragCancel = () => {
    // setActiveId(null);
  };
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const dndContextId = useId();
  return (
    <DndContext
      id={dndContextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
      onDragCancel={onDragCancel}
    >
      <div className="flex flex-col gap-2">
        {/* answers droppable */}
        <Answers items={answers} taskId={"TASK-ID"}/>
        <DragOverlay>
          {activeId && (
            <>
              {/*<Global styles={{ body: { cursor: "grabbing" } }} />*/}
              <Item value={activeId} dragOverlay/>
            </>
          )}
        </DragOverlay>
        {/* choice droppable */}
        <Choice id={1} words={items}/>
      </div>
    </DndContext>
  );
}


// answers
export function Answers({items, taskId}: { items: any[], taskId: string }) {
  return (
    <SortableContext
      items={items}
      strategy={rectSortingStrategy}>
      <div className="relative">
        <div className="overflow-hidden h-full w-full absolute">
          <div className="w-full h-16 border-t-2 border-zinc-300"></div>
          <div className="w-full h-16 border-t-2 border-zinc-300"></div>
          <div className="w-full h-16 border-t-2 border-zinc-300"></div>
          <div className="w-full h-16 border-t-2 border-zinc-300"></div>
          <div className="w-full h-16 border-t-2 border-zinc-300"></div>
        </div>
        <div className="flex w-full border-zinc-300 min-h-16">
          {/*  draggable items */}
          <DroppableContainer
            taskId={"DND-1"}
            id={"ANSWER"}
            items={items}>
            {items.map((value) => {
              return <SortableItem key={value} id={value} taskId={"DND-1"}/>;
            })}
          </DroppableContainer>
        </div>
      </div>
    </SortableContext>
  )
}


export function DroppableContainer({id, children, items, taskId}: {
  id: string,
  children?: ReactNode,
  items: any[],
  taskId: string
}) {
  const {over, isOver, setNodeRef} = useDroppable({
    id
  })
  return (
    <div
      ref={setNodeRef}
      className="flex gap-4 py-2 max-w-full flex-wrap"
      // style={{
      //   display: "flex",
      //   gap: "10px",
      //   // gridAutoRows: "max-content",
      //   // gridTemplateColumns: "repeat(2, 1fr)",
      //   // gridGap: "10px",
      //   border: "none",
      //   margin: "0",
      // }}
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

const SORTABLE_TRANSITION_DURATION = 250;
export default function SortableItem({id, taskId, isCorrect}: { id: string, taskId: string, isCorrect?: boolean }) {
  const {
    setNodeRef,
    listeners,
    isDragging,
    transform,
    transition
  } = useSortable({
    id,
    transition: {
      duration: SORTABLE_TRANSITION_DURATION,
      easing: "ease"
    }
  });
  
  return (
    <Item
      dragOverlay={false}
      ref={setNodeRef}
      taskId={taskId}
      value={id}
      dragging={isDragging}
      transition={transition}
      transform={transform}
      listeners={listeners}
      isCorrect={isCorrect}
    />
  );
}

const boxShadowBorder =
  "0 0 0 calc(1px / var(--scale-x, 1)) rgba(63, 63, 68, 0.05)";
const boxShadowCommon =
  "0 1px calc(3px / var(--scale-x, 1)) 0 rgba(34, 33, 81, 0.15)";
const boxShadow = `${boxShadowBorder}, ${boxShadowCommon}`;

const wrapperDragOverlay = (dragOverlay: boolean | undefined) =>
  dragOverlay
    ? {
      "--scale": 1.05,
      "--box-shadow": boxShadow,
      "--box-shadow-picked-up": {
        "--box-shadow-picked-up": [
          boxShadowBorder,
          "-1px 0 15px 0 rgba(34, 33, 81, 0.01)",
          "0px 15px 15px 0 rgba(34, 33, 81, 0.25)"
        ].toString()
      },
      zIndex: 999
    }
    : {};

const popKeyframes = `
  @keyframes pop {
    from {
      transform: scale(1);
      box-shadow: var(--box-shadow);
    }
    to {
      transform: scale(var(--scale));
      box-shadow: var(--box-shadow-picked-up);
    }
  }
`;

function getItemStyles({dragging, dragOverlay}: { dragging: boolean | undefined, dragOverlay: boolean | undefined }) {
  if (dragOverlay) {
    return {
      cursor: "inherit",
      animation: `${popKeyframes} 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)`,
      transform: "scale(var(--scale))",
      boxShadow: "var(--box-shadow-picked-up)",
      opacity: 1
    };
  }
  
  if (dragging) {
    return {
      opacity: "var(--dragging-opacity, 0.25)",
      zIndex: 0,
      
      "&:focus": {
        boxShadow
      }
    };
  }
}

type Ref = HTMLButtonElement;

interface Props {
  taskId?: string,
  dragging?: boolean
  listeners?: any,
  transition?: string,
  transform?: any,
  value: string,
  dragOverlay?: boolean,
  isCorrect?: boolean
  style?: any
}

export const Item = memo(
  forwardRef<Ref, Props>(
    (
      {
        taskId,
        dragOverlay,
        dragging,
        listeners,
        transition,
        transform,
        value,
        isCorrect,
        style,
        ...props
      },
      ref
    ) => {
      const isDisplayingAlertIcon = typeof isCorrect === "boolean";
      
      return (
        // <button
        //   ref={setNodeRef} style={style} {...listeners} {...attributes}
        //   className="flex items-center justify-center px-4 py-1 text-zinc-700 font-normal text-lg min-h-14 rounded-xl border border-b-4 border-zinc-300 bg-white">
        //   <span>{word}</span>
        // </button>
        <button
          ref={ref}
          style={{
            transform: CSS.Transform.toString(transform),
            transition,
            touchAction: "manipulation",
            ...wrapperDragOverlay(dragOverlay),
            height: 8
          }}
          className={"flex md:h-12 min-h-12 items-center justify-center text-zinc-700 font-normal text-base rounded-xl border border-b-4 border-zinc-300 bg-white"}
        >
          <div
            className="relative flex grow items-center justify-between text-zinc-900 px-3 whitespace-nowrap rounded-sm cursor-grab"
            style={{
              WebkitTapHighlightColor: "transparent", // for mobile
              
              // only show focus outline when using keyboard
              "&:focusVisible": {
                boxShadow: "outline",
                touchAction: "none",
                userSelect: "none",
                WebkitUserSelect: "none"
              },
              
              ...getItemStyles({dragging, dragOverlay}),
              ...style
            }}
            {...listeners}
            {...props}
            tabIndex={0}>
            {value}
          </div>
        
        </button>
      );
    }
  )
);

Item.displayName = "Item";

// word bank

export function Sortable({children, word}: { children?: ReactNode, word: string }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({id: word});
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <button
      ref={setNodeRef} style={style} {...listeners} {...attributes}
      className="flex items-center justify-center px-4 py-1 text-zinc-700 font-normal text-lg min-h-14 rounded-xl border border-b-4 border-zinc-300 bg-white">
      <span>{word}</span>
    </button>
  )
}

export function Choice({id, words}: { id: number, words: string[] }) {
  const {setNodeRef} = useDroppable({id});
  
  return (
    <SortableContext
      items={words}
      strategy={horizontalListSortingStrategy}
    >
      <div className="flex items-center justify-center w-full gap-2 flex-wrap" ref={setNodeRef}>
        {/* word that I will wrap as the draggable */}
        {
          words.map((word) => {
            return <Sortable key={word} word={word}/>
          })
        }
      </div>
    </SortableContext>
  )
}

export function Droppable({children, id}: { children?: ReactNode, id: string }) {
  const {isOver, setNodeRef} = useDroppable({
    id: id
  })
  return (
    <div ref={setNodeRef} style={isOver ? {color: 'green'} : undefined}
         className="w-full h-full">
      {children}
    </div>
  )
}

export function MessageSvg() {
  return (
    // <SiTeratail className="text-gray-500 -mr-0.5 bg-white" style={{rotate:"-90deg"}}/>
    <svg height="20" viewBox="0 0 18 20" width="18">
      <path className="text-white fill-white"
            d="M2.00358 19.0909H18V0.909058L0.624575 15.9561C-0.682507 17.088 0.198558 19.0909 2.00358 19.0909Z"></path>
      <path className="fill-zinc-200" clipRule="evenodd"
            d="M18 2.48935V0L0.83037 15.6255C-0.943477 17.2398 0.312833 20 2.82143 20H18V18.2916H16.1228H2.82143C1.98523 18.2916 1.56646 17.3716 2.15774 16.8335L16.1228 4.12436L18 2.48935Z"
            fillRule="evenodd"></path>
    </svg>
  )
}

