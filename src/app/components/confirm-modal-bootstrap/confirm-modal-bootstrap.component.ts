import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

declare var bootstrap: any;

@Component({
  selector: 'app-confirm-modal-bootstrap',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './confirm-modal-bootstrap.component.html',
  styleUrls: ['./confirm-modal-bootstrap.component.css']
})
export class ConfirmModalBootstrapComponent {
  @Output() confirmed = new EventEmitter<boolean>();
  password: string = '';

  confirm(): void {
    if (this.password === 'Nico1234') {
      this.confirmed.emit(true);
      this.closeModal();
    } else {
      this.confirmed.emit(false);
    }
  }

  closeModal(): void {
    const modalElement = document.getElementById('confirmModal');
    if (modalElement) {
      const modal = new bootstrap.Modal(modalElement);
      modal.hide();
    }
  }
}