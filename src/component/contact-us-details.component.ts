import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { EmailConstants } from 'src/app/constants/email.contatnt';
import { ContactUsForm } from 'src/app/models/contact-us.model';
import { ContactUsValidation } from 'src/app/models/enums/conatct-us-validation.enum';
import { EmailType } from 'src/app/models/enums/email-type.enum';
import { EmailSenderService } from 'src/app/services/email-sender.service';
import { CustomToastService } from './../../../../services/custom-toast.service';

@Component({
    selector: "app-contact-us-details",
    templateUrl: "./contact-us-details.component.html",
    styleUrls: ["./contact-us-details.component.scss"],
})
export class ContactUsDetailsComponent implements OnInit {
    contactUsForm: FormGroup;
    countryList: string[];
    productList: string[];
    contactUsDetails: ContactUsForm;

    constructor(
        private formBuilder: FormBuilder,
        private customToastService: CustomToastService,
        private translocoService: TranslocoService,
        private ngxUiLoaderService: NgxUiLoaderService,
        private emailSenderService: EmailSenderService
    ) {
        this.countryList = [];
        this.productList = [];
    }

    ngOnInit(): void {
        this.createFormControls();
    }

    // * method to create the form controls
    createFormControls() {
        this.contactUsForm = this.formBuilder.group({
            firstName: ["", [Validators.required]],
            lastName: ["", [Validators.required]],
            companyName: ["", [Validators.required]],
            email: [
                "",
                [
                    Validators.required,
                    Validators.email,
                    Validators.pattern(
                        "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$"
                    ),
                ],
            ],
            industry: ["", [Validators.required]],
            serviceLine: ["", [Validators.required]],
            country: ["", [Validators.required]],
            product: ["", [Validators.required]],
            enquiryDetails: ["", [Validators.required]],
            newsLetter: [false, []],
        });
    }


    /**
     * handler for handling formControl Validation
     * @param event - it is a type of event like paste or keypress
     * @param index - it is type of validation that is required based on input fields
     * @returns boolean
     */
    fromControlsValidationHandler(event, index: number) {
        let keyCode = event.charCode;
        switch (index) {
            // * restrict special char 0
            case ContactUsValidation.ResSpecialChar:
                return (
                    (keyCode > 64 && keyCode < 91) ||
                    (keyCode > 96 && keyCode < 123) ||
                    keyCode == 8 ||
                    keyCode == 32 ||
                    (keyCode >= 48 && keyCode <= 57)
                );

            // * restrict special char and numbers 1
            case ContactUsValidation.ResSpecialCharNum:
                return (
                    (keyCode > 64 && keyCode < 91) ||
                    (keyCode > 96 && keyCode < 123) ||
                    keyCode == 8 ||
                    keyCode == 32
                );

            // * restrict special char except hyphen symbol 2
            case ContactUsValidation.ResSpecialCharExceptHyphen:
                return (
                    (keyCode > 64 && keyCode < 91) ||
                    (keyCode > 96 && keyCode < 123) ||
                    keyCode == 8 ||
                    keyCode == 32 ||
                    keyCode == 45 ||
                    (keyCode >= 48 && keyCode <= 57)
                );

            // * restrict paste if string has special char 3
            case ContactUsValidation.PasteSpecialChar:
                let clipboardData1 = event.clipboardData;
                let pastedText1 = clipboardData1.getData("text");
                let format1 = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
                return format1.test(pastedText1)
                    ? (event.preventDefault(), this.displayToast())
                    : null;

            // * restrict paste if string has special char except hyphen symbol 4
            case ContactUsValidation.PasteSpecialCharExceptHyphen:
                let clipboardData2 = event.clipboardData;
                let pastedText2 = clipboardData2.getData("text");
                let format = /[!@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+/;
                return format.test(pastedText2)
                    ? (event.preventDefault(), this.displayToast())
                    : null;

            // * restrict the paste if staring has special char and numbers 5
            case ContactUsValidation.PasteSpecialCharNum:
                let clipboardData3 = event.clipboardData;
                let pastedText3 = clipboardData3.getData("text");
                let format3 = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?0123456789]+/;
                return format3.test(pastedText3)
                    ? (event.preventDefault(), this.displayToast())
                    : null;
        }
    }

    // * helper method to collect the form controls value
    getFormControlsValues() {
        let formValues = new ContactUsForm();
        formValues.firstName = this.contactUsForm.get("firstName").value.trim();
        formValues.lastName = this.contactUsForm.get("lastName").value.trim();
        formValues.companyName = this.contactUsForm.get("companyName").value.trim();
        formValues.email = this.contactUsForm.get("email").value.trim();
        formValues.industry = this.contactUsForm.get("industry").value.trim();
        formValues.serviceLine = this.contactUsForm.get("serviceLine").value;
        formValues.country = this.contactUsForm.get("country").value;
        formValues.product = this.contactUsForm.get("product").value;
        formValues.enquiryDetails = this.contactUsForm
            .get("enquiryDetails")
            .value.trim();
        formValues.newsLetter = this.contactUsForm.get("newsLetter").value;
        this.contactUsDetails = formValues;
    }

    // * api call to sent the email
    sendEmail() {
        this.ngxUiLoaderService.start();
        this.getFormControlsValues();
        this.emailSenderService
            .emailHandler(
                EmailType.ContactUsPage,
                EmailConstants.EMAIL_RECEIVER_LIST,
                this.contactUsDetails
            )
            .subscribe(
                (data) => {
                    if (data.success) {
                        this.customToastService.successToast(
                            this.translocoService.translate('TOAST_MESSAGE.MESSAGE.CONTACT_US_PAGE_SUCCESS'),
                            this.translocoService.translate('TOAST_MESSAGE.TITLE.SUCCESS'),
                        );
                        this.contactUsForm.reset();
                    }
                    this.ngxUiLoaderService.stop();
                },
                (error) => {
                    this.customToastService.errorToast(
                        this.translocoService.translate('TOAST_MESSAGE.MESSAGE.CONTACT_US_PAGE_ERROR'),
                        this.translocoService.translate('TOAST_MESSAGE.TITLE.ERROR'),
                    );
                    this.ngxUiLoaderService.stop();
                }
            );
    }

    // * helper method to display toast
    displayToast() {
        this.customToastService.infoToast(
            this.translocoService.translate('TOAST_MESSAGE.MESSAGE.CONTACT_US_PAGE_INFO'),
            this.translocoService.translate('TOAST_MESSAGE.TITLE.INFO'),
        );
    }

    // * helper method to expose our enum  to use on template
    public get contactUsValidation(): typeof ContactUsValidation {
        return ContactUsValidation;
    }
}
