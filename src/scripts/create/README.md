# Create Event

## Create keys file

Create a file named `keys.js` in the same directory as this README file. The file should contain the following code:

```javascript
export const keys = {
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  },
};
```

Fill in the values with the Firebase configuration values from the Firebase console.

## Create events file

Create a file named `events.js` in the same directory as this README file. The file should contain the events you want to create. The events should be an array of events objects, you can see events.template.js for an example.
