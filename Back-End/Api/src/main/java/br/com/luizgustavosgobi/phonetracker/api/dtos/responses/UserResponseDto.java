package br.com.luizgustavosgobi.phonetracker.api.dtos.responses;

import br.com.luizgustavosgobi.phonetracker.api.enums.UserRoles;
import lombok.Data;

@Data
public class UserResponseDto {
    String id;
    String name;
    UserRoles role;
}
