import { Component, OnInit, AfterViewChecked } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormArrayName, FormControl, Validators  } from '@angular/forms';

declare const Materialize: any;

import { SettingService } from '../core/services/setting.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, AfterViewChecked {

  settingsForm: FormGroup;
  formSubmitted = false;
  formErrors = { picksAllowed: '' };
  validationMessages = {
    picksAllowed: {
      required: 'Picks Allowed is required.',
      minimum: 'Picks Allowed minimum must be no less than 1.',
      pattern: 'Picks Allowed must be a number without decimal.'
    }
  };
  settings: any;
  successMsg: string;
  errorMsg: string;
  error = false;
  noData = false;




  constructor(
    private settingService: SettingService,
    private formBuilder: FormBuilder
  ) { }




  ngOnInit(): void {

    this.getSettings();
    this.buildForm();
  }



  ngAfterViewChecked(): void {
    this.formChanged();
  }



  getSettings(): void {

    this.settingService.getAllSettings()
      .subscribe(
        settings => {
          if (settings.length === 0) { this.noData = true; }
          this.settings = settings[0];
          this.settingsForm.patchValue({picksAllowed: settings[0].picksAllowed});
        },
        error => this.error = true
      );
  }



  buildForm(): void {

    this.settingsForm = this.formBuilder.group({
      picksAllowed: [null, [
        Validators.required,
        Validators.pattern('[0-9]+'),
        this.validatePicksAllowed
      ]]
    });
  }



  validatePicksAllowed(control: FormControl): any {

    if (control.value < 1) { return {minimum: {valid: false}}; }
    return null;
  }



  formChanged(): void {

    if (this.settingsForm.valueChanges) {
      this.settingsForm.valueChanges
        .subscribe(
          data => this.onValueChanged(data),
          error => console.error(error)
        );
    }
  }



  onValueChanged(data?: any): void {

    if (!this.settingsForm) { return; }

    const form: FormGroup = this.settingsForm;

    // tslint:disable-next-line:forin
    for (const field in this.formErrors) {

      // clear previous error message (if any)
      this.formErrors[field] = '';
      const control: any = form.get(field);


      if (control && control.dirty && !control.valid) {
        const messages: string = this.validationMessages[field];
        // tslint:disable-next-line:forin
        for (const key in control.errors) {
          this.formErrors[field] += messages[key] + ' ';
        }
      }
    }
  }



  saveSettings(): void {

    if (!this.settingsForm.dirty) {

      this.formSubmitted = true;
      this.errorMsg = 'No changes to settings form';
      return;

    } else if (this.settingsForm.dirty && this.settingsForm.valid) {

      this.formSubmitted = true;
      this.errorMsg = '';

      const picksAllowed: number = this.settingsForm.controls['picksAllowed'].value;
      const newSettings: any = {_id: this.settings._id, picksAllowed: picksAllowed, allowSignup: this.settings.allowSignup};

      if (typeof picksAllowed !== 'number') {
        this.errorMsg = 'Picks allowed must be a number';
        return;
      }

      if (picksAllowed < 1 || picksAllowed > 16) {
        this.errorMsg = 'Picks allowed must be between 0 to 17';
        return;
      }

      this.settingService.updateSetting(newSettings)
        .subscribe(
          setting => this.successMsg = 'Settings UPDATED',
          error => this.errorMsg = error.message
        );
    }
  }




}
