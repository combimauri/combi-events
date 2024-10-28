# CombiEvents

## Create SECRETS for Firebase Cloud Functions

`firebase functions:secrets:set <SECRET_KEY>`

These are the necessary secrets:

- WOLIPAY_BASE_PATH
- WOLIPAY_EMAIL
- WOLIPAY_EVENT_NOTIFY_URL
- WOLIPAY_PASSWORD
- WOLIPAY_PRODUCT_NOTIFY_URL

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

## Important Links

### Cloud Secret Manager

https://cloud.google.com/security/products/secret-manager
