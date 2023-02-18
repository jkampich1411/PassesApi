# PassesApi
This is a utility package to create [Google Wallet](https://developers.google.com/wallet) passes.


### Passes Available:
|Pass Type|Supported|Reason|
|---------|---------|------|
|Gift Cards|❌|Coming soon!|
|Loyality Cards|❌|Coming soon!|
|Offers|❌|Coming soon!|
|In-store Payments|❌|NDA required|
|Boarding Passes|✔️|---|
|Event Tickets|❌|Coming soon!|
|Closed-Loop and Open-Loop Transit|❌|NDA required|
|Transit passes|❌|Part coming soon!|
|Generic Pass|❌|Coming soon!|

### Quick Start Tutorial
1. First, you need to setup a Google Wallet issuer account
You can either setup a temporary issuer account using [this](https://wallet-lab-tools.web.app/issuers) service or sign up in the [Google Pay Business Console](https://pay.google.com/business/console)

2. Setup the Github NPM registry and install this package. [Tutorial](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#installing-a-package)

3. Setup a Google Cloud Project and enable it for use with Google Wallet.
Complete Steps 1. to 4. from [this guide](https://developers.google.com/wallet/generic/web/prerequisites)!

4. Move the service-account file to your project directory! **PLEASE KEEP THIS FILE SECURE! DO NOT PUBLISH IT ANYWHERE!**

5. Setup the library: (This example uses TypeScript)
```TypeScript
import {Setup, <any package you need>} from '@jkampich1411/passesapi';
import * as fs from 'fs';

const ISSUER_ID = '<your Issuer ID>';
const CREDENTIALS = JSON.parse(
    fs.readFileSync('<path-to-your-service-account>.json')
);

const SETUP = new Setup(CREDENTIALS, ISSUER_ID);
```

5. Now you can use any class! Just pass the `SETUP` variable to any class!
