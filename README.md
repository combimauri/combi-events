# CombiEvents

CombiEvents is an application for event management.

## � Project Structure

```
combi-events/
├── 📁 api/                          # Vercel API routes
│   └── index.js                     # API entry point
├── 📁 functions/                    # Firebase Cloud Functions
│   ├── package.json                 # Functions dependencies
│   ├── tsconfig.json               # TypeScript config for functions
│   └── 📁 src/
│       ├── index.ts                # Functions entry point
│       ├── 📁 models/              # Data models
│       │   ├── app-event.model.ts
│       │   ├── billing-data.model.ts
│       │   ├── coupon.model.ts
│       │   ├── event-record.model.ts
│       │   ├── payment.model.ts
│       │   ├── price.model.ts
│       │   ├── product-record.model.ts
│       │   ├── product.model.ts
│       │   ├── record-role.enum.ts
│       │   ├── session-record.model.ts
│       │   ├── session.model.ts
│       │   ├── wolipay-iframe.model.ts
│       │   ├── wolipay-payment.model.ts
│       │   ├── wolipay-response.model.ts
│       │   └── wolipay-token.model.ts
│       └── 📁 utils/               # Utility functions
│           ├── coupons.utils.ts
│           ├── event-records.utils.ts
│           ├── events.utils.ts
│           ├── mail.utils.ts
│           ├── payments.utils.ts
│           ├── product-records.utils.ts
│           ├── products.utils.ts
│           ├── session-records.utils.ts
│           ├── sessions.utils.ts
│           └── wolipay.utils.ts
├── 📁 public/                      # Static assets
├── 📁 readme-assets/               # README documentation assets
├── 📁 src/                         # Angular application source
│   ├── index.html                  # Main HTML template
│   ├── main.ts                     # Application bootstrap
│   ├── main.server.ts             # SSR bootstrap
│   ├── styles.scss                # Global styles
│   ├── 📁 app/                     # Application modules
│   │   ├── app.component.ts        # Root component
│   │   ├── app.component.spec.ts   # Root component tests
│   │   ├── app.config.ts          # App configuration
│   │   ├── app.config.server.ts   # SSR configuration
│   │   ├── app.routes.ts          # Application routes
│   │   ├── 📁 core/               # Core functionality
│   │   │   ├── 📁 guards/         # Route guards
│   │   │   │   ├── admin.guard.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── event.guard.ts
│   │   │   │   ├── exit-registration.guard.ts
│   │   │   │   ├── login.guard.ts
│   │   │   │   ├── marketplace.guard.ts
│   │   │   │   ├── platform.guard.ts
│   │   │   │   └── index.ts
│   │   │   ├── 📁 layout/         # Layout components
│   │   │   ├── 📁 models/         # TypeScript interfaces
│   │   │   ├── 📁 resolvers/      # Route resolvers
│   │   │   ├── 📁 services/       # Angular services
│   │   │   ├── 📁 states/         # State management
│   │   │   └── 📁 utils/          # Utility functions
│   │   ├── 📁 events/             # Events feature module
│   │   │   ├── events.component.ts
│   │   │   ├── events.component.spec.ts
│   │   │   ├── events.routes.ts
│   │   │   ├── 📁 event-card/     # Event card component
│   │   │   └── 📁 event-details/  # Event details component
│   │   ├── 📁 login/              # Authentication module
│   │   │   ├── login.component.ts
│   │   │   ├── login.component.spec.ts
│   │   │   ├── login.routes.ts
│   │   │   └── 📁 verify-link/    # Email verification
│   │   └── 📁 shared/             # Shared components
│   │       ├── 📁 components/     # Reusable components
│   │       ├── 📁 directives/     # Custom directives
│   │       └── 📁 pipes/          # Custom pipes
│   ├── 📁 environments/           # Environment configurations
│   │   ├── environment.ts         # Production environment
│   │   ├── environment.development.ts # Development environment
│   │   ├── keys.template.ts       # Firebase keys template
│   │   └── keys.ts               # Firebase keys (generated)
│   └── 📁 scripts/               # Utility scripts
│       ├── validate-payments.gs   # Google Apps Script
│       └── 📁 create/            # Data creation scripts
│           ├── create-event.js
│           ├── create-product.js
│           ├── create-session.js
│           ├── events.template.js
│           ├── package.json
│           ├── products.template.js
│           ├── README.md
│           └── sessions.template.js
├── 📄 angular.json                # Angular CLI configuration
├── 📄 package.json               # Dependencies and scripts  
├── 📄 tsconfig.json              # TypeScript configuration
├── 📄 tsconfig.app.json          # App TypeScript config
├── 📄 tsconfig.spec.json         # Test TypeScript config
├── 📄 firebase.json              # Firebase configuration
├── 📄 apphosting.yaml           # Firebase App Hosting config
├── 📄 vercel.json               # Vercel deployment config
├── 📄 server.ts                 # Express server for SSR
└── 📄 README.md                 # Project documentation
```

