# Architecture & Design

## Logic & Access Control
The application implements RBAC using NestJS Guards and Services.

### Roles
- **ADMIN**: Full access to all data and actions.
- **MANAGER**: Restricted to their Country. Can create, place, cancel orders. Cannot update payment methods.
- **MEMBER**: Restricted to their Country. Can create, place orders. Cannot cancel orders or update payment methods.

### Regional Isolation (Bonus Objective)
Data access is filtered at the Service layer based on the user's `country`.
- **Restaurants**: `findAll` returns only restaurants matching user's country (unless Admin).
- **Orders**: 
    - `create` validates that all items belong to restaurants in the user's country.
    - `findAll` returns orders matching the user's country.
    - `cancel` validates that the order belongs to the user's country.

### Database Design (Prisma)
- **User**: Stores Role, Country, Payment Method.
- **Restaurant**: Linked to Country.
- **MenuItem**: Linked to Restaurant.
- **Order**: Linked to User and Country. Contains OrderItems.
- **OrderItem**: Snapshot of items in an order.

### Tech Choices
- **NestJS**: For modular, scalable architecture.
- **Prisma**: Type-safe database interactions.
- **SQLite**: Simple local database for development.

### Access Control Implementation
- `AuthGuard`: Validates `x-user-id` header and populates `request.user`.
- `RolesGuard` (Logic embedded in Services for stricter control): Service methods check `user.role` and `user.country` before executing actions.
