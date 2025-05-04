package initialScaffolding.initialScaffolding.controllers;

import initialScaffolding.initialScaffolding.dtos.DummyDto;
import initialScaffolding.initialScaffolding.models.Dummy;
import initialScaffolding.initialScaffolding.services.DummyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dummy") //CP: esto coloca en cada Mapping el nombre dummy
public class DummyController {
    //CP: Inyecta la dependencia
    @Autowired
    private DummyService dummyService;

    //CP: lo que se hace aqui hay que hacerlo con cada uno de los verbos. (Mapeo segun verbo)
    //Get
    @GetMapping("")
    public ResponseEntity<DummyDto> getDummyList(){
        List<Dummy> dummyList = dummyService.getDummyList(); //De esta manera ya esta conectado el controlador con el servicio.
        return null;
    }
    //CP: Este trae segun id, lo recibe por un body o por el path variable directamente el id.
    @GetMapping("/{id}")
    public ResponseEntity<DummyDto> getDummyList(@PathVariable Long id){
        Dummy dummy = dummyService.getDummy(id);
        return null;
    }
    //Post
    @PostMapping("")
    public ResponseEntity<DummyDto> postDummy(){
        Dummy dummy = dummyService.createDummy(null);
        return null;
    }
    //Put
    @PutMapping("")
    public ResponseEntity<DummyDto> putDummy(){
        Dummy dummy = dummyService.updateDummy(null);
        return null;
    }
    //Delete
    @DeleteMapping("")
    public ResponseEntity<DummyDto> deleteDummy(){
        dummyService.deleteDummy(null); //CP: como es void no va el Dummy dummy.
        return null;
    }
}
