package br.com.luizgustavosgobi.phonetracker.api.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class TempTokenService {
    private final Map<String, TempTokenData> tokenStore = new ConcurrentHashMap<>();
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    @Value("${app.temp-token.expiry:30}")
    private int expiryMinutes;

    public String generateTempToken(String fileName) {
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(expiryMinutes);

        TempTokenData tokenData = new TempTokenData(fileName, expiryTime);
        tokenStore.put(token, tokenData);

        scheduler.schedule(() -> tokenStore.remove(token), expiryMinutes, TimeUnit.MINUTES);
        return token;
    }

    public String validateTempToken(String token) {
        TempTokenData tokenData = tokenStore.get(token);

        if (tokenData == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }

        if (LocalDateTime.now().isAfter(tokenData.expiryTime())) {
            tokenStore.remove(token);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired token");
        }

        return tokenData.fileName();
    }

    private record TempTokenData(String fileName, LocalDateTime expiryTime) {}
}
