package br.com.luizgustavosgobi.phonetracker.api.repositories;

import br.com.luizgustavosgobi.phonetracker.api.models.OccurrenceInferenceMetadataModel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OccurrenceInferenceMetadataRepository extends JpaRepository<OccurrenceInferenceMetadataModel, String> {
}
