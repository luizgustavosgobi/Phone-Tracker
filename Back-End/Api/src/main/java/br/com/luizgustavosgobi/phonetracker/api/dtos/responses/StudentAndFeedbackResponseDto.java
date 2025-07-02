package br.com.luizgustavosgobi.phonetracker.api.dtos.responses;

import lombok.Data;

import java.util.Set;
import java.util.UUID;

@Data
public class StudentAndFeedbackResponseDto {
    String id;
    String name;
    String photo;
    String course;
    Set<FeedbackDTO> occurrences;

    @Data
    public static class FeedbackDTO {
        UUID id;
        String comments;
        String status;
    }
}
