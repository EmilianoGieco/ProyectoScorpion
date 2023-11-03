const path = require('path');
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');


const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

//cloudinary       
cloudinary.config({
  cloud_name: 'dlimugyad',
  api_key: '232418438234228',
  api_secret: 'APayZJi7Qqs1U4CbQS2gkE6h1k4'
});

//base de datos conexion
let db = require("../database/models");
const { where } = require('sequelize');
const { Op } = require('sequelize');


/*detalle de las peliculas*/
const controlador = {
  detallePelicula: async (req, res) => {
    try {
      const peliculaId = req.params.id;

      // Obtener detalles de la película
      const movie = await db.productoFilm.findByPk(peliculaId, {
        include:  [
                { association: "genero" },
                { association: "plataforma" },
                { association: "tipo" }
                // Agrega más asociaciones si es necesario
            ]
      });

      

      // Obtener comentarios y calificaciones asociadas a la película
      const comentarios = await controlador.obtenerComentarios(req, res) || [];

      // Renderizar la vista y pasar los detalles de la película, comentarios y calificaciones
      res.render("movies/detallePelicula", { movie: movie, comentarios: comentarios });
    } catch (error) {
      console.error(error);
      res.render('error', { message: 'Error al cargar la página' });
    }
  },

  /*comentarios de ALL people*/

  obtenerComentarios: async (req, res) => {
    try {
      const peliculaId = req.params.id;

      // Obtener los comentarios asociados a la película
      const comentarios = await db.calificacion.findAll({
        where: { id_productoFilm: peliculaId },
        limit: 150,
        include: [{ model: db.usuario, as: 'usuario' }] // Asegúrate de que 'usuario' sea el alias correcto
      });

      return comentarios || [];
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
      res.status(500).send('Error interno del servidor');
    }
  },
    

  //guardado de calificacion
  guardado: async (req, res) => {
    try {
      const calificacion = req.body.calificacion;
      const peliculaId = req.params.id;
      const usuarioId = req.body.usuarioId;
      const comentarioUsuario = req.body.comentarioUsuario;
  
      if (!calificacion) {
        return res.status(400).send('La calificación es requerida.');
      }
  
      // Verificar si el usuario ya ha calificado la película
      const calificacionExistente = await db.calificacion.findOne({
        where: { id_productoFilm: peliculaId, usuario_id: usuarioId },
      });
  
      if (calificacionExistente) {
        return res.status(400).send('Ya has calificado esta película anteriormente.');
      }
      
  
      // Crear la calificación y el comentario asociados a la película
      await db.calificacion.create({
        calificacion: calificacion,
        id_productoFilm: peliculaId,
        usuario_id: usuarioId,
        comentario: comentarioUsuario,
      });
  
      res.redirect('/');
    } catch (error) {
      console.error('Error al guardar la calificación:', error);
      res.status(500).send('Error al guardar la calificación');
    }
  },
  //guardado de calificacion final

     //motrar comentarios
     mostrarCalificaciones: async (req, res) => {
    try {
      const peliculaId = req.params.id;
  
      // Obtén calificaciones asociadas a la película
      const calificaciones = await db.calificacion.findAll({
        where: { id_productoFilm: peliculaId },
        include: [{ model: db.usuario, as: 'usuario' }]
      });
  
      // Renderiza tu vista con las calificaciones
      res.render('movies/detallePelicula', { calificaciones: calificaciones });
    } catch (error) {
      console.error('Error al obtener calificaciones:', error);
      res.status(500).send('Error al obtener calificaciones');
    }
  },


  /*prueba de metodo cloudinary*/
  postCrearFilm: (req, res) => {
    const imageBuffer = req.file.buffer;
    const customFilename = '';

    const stream = cloudinary.uploader.upload_stream({ resource_type: 'image', public_id: customFilename }, (error, result) => {
        if (error) {
            console.error('Error en Cloudinary:', error);
            res.redirect("/");
        } else {
            console.log('Imagen cargada con éxito');

            // Crear la película
            db.productoFilm.create({
                nombre: req.body.nombre,
                imagen1: result.secure_url,
                resumen: req.body.resumen,
                fecha_estreno: req.body.fecha_estreno,
                fecha_creacion: req.body.fecha_creacion,
                calificacion: req.body.calificacion,
                video: req.body.video,
                subidoPor: req.body.usuario,
                duracion: req.body.duracion,
            })
            .then((movie) => {
                // Crear asociación con el género a través de generoFilm
                db.generoFilm.create({
                    id_productoFilm: movie.id,
                    id_genero: req.body.genero
                })
                .then(() => {
                    // Crear asociación con la plataforma a través de plataformaFilm
                    db.plataformaFilm.create({
                        id_productoFilm: movie.id,
                        id_plataforma: req.body.plataforma
                    })
                    .then(() => {
                        // Crear asociación con el tipo a través de tipoFilm
                        db.tipoFilm.create({
                            id_productoFilm: movie.id,
                            id_tipo: req.body.tipo
                        })
                        .then(() => {
                            console.log('Película y asociaciones guardadas con éxito');
                            res.redirect("/");
                        })
                        .catch((error) => {
                            console.error('Error al crear la asociación con tipo:', error);
                            res.redirect("/");
                        });
                    })
                    .catch((error) => {
                        console.error('Error al crear la asociación con plataforma:', error);
                        res.redirect("/");
                    });
                })
                .catch((error) => {
                    console.error('Error al crear la asociación con género:', error);
                    res.redirect("/");
                });
            })
            .catch((error) => {
                console.error('Error al crear la película:', error);
                res.redirect("/");
            });
        }
    });
    streamifier.createReadStream(imageBuffer).pipe(stream);
},

getCrearFilm: function (req, res) {
  Promise.all([
      db.genero.findAll(),
      db.tipo.findAll(),
      db.plataforma.findAll()
  ])
  .then(function ([generos, tipos, plataformas]) {
      return res.render("./user/CrearFilm", { generos: generos, tipos: tipos, plataformas: plataformas });
  })
  .catch(error => {
      console.error('Error:', error);
      res.status(500).send('Internal Server Error');
  });
},

getActualizarFilm: async function (req, res) {
  const idM = req.params.id;
  try {
      const movie = await db.productoFilm.findByPk(idM);

      if (movie) {
          const generos = await db.genero.findAll();
          const plataformas = await db.plataforma.findAll(); 
          const tipos = await db.tipo.findAll(); 

          return res.render("./user/actualizarFilm", {
              movie: movie,
              generos: generos,
              plataformas: plataformas, 
              tipos: tipos 
          });
      } else {
          res.send('Película no encontrada');
      }
  } catch (error) {
      console.error('Error en getActualizarFilm:', error);
      res.render('error', { message: 'Error al cargar la página' });
  }
},

postActualizarFilm: async function (req, res) {
  const idM = req.params.id;

  try {
      const movie = await db.productoFilm.findByPk(idM);

      if (movie) {
          const imageBuffer = req.file.buffer;
          const customFilename = '';

          const stream = cloudinary.uploader.upload_stream({ resource_type: 'image', public_id: customFilename }, async (error, result) => {
              if (error) {
                  console.error('Error en Cloudinary:', error);
              } else {
                  // Actualizar la imagen en la base de datos
                  movie.nombre = req.body.nombre;
                  movie.resumen = req.body.resumen;
                  movie.fecha_estreno = req.body.fecha_estreno;
                  movie.calificacion = req.body.calificacion;
                  movie.fecha_creacion = req.body.fecha_creacion;
                  movie.video = req.body.video;
                  movie.subidoPor = req.body.usuario;
                  movie.duracion = req.body.duracion;
                  movie.imagen1 = result.secure_url || movie.imagen1;

                  // Actualizar o crear la asociación con el género
                  const generoFilm = await db.generoFilm.findOne({ where: { id_productoFilm: movie.id } });
                  if (generoFilm) {
                      generoFilm.id_genero = req.body.genero;
                      await generoFilm.save();
                  } else {
                      await db.generoFilm.create({
                          id_productoFilm: movie.id,
                          id_genero: req.body.genero
                      });
                  }

                  // Actualizar o crear la asociación con la plataforma
                  const plataformaFilm = await db.plataformaFilm.findOne({ where: { id_productoFilm: movie.id } });
                  if (plataformaFilm) {
                      plataformaFilm.id_plataforma = req.body.plataforma;
                      await plataformaFilm.save();
                  } else {
                      await db.plataformaFilm.create({
                          id_productoFilm: movie.id,
                          id_plataforma: req.body.plataforma
                      });
                  }

                  // Actualizar o crear la asociación con el tipo
                  const tipoFilm = await db.tipoFilm.findOne({ where: { id_productoFilm: movie.id } });
                  if (tipoFilm) {
                      tipoFilm.id_tipo = req.body.tipo;
                      await tipoFilm.save();
                  } else {
                      await db.tipoFilm.create({
                          id_productoFilm: movie.id,
                          id_tipo: req.body.tipo
                      });
                  }

                  await movie.save();

                  res.redirect("/");
              }
          });

          streamifier.createReadStream(imageBuffer).pipe(stream);
      } else {
          res.send(`
              <div style="text-align: center; padding-top:30px">
              <h1>La película no se puede editar</h1>
              <img style="width:40%;" src="/img/error-critico.jpg">
              </div>
              `);
      }
  } catch (error) {
      console.error('Error en postActualizarFilm:', error);
      res.render('error', { message: 'Error al actualizar la película' });
  }
},


  /* proceso de borrado */
  delete: async (req, res) => {
    const idPelicula = req.params.id;

    try {
        // Buscar la película por su ID en la base de datos
        const pelicula = await db.productoFilm.findByPk(idPelicula);

        if (!pelicula) {
            res.send('Película no encontrada');
            return;
        }

        // Buscar y eliminar las calificaciones asociadas a la película
        await db.calificacion.destroy({
            where: { id_productoFilm: idPelicula },
        });

        // Buscar y eliminar los géneros asociados a la película
        await db.generoFilm.destroy({
            where: { id_productoFilm: idPelicula },
        });

        // Buscar y eliminar las asociaciones con tipos
        await db.tipoFilm.destroy({
            where: { id_productoFilm: idPelicula },
        });

        // Buscar y eliminar las asociaciones con plataformas
        await db.plataformaFilm.destroy({
            where: { id_productoFilm: idPelicula },
        });

        // Eliminar la película después de eliminar todas las asociaciones
        await pelicula.destroy();

        res.redirect("/");
    } catch (error) {
        console.error('Error en delete:', error);
        res.render('error', { message: 'Error al eliminar la película' });
    }
},

  
  
  
  /*peliculas estrenos*/
  estrenos: async (req, res) => {
    try {
      // Consulta para encontrar películas con nombres específicos.
      const estrenos = await db.productoFilm.findAll({
        include: [
          {
            association: 'plataforma',
            where: { nombre: 'Cine' } // Reemplaza con el nombre real de la plataforma
          },
          {
            association: 'tipo',
            where: { nombre: 'En cartelera' } // Reemplaza con el nombre real del tipo
          }
        ],
        order: [['fecha_creacion', 'DESC']] // Agregué la coma aquí
      })
  
      // Renderizar la vista y los resultados a la plantilla.
      return res.render("movies/estrenos", { estrenos: estrenos });
    } catch (error) {
      console.log(error);
    }
  },


  /*detalle de los estrenos*/
detalleEstrenos: async (req, res) => {
  try {
    const peliculaId = req.params.id;

    // Obtener detalles de la película
    const movie = await db.productoFilm.findByPk(peliculaId, {
      include: [{ association: "genero" }, { association: "actor" }, { association: "guionista" }, { association: "director" }]
    });

    // Obtener comentarios y calificaciones asociadas a la película
    const Coment = await controlador.obtenerComent(req, res) || [];

    // Renderizar la vista y pasar los detalles de la película, comentarios y calificaciones
    res.render("movies/detalleEstrenos", { pelicula: movie, Coment: Coment });
  } catch (error) {
    console.error(error);
    res.render('error', { message: 'Error al cargar la página' });
  }
},


obtenerComent: async (req, res, pelicula) => {
  try {
    const peliculaId = req.params.id;

    // Obtener los comentarios asociados a la película
    const Coment = await db.calificacion.findAll({
      where: { id_productoFilm: peliculaId },
      limit: 150,
      include: [{ model: db.usuario, as: 'usuario' }]
    });

    console.log('Comentarios obtenidos correctamente:', Coment);

    return Coment || [];

  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    res.status(500).send('Error interno del servidor');
  }
},
 



  /* guardado  en la base de datos de ultimos estrenos*/
  guardadoEstrenos: async (req, res) => {
    try {
      const calificacion = req.body.calificacion;
      const peliculaId = req.params.id;  // Obtener el ID de la película desde la URL
      const usuarioId = req.body.usuarioId; // Obtener el ID del usuario desde el body
      const comentarioUsuario = req.body.comentarioUsuario // Obtener el comentario del cuerpo de la solicitud

      if (!calificacion) {
        return res.status(400).send('La calificación es requerida.');
      }

      // Crear la calificación y el comentario asociada a la película/serie
      await db.calificacion.create({
        calificacion: calificacion, // Guardar la calificacion en la base de datos
        id_productoFilm: peliculaId,  // Asociar la calificación con la película
        usuario_id: usuarioId,  // establecer el ID del usuario 
        comentario: comentarioUsuario // Guardar el comentario en la base de datos
      });

      res.redirect('/');
    } catch (error) {
      console.error('Error al guardar la calificación:', error);
      res.status(500).send('Error al guardar la calificación');
    }
  },


  noticia: (req, res) => {
    db.productoFilm.findAll({
        include: [
            { association: 'plataforma' },
            {
                association: 'tipo',
                where: { nombre: 'Noticia' } // Reemplaza con el nombre real del tipo
            },
            { association: "genero" },
            { association: "actor" }
        ],
        order: [['fecha_creacion', 'DESC']] // Añade esta línea para ordenar por fecha de creación
    })
      .then(function (noticias) {
        return res.render("movies/noticias", { noticias: noticias });
      })
      .catch(function (error) {
        console.log(error);
      });
  },


  /*Detalle de las noticias*/
  detalleNoti: (req, res) => {
    db.productoFilm.findByPk(req.params.id, { include: [{ association: "genero" }, { association: "actor" }, { association: "guionista" }, { association: "director" }] })
      .then(function (noticia) {
        res.render("movies/detalleNoti", { noticia: noticia })
      })
  },
  

  /* noticias de peliculas slide principal*/
  detalleNoticia: (req, res) => {
    db.productoFilm.findByPk(req.params.idN, {
      include: [{ association: "genero" }] // Esto incluirá los detalles de noticias asociados al producto
    })
      .then(function (noticiaDetalle) {
        res.render("movies/detalleNoticia", { noticiaDetalle: noticiaDetalle })
      })
  },


/////////////////////////////////series plataforma //////////////////////////////////////


//serie netflix

seriesNetflix: (req, res) => {
  db.productoFilm.findAll({
    where: {},
    include: [
      {
        association: 'plataforma',
        where: { nombre: 'Netflix' } // Reemplaza con el nombre real de la plataforma
      },
      {
        association: 'tipo',
        where: { nombre: 'Serie' } // Reemplaza con el nombre real del tipo
      }
    ],
    order: [['fecha_creacion', 'DESC']] // Agregué la coma aquí
  })
  
    .then(function (seriesNetflix) {
      return res.render('series/netflix', { seriesNetflix: seriesNetflix });
    })
    .catch(function (error) {
      console.error('Error en la consulta:', error);
      res.status(500).send('Internal Server Error');
    });
},

/*Detalle de las netflix*/
serieNetflix: (req, res) => {
  const serieId = req.params.id;

  db.productoFilm.findByPk(serieId, { include: [{ association: "genero" }, { association: "actor" }, { association: "guionista" }, { association: "director" }] })
    .then(function (serieNetflix) {
      res.render("series/netflixDetalle", { serieNetflix: serieNetflix })
    })
    .catch(function (error) {
      console.error('Error al obtener el detalle de la serie:', error);
      res.status(500).send('Internal Server Error');
    });
},

//serie PrimeVideo
seriesPrimeVideo: (req, res) => {
  
  db.productoFilm.findAll({
    where: {},
    include:[
      {
        association: 'plataforma',
        where: { nombre: 'Prime Video' } // Reemplaza con el nombre real de la plataforma
      },
      {
        association: 'tipo',
        where: { nombre: 'Serie' } // Reemplaza con el nombre real del tipo
      }
    ],
    order: [['fecha_creacion', 'DESC']]
  })
    .then(function (seriesPrimeVideo) {
      return res.render('series/PrimeVideo', { seriesPrimeVideo: seriesPrimeVideo });
    })
    .catch(function (error) {
      console.error('Error en la consulta:', error);
      res.status(500).send('Internal Server Error');
    });
},

/*Detalle de las PrimeVideo*/
seriePrimeVideo: (req, res) => {
  const serieId = req.params.id;

  db.productoFilm.findByPk(serieId, { include: [{ association: "genero" }, { association: "actor" }, { association: "guionista" }, { association: "director" }] })
    .then(function (seriePrimeVideo) {
      res.render("series/PrimeVideoDetalle", { seriePrimeVideo: seriePrimeVideo })
    })
    .catch(function (error) {
      console.error('Error al obtener el detalle de la serie:', error);
      res.status(500).send('Internal Server Error');
    });
},


//serie Disney+
seriesDisneyPlus: (req, res) => {
  
  db.productoFilm.findAll({
    where: {},
    include:[
      {
        association: 'plataforma',
        where: { nombre: 'Disney Plus' } // Reemplaza con el nombre real de la plataforma
      },
      {
        association: 'tipo',
        where: { nombre: 'Serie' } // Reemplaza con el nombre real del tipo
      }
    ],
    order: [['fecha_creacion', 'DESC']]
  })
    .then(function (seriesDisneyPlus) {
      return res.render('series/DisneyPlus', { seriesDisneyPlus: seriesDisneyPlus });
    })
    .catch(function (error) {
      console.error('Error en la consulta:', error);
      res.status(500).send('Internal Server Error');
    });
},

/*Detalle de las DisneyPlus*/
serieDisneyPlus: (req, res) => {
  const serieId = req.params.id;

  db.productoFilm.findByPk(serieId, { include: [{ association: "genero" }, { association: "actor" }, { association: "guionista" }, { association: "director" }] })
    .then(function (serieDisneyPlus) {
      res.render("series/DisneyPlusDetalle", { serieDisneyPlus: serieDisneyPlus })
    })
    .catch(function (error) {
      console.error('Error al obtener el detalle de la serie:', error);
      res.status(500).send('Internal Server Error');
    });
},



//serie HboMax
seriesHboMax: (req, res) => {
  
  db.productoFilm.findAll({
    where: {},
    include:[
      {
        association: 'plataforma',
        where: { nombre: 'Hbo Max' } // Reemplaza con el nombre real de la plataforma
      },
      {
        association: 'tipo',
        where: { nombre: 'Serie' } // Reemplaza con el nombre real del tipo
      }
    ],
    order: [['fecha_creacion', 'DESC']]
  })
    .then(function (seriesHboMax) {
      return res.render('series/HboMax', { seriesHboMax: seriesHboMax });
    })
    .catch(function (error) {
      console.error('Error en la consulta:', error);
      res.status(500).send('Internal Server Error');
    });
},

/*Detalle de las HboMax*/
serieHboMax: (req, res) => {
  const serieId = req.params.id;

  db.productoFilm.findByPk(serieId, { include: [{ association: "genero" }, { association: "actor" }, { association: "guionista" }, { association: "director" }] })
    .then(function (serieHboMax) {
      res.render("series/HboMaxDetalle", { serieHboMax: serieHboMax })
    })
    .catch(function (error) {
      console.error('Error al obtener el detalle de la serie:', error);
      res.status(500).send('Internal Server Error');
    });
},


//serie ParamountPlus
seriesParamountPlus: (req, res) => {
  
  db.productoFilm.findAll({
    where: {},
    include:[
      {
        association: 'plataforma',
        where: { nombre: 'Paramount Plus' } // Reemplaza con el nombre real de la plataforma
      },
      {
        association: 'tipo',
        where: { nombre: 'Serie' } // Reemplaza con el nombre real del tipo
      }
    ],
    order: [['fecha_creacion', 'DESC']]
  })
    .then(function (seriesParamountPlus) {
      return res.render('series/ParamountPlus', { seriesParamountPlus: seriesParamountPlus });
    })
    .catch(function (error) {
      console.error('Error en la consulta:', error);
      res.status(500).send('Internal Server Error');
    });
},

/*Detalle de las ParamountPlus*/
serieParamountPlus: (req, res) => {
  const serieId = req.params.id;

  db.productoFilm.findByPk(serieId, { include: [{ association: "genero" }, { association: "actor" }, { association: "guionista" }, { association: "director" }] })
    .then(function (serieParamountPlus) {
      res.render("series/ParamountPlusDetalle", { serieParamountPlus: serieParamountPlus })
    })
    .catch(function (error) {
      console.error('Error al obtener el detalle de la serie:', error);
      res.status(500).send('Internal Server Error');
    });
},

//serie StarPlus
seriesStarPlus: (req, res) => {
  
  db.productoFilm.findAll({
    where: {},
    include:[
      {
        association: 'plataforma',
        where: { nombre: 'Star Plus' } // Reemplaza con el nombre real de la plataforma
      },
      {
        association: 'tipo',
        where: { nombre: 'Serie' } // Reemplaza con el nombre real del tipo
      }
    ],
    order: [['fecha_creacion', 'DESC']]

  })
    .then(function (seriesStarPlus) {
      return res.render('series/StarPlus', { seriesStarPlus: seriesStarPlus });
    })
    .catch(function (error) {
      console.error('Error en la consulta:', error);
      res.status(500).send('Internal Server Error');
    });
},

/*Detalle de las StarPlus*/
serieStarPlus: (req, res) => {
  const serieId = req.params.id;

  db.productoFilm.findByPk(serieId, { include: [{ association: "genero" }, { association: "actor" }, { association: "guionista" }, { association: "director" }] })
    .then(function (serieStarPlus) {
      res.render("series/StarPlusDetalle", { serieStarPlus: serieStarPlus })
    })
    .catch(function (error) {
      console.error('Error al obtener el detalle de la serie:', error);
      res.status(500).send('Internal Server Error');
    });
},

/////////////////////////////////peliculas plataforma //////////////////////////////////////

//pelicula netflix

peliculasNetflix: (req, res) => {
  
  db.productoFilm.findAll({
    where: {},
    include:[
      {
        association: 'plataforma',
        where: { nombre: 'Netflix' } // Reemplaza con el nombre real de la plataforma
      },
      {
        association: 'tipo',
        where: { nombre: 'Película' } // Reemplaza con el nombre real del tipo
      }
    ],
    order: [['fecha_creacion', 'DESC']]
  })
    .then(function (peliculasNetflix) {
      return res.render('peliculas/peliculanetflix', { peliculasNetflix: peliculasNetflix });
    })
    .catch(function (error) {
      console.error('Error en la consulta:', error);
      res.status(500).send('Internal Server Error');
    });
},

/*Detalle de las pelicula netflix*/
peliculaNetflix: (req, res) => {
  const peliculaId = req.params.id;

  db.productoFilm.findByPk(peliculaId, { include: [{ association: "genero" }, { association: "actor" }, { association: "guionista" }, { association: "director" }] })
    .then(function (peliculaNetflix) {
      res.render("peliculas/PeliculanetflixDetalle", { peliculaNetflix: peliculaNetflix })
    })
    .catch(function (error) {
      console.error('Error al obtener el detalle de la pelicula:', error);
      res.status(500).send('Internal Server Error');
    });
},

//pelicula PrimeVideo
peliculasPrimeVideo: (req, res) => {
  
  db.productoFilm.findAll({
    where: {},
    include:[
      {
        association: 'plataforma',
        where: { nombre: 'Prime Video' } // Reemplaza con el nombre real de la plataforma
      },
      {
        association: 'tipo',
        where: { nombre: 'Película' } // Reemplaza con el nombre real del tipo
      }
    ],
    order: [['fecha_creacion', 'DESC']]
  })
    .then(function (peliculasPrimeVideo) {
      return res.render('peliculas/peliculaPrimeVideo', { peliculasPrimeVideo: peliculasPrimeVideo });
    })
    .catch(function (error) {
      console.error('Error en la consulta:', error);
      res.status(500).send('Internal Server Error');
    });
},

/*Detalle de las pelicula PrimeVideo*/
peliculaPrimeVideo: (req, res) => {
  const peliculaId = req.params.id;

  db.productoFilm.findByPk(peliculaId, { include: [{ association: "genero" }, { association: "actor" }, { association: "guionista" }, { association: "director" }] })
    .then(function (peliculaPrimeVideo) {
      res.render("peliculas/peliculaPrimeVideoDetalle", { peliculaPrimeVideo: peliculaPrimeVideo })
    })
    .catch(function (error) {
      console.error('Error al obtener el detalle de la pelicula:', error);
      res.status(500).send('Internal Server Error');
    });
},


//pelicula Disney+
peliculasDisneyPlus: (req, res) => {
  
  db.productoFilm.findAll({
    where: {},
    include:[
      {
        association: 'plataforma',
        where: { nombre: 'Disney Plus' } // Reemplaza con el nombre real de la plataforma
      },
      {
        association: 'tipo',
        where: { nombre: 'Película' } // Reemplaza con el nombre real del tipo
      }
    ],
    order: [['fecha_creacion', 'DESC']]
  })
    .then(function (peliculasDisneyPlus) {
      return res.render('peliculas/peliculaDisneyPlus', { peliculasDisneyPlus: peliculasDisneyPlus });
    })
    .catch(function (error) {
      console.error('Error en la consulta:', error);
      res.status(500).send('Internal Server Error');
    });
},

/*Detalle de las pelicula DisneyPlus*/
peliculaDisneyPlus: (req, res) => {
  const peliculaId = req.params.id;

  db.productoFilm.findByPk(peliculaId, { include: [{ association: "genero" }, { association: "actor" }, { association: "guionista" }, { association: "director" }] })
    .then(function (peliculaDisneyPlus) {
      res.render("peliculas/peliculaDisneyPlusDetalle", { peliculaDisneyPlus: peliculaDisneyPlus, movie: peliculaDisneyPlus });
    })
    .catch(function (error) {
      console.error('Error al obtener el detalle de la pelicula:', error);
      res.status(500).send('Internal Server Error');
    });
},



//pelicula HboMax
peliculasHboMax: (req, res) => {
  
  db.productoFilm.findAll({
    where: {},
    include:[
      {
        association: 'plataforma',
        where: { nombre: 'Hbo Max' } // Reemplaza con el nombre real de la plataforma
      },
      {
        association: 'tipo',
        where: { nombre: 'Película' } // Reemplaza con el nombre real del tipo
      }
    ],
    order: [['fecha_creacion', 'DESC']]
  })
    .then(function (peliculasHboMax) {
      return res.render('peliculas/peliculaHboMax', { peliculasHboMax: peliculasHboMax });
    })
    .catch(function (error) {
      console.error('Error en la consulta:', error);
      res.status(500).send('Internal Server Error');
    });
},

/*Detalle de las pelicula HboMax*/
peliculaHboMax: (req, res) => {
  const peliculaId = req.params.id;

  db.productoFilm.findByPk(peliculaId, { include: [{ association: "genero" }, { association: "actor" }, { association: "guionista" }, { association: "director" }] })
    .then(function (peliculaHboMax) {
      res.render("peliculas/peliculaHboMaxDetalle", { peliculaHboMax: peliculaHboMax })
    })
    .catch(function (error) {
      console.error('Error al obtener el detalle de la pelicula:', error);
      res.status(500).send('Internal Server Error');
    });
},


//pelicula ParamountPlus
peliculasParamountPlus: (req, res) => {
  
  db.productoFilm.findAll({
    where: {},
    include:[
      {
        association: 'plataforma',
        where: { nombre: 'Paramount Plus' } // Reemplaza con el nombre real de la plataforma
      },
      {
        association: 'tipo',
        where: { nombre: 'Película' } // Reemplaza con el nombre real del tipo
      }
    ],
    order: [['fecha_creacion', 'DESC']]
  })
    .then(function (peliculasParamountPlus) {
      return res.render('peliculas/peliculaParamountPlus', { peliculasParamountPlus: peliculasParamountPlus });
    })
    .catch(function (error) {
      console.error('Error en la consulta:', error);
      res.status(500).send('Internal Server Error');
    });
},

/*Detalle de las pelicula ParamountPlus*/
peliculaParamountPlus: (req, res) => {
  const peliculaId = req.params.id;

  db.productoFilm.findByPk(peliculaId, { include: [{ association: "genero" }, { association: "actor" }, { association: "guionista" }, { association: "director" }] })
    .then(function (peliculaParamountPlus) {
      res.render("peliculas/peliculaParamountPlusDetalle", { peliculaParamountPlus: peliculaParamountPlus })
    })
    .catch(function (error) {
      console.error('Error al obtener el detalle de la pelicula:', error);
      res.status(500).send('Internal Server Error');
    });
},

//pelicula StarPlus
peliculasStarPlus: (req, res) => {
  
  db.productoFilm.findAll({
    where: {},
    include:[
      {
        association: 'plataforma',
        where: { nombre: 'Star Plus' } // Reemplaza con el nombre real de la plataforma
      },
      {
        association: 'tipo',
        where: { nombre: 'Película' } // Reemplaza con el nombre real del tipo
      }
    ],
    order: [['fecha_creacion', 'DESC']]
  })
    .then(function (peliculasStarPlus) {
      return res.render('peliculas/peliculaStarPlus', { peliculasStarPlus: peliculasStarPlus });
    })
    .catch(function (error) {
      console.error('Error en la consulta:', error);
      res.status(500).send('Internal Server Error');
    });
},

/*Detalle de las pelicula StarPlus*/
peliculaStarPlus: (req, res) => {
  const peliculaId = req.params.id;

  db.productoFilm.findByPk(peliculaId, { include: [{ association: "genero" }, { association: "actor" }, { association: "guionista" }, { association: "director" }] })
    .then(function (peliculaStarPlus) {
      res.render("peliculas/peliculaStarPlusDetalle", { peliculaStarPlus: peliculaStarPlus })
    })
    .catch(function (error) {
      console.error('Error al obtener el detalle de la pelicula:', error);
      res.status(500).send('Internal Server Error');
    });
},



  ///////////////////////////////APIS/////////////////////////////////////////

  //PRODUCTO (PELICULAS Y SERIES)
  cantidadProductos: (req, res) => {
    db.productoFilm.findAll({ //obtengo todos los productos de la bd
      include: [{ association: "tipo" }, { association: "genero" }] //incluyo la tabla asociada a productoFilm
    })
      .then(peliculas => {
        const productosConTipo = peliculas.map(producto => ({
          id: producto.id,
          nombre: producto.nombre,
          duracion: producto.duracion,
          fecha_estreno: producto.fecha_estreno,
          imagen: producto.imagen1,
          tipo: producto.tipo && producto.tipo.nombre, // Obtenngo el nombre del tipo (película o serie)
        }));

        return res.status(200).json({
          productoTotal: productosConTipo.length,
          data: productosConTipo,
          status: 200
        });
      })
  },

  //PRODUCTO POR ID 
  productoId: (req, res) => {
    db.productoFilm.findByPk(req.params.id, {
      include: [{ association: "tipo" }]
    })
      .then(producto => {
        return res.status(200).json({
          id: producto.id,
          nombre: producto.nombre,
          duracion: producto.duracion,
          fecha_estreno: producto.fecha_estreno,
          imagen: producto.imagen1,
          tipo: producto.tipo && producto.tipo.nombre,
          status: 200
        })
      })
  },

  ///////////////////////////////FIN APIS PRODUCTO/////////////////////////////////////////

  //CATEGORIAS (GENERO)
  generosTotal: (req, res) => {
    db.genero.findAll({ //obtengo todos los generos de la bd
      include: [{ association: "productoFilm" }]
    })
      .then(generos => {
        const generosConProductoFilm = generos.map(genero => ({
          id: genero.id,
          genero: genero.nombre,
          productos: genero.productoFilm.map(producto => ({
            id: producto.id,
            nombre: producto.nombre
          })),
        }));

        return res.status(200).json({
          productoTotal: generosConProductoFilm.length,
          data: generosConProductoFilm,
          status: 200
        });
      })
  },

  //GENERO POR ID 
  generoId: (req, res) => {
    db.genero.findByPk(req.params.id, {
      include: [{ association: "productoFilm" }]
    })
      .then(genero => {
        if (!genero.productoFilm || genero.productoFilm.length === 0) {
          return res.status(200).json({
            mensaje: "No hay productos asociados a este género",
            status: 200
          });
        }

        return res.status(200).json({
          id: genero.id,
          genero: genero.nombre,
          productos: genero.productoFilm.map(producto => ({
            id: producto.id,
            nombre: producto.nombre
          })),
          status: 200
        });
      });
  },

///////////////////////////////FIN APIS CATEGORIA (GENERO)/////////////////////////////////////////

todo: (req, res) => {
  db.calificacion.findAll({
    include: [{ association: "productoFilm" }]
  })
    .then(calificaciones => {  
      return res.status(200).json({
        total: calificaciones.length,
        data: calificaciones,
        status: 200
      })
     })
},

todoId: (req, res) => {
  db.calificacion.findByPk(req.params.id, {
    include: [{ association: "productoFilm" }]
  })
    .then(calificaciones => {
        return res.status(200).json({
         data: calificaciones
      });
    });
}

}

module.exports = controlador;