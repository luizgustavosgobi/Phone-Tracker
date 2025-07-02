package br.com.luizgustavosgobi.phonetracker.api.models;

import br.com.luizgustavosgobi.phonetracker.api.enums.OccurrenceStatus;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "TB_OCCURRENCE_FEEDBACK")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class FeedbackModel {

    @Id private UUID id;

    String comments;

    @Enumerated(EnumType.STRING) @NotNull
    private OccurrenceStatus status = OccurrenceStatus.PENDING;

    @OneToOne @MapsId @JoinColumn(name = "id")
    private OccurrenceModel occurrence;

    @ManyToOne @JoinColumn(name = "student_id")
    private StudentModel student;
}
