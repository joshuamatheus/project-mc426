package main.java.com.mc426.backend.entity;

import java.lang.annotation.Inherited;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@Entity
@Table(name = "criatura")
public class Criatura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome;
    private String tipo;
    private double latitude;
    private double longitude;
}
