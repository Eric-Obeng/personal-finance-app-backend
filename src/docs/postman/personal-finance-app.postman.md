# Personal Finance App API Testing Guide

## Setup Environment Variables

First, set up these environment variables in Postman:

```json
{
  "base_url": "http://localhost:5000",
  "token": ""
}
```

## Authentication Endpoints

### 1. User Registration

- **POST** `{{base_url}}/api/v1/auth/signup`

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "Test@123"
}
```

### 2. User Login

- **POST** `{{base_url}}/api/v1/auth/login`

```json
{
  "email": "test@example.com",
  "password": "Test@123"
}
```

### 3. Get User Profile

- **GET** `{{base_url}}/api/v1/auth/profile`
- **Headers**: `Authorization: Bearer {{token}}`

### 4. Email Verification

- **GET** `{{base_url}}/api/v1/auth/verify-email/:token`

### 5. Forgot Password

- **POST** `{{base_url}}/api/v1/auth/forgot-password`

```json
{
  "email": "test@example.com"
}
```

### 6. Reset Password

- **POST** `{{base_url}}/api/v1/auth/reset-password/:token`

```json
{
  "password": "NewPassword@123"
}
```

## Transaction Endpoints

### 1. Create Transaction

- **POST** `{{base_url}}/api/v1/transactions`
- **Headers**: `Authorization: Bearer {{token}}`

```json
{
  "name": "Grocery Shopping",
  "amount": 50.99,
  "type": "expense",
  "category": "Food",
  "description": "Weekly groceries",
  "date": "2024-03-20T10:00:00Z",
  "recurring": false,
  "tags": ["groceries", "essential"]
}
```

### 2. Get All Transactions

- **GET** `{{base_url}}/api/v1/transactions`
- **Headers**: `Authorization: Bearer {{token}}`

Query Parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `startDate`: Filter by start date (YYYY-MM-DD)
- `endDate`: Filter by end date (YYYY-MM-DD)
- `category`: Filter by category
- `type`: Filter by type (income/expense)
- `minAmount`: Minimum amount
- `maxAmount`: Maximum amount
- `search`: Search in name/description
- `recurring`: Filter recurring transactions (true/false)

### 3. Get Transaction Analytics

- **GET** `{{base_url}}/api/v1/transactions/analytics`
- **Headers**: `Authorization: Bearer {{token}}`

Query Parameters:

- `dateRange`: last7days, last30days, thisMonth

### 4. Get Transaction Overview

- **GET** `{{base_url}}/api/v1/transactions/overview`
- **Headers**: `Authorization: Bearer {{token}}`

Query Parameters:

- `limit`: Number of transactions to return
- `sort`: latest/oldest

### 5. Upload Transaction Avatar

- **POST** `{{base_url}}/api/v1/transactions/upload-avatar`
- **Headers**: `Authorization: Bearer {{token}}`
- **Body**: Form-data with key 'avatar' and file value

### 6. Update Transaction

- **PUT** `{{base_url}}/api/v1/transactions/:id`
- **Headers**: `Authorization: Bearer {{token}}`

```json
{
  "name": "Updated Transaction",
  "amount": 75.5,
  "category": "Food"
}
```

### 7. Delete Transaction

- **DELETE** `{{base_url}}/api/v1/transactions/:id`
- **Headers**: `Authorization: Bearer {{token}}`

### 8. Restore Transaction

- **PATCH** `{{base_url}}/api/v1/transactions/:id/restore`
- **Headers**: `Authorization: Bearer {{token}}`

## Category Endpoints

### 1. Create Category

- **POST** `{{base_url}}/api/v1/categories`
- **Headers**: `Authorization: Bearer {{token}}`

```json
{
  "name": "Entertainment",
  "description": "Entertainment expenses",
  "theme": "#FF5733",
  "icon": "🎮"
}
```

### 2. Get All Categories

- **GET** `{{base_url}}/api/v1/categories`
- **Headers**: `Authorization: Bearer {{token}}`

Query Parameters:

- `activeOnly`: Filter active categories (true/false)

## Budget Endpoints

### 1. Create Budget

- **POST** `{{base_url}}/api/v1/budgets`
- **Headers**: `Authorization: Bearer {{token}}`

```json
{
  "category": "Food",
  "amount": 500,
  "period": "monthly",
  "theme": "#FF5733",
  "startDate": "2024-03-01T00:00:00Z"
}
```

### 2. Get All Budgets

- **GET** `{{base_url}}/api/v1/budgets`
- **Headers**: `Authorization: Bearer {{token}}`

Query Parameters:

- `page`: Page number
- `limit`: Items per page
- `category`: Filter by category
- `period`: monthly/quarterly/yearly
- `isActive`: true/false
- `minAmount`: Minimum amount
- `maxAmount`: Maximum amount
- `search`: Search term

### 3. Get Budget Utilization

- **GET** `{{base_url}}/api/v1/budgets/:id/utilization`
- **Headers**: `Authorization: Bearer {{token}}`

### 4. Update Budget

- **PUT** `{{base_url}}/api/v1/budgets/:id`
- **Headers**: `Authorization: Bearer {{token}}`

```json
{
  "amount": 600,
  "isActive": true
}
```

### 5. Delete Budget

- **DELETE** `{{base_url}}/api/v1/budgets/:id`
- **Headers**: `Authorization: Bearer {{token}}`

## Savings Pot Endpoints

### 1. Create Savings Pot

- **POST** `{{base_url}}/api/v1/pots`
- **Headers**: `Authorization: Bearer {{token}}`

```json
{
  "name": "New Car",
  "goalAmount": 5000,
  "targetDate": "2024-12-31T00:00:00Z",
  "theme": "#FF5733",
  "description": "Saving for a new car"
}
```

### 2. Get All Pots

- **GET** `{{base_url}}/api/v1/pots`
- **Headers**: `Authorization: Bearer {{token}}`

### 3. Update Pot Balance

- **PATCH** `{{base_url}}/api/v1/pots/:id/balance`
- **Headers**: `Authorization: Bearer {{token}}`

```json
{
  "amount": 500,
  "operation": "add"
}
```

## Account Overview Endpoints

### 1. Get Account Summary

- **GET** `{{base_url}}/api/v1/account/account-summary`
- **Headers**: `Authorization: Bearer {{token}}`

### 2. Get Budget Overview

- **GET** `{{base_url}}/api/v1/account/budgets`
- **Headers**: `Authorization: Bearer {{token}}`

### 3. Get Savings Pots Overview

- **GET** `{{base_url}}/api/v1/account/savings-pots`
- **Headers**: `Authorization: Bearer {{token}}`

## Recurring Bills Endpoints

### 1. Get Recurring Bills Summary

- **GET** `{{base_url}}/api/v1/recurring-bills/summary`
- **Headers**: `Authorization: Bearer {{token}}`

## Common Response Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Server Error

## Best Practices

1. Always include the Authorization header for protected routes
2. Use appropriate HTTP methods for each operation
3. Include error handling in your requests
4. Test with different scenarios (valid/invalid data)
5. Monitor rate limits
6. Validate responses against expected schemas

## Testing Workflow

1. Register a new user
2. Login and save the token
3. Create categories for transactions
4. Create budgets for different categories
5. Create transactions
6. Test filtering and pagination
7. Create savings pots
8. Test account overview features
9. Test recurring bills functionality
10. Verify notifications are working

## Rate Limits

- Auth endpoints: 5 requests per 15 minutes
- Transaction endpoints: 100 requests per 15 minutes
- Budget endpoints: 100 requests per 15 minutes
- Other endpoints: 50 requests per 15 minutes

---

© 2024 Personal Finance App. All Rights Reserved.
