package br.com.luizgustavosgobi.phonetracker.api.dtos;

import jakarta.validation.constraints.NotBlank;

public record LoginDto(
        @NotBlank String id,
        @NotBlank String password) {
}
