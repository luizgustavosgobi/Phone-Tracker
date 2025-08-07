package br.com.luizgustavosgobi.phonetracker.api.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "TB_OCCURRENCE_INFERENCE_METADATA")
public class OccurrenceInferenceMetadataModel {

    @Id private UUID id;

    @Column(name = "tracking_id")
    @NotNull private Integer trackingId;

    @ManyToOne @JoinColumn(name = "predicted_student_id")
    private StudentModel predictedStudent;

    @OneToOne @MapsId @JoinColumn(name = "id")
    private OccurrenceModel occurrence;
}
