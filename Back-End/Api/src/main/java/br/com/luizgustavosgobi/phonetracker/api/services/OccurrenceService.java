package br.com.luizgustavosgobi.phonetracker.api.services;

import br.com.luizgustavosgobi.phonetracker.api.dtos.OccurrenceFilterDto;
import br.com.luizgustavosgobi.phonetracker.api.models.OccurrenceModel;
import br.com.luizgustavosgobi.phonetracker.api.repositories.OccurrenceRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OccurrenceService {
    @Autowired private OccurrenceRepository occurrenceRepository;

    public Specification<OccurrenceModel> buildQuerySpecification(OccurrenceFilterDto filters) {
        if (filters.getStartDate() != null && filters.getEndDate() != null && filters.getStartDate().isAfter(filters.getEndDate()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Start date must be before end date");

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
