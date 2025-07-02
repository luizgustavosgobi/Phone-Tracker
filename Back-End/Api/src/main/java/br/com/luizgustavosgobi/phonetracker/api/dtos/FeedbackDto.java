package br.com.luizgustavosgobi.phonetracker.api.dtos;

import br.com.luizgustavosgobi.phonetracker.api.enums.OccurrenceStatus;
import jakarta.validation.constraints.NotNull;

public record FeedbackDto(
        String studentId,
        String comments,
        @NotNull OccurrenceStatus status
) {}