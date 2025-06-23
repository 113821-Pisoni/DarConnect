import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrasladoModalComponent } from './traslado-modal.component';

describe('TrasladoModalComponent', () => {
  let component: TrasladoModalComponent;
  let fixture: ComponentFixture<TrasladoModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrasladoModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrasladoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
