package br.com.luizgustavosgobi.phonetracker.api.repositories;

import br.com.luizgustavosgobi.phonetracker.api.models.OccurrenceModel;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.UUID;

public interface OccurrenceRepository extends CrudRepository<OccurrenceModel, UUID>, JpaSpecificationExecutor<OccurrenceModel> {

    List<OccurrenceModel> findByFeedbackIsNull();

    @Query("SELECT CAST(o.date AS DATE) as dia, COUNT(o) FROM OccurrenceModel o GROUP BY CAST(o.date AS DATE)")
    List<Object[]> countOccurrencesByDay();

    @Query("SELECT EXTRACT(HOUR FROM o.date) as hora, COUNT(o) FROM OccurrenceModel o GROUP BY EXTRACT(HOUR FROM o.date)")
    List<Object[]> countOccurrencesByHour();

    @Query("SELECT o.cameraId, COUNT(o) FROM OccurrenceModel o GROUP BY o.cameraId")
    List<Object[]> countOccurrencesByCamera();

    @Query("SELECT o.local, COUNT(o) FROM OccurrenceModel o WHERE o.local IS NOT NULL GROUP BY o.local")
    List<Object[]> countOccurrencesByLocation();

    @Query("SELECT o.type, COUNT(o) FROM OccurrenceModel o GROUP BY o.type")
    List<Object[]> countOccurrencesByType();

    @Query("SELECT CAST(o.date AS DATE) as dia, o.type, COUNT(o) FROM OccurrenceModel o GROUP BY CAST(o.date AS DATE), o.type ORDER BY CAST(o.date AS DATE)")
    List<Object[]> countOccurrencesByDateAndType();
}