package br.com.luizgustavosgobi.phonetracker.api.dtos;

import br.com.luizgustavosgobi.phonetracker.api.enums.OccurrenceType;
import jakarta.validation.constraints.NotNull;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

public record OccurrenceDto(
        @NotNull @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date,
        @NotNull OccurrenceType type,
        @NotNull Integer cameraId,
        String local,
        MultipartFile proof
) {
}