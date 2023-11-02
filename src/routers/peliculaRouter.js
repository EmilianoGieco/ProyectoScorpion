const peliculaController = require('../controllers/peliculaController');
const multer = require("multer");
const express = require('express');
const router = express.Router();
const path = require("path");

const autenticacionMiddleware = require('../middlewares/autenticacionMiddleware');


console.log(path.join(__dirname, '../../public/img'))
const upload = multer();

//ruta carpeta detalle pelicula
router.get("/detalle/:id", peliculaController.detallePelicula);
//guardado de las calificaciones del usuario
router.post("/detalle/:id", peliculaController.guardado);

router.post("/detalle/:id", peliculaController.mostrarCalificaciones);



router.get("/CrearFilm", autenticacionMiddleware, (req, res, next) => {
    if (req.session.userLogged && req.session.userLogged.administrador === 1) {
        return next();
    } else {
        return res.status(403).send("Acceso denegado. No eres un administrador.");
    }
}, peliculaController.getCrearFilm);

router.post("/CrearFilm", upload.single("imagen"), autenticacionMiddleware, (req, res, next) => {
    if (req.session.userLogged && req.session.userLogged.administrador === 1) {
        return next();
    } else {
        return res.status(403).send("Acceso denegado. No eres un administrador.");
    }
}, peliculaController.postCrearFilm);

//ruta actualizacionFilm
router.get("/actualizarFilm/:id", autenticacionMiddleware, (req, res, next) => {
      if (req.session.userLogged && req.session.userLogged.administrador === 1) {
        return next();
    } else {
        return res.status(403).send("Acceso denegado. No eres un administrador.");
    }
}, peliculaController.getActualizarFilm);
router.put("/actualizarFilm/:id", autenticacionMiddleware, (req, res, next) => {
    if (req.session.userLogged && req.session.userLogged.administrador === 1) {
        return next();
    } else {
        return res.status(403).send("Acceso denegado. No eres un administrador.");
    }
},  upload.single("imagen"), peliculaController.postActualizarFilm);

//ruta de borrado pelicula
router.delete("/delete/:id", peliculaController.delete)

//peliculas de "ultimos estrenos"
router.get("/estrenos", peliculaController.estrenos);
/*detalle de ultimos estrenos*/
router.get("/estrenos/detalle/:id", peliculaController.detalleEstrenos);
//guardado de las calificaciones del usuario
router.post("/estrenos/detalle/:id", peliculaController.guardadoEstrenos);

//peliculas noticias
router.get('/noticias', peliculaController.noticia);
//peliculas noticias detalle
router.get('/noticias/detalle/:id', peliculaController.detalleNoti);

//rutas carpetas las 5 mejores peliculas (slide)
router.get("/detalleNoticia/:idN", peliculaController.detalleNoticia);

//rutas carpetas Series (enrutar como corresponde)
router.get('/seriesNetflix', peliculaController.seriesNetflix);
router.get('/seriesNetflix/detalle/:id', peliculaController.serieNetflix);

router.get('/seriesPrimeVideo', peliculaController.seriesPrimeVideo);
router.get('/seriesPrimeVideo/detalle/:id', peliculaController.seriePrimeVideo);

router.get('/seriesDisneyPlus', peliculaController.seriesDisneyPlus);
router.get('/seriesDisneyPlus/detalle/:id', peliculaController.serieDisneyPlus);

router.get('/seriesHboMax', peliculaController.seriesHboMax);
router.get('/seriesHboMax/detalle/:id', peliculaController.serieHboMax);

router.get('/seriesParamountPlus', peliculaController.seriesParamountPlus);
router.get('/seriesParamountPlus/detalle/:id', peliculaController.serieParamountPlus);

router.get('/seriesStarPlus', peliculaController.seriesStarPlus);
router.get('/seriesStarPlus/detalle/:id', peliculaController.serieStarPlus);


//rutas carpetas pelicula (enrutar como corresponde)

router.get('/peliculasNetflix', peliculaController.peliculasNetflix);
router.get('/peliculasNetflix/detalle/:id', peliculaController.peliculaNetflix);

router.get('/peliculasPrimeVideo', peliculaController.peliculasPrimeVideo);
router.get('/peliculasPrimeVideo/detalle/:id', peliculaController.peliculaPrimeVideo);

router.get('/peliculasDisneyPlus', peliculaController.peliculasDisneyPlus);
router.get('/peliculasDisneyPlus/detalle/:id', peliculaController.peliculaDisneyPlus);

router.get('/peliculasHboMax', peliculaController.peliculasHboMax);
router.get('/peliculasHboMax/detalle/:id', peliculaController.peliculaHboMax);

router.get('/peliculasParamountPlus', peliculaController.peliculasParamountPlus);
router.get('/peliculasParamountPlus/detalle/:id', peliculaController.peliculaParamountPlus);

router.get('/peliculasStarPlus', peliculaController.peliculasStarPlus);
router.get('/peliculasStarPlus/detalle/:id', peliculaController.peliculaStarPlus);




///////////////////////////////APIS/////////////////////////////////////////

//PRODUCTO (PELICULAS Y SERIES)
router.get('/productos',peliculaController.cantidadProductos);
//PRODUCTO POR ID 
router.get('/productos/:id',peliculaController.productoId);

///////////////////////////////FIN APIS PRODUCTO (PELICULAS) /////////////////////////////////////////

//CATEGORIA (GENERO)
router.get('/generos',peliculaController.generosTotal);
//GENERO POR ID 
router.get('/generos/:id',peliculaController.generoId);

///////////////////////////////FIN APIS CATEGORIA (GENERO) /////////////////////////////////////////

router.get("/todo",peliculaController.todo);

router.get("/todo/:id",peliculaController.todoId);


///////////////////////////////comentarios de ALL people /////////////////////////////////////////
//detallePelicula
router.get("/comentarios/:id", peliculaController.obtenerComentarios);

//detalleEstrenos
router.get("/estrenos/detalle/comentarios/:id", peliculaController.obtenerComent);



module.exports = router;
