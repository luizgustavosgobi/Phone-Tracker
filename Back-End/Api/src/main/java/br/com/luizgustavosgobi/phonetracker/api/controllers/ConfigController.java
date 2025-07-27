package br.com.luizgustavosgobi.phonetracker.api.controllers;

import br.com.luizgustavosgobi.phonetracker.api.services.ApiKeyService;
import io.github.thibaultmeyer.cuid.CUID;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/config")
@Tag(name = "Configurations", description = "Configuration management endpoints")
@SecurityRequirement(name = "bearerAuth")
public class ConfigController {

    @Autowired private ApiKeyService apiKeyService;

    @PostMapping("/generate-api-key")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<cuidResponseDto> generateApiKey() {
        CUID cuid = CUID.randomCUID2();

        apiKeyService.addKey(cuid);
        return ResponseEntity.ok(new cuidResponseDto(cuid.toString()));
    }

    private record cuidResponseDto(String key) {}
}
