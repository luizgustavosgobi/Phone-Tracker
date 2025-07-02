package br.com.luizgustavosgobi.phonetracker.api.dtos;

import jakarta.validation.constraints.NotBlank;

public record JwtTokenDto(
        @NotBlank String token
) {}
