import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { User } from '../user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  private authStatusSubs: Subscription;
  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authStatusSubs = this.authService.getAuthStatusListener().subscribe(
      authStatus => this.isLoading = false
    );
  }

  onSignup(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    const user: User = {
      firstName: form.value.firstname,
      lastName: form.value.lastname,
      email: form.value.email,
      password: form.value.password
    };
    this.authService.createUser(user);
  }

  ngOnDestroy(): void {
    this.authStatusSubs.unsubscribe();
  }

}
