package br.com.luizgustavosgobi.phonetracker.api.dtos.responses;

import br.com.luizgustavosgobi.phonetracker.api.enums.UserRoles;
import lombok.Data;

import java.util.Set;
import java.util.UUID;

@Data
public class StudentAndFeedbackResponseDto {
    String id;
    String name;
    String photo;
    String course;
    UserRoles role = UserRoles.STUDENT;
    Set<FeedbackDTO> occurrences;

    @Data
    public static class FeedbackDTO {
        UUID id;
        String comments;
        String status;
    }
}
