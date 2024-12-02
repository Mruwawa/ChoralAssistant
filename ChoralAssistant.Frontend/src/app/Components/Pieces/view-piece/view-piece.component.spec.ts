// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { ViewPieceComponent } from './view-piece.component';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { of } from 'rxjs';
// import { ActivatedRoute } from '@angular/router';

// (globalThis as any).import = {
//   meta: {
//     env: {
//       NG_APP_GOOGLE_CLIENT_ID: 'mock-google-client-id',
//       // Add other environment variables as needed
//     }
//   }
// };

// describe('ViewPieceComponent', () => {
//   let component: ViewPieceComponent;
//   let fixture: ComponentFixture<ViewPieceComponent>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [ViewPieceComponent, HttpClientTestingModule],
//       providers: [
//         {
//           provide: ActivatedRoute,
//           useValue: {
//             params: of({ id: '123' }), // Mock params if needed
//             snapshot: {
//               paramMap: {
//                 get: () => '123' // Mock paramMap.get() if needed
//               }
//             }
//           }
//         }
//       ]
//     })
//     .compileComponents();

//     fixture = TestBed.createComponent(ViewPieceComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   // it('should create', () => {
//   //   expect(component).toBeTruthy();
//   // });
// });
