package initialScaffolding.initialScaffolding;

public class Pasos {
    /*
    CP: Scaffolding carpetas: controllers, dtos, entities, models, repositories, services (impl). Son 6 en total!
    luego se va a agregar la carpeta CONFIG
    ********************************************************************************************************************

    CP: Primero se crea all scaffolding
    CP: Despues se pone anotacion RestController en Controlador y Service en IServicio
    CP: Agregamos la inyeccion de dependencia en el controlador al servicio con la anotacion del autowired
    CP: Agregamos en DummyServiceImpl el implements de DummyService y le agregamos la anotacion de Service
    CP: Agregamos en el Controlador el Mapeo segun Verbo.

    CP: Agregamos la conexion entre el Controlador y el Servicio a traves del Dummy dummy = dummy.getdummy....asi con cada verbo.
    CP: Ahora conectamos el repositorio con el servicio y el controlador.
    CP: En el DummyServiceImpl cableamos (autowired) con el repositorio
    CP: DummyRepository extiende de JPARepository.
    CP: Agregar la anotacion entity a DummyEntity.
    CP: Agregamos el package Config y le cargamos las clases MapperConfig y SpringDocConfig
    CP: En el pom.xml agregamos las dependencias de mapper y springdoc

    CP !!!!!!!! ->
        A la hora de ir a un examen y tener este scaffolding hecho copiamos la carpeta src con el .gitignore y el pom
        Y se arranca de 0.
        -> Luego solo quedara acomodar en el pom el groupId y el Artefacto
        Llege a 1 hora... se continua al regreso
    ********************************************************************************************************************
    CP: CONTROLADOR
    Acá yo voy a establecer los servicios que voy a tener.

    CP: ISERVICE
    Aca incluimos toda la lista de servicios que voy a tener.


    CP conexion:
      controlador a traves de una interfaz con el servicio y despues con el repositorio
      DummyController -> IService -> DummyService -> Dummy Repository
     */
}
