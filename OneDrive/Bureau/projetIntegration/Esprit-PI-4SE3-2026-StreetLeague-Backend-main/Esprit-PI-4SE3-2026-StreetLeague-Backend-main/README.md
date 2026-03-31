# Street League - Amateur Sports Platform

A unified digital platform for amateur sports management with JWT authentication and role-based access control.

## Features

- **User Management**: Multiple user roles (Admin, Player, Coach, Referee, Health Professional, Sponsor, Venue Owner)
- **Event Management**: Matches, tournaments, and training sessions
- **Venue Booking**: Reserve sports fields and venues
- **Health Tracking**: Medical records and injury management
- **Digital Wallet**: Secure payment system
- **Community**: Posts, comments, and social features
- **Carpooling**: Coordinate transportation to events
- **Fantasy Sports**: Virtual teams and rewards
- **Shop**: Purchase team merchandise

## Tech Stack

- **Backend**: Spring Boot 4.0.3, Java 21
- **Security**: Spring Security + JWT
- **Database**: MySQL
- **ORM**: JPA/Hibernate

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token

### Role-Based Access
- `/admin/**` - Admin only
- `/player/**` - Player only
- `/coach/**` - Coach only
- `/referee/**` - Referee only
- `/health/**` - Health Professional only
- `/sponsor/**` - Sponsor only
- `/venue/**` - Venue Owner only

## Setup

1. Clone the repository
2. Configure MySQL database in `application.properties`
3. Run: `mvn spring-boot:run`
4. Server runs on: `http://localhost:8089/SpringSecurity`

## Database Configuration

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/pi
spring.datasource.username=root
spring.datasource.password=
```

## User Roles

- `ADMIN` - Platform administration
- `PLAYER` - Athletes and players
- `COACH` - Team coaches
- `REFEREE` - Match officials
- `HEALTH_PROFESSIONAL` - Medical staff
- `SPONSOR` - Event sponsors
- `VENUE_OWNER` - Field/venue owners

## Security

- JWT-based stateless authentication
- Role-based authorization
- CORS enabled for Angular frontend (localhost:4200)
- Password encryption with BCrypt
