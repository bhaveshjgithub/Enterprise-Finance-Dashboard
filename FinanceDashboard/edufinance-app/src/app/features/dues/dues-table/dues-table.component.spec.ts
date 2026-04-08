import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuesTableComponent } from './dues-table.component';

describe('DuesTableComponent', () => {
  let component: DuesTableComponent;
  let fixture: ComponentFixture<DuesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DuesTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DuesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
