package br.com.luizgustavosgobi.phonetracker.api.models;

import br.com.luizgustavosgobi.phonetracker.api.enums.UserRoles;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "TB_USER")
public class UserModel {

    @Id
    private String id;

    @NotNull private String name;

    @JsonIgnore
    @NotNull private String password;

    @Enumerated(EnumType.STRING)
    @NotNull private UserRoles role = UserRoles.STUDENT;
}
