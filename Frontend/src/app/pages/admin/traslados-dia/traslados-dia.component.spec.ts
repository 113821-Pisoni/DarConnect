import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrasladosDiaComponent } from './traslados-dia.component';

describe('TrasladosDiaComponent', () => {
  let component: TrasladosDiaComponent;
  let fixture: ComponentFixture<TrasladosDiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrasladosDiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrasladosDiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
