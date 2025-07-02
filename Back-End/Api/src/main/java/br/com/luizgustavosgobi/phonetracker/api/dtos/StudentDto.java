package br.com.luizgustavosgobi.phonetracker.api.dtos;

import jakarta.validation.constraints.NotBlank;

public record StudentDto(
        @NotBlank String id,
        @NotBlank String name,
        String photo,
        @NotBlank String course
) {
}
