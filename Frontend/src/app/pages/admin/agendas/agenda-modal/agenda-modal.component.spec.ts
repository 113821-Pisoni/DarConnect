import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaModalComponent } from './agenda-modal.component';

describe('AgendaModalComponent', () => {
  let component: AgendaModalComponent;
  let fixture: ComponentFixture<AgendaModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgendaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
