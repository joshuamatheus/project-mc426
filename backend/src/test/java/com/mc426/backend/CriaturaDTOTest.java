package test.java.com.mc426.backend;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import main.java.com.mc426.backend.dto.CriaturaDTO;
import main.java.com.mc426.backend.entity.Criatura;

public class CriaturaDTOTest {

    @Test
    public void testCriaturaDTOWithBuilder() {
        CriaturaDTO dto = CriaturaDTO.builder()
            .nome("Dracon")
            .tipo("Fogo")
            .latitude(-22.8184)
            .longitude(-47.0707)
            .build();

        assertEquals("Dracon", dto.getNome());
        assertEquals("Fogo", dto.getTipo());
        assertEquals(-22.8184, dto.getLatitude(), 0.0001);
        assertEquals(-47.0707, dto.getLongitude(), 0.0001);
    }
}
