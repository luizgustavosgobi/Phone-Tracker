package br.com.luizgustavosgobi.phonetracker.api.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public record OccurrenceNotificationDto (
        UUID occurrenceId,
        String action,
        LocalDateTime timestamp
) { }
