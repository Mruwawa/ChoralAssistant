import { CanDeactivateFn } from '@angular/router';
import { ViewPieceComponent } from '../Components/Pieces/view-piece/view-piece.component';

export const saveDrawingGuard: CanDeactivateFn<ViewPieceComponent> = (component, currentRoute, currentState, nextState) => {
  return component.canDeactivate ? component.canDeactivate() : true;
};
