package main.java.com.mc426.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CriaturaDTO {
    private String nome;
    private String tipo;
    private double latitude;
    private double longitude;
}

