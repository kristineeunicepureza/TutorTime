# CORS Configuration Guide

The frontend is now configured to handle CORS requests properly. To complete the setup, you need to configure your Java Spring Boot backend to allow cross-origin requests.

## Backend CORS Configuration (Spring Boot)

Add the following configuration to your Spring Boot application:

### Option 1: Using @CrossOrigin Annotation (Per Controller)

```java
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:3000", 
             allowedHeaders = "*", 
             allowCredentials = "true",
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RequestMapping("/api")
public class AuthController {
    // Your endpoints here
}
```

### Option 2: Global CORS Configuration (Recommended)

Create a configuration class:

```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### Option 3: Using Properties File (application.properties/application.yml)

```properties
# application.properties
server.servlet.session.cookie.same-site=none
server.servlet.session.cookie.secure=true
```

## Frontend Configuration

The frontend is already configured with:
- ✅ `credentials: 'include'` for all API requests
- ✅ Proper `Content-Type` headers
- ✅ Bearer token authorization headers
- ✅ Environment-based API URL configuration

## Environment Variables

**Development:**
```
REACT_APP_API_URL=http://localhost:8080/api
```

**Production:**
```
REACT_APP_API_URL=https://your-production-api.com/api
```

## Testing CORS

1. Start your Spring Boot backend on port 8080
2. Start your React app on port 3000
3. Open browser DevTools (F12)
4. Go to Network tab
5. Try logging in
6. Look for the login request and check the `Access-Control-Allow-*` headers in the Response

### Expected Response Headers:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: *
```

## Common CORS Errors and Solutions

### Error: "No 'Access-Control-Allow-Origin' header"
- Backend is not configured to allow the frontend URL
- Solution: Add the CORS configuration above to your backend

### Error: "credentials mode is 'include'"
- The backend is not allowing credentials
- Solution: Add `allowCredentials(true)` to your CORS config

### Error: "Method not allowed"
- The backend is not allowing the HTTP method (GET, POST, etc.)
- Solution: Add the method to `allowedMethods`

## Troubleshooting Checklist

- [ ] Backend is running on http://localhost:8080
- [ ] Frontend is running on http://localhost:3000
- [ ] Backend has CORS configured for `http://localhost:3000`
- [ ] Backend CORS config includes all required HTTP methods
- [ ] Backend CORS config has `allowCredentials(true)`
- [ ] No typos in authorized origins
- [ ] Browser cache is cleared (or use Incognito mode)
- [ ] Check browser console for detailed error messages

## For Production

When deploying to production, update the CORS configuration:

```java
.allowedOrigins("https://your-frontend-domain.com")
```

And in `.env`:
```
REACT_APP_API_URL=https://your-backend-domain.com/api
```

## Additional Resources

- [Spring Boot CORS Documentation](https://spring.io/blog/2015/06/08/cors-in-spring-framework)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Fetch API Credentials](https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials)
