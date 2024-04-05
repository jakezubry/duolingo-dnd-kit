import {
  Active, ClientRect,
  Collision,
  DroppableContainer,
  pointerWithin,
  rectIntersection
} from '@dnd-kit/core';
import {Coordinates} from "@dnd-kit/utilities";
import {RectMap} from "@dnd-kit/core/dist/store";

interface Args {
  active: Active,
  collisionRect: ClientRect,
  droppableRects: RectMap,
  droppableContainers: DroppableContainer[],
  pointerCoordinates: Coordinates | null
}

export function customCollisionDetectionAlgorithm(args:Args): Collision[] {
  // Check for pointer collisions first
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  
  // If no pointer collisions, check rectangle intersections
  return rectIntersection(args);
}