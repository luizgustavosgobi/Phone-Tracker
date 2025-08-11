package br.com.luizgustavosgobi.phonetracker.api.services;

import io.github.thibaultmeyer.cuid.CUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class ApiKeyService {
    @Autowired private RedisTemplate<String, String> redisTemplate;

    private static final String API_TOKEN_PREFIX = "api-token:";

    public boolean addKey(CUID token, Duration expiration) {
        if (token == null) throw new IllegalArgumentException("Token cannot be null");
        if (redisTemplate.hasKey(API_TOKEN_PREFIX + token)) return false;

        redisTemplate.opsForValue().set(API_TOKEN_PREFIX + token, "valid", expiration);
        return true;
    }

    public boolean addKey(CUID token) {
        if (token == null) throw new IllegalArgumentException("Token cannot be null");
        if (redisTemplate.hasKey(API_TOKEN_PREFIX + token)) return false;

        redisTemplate.opsForValue().set(API_TOKEN_PREFIX + token, "valid");
        return true;
    }

    public boolean isKeyValid(String token) {
        if (token == null) return false;

        String value = redisTemplate.opsForValue().get(API_TOKEN_PREFIX + token);
        if (value == null) return false;
        return value.equals("valid");
    }

    public void removeKey(CUID token) {
        redisTemplate.delete(API_TOKEN_PREFIX + token);
    }
}
