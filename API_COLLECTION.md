# API Collection

Base URL: `http://localhost:3000`

## Authentication
**Log in (Simulated)**
Returns user object including ID and Role.
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name": "Nick Fury"}'
```

**Common Header**
All protected endpoints require `x-user-id` header.
```
x-user-id: <USER_ID>
```

## Restaurants
**Get All Restaurants**
Admin sees all. Manager/Member sees only their country's restaurants.
```bash
curl -X GET http://localhost:3000/restaurants \
  -H "x-user-id: 1"
```

## Orders
**Create Order**
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{
    "items": [
      { "menuItemId": 1, "quantity": 2 },
      { "menuItemId": 2, "quantity": 1 }
    ]
  }'
```

**Get Orders**
View orders (filtered by country for Managers/Members).
```bash
curl -X GET http://localhost:3000/orders \
  -H "x-user-id: 1"
```

**Checkout Order**
```bash
curl -X POST http://localhost:3000/orders/1/checkout \
  -H "x-user-id: 1"
```

**Cancel Order**
Manager/Admin only.
```bash
curl -X PATCH http://localhost:3000/orders/1/cancel \
  -H "x-user-id: 2"
```

## Users
**Update Payment Method**
Admin only.
```bash
curl -X PATCH http://localhost:3000/users/4/payment \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{"payment": "New Credit Card"}'
```
