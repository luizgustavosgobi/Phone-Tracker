package br.com.luizgustavosgobi.phonetracker.api.dtos;

import br.com.luizgustavosgobi.phonetracker.api.enums.OccurrenceStatus;
import br.com.luizgustavosgobi.phonetracker.api.enums.OccurrenceType;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
public class OccurrenceFilterDto {

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    LocalDate startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    LocalDate endDate;

    OccurrenceStatus status;

    OccurrenceType type;

    Integer cameraId;

    String local;

    String studentId;
}
