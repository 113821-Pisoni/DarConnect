import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerAgendaAdminComponent } from './ver-agenda-admin.component';

describe('VerAgendaAdminComponent', () => {
  let component: VerAgendaAdminComponent;
  let fixture: ComponentFixture<VerAgendaAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerAgendaAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerAgendaAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
