import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormArrayName, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
declare const Materialize: any;

import { User } from '../../models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { Avatar } from '../../models/avatar.model';
import { AvatarService } from '../../core/services/avatar.service';

@Component({
  selector: 'app-avatar-form',
  templateUrl: './avatar-form.component.html',
  styleUrls: ['./avatar-form.component.css']
})
export class AvatarFormComponent implements OnInit {

  avatarForm: FormGroup;
  avatars: Avatar[];
  avatar: string;
  userId: string;
  successMsg: string;
  errorMsg: string;
  error = false;
  noData = false;
  formSubmitted = false;



  constructor(
    private authService: AuthService,
    private avatarService: AvatarService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cdref: ChangeDetectorRef
  ) { }




  ngOnInit(): void {

    this.buildForm();
    
    this.route.parent.data.subscribe(
      data => {
        this.avatar = data.user.avatar;
        this.userId = data.user._id;
        this.addAvatarToFormGroup(data.user.avatar);
      },
      error => this.error = true
    );
    
    this.getAllAvatars();
  }



  buildForm(): void {

    this.avatarForm = this.formBuilder.group({
      avatar: [null, Validators.required]
    });
  }



  addAvatarToFormGroup(avatar: string): void {
    this.avatarForm.patchValue({avatar});
  }



  getAllAvatars(): void {

    this.avatarService.getAllAvatars()
      .subscribe(
        avatars => {
          if (avatars.length === 0) {
            this.noData = true;
          }
          this.avatars = avatars;
        },
        error => this.error = true
      );
  }



  saveAvatar(): void {

    if (!this.avatarForm.dirty) {

      this.formSubmitted = true;
      this.errorMsg = 'No changes to avatars form';
      return;
    }

    if (this.avatar !== this.avatarForm.controls['avatar'].value) {

      this.formSubmitted = true;
      this.errorMsg = '';

      const newAvatar: any = {
        _id: this.userId,
        avatar: this.avatarForm.controls['avatar'].value,
      };

      this.authService.updateUserAvatar(newAvatar)
        .subscribe(
          user => {
            this.successMsg = 'Avatar UPDATED';
            this.avatar = user.avatar;
            this.addAvatarToFormGroup(user.avatar);
            this.router.navigateByUrl('/standings').then(() => {
              this.router.navigateByUrl('/personal-settings/avatar').then(() => {
                // setTimeout(() => {
                //   this.successMsg = 'Avatar UPDATED';
                //   console.log('setTimeout', this.successMsg);
                // }, 1000);
                this.cdref.markForCheck();
                this.successMsg = 'Avatar UPDATED';
              });
            });
          },
          error => this.errorMsg = error.message
        );

      return;

    } else {

      this.formSubmitted = true;
      this.errorMsg = 'Avatar the same';
      return;
    }
  }




  trackAvatars(index: number, avatar: Avatar): string | undefined {
    return avatar ? avatar._id : undefined;
  }




}
