package br.com.luizgustavosgobi.phonetracker.api.controllers;

import br.com.luizgustavosgobi.phonetracker.api.services.ProofsService;
import br.com.luizgustavosgobi.phonetracker.api.services.TempTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/proofs")
@Tag(name = "Proofs", description = "Proof file management endpoints for accessing occurrence evidence")
@SecurityRequirement(name = "bearerAuth")
public class ProofsController {

    @Autowired private ProofsService proofsService;
    @Autowired private TempTokenService tempTokenService;

    @GetMapping("/{fileName}")
    @Operation(summary = "Direct get an proof file by the file name", description = "**Required Permissions:** None - Public endpoint (Has to be authenticated)")
    public ResponseEntity<Resource> getProof(@PathVariable String fileName) {
        try {
            Path sanitizedFilePath = proofsService.validateFileName(fileName);

            if (!Files.exists(sanitizedFilePath)) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "File not found");
            }

            Resource resource = new UrlResource(sanitizedFilePath.toUri());
            String contentType = Files.probeContentType(sanitizedFilePath);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error reading file", e);
        }
    }

    @GetMapping("/public/{tempToken}")
    @Operation(summary = "Get an proof file by an temporary token", description = "**Required Permissions:** None - Public endpoint")
    public ResponseEntity<Resource> getProofByPublicToken(@PathVariable String tempToken) {
        return this.getProof(tempTokenService.validateTempToken(tempToken));
    }
}
