package initialScaffolding.initialScaffolding.repositories;

import initialScaffolding.initialScaffolding.entities.DummyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DummyRepository extends JpaRepository<DummyEntity, Long> {

}