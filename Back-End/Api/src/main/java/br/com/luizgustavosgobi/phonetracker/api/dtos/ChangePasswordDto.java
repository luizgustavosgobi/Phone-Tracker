package br.com.luizgustavosgobi.phonetracker.api.dtos;

import jakarta.validation.constraints.NotBlank;

public record ChangePasswordDto(
        @NotBlank String id,
        String oldPassword,
        @NotBlank String newPassword
) {
}
