import {forwardRef, memo} from "react";
import {CSS} from "@dnd-kit/utilities";
import {UniqueIdentifier} from "@dnd-kit/core";

const boxShadowBorder =
  "0 0 0 calc(1px / var(--scale-x, 1)) rgba(63, 63, 68, 0.05)";
const boxShadowCommon =
  "0 1px calc(3px / var(--scale-x, 1)) 0 rgba(34, 33, 81, 0.15)";
const boxShadow = `${boxShadowBorder}, ${boxShadowCommon}`;

const wrapperDragOverlay = (dragOverlay: boolean | undefined) =>
  dragOverlay
    ? {
      // "--scale": 1,
      // "--box-shadow": boxShadow,
      // "--box-shadow-picked-up": {
      //   "--box-shadow-picked-up": [
      //     boxShadowBorder,
      //     "-1px 0 15px 0 rgba(34, 33, 81, 0.01)",
      //     "0px 15px 15px 0 rgba(34, 33, 81, 0.25)"
      //   ].toString()
      // },
      // zIndex: 999
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
      // cursor: "inherit",
      // animation: `${popKeyframes} 200ms cubic-bezier(0.18, 0.67, 0.6, 1.22)`,
      // transform: "scale(var(--scale))",
      // boxShadow: "var(--box-shadow-picked-up)",
      opacity: 1
    };
  }
  
  if (dragging) {
    return {
      opacity: 0,
      zIndex: 0,
      
      "&:focus": {
        boxShadow
      }
    };
  }
}

type Ref = HTMLButtonElement;

interface Props {
  id:UniqueIdentifier,
  dragging?: boolean
  listeners?: any,
  transition?: string,
  transform?: any,
  value: string | number,
  dragOverlay?: boolean,
  handleItemClick?: any
}

export const Item = memo(
  forwardRef<Ref, Props>(
    (
      {
        id,
        dragOverlay,
        dragging,
        listeners,
        transition,
        transform,
        value,
        handleItemClick,
        ...props
      },
      ref
    ) => {
      const style = {
      //   transform: CSS.Transform.toString(transform),
      //   transition,
      };
      // console.log(CSS.Transform.toString(transform))
      return (
        <button
          ref={ref}
          onClick={() => handleItemClick((`item-${id}`))}
          style={{
            transform: CSS.Transform.toString(transform),
            transition,
            touchAction: "none",
            ...wrapperDragOverlay(dragOverlay),
            height: 8,
            WebkitTapHighlightColor: "transparent", // for mobile
            
            // only show focus outline when using keyboard
            // "&:focusVisible": {
            //   boxShadow: "outline",
            //   touchAction: "none",
            //   userSelect: "none",
            //   WebkitUserSelect: "none"
            // },
            
            ...getItemStyles({dragging, dragOverlay}),
            ...style
          }}
          className={"flex md:h-12 min-h-12 items-center justify-center text-zinc-700 font-normal text-base rounded-xl border border-b-4 border-zinc-300 bg-white"}
        >
          <div
            className="relative flex grow items-center justify-between text-zinc-900 px-3 whitespace-nowrap rounded-sm cursor-grab"
  
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