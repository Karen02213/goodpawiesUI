# GoodPawies API Server

A professional, secure authentication and API server for the GoodPawies pet social media platform.

## Features

### 🔐 Advanced Authentication & Security
- **JWT-based authentication** with access and refresh tokens
- **Argon2 password hashing** - industry standard security
- **Rate limiting** to prevent abuse and DDoS attacks
- **Session management** with automatic cleanup
- **CORS protection** and security headers via Helmet
- **Input validation** and sanitization
- **Account lockout** after failed attempts
- **Secure cookie handling** with HttpOnly flags

### 🛡️ Professional Security Practices
- **Password complexity validation**
- **SQL injection protection** with prepared statements
- **XSS prevention** through input sanitization
- **CSRF protection** with SameSite cookies
- **Brute force protection** with progressive delays
- **Token rotation** for enhanced security
- **Encrypted sensitive data** storage

### 📊 Database Management
- **MySQL connection pooling** for optimal performance
- **Database transactions** for data integrity
- **Automatic cleanup** of expired tokens and sessions
- **Soft deletion** for data recovery
- **Optimized queries** with proper indexing

### 🔄 RESTful API Design
- **Consistent response format** with proper HTTP status codes
- **Pagination support** for large data sets
- **Comprehensive error handling** with detailed messages
- **Request/response validation** using express-validator
- **API versioning** ready structure

## API Endpoints

### Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/register` | Register new user account | ❌ |
| `POST` | `/login` | Authenticate user | ❌ |
| `POST` | `/refresh` | Refresh access token | ✅ (Refresh Token) |
| `POST` | `/logout` | Logout current session | ✅ |
| `POST` | `/logout-all` | Logout from all devices | ✅ |
| `POST` | `/change-password` | Change user password | ✅ |
| `GET` | `/me` | Get current user info | ✅ |
| `GET` | `/sessions` | Get active sessions | ✅ |
| `DELETE` | `/sessions/:sessionId` | Revoke specific session | ✅ |
| `POST` | `/validate` | Validate current token | ✅ |

### User Management (`/api/users`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/users/:userid` | Get user profile | ❌ (Public data) |
| `PUT` | `/users/:userid` | Update user profile | ✅ (Owner only) |
| `GET` | `/users/:userid/pets` | Get user's pets | ❌ |
| `POST` | `/users/:userid/pets` | Create new pet | ✅ (Owner only) |

### Pet Management (`/api/pets`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/pets/:petid` | Get pet information | ❌ |
| `PUT` | `/pets/:petid` | Update pet information | ✅ (Owner only) |
| `DELETE` | `/pets/:petid` | Delete pet | ✅ (Owner only) |

### QR Code Generation (`/api/qr`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/qr/generate` | Generate QR code for pet | ✅ (Owner only) |
| `GET` | `/qr/image/:filename` | Serve QR code image | ❌ |

### Utility Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/health` | Health check | ❌ |
| `GET` | `/api/hello` | Legacy hello endpoint | ❌ |

## Setup Instructions

### 1. Prerequisites
- Node.js 16+ and npm 8+
- MySQL 8.0+
- Docker (optional, for database)

### 2. Database Setup
```bash
# Start MySQL with Docker (optional)
docker-compose up -d mysql

# Or use your existing MySQL installation
# Create database and run setup scripts
mysql -u root -p < ../database/user_setup.sql
mysql -u root -p < ../database/access_setup.sql
mysql -u root -p < ../database/enhanced_auth_setup.sql
```

### 3. Server Setup
```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Edit .env file with your configuration
nano .env

# Start development server
npm run dev

# Or start production server
npm start
```

### 4. Environment Configuration

Create a `.env` file with the following variables:

```env
# Essential Configuration
NODE_ENV=production
PORT=5000
CLIENT_URL=https://your-frontend-domain.com

# Database
DB_HOST=localhost
DB_USER=goodpawiesuser
DB_PASSWORD=your-secure-password
DB_NAME=goodpawiesdb

# JWT Secrets (MUST CHANGE IN PRODUCTION)
JWT_SECRET=your-super-long-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# Encryption Key (MUST CHANGE IN PRODUCTION)
ENCRYPTION_KEY=your-32-byte-encryption-key
```

## Security Considerations

### 🔑 Production Secrets
- **Change all default secrets** in environment variables
- **Use strong, unique passwords** for database access
- **Generate cryptographically secure keys** for JWT and encryption
- **Enable HTTPS** in production environments

### 🌐 CORS Configuration
- **Whitelist specific origins** instead of allowing all
- **Configure proper headers** for cross-origin requests
- **Use secure, sameSite cookies** for authentication

### 🔒 Rate Limiting
- **Authentication endpoints**: 5 attempts per 15 minutes
- **Registration**: 3 attempts per hour per IP
- **General API**: 1000 requests per 15 minutes
- **Custom tracking** for login attempts in database

### 🏗️ Database Security
- **Use connection pooling** to prevent connection exhaustion
- **Implement prepared statements** to prevent SQL injection
- **Regular cleanup** of expired tokens and sessions
- **Account lockout** after 5 failed login attempts

## Error Handling

### Standard Response Format
```json
{
  "success": boolean,
  "message": "string",
  "data": object,
  "error": "ERROR_CODE",
  "details": array
}
```

### Common Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_REQUIRED` - Valid token required
- `FORBIDDEN` - Insufficient permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `USER_NOT_FOUND` - User does not exist
- `INVALID_CREDENTIALS` - Wrong username/password
- `ACCOUNT_LOCKED` - Account temporarily locked
- `TOKEN_EXPIRED` - Access token has expired
- `INTERNAL_ERROR` - Server error

## Development

### Project Structure
```
server/
├── middleware/
│   ├── auth.js          # Authentication middleware
│   ├── validation.js    # Input validation
│   └── rateLimiting.js  # Rate limiting
├── utils/
│   └── auth.js          # Authentication utilities
├── database/
│   ├── user_setup.sql
│   ├── access_setup.sql
│   └── enhanced_auth_setup.sql
├── temp/                # QR code storage
├── auth.js              # Authentication routes
├── index.js             # Main server file
└── package.json
```

### Adding New Endpoints
1. **Add validation rules** in `middleware/validation.js`
2. **Implement route handler** with proper error handling
3. **Add authentication/authorization** as needed
4. **Update API documentation** in this README

### Testing
```bash
# Run basic health check
curl http://localhost:5000/api/health

# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"testuser","password":"testpass"}'
```

## Performance Optimization

### Database Optimization
- **Connection pooling** with configurable limits
- **Proper indexing** on frequently queried columns
- **Query optimization** with EXPLAIN analysis
- **Regular cleanup** of expired data

### Memory Management
- **Automatic token cleanup** every hour
- **Configurable rate limiting** windows
- **Efficient session storage** in database
- **Graceful shutdown** handling

### Monitoring
- **Health check endpoint** for load balancers
- **Comprehensive error logging** with timestamps
- **Request/response logging** (configurable)
- **Performance metrics** ready for integration

## License

MIT License - see LICENSE file for details

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## Support

For issues and questions:
- Create an issue in the repository
- Check existing documentation
- Review the API endpoint specifications
