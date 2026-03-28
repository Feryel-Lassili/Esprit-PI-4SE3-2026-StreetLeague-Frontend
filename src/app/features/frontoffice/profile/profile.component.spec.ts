import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { ProfileComponent } from './profile.component';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileService } from '../../../core/services/profile.service';
import { SponsorService } from '../../../core/services/sponsor.service';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ProfileComponent],
      imports: [CommonModule, FormsModule],
      providers: [
        { provide: AuthService, useValue: { hasRole: jasmine.createSpy().and.returnValue(false) } },
        { provide: ProfileService, useValue: { getCoachProfile: jasmine.createSpy().and.returnValue(of({})), getPlayerProfile: jasmine.createSpy().and.returnValue(of({})) } },
        { provide: SponsorService, useValue: { getMyProfile: jasmine.createSpy().and.returnValue(of({})) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
