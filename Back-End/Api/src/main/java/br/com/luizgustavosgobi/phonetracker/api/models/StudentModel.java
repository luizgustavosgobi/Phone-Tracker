package br.com.luizgustavosgobi.phonetracker.api.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "TB_STUDENT")
public class StudentModel {
    @Id String id;

    @NotNull String name;
    String photo;
    @NotNull String course;

    @JsonIgnore
    @NotNull String password;

    @OneToMany(mappedBy = "student", cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private Set<FeedbackModel> occurrences;


    @PreRemove
    private void preRemove() {
        for (FeedbackModel feedback : occurrences) {
            feedback.setStudent(null);
        }
    }
}
