package br.com.luizgustavosgobi.phonetracker.api.exceptions;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;

@Data
public class ExceptionResponse {
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    LocalDateTime timestamp;
    int status;
    String error;
    String message;
    String path;

    public ExceptionResponse(LocalDateTime timestamp, HttpStatus status, String message, String path) {
        this.timestamp = timestamp;
        this.status = status.value();
        this.error = status.getReasonPhrase();
        this.message = message;
        this.path = path;
    }

    public ExceptionResponse(HttpStatus status, String message, String path) {
        this(LocalDateTime.now(), status, message, path);
    }
}
