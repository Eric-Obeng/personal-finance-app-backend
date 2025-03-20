# Personal Finance App Backend

A robust, secure, and scalable RESTful API for managing personal finances. This application allows users to track income and expenses, manage transactions with customizable categories, and monitor financial activities over time.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Security](#security)
- [Testing](#testing)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Features

### Authentication

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Session management

### Transactions

- CRUD operations for financial transactions
- Transaction categorization
- Transaction type support (income/expense)
- Soft delete with restore capability
- Custom avatar support for visual transaction identification
- Support for recurring transactions
- Detailed transaction filtering and pagination

### Planned Features

- Budget planning and tracking
- Financial reports and analytics
- Goal setting and tracking
- Notifications for important financial events
- Export functionality for reports

## Technologies

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **File Upload**: Multer
- **Logging**: Winston, Pino
- **Security**: Helmet, CSRF protection, Rate limiting
- **Testing**: Jest (planned)
- **Documentation**: Swagger/OpenAPI (planned)

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB (local installation or MongoDB Atlas account)
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/personal-finance-app-backend.git
   cd personal-finance-app-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/personal-finance-app
   JWT_SECRET=your-super-secret-jwt-key
   NODE_ENV=development
   ```

4. Create required directories:

   ```bash
   mkdir -p public/uploads/avatars
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

| Variable    | Description                         | Default                                        |
| ----------- | ----------------------------------- | ---------------------------------------------- |
| PORT        | Server port                         | 5000                                           |
| MONGODB_URI | MongoDB connection string           | mongodb://localhost:27017/personal-finance-app |
| JWT_SECRET  | Secret key for JWT token generation | (Required)                                     |
| NODE_ENV    | Application environment             | development                                    |

## Security

The application implements several security best practices:

- **Authentication**: JWT-based with proper secret management
- **Data Validation**: Complete input validation using Joi schemas
- **Password Security**: Passwords hashed using bcrypt
- **Rate Limiting**: Prevents abuse through request throttling
- **Security Headers**: Implemented using Helmet
- **CSRF Protection**: For routes that use cookie-based authentication
- **Input Sanitization**: Prevents XSS and injection attacks
- **Error Handling**: Custom error handler that prevents leaking sensitive information

## Testing

Testing implementation is planned using Jest. To run tests (once implemented):

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

## Roadmap

- [ ] Enhanced analytics and reporting features
- [ ] Third-party service integrations (e.g., bank APIs)
- [ ] Comprehensive testing suite
- [ ] API documentation with Swagger/OpenAPI
- [ ] Mobile app integration
- [ ] Subscription and premium features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to update tests as appropriate and adhere to the existing coding style.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

© 2024 Personal Finance App. All Rights Reserved.