### 📂 Key Directories Explained

- **`/api`**: Vercel API routes for serverless functions
- **`/functions`**: Firebase Cloud Functions for backend logic
- **`/src/app/core`**: Core application functionality (guards, services, models)
- **`/src/app/events`**: Event management feature module
- **`/src/app/login`**: Authentication and user management
- **`/src/app/shared`**: Reusable components, directives, and pipes
- **`/src/environments`**: Environment-specific configurations
- **`/src/scripts`**: Utility scripts for data management and external integrations

## � Features

## �👤 Normal User Role

- View the list of existing events ordered by date.  
- Access an event and see its details, including:  
  - Title  
  - Description  
  - Event location  
  - Cost (if any)  
  - An embedded map  
  - A button to register as a participant  
- The user must log in to register for an event.  
- Once logged in, the user can register for the event.  
- If the event has an associated form or required questions to collect additional information, the user must complete this form first.  
- After completing the form, a summary of the user's responses will be displayed.  
- In this section, if the user has a discount coupon, they can enter it.  
- If no coupon is available, the user can proceed to payment.  
- Different payment methods are available: payment gateway or QR code.  
- Once the payment is completed, the user will be registered and redirected to the event details.  
- If the event has a shop with available products, the user can purchase these products.  
- On the same screen, the user's event ticket will be displayed once the payment is confirmed.  

## 👤 Administrator User Role

- To become an administrator, a user must first be added to the event's administrators list. This action is performed directly in the database by the application administrator.  
- An administrator can view all events ordered by date but can only manage events where they are assigned as an administrator.  
- An administrator can view the list of all users registered for an event, filter them, review each user's information, and validate their payments.  
- An administrator can export the registration list in CSV format.  
- If the event has a product shop, the administrator can review the list of product orders.  
- The administrator can review the list of users registered for workshops if the event has workshop sessions.  
- An administrator can scan tickets on the day of the event.  
- They can also scan tickets for workshops if the event includes workshop sessions.  

## ⚙️ Steps to Run the Project Locally

1. **Clone the project:**  
```bash
git clone https://github.com/combimauri/combi-events
cd combi-events
```

2. **Install Node.js version 20.18.3 or higher** (LTS version recommended):  
[Download Node.js](https://nodejs.org/en/download)

3. **Install project dependencies:**  
```bash
npm ci
```

4. **Create the Firebase keys file:**  
```bash
npm run keys:create
```
This will generate a file `keys.ts` in `./src/environments/keys.ts`, which will store the Firebase keys needed for the project.

5. **Configure Firebase keys:**  
Request the Firebase key from your trainer, then open `src/environments/keys.ts` and paste the key there.

6. **Start the project:**  
```bash
npm start
```

7. **Open your browser:**  
Go to [http://localhost:4200/](http://localhost:4200/) to see the project running.