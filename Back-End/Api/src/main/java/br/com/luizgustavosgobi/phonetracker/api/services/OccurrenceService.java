package br.com.luizgustavosgobi.phonetracker.api.services;

import br.com.luizgustavosgobi.phonetracker.api.dtos.OccurrenceFilterDto;
import br.com.luizgustavosgobi.phonetracker.api.models.OccurrenceModel;
import br.com.luizgustavosgobi.phonetracker.api.repositories.OccurrenceRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OccurrenceService {
    private final String DEFAULT_PROOFS_PATH = "src/main/resources/proofs/";

    @Autowired private OccurrenceRepository occurrenceRepository;

    public String saveOccurrenceFile(MultipartFile proof) {
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

    public void deleteOccurrenceFile(String fileName){
        try {
            Files.deleteIfExists(Paths.get(DEFAULT_PROOFS_PATH + fileName));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error trying to delete the file", e);
        }
    }

    public Specification<OccurrenceModel> buildQuerySpecification(OccurrenceFilterDto filters) {
        if (filters.getStartDate() != null && filters.getEndDate() != null && filters.getStartDate().isAfter(filters.getEndDate()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date must be after end date");

        return (root, _, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filters.getStartDate() != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("date"), filters.getStartDate().atStartOfDay()));

            if (filters.getEndDate() != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("date"), filters.getEndDate().atTime(LocalTime.MAX)));

            if (filters.getType() != null)
                predicates.add(cb.equal(root.get("type"), filters.getType()));

            if (filters.getCameraId() != null)
                predicates.add(cb.equal(root.get("cameraId"), filters.getCameraId()));

            if (filters.getLocal() != null && !filters.getLocal().isBlank())
                predicates.add(cb.like(cb.lower(root.get("local")), "%" + filters.getLocal().toLowerCase() + "%"));

            if (filters.getStatus() != null)
                predicates.add(cb.equal(root.get("feedback").get("status"), filters.getStatus()));

            if (filters.getStudentId() != null)
                predicates.add(cb.equal(root.get("feedback").get("student").get("id"), filters.getStudentId()));

            return predicates.isEmpty() ? null : cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public boolean isUserAllowedToAccessOccurrence(UUID occurrenceId, String userId) {
        OccurrenceModel occurrence = occurrenceRepository.findById(occurrenceId)
                .orElse(null);

        if (occurrence == null || occurrence.getFeedback() == null || occurrence.getFeedback().getStudent() == null) {
            return false;
        }

        return occurrence.getFeedback().getStudent().getId().equals(userId);
    }
}
