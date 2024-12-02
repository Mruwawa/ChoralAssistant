import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanDeactivateFn, RouterStateSnapshot } from '@angular/router';
import { saveDrawingGuard } from './save-drawing.guard';
import { ViewPieceComponent } from '../Components/Pieces/view-piece/view-piece.component';

describe('saveDrawingGuard', () => {
  let guard: CanDeactivateFn<ViewPieceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = saveDrawingGuard;
  });

  it('should allow deactivation if canDeactivate is not defined', () => {
    const component = {} as ViewPieceComponent;
    const mockActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const mockRouterStateSnapshot = {} as RouterStateSnapshot;
    const result = guard(component, mockActivatedRouteSnapshot, mockRouterStateSnapshot, {} as RouterStateSnapshot);
    expect(result).toBe(true);
  });

  it('should call canDeactivate and return its result', () => {
    const component = {
      canDeactivate: jasmine.createSpy().and.returnValue(false)
    } as unknown as ViewPieceComponent;

    const mockActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const mockRouterStateSnapshot = {} as RouterStateSnapshot;
    const result = guard(component, mockActivatedRouteSnapshot, mockRouterStateSnapshot, {} as RouterStateSnapshot);
    expect(component.canDeactivate).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should return true if canDeactivate returns true', () => {
    const component = {
      canDeactivate: jasmine.createSpy().and.returnValue(true)
    } as unknown as ViewPieceComponent;

    const mockActivatedRouteSnapshot = {} as ActivatedRouteSnapshot;
    const mockRouterStateSnapshot = {} as RouterStateSnapshot;
    const result = guard(component, mockActivatedRouteSnapshot, mockRouterStateSnapshot, {} as RouterStateSnapshot);
    expect(component.canDeactivate).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});