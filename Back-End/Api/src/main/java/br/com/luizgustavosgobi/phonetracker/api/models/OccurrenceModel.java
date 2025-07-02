package br.com.luizgustavosgobi.phonetracker.api.models;

import br.com.luizgustavosgobi.phonetracker.api.enums.OccurrenceType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "TB_OCCURRENCE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OccurrenceModel implements Serializable {

    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull private LocalDateTime date;
    @NotNull private Integer cameraId;

    private String local;
    private String proofFile;

    @NotNull @Enumerated(EnumType.STRING)
    private OccurrenceType type = OccurrenceType.CELLPHONE;

    @OneToOne(mappedBy = "occurrence", cascade = CascadeType.ALL, orphanRemoval = true)
    private FeedbackModel feedback;

}
