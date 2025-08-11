package br.com.luizgustavosgobi.phonetracker.api.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "TB_STUDENT_EMBEDDINGS")
public class StudentEmbeddingsModel {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne @JoinColumn(name = "student_id")
    private StudentModel student;

    @Column(name = "tracking_id")
    @NotNull private Integer trackingId;

    @Column(name = "embedding", columnDefinition = "vector(512)")
    @NotNull private float[] embedding;

    @NotNull private LocalDateTime timestamp;
}
