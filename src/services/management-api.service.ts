import {
    HttpClient,
    HttpHeaders,
    HttpErrorResponse,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { AppConfig } from "../config/app-config";
import { appInsights } from "../config/app-config";
import { EmailModel } from "../models/email.model";
import { MsalService } from "./msAl.service"

@Injectable({
    providedIn: "root",
})


export class ManagementApiService {
    headers: HttpHeaders;
    private mgmtApi = this.config.setting["MgmtApi"];
    private subVal = this.config.setting["SubValue"];
    private logedInUserId =
        this.authService?.instance?.getActiveAccount()?.idTokenClaims?.oid;

    private anonymousEmailApi = this.config.setting["anonymousEmailApi"];
    constructor(
        private http: HttpClient,
        private config: AppConfig,
        private authService: MsalService,
    ) {
        this.headers = new HttpHeaders({
            "Ocp-Apim-Subscription-Key": this.subVal,
            Authorization: `Bearer ${localStorage.getItem("msal.accessToken")}`,
        });
    }

    addPostAndPutHeaders() {
        this.headers = new HttpHeaders();
        this.headers = this.headers.append(
            "Ocp-Apim-Subscription-Key",
            this.subVal
        );
        this.headers = this.headers.append("content-type", "application/json");
        this.headers = this.headers.append("Accept", "application/json");
        this.headers = this.headers.append("Access-Control-Allow-Origin", "*");
        this.headers = this.headers.append("Content-Type", "multipart/form-data");
        this.headers = this.headers.append(
            "Authorization",
            `Bearer ${localStorage.getItem("msal.accessToken")}`
        );
    }

    // * api call to sent an email (specially for contact us and page and it is an anonymousEmailApi)
    sentEmail(emailData: EmailModel): Observable<{
        success: boolean;
    }> {
        // this.addPostAndPutHeaders();
        let headers = new HttpHeaders({
            "Ocp-Apim-Subscription-Key": this.subVal,
            "content-type": "application/json",
            Accept: "application/json",
        });
        return this.http
            .post(`${this.anonymousEmailApi}Email/SendEmail`, emailData, {
                headers,
            })
            .pipe(catchError(this.handleError.bind(this)));
    }

    /**
     * api call to sent an email based on any transaction
     * @param emailData - it is an object of EmailModel
     * @returns Observable<{ success: boolean }>
     */
    sendEmailThroughOutWebApp(emailData: EmailModel): Observable<{
        success: boolean;
    }> {
        this.addPostAndPutHeaders();
        return this.http
            .post(`${this.mgmtApi}Email/SendEmail`, emailData, {
                headers: this.headers,
                // headers
            })
            .pipe(catchError(this.handleError.bind(this)));
    }

    private handleError(error: HttpErrorResponse) {
        this.logedInUserId =
            this.authService?.instance?.getActiveAccount()?.idTokenClaims?.oid;
        let currOrg = localStorage.getItem("selectedOrgId");
        let currInstance = localStorage.getItem("currentInstanceId");
        if (error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error("An error occurred:", error.message);

            appInsights.trackException({
                exception: new Error(error.message),
                properties: {
                    currOrg: currOrg,
                    currentInstanceId: currInstance,
                    oid: this.logedInUserId,
                },
            });
            appInsights.trackPageView({
                properties: {
                    currOrg: currOrg,
                    currentInstanceId: currInstance,
                    oid: this.logedInUserId,
                },
            });
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(
                `Backend returned code ${error.status}, ` + `body was: ${error.message}`
            );
            appInsights.trackException({
                exception: new Error(error.message),
                properties: {
                    currOrg: currOrg,
                    currentInstanceId: currInstance,
                    oid: this.logedInUserId,
                },
            });
            appInsights.trackPageView({
                properties: {
                    currOrg: currOrg,
                    currentInstanceId: currInstance,
                    oid: this.logedInUserId,
                },
            });
        }
        // Return an observable with a user-facing error message.
        return throwError("Something bad happened; please try again later.");
    }
}
