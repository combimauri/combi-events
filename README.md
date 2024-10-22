# CombiEvents

## Configure environment variables for Firebase App Hosting

https://firebase.google.com/docs/app-hosting/configure?hl=es-419#secret-parameters

## Create SECRETS for Firebase Cloud Functions

`firebase functions:secrets:set <SECRET_KEY>`

These are the necessary secrets:

- WOLIPAY_BASE_PATH
- WOLIPAY_EMAIL
- WOLIPAY_NOTIFY_URL
- WOLIPAY_PASSWORD

## Add environment variables for Vercel deployment

A KEYS_CONFIG environment variable needs to be created for Firebase connection with this value:

```json
export const keys = {
  firebase: {
    projectId: '<PROJECT_ID>',
    appId: '<APP_ID>',
    storageBucket: '<STORAGE_BUCKET>',
    apiKey: '<API_KEY>',
    authDomain: '<AUTH_DOMAIN>',
    messagingSenderId: '<MESSAGING_SENDER_ID>'
  }
};
```
