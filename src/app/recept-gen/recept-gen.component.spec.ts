import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptGenComponent } from './recept-gen.component';

describe('ReceptGenComponent', () => {
  let component: ReceptGenComponent;
  let fixture: ComponentFixture<ReceptGenComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReceptGenComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceptGenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
