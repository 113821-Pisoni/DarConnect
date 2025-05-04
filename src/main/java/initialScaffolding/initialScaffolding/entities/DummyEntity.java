package initialScaffolding.initialScaffolding.entities;

import jakarta.persistence.*;

@Entity
public class DummyEntity {
    //CP: Como toda entidad como toda entidad tiene que tener una identificacion.
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    private String dummy;

}
