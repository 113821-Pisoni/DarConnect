import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObraSocialModalComponent } from './obra-social-modal.component';

describe('ObraSocialModalComponent', () => {
  let component: ObraSocialModalComponent;
  let fixture: ComponentFixture<ObraSocialModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObraSocialModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ObraSocialModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
