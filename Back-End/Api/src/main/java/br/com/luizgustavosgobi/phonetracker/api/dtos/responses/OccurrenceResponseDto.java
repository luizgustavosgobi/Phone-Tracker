package br.com.luizgustavosgobi.phonetracker.api.dtos.responses;

import br.com.luizgustavosgobi.phonetracker.api.enums.OccurrenceType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class OccurrenceResponseDto {
    private UUID id;
    private String local;
    private LocalDateTime date;
    private OccurrenceType type;
    private String cameraId;
    private String proof;
    private FeedbackDTO feedback;

    @Data
    public static class FeedbackDTO {
        private String comments;
        private String status;
        private StudentDTO student;
    }

    @Data
    public static class StudentDTO {
        private String id;
        private String name;
    }

    public OccurrenceResponseDto processFeedbackFile(String token) {
        if (token != null)
            this.setProof(token);
        return this;
    }
}