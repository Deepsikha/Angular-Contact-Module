import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';
import { ManagementApiService } from 'src/app/services';
import { EmailConstants } from '../constants/email.constatnt';
import { ContactUsForm } from '../models/contact-us.model';
import { EmailModel } from '../models/email.model';
import { EmailNewOrgAdd } from '../models/Emails.model';
import { EmailType } from '../models/enums/email-type.enum';

@Injectable({
    providedIn: "root",
})
export class EmailSenderService {
    emailData: EmailNewOrgAdd;
    contactUsData: ContactUsForm;
    constructor(
        private managementApiService: ManagementApiService,
        private translocoService: TranslocoService
    ) { }

    // * 
    /**
     * helper method to sent an email based on transaction
     * @param emailType - it is type of email based on event which is happening
     * @param toAddress - receiver address
     * @param requiredDataForEmail - it is an object which contains data to be sent in respective email
     * @returns Observable<{success: boolean}>
     */
    emailHandler(
        emailType: number,
        toAddress: string[],
        requiredDataForEmail: any
    ) {
        let emailPayload = new EmailModel();
        emailPayload.ccAddresses = [];
        emailPayload.toAddresses = toAddress;

        switch (emailType) {
            // * send mail for contact us page
            case EmailType.ContactUsPage:
                emailPayload.subject = this.translocoService.translate(
                    "EMAIL_TEMPLATES.CONTACT_US_EMAIL.SUBJECT"
                );
                this.contactUsData = requiredDataForEmail;
                emailPayload.body = this.translocoService.translate(
                    "EMAIL_TEMPLATES.CONTACT_US_EMAIL.BODY",
                    {
                        firstName: this.contactUsData.firstName,
                        lastName: this.contactUsData.lastName,
                        companyName: this.contactUsData.companyName,
                        email: this.contactUsData.email,
                        industry: this.contactUsData.industry,
                        serviceLine: this.contactUsData.serviceLine,
                        country: this.contactUsData.country,
                        product: this.contactUsData.product,
                        enquiryDetails: this.contactUsData.enquiryDetails,
                        newsLater: this.contactUsData.newsLetter
                            ? this.translocoService.translate("COMMON_TEXTS.YES")
                            : this.translocoService.translate("COMMON_TEXTS.NO"),
                        integrityAssuredImg: EmailConstants.EMAIL_LOGOS.INTEGRITY_ASSURED,
                        hydratightImg: EmailConstants.EMAIL_LOGOS.HYDRATIGHT,
                    }
                );
                return this.managementApiService.sentEmail(emailPayload);

            // * when new org is created
            case EmailType.NewOrgAdded:
                emailPayload.subject = this.translocoService.translate(
                    "EMAIL_TEMPLATES.NEW_ORG_ADD_EMAIL.SUBJECT"
                );
                this.emailData = new EmailNewOrgAdd();
                this.emailData = requiredDataForEmail;
                emailPayload.body = this.translocoService.translate(
                    "EMAIL_TEMPLATES.NEW_ORG_ADD_EMAIL.BODY",
                    {
                        lastName: this.emailData.lastName
                            ? this.emailData.lastName
                            : this.emailData.firstName
                                ? this.emailData.firstName
                                : this.emailData.email,
                        organizationName: this.emailData.organizationName,
                        integrityAssuredImg: EmailConstants.EMAIL_LOGOS.INTEGRITY_ASSURED,
                        hydratightImg: EmailConstants.EMAIL_LOGOS.HYDRATIGHT,
                    }
                );
                return this.managementApiService.sendEmailThroughOutWebApp(
                    emailPayload
                );
        }
    }
}
