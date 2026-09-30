# Noreva — Modern Digital Banking

Noreva is a portfolio fintech web application built to simulate a modern digital banking experience for Nigerian users.

It demonstrates a full-stack banking workflow including authentication, digital wallets, money transfers, transaction history, virtual cards, scheduled payments, notifications, and password recovery.

> **Note:** Noreva is a portfolio/demo application. It does not process real money or connect to real banking infrastructure.

## Screenshots

### Landing Page

![Noreva Landing Page](./client/public/images/landing-page.png)

### Dashboard

![Noreva Dashboard](./client/public/images/dashboard.png)

> Screenshots can be updated with the final production UI before publishing the repository.

## Features

### Authentication

* User registration and login
* JWT-based authentication
* Protected routes
* Password visibility toggle
* Forgot password
* Secure password reset links
* Password hashing with bcrypt
* Authentication rate limiting

### Digital Wallet

* Automatic account creation
* Demo wallet with ₦100,000 starting balance
* Unique account number
* Real-time wallet balance updates

### Money Transfers

* Search for registered recipients
* Send money between Noreva users
* Self-transfer prevention
* Insufficient-balance protection
* Atomic wallet balance updates
* Transaction references
* Sender and receiver transaction records
* Transfer notifications

### Transactions

* Transaction history
* Transaction details
* Transaction reference numbers
* Debit and credit records
* Transaction receipts
* Receipt download

### Cards

* Virtual card
* Card number, expiry date and CVV
* Show/hide card details
* Copy card details
* Freeze/unfreeze card
* Physical card interface for future expansion

### Scheduled Payments

* Create scheduled payments
* View scheduled payments
* Cancel scheduled payments
* Automatic scheduled-payment processing

### Notifications

* In-app notification centre
* Unread notification count
* Mark notifications as read
* Transfer notifications
* Email notifications

### Dashboard

* Available balance
* Account information
* Financial statistics
* Transaction overview
* Recent transactions
* Quick actions
* Financial charts

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios
* Recharts
* Lucide React

### Backend

* Node.js
* Express
* TypeScript
* Prisma ORM
* PostgreSQL
* JWT
* bcrypt
* Zod

### Services

* Neon PostgreSQL
* EmailJS

## Architecture

Noreva uses a separate frontend and backend architecture.

```text
Noreva
│
├── client
│   ├── React
│   ├── TypeScript
│   ├── Tailwind CSS
│   ├── React Router
│   └── Axios
│
└── server
    ├── Express
    ├── TypeScript
    ├── Prisma
    ├── PostgreSQL
    ├── JWT
    └── EmailJS
```

The frontend communicates with the Express API through authenticated HTTP requests.

The backend handles authentication, wallet operations, transfers, transactions, scheduled payments, notifications and database access.

## Security

Security was considered throughout the application rather than relying only on frontend restrictions.

### Authentication

* Passwords are hashed with bcrypt.
* JWTs are used for authenticated API requests.
* Protected API routes require a valid Bearer token.
* Password reset tokens are randomly generated and expire after a limited period.

### Authorization

User-owned resources are scoped using the authenticated user's ID.

For example, transaction and notification queries are associated with the authenticated user rather than trusting a user ID supplied by the client.

This prevents users from simply changing an ID in a request to access another user's data.

### Transfer Protection

Money transfers use an atomic balance check when debiting the sender's wallet.

The wallet is only debited when the available balance is sufficient, helping prevent concurrent requests from spending the same balance.

### API Protection

* Authentication middleware
* Login rate limiting
* Password-reset rate limiting
* Restricted CORS configuration
* Server-side request validation with Zod
* Environment variables for secrets

## Environment Variables

### Client

```env
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_ID=
VITE_EMAILJS_PUBLIC_KEY=
```

### Server

```env
DATABASE_URL=
JWT_SECRET=
FRONTEND_URL=

EMAILJS_SERVICE_ID=
EMAILJS_TEMPLATE_ID=
EMAILJS_PUBLIC_KEY=
EMAILJS_PRIVATE_KEY=
```

> Never commit `.env` files or private API keys to the repository.

## Getting Started

### Prerequisites

Make sure you have:

* Node.js
* Yarn
* PostgreSQL database

### Clone the repository

```bash
git clone https://github.com/al-waheed/Noreva-Modern-Digital-Banking.git

cd Noreva-Modern-Digital-Banking
```

### Install frontend dependencies

```bash
cd client
yarn install
```

### Install backend dependencies

```bash
cd ../server
yarn install
```

### Configure environment variables

Create the required `.env` files in the `client` and `server` directories.

### Set up the database

From the server directory:

```bash
npx prisma migrate dev
npx prisma generate
```

### Start the backend

```bash
yarn dev
```

### Start the frontend

From the client directory:

```bash
yarn dev
```

The application will then be available through the Vite development server.

## API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

### Dashboard

```text
GET /api/dashboard
```

### Transfers

```text
POST /api/transfers/recipient
POST /api/transfers
```

### Transactions

```text
GET /api/transactions
GET /api/transactions/:reference
```

### Scheduled Payments

```text
GET   /api/scheduled-payments
POST  /api/scheduled-payments
PATCH /api/scheduled-payments/:id/cancel
```

### Notifications

```text
GET   /api/notifications
PATCH /api/notifications/:id/read
```

All protected endpoints require authentication.

## Project Goals

Noreva was built as a portfolio project to demonstrate practical full-stack development skills through a realistic fintech use case.

The project focuses on:

* Full-stack application architecture
* REST API development
* Database design
* Authentication and authorization
* Secure financial workflows
* React application architecture
* TypeScript
* API integration
* Transaction handling
* Error handling
* Security considerations
* Responsive UI development

## Future Improvements

Possible future improvements include:

* Automated testing
* CI/CD pipeline
* Docker deployment
* Improved application monitoring
* More advanced analytics
* Additional card functionality
* Production-grade background job processing
* Additional financial services

## Disclaimer

Noreva is a demonstration application created for portfolio purposes.

It does not provide real banking services, process real financial transactions, issue real payment cards, or connect to Nigerian banking infrastructure.

## Author

**Morenikeji Ajisegiri**

Frontend / Software Engineer

GitHub: [al-waheed](https://github.com/al-waheed)
