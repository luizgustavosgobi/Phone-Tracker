package br.com.luizgustavosgobi.phonetracker.api.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Duration;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Autowired private CustomUserDetailsService userDetailsService;

    @Value("${app.jwt.secret-key}")
    private String secret;

    private static final long JWT_EXPIRATION = 1000 * 60 * 60 * 24; // 24 horas
    private static Key SECRET_KEY;

    @PostConstruct
    public void init() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);

        if (keyBytes.length < 32) {
            byte[] paddedKey = new byte[32];
            System.arraycopy(keyBytes, 0, paddedKey, 0, keyBytes.length);
            for (int i = keyBytes.length; i < paddedKey.length; i++) {
                paddedKey[i] = (byte) (keyBytes[i % keyBytes.length] ^ 0x55);
            }
            SECRET_KEY = Keys.hmacShaKeyFor(paddedKey);
        } else SECRET_KEY = Keys.hmacShaKeyFor(keyBytes);
    }

    // Generate

    public String generateToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                .signWith(SECRET_KEY, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateToken(Authentication authentication) {
        List<String> roles = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", roles);

        return generateToken(claims, authentication.getName());
    }

    // Extract Infos

    public String extractUserId(String token) {
        try { return extractClaim(token, Claims::getSubject); }
        catch (Exception _) { return null; }
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        final Claims claims = extractAllClaims(token);
        return claims.get("roles", List.class);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // Validate

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUserId(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // Auxiliary

    public UserDetails validateAndGetUserDetails(String token) throws AuthenticationException {
        String userId = extractUserId(token);
        if (userId == null)
            throw new BadCredentialsException("Invalid token");

        UserDetails user = userDetailsService.loadUserByUsername(userId);
        if (!isTokenValid(token, user) || tokenBlacklistService.isBlacklisted(token))
            throw new BadCredentialsException("Invalid token");

        return user;
    }

    public void invalidateToken(String token) throws AuthenticationException {
        validateAndGetUserDetails(token);

        long timeLeftToExpireMs = extractExpiration(token).getTime() - new Date().getTime();
        tokenBlacklistService.addToBlacklist(token, Duration.ofMillis(timeLeftToExpireMs));
        SecurityContextHolder.clearContext();
    }
}
