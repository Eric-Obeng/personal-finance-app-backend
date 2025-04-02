# Personal Finance App API Testing Guide

## Setup Environment Variables

First, set up these environment variables in Postman:

```json
{
  "base_url": "http://localhost:8080",
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

After successful login, copy the token and set it to your environment variable:

```javascript
pm.environment.set("token", pm.response.json().token);
```

## Transaction Endpoints

Add this authorization header to all requests:

```
Authorization: Bearer {{token}}
```

### 1. Create Transaction

- **POST** `{{base_url}}/api/v1/transactions`

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

Query Parameters:

```
?page=0
&limit=10
&startDate=2024-01-01
&endDate=2024-12-31
&category=Food
&type=expense
&minAmount=10
&maxAmount=100
&search=grocery
```

### 3. Get Single Transaction

- **GET** `{{base_url}}/api/v1/transactions/:id`

### 4. Update Transaction

- **PUT** `{{base_url}}/api/v1/transactions/:id`

```json
{
  "amount": 55.99,
  "description": "Updated description"
}
```

### 5. Delete Transaction

- **DELETE** `{{base_url}}/api/v1/transactions/:id`

### 6. Restore Transaction

- **PATCH** `{{base_url}}/api/v1/transactions/:id/restore`

### 7. Upload Transaction Avatar

- **POST** `{{base_url}}/api/v1/transactions/upload-avatar`
  Form Data:

```
avatar: [Select File]
```

## Budget Endpoints

### 1. Create Budget

- **POST** `{{base_url}}/api/v1/budgets`

```json
{
  "category": "Food",
  "amount": 500,
  "period": "monthly",
  "theme": "#FF5733"
}
```

### 2. Get All Budgets

- **GET** `{{base_url}}/api/v1/budgets`

Query Parameters:

```
?page=0
&limit=10
&category=Food
&period=monthly
&isActive=true
&minAmount=100
&maxAmount=1000
&search=grocery
```

### 3. Get Single Budget

- **GET** `{{base_url}}/api/v1/budgets/:id`

### 4. Update Budget

- **PUT** `{{base_url}}/api/v1/budgets/:id`

```json
{
  "amount": 600,
  "isActive": true
}
```

### 5. Delete Budget

- **DELETE** `{{base_url}}/api/v1/budgets/:id`

### 6. Get Budget by Category

- **GET** `{{base_url}}/api/v1/budgets/category/:category`

### 7. Get Budget Utilization

- **GET** `{{base_url}}/api/v1/budgets/:id/utilization`

## Savings Pot Endpoints

### 1. Create Savings Pot

- **POST** `{{base_url}}/api/v1/pots`

```json
{
  "name": "New Car",
  "goalAmount": 5000,
  "targetDate": "2024-12-31T00:00:00Z",
  "description": "Saving for a new car",
  "category": "Vehicle"
}
```

### 2. Get All Savings Pots

- **GET** `{{base_url}}/api/v1/pots`

Query Parameters:

```
?search=car
&category=Vehicle
&minGoalAmount=1000
&maxGoalAmount=10000
&targetDateBefore=2024-12-31
&targetDateAfter=2024-01-01
```

### 3. Get Single Pot

- **GET** `{{base_url}}/api/v1/pots/:id`

### 4. Update Pot

- **PUT** `{{base_url}}/api/v1/pots/:id`

```json
{
  "name": "Updated Car Fund",
  "goalAmount": 6000,
  "targetDate": "2025-01-31T00:00:00Z",
  "description": "Updated saving goal for a better car"
}
```

### 5. Delete Pot

- **DELETE** `{{base_url}}/api/v1/pots/:id`

### 6. Update Pot Balance

- **PATCH** `{{base_url}}/api/v1/pots/:id/balance`

```json
{
  "amount": 500 // Positive for adding, negative for withdrawing
}
```

Example Success Responses:

Create/Update:

```json
{
  "success": true,
  "message": "Pot created/updated successfully",
  "data": {
    "_id": "pot_id",
    "name": "New Car",
    "goalAmount": 5000,
    "currentAmount": 0,
    "targetDate": "2024-12-31T00:00:00Z",
    "description": "Saving for a new car",
    "category": "Vehicle",
    "progress": 0,
    "createdAt": "2024-03-20T10:00:00Z",
    "updatedAt": "2024-03-20T10:00:00Z"
  }
}
```

Get All:

```json
{
  "pots": [
    {
      "_id": "pot_id",
      "name": "New Car",
      "goalAmount": 5000,
      "currentAmount": 1000,
      "progress": 20
      // ...other fields
    }
  ]
}
```

## Testing Flow

1. Register a new user
2. Login and save the token
3. Create a budget
4. Create transactions
5. Test filtering and pagination
6. Update transactions and budgets
7. Check budget utilization
8. Test deletion and restoration

## Common Response Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## Tips

1. Always verify the token is set in your environment
2. Test with invalid data to ensure validation works
3. Test pagination starting from page=0
4. Save transaction and budget IDs for later use
5. Test date ranges and filtering extensively
