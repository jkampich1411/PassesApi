import * as google from 'google-auth-library';
const SCOPES = ["https://www.googleapis.com/auth/wallet_object.issuer"];

class Setup {
    google_client: any;
    issuer_id: string | number;
    credentials: any;

    constructor(credentials: any, issuerId: string | number) {
        this.google_client = new google.GoogleAuth({
            scopes: SCOPES,
            credentials: credentials
        });

        this.issuer_id = issuerId

        this.credentials = credentials;
    }
}

export {
    Setup
}