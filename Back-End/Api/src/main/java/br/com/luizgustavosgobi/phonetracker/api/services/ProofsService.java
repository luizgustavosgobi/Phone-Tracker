package br.com.luizgustavosgobi.phonetracker.api.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ProofsService {
    @Value("${app.proofs.path:src/main/resources/proofs/}")
    private String DEFAULT_PROOFS_PATH;

    public String saveProofFile(MultipartFile proof) {
        String originalFileName = proof.getOriginalFilename();
        if (originalFileName == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Proof file name is null");

        String fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        String newFileName = UUID.randomUUID() + fileExtension;

        try {
            Path dir = Paths.get(DEFAULT_PROOFS_PATH);
            if (!Files.exists(dir))
                Files.createDirectories(dir);

            proof.transferTo(dir.resolve(newFileName));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error trying to save the proof file", e);
        }

        return newFileName;
    }

    public void deleteProofFile(String fileName){
        try {
            Files.deleteIfExists(Paths.get(DEFAULT_PROOFS_PATH + fileName));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error trying to delete the file", e);
        }
    }

    public Path validateFileName(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name");
        }

        String uuidPattern = "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\\.[a-zA-Z0-9]{2,10}$";

        if (!fileName.matches(uuidPattern)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid file name");
        }

        Path filePath = Paths.get(DEFAULT_PROOFS_PATH + fileName);
        Path basePath = Paths.get(DEFAULT_PROOFS_PATH).toAbsolutePath().normalize();

        if (!filePath.toAbsolutePath().normalize().startsWith(basePath)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }

        return filePath;
    }
}
