package br.com.luizgustavosgobi.phonetracker.api.dtos.responses;

import br.com.luizgustavosgobi.phonetracker.api.enums.UserRoles;
import lombok.Data;

@Data
public class StudentResponseDto {
    String id;
    String name;
    String photo;
    String course;
    UserRoles role = UserRoles.STUDENT;
}
