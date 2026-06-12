import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimulatorPage } from './simulator';

describe('SimulatorPage', () => {
  let component: SimulatorPage;
  let fixture: ComponentFixture<SimulatorPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimulatorPage],
    }).compileComponents();

    fixture = TestBed.createComponent(SimulatorPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
