package br.com.luizgustavosgobi.phonetracker.api.dtos;

import br.com.luizgustavosgobi.phonetracker.api.enums.UserRoles;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserDto(
        @NotBlank String id,
        @NotBlank String name,
        @NotNull UserRoles role
) {
}
