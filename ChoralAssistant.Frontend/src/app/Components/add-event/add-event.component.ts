import { Component, importProvidersFrom, inject, signal } from '@angular/core';
import { CalendarService } from '../../Services/calendar.service';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormControl } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatIcon } from '@angular/material/icon';
import { MatSelectionListChange } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { PieceStorageService } from '../../Services/piece-storage.service';

@Component({
  selector: 'app-add-event',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatDatepickerModule, ReactiveFormsModule, MatNativeDateModule, MatChipsModule, MatIcon, MatSelectModule, FormsModule],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.scss'
})
export class AddEventComponent {
  private calendarService = inject(CalendarService);
  private dialogRef: MatDialogRef<AddEventComponent> = inject(MatDialogRef);
  private storageService: PieceStorageService = inject(PieceStorageService);

  title: string = '';
  description: string = '';
  location: string = '';

  errorMessage: string = '';

  readonly range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  availableOptions: { id: string, title: string }[] =
    [
      { id: '827r3gweafyas', title: 'Gloria' },
      { id: '23gtfewrgvf', title: 'Toto Africa' },
      { id: 'c346awe5trdfg', title: 'Alleluia' },
      { id: 'c3sve7yhrdgfsd', title: 'Dulaman' },
    ];

  // Selected options to display as chips
  selectedPieces: { id: string, title: string }[] = [];

  // FormControl for the mat-select
  selectControl = new FormControl();

  readonly keywords = signal(['angular', 'how-to', 'tutorial', 'accessibility']);
  readonly formControl = new FormControl(['angular']);

  ngOnInit() {
    this.storageService.getAllPiecesMinimal().subscribe({
      next: (pieces) => {
        this.availableOptions = pieces;
      },
      error: (error) => {
        console.error(error);
      }
    });
  }


  removeOption(option: { id: string, title: string }): void {
    const index = this.selectedPieces.findIndex(piece => piece.id === option.id);

    if (index >= 0) {
      // Remove the chip
      this.selectedPieces.splice(index, 1);

      // Add the option back to the dropdown
      this.availableOptions.push(option);
    }
  }

  add(event: any): void {
    const value = event.value;

    if (value && !this.selectedPieces.includes(value)) {
      const piece = this.availableOptions.find(opt => opt.id === value.id)!;
      this.selectedPieces.push(piece);
      this.availableOptions = this.availableOptions.filter(opt => opt.id !== piece.id);
      this.selectControl.setValue(null);
    }
  }

  submit() {
    this.errorMessage = '';
    if (!this.validate()) {
      return;
    }

    const startDateValue = this.range.value.start;
    const endDateValue = this.range.value.end;

    const startDate = new Date(startDateValue?.getFullYear()!, startDateValue?.getMonth()!, startDateValue?.getDate()!, 2);
    const endDate = new Date(endDateValue?.getFullYear()!, endDateValue?.getMonth()!, endDateValue?.getDate()!, 2);

    const event = {
      title: this.title,
      description: this.description,
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      location: this.location,
      pieces: this.selectedPieces
    };

    this.calendarService
      .addEvent(event)
      .subscribe({
        next: (response) => {
          this.dialogRef.close({ created: true });
        },
        error: (error) => {
          console.error(error);
        }
      });

  }


  validate(): boolean {
    if (this.title === '') {
      this.errorMessage = 'Nazwa jest wymagana';
      return false;
    }

    if (this.range.value.start === null) {
      this.errorMessage = 'Data rozpoczęcia jest wymagana';
      return false;
    }

    if (this.range.value.end === null) {
      this.errorMessage = 'Data zakończenia jest wymagana';
      return false;
    }

    if (this.range.value.start &&
      this.range.value.end &&
      this.range.value.start > this.range.value.end) {
      this.errorMessage = 'Data zakończenia nie może być wcześniejsza niż data rozpoczęcia';
      return false;
    }
    return true;
  }
}
