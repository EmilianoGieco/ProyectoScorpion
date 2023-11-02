function productoFilm(sequelize, Datatypes) {

    alias = 'productoFilm';

    cols = {
        id: {
            type: Datatypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        nombre:
            { type: Datatypes.STRING(255) },

        duracion:
            { type: Datatypes.INTEGER(3) },

        resumen:
            { type: Datatypes.TEXT },

        critica:
            { type: Datatypes.TEXT },

        fecha_estreno:
            { type: Datatypes.DATE },

        fecha_creacion:
            { type: Datatypes.DATE },

        fecha_modificacion:
            { type: Datatypes.DATE },

        fecha_modificacion:
            { type: Datatypes.DATE },

        fecha_baja:
            { type: Datatypes.DATE },

        temporada:
            { type: Datatypes.INTEGER(2) },

        video:
            { type: Datatypes.STRING(150) },

        imagen1:
            { type: Datatypes.STRING(150) },

        imagen2:
            { type: Datatypes.STRING(150) },

        imagen3:
            { type: Datatypes.STRING(150) },

        titulo:
            { type: Datatypes.STRING(100) },

        titulo2:
            { type: Datatypes.STRING(150) },

                                        
           
    }

    // Timestamps
    config = { tableName: "productoFilm", timestamps: false };

    const productoFilm = sequelize.define(alias, cols, config)

    productoFilm.associate = function (models) {
        productoFilm.belongsToMany(models.tipo, {
            as: 'tipo',
            through: 'tipoFilm',
            foreignKey: 'id_productoFilm',
            otherKey: 'id_tipo' // Cambiar a 'id_tipo' en lugar de 'id_tipo'
        });

            productoFilm.hasMany(models.calificacion, {
                as: 'calificacion',
                foreignKey: "id_productoFilm"
            });
        
            productoFilm.belongsToMany(models.actor, {
                as: 'actor',
                through: 'actorFilm', // tabla intermedia
                foreignKey: 'id_productoFilm', // es el FK del modelo en el que estoy
                otherKey: 'id_actor'// es el FK del otro modelo
            });
        
            productoFilm.belongsToMany(models.genero, {
                as: 'genero',
                through: 'generoFilm', // tabla intermedia
                foreignKey: 'id_productoFilm', // es el FK del modelo en el que estoy
                otherKey: 'id_genero'// es el FK del otro modelo
            });
            
        
            productoFilm.belongsToMany(models.productora, {
                as: 'productora',
                through: 'productoraFilm', // tabla intermedia
                foreignKey: 'id_productoFilm', // es el FK del modelo en el que estoy
                otherKey: 'id_productora'// es el FK del otro modelo
            });
        
            productoFilm.belongsToMany(models.director, {
                as: 'director',
                through: 'directorFilm', // tabla intermedia
                foreignKey: 'id_productoFilm', // es el FK del modelo en el que estoy
                otherKey: 'id_director' // es el FK del otro modelo
            });
        
            productoFilm.belongsToMany(models.guionista, {
                as: 'guionista',
                through: 'guionistaFilm', // tabla intermedia
                foreignKey: 'id_productoFilm', // es el FK del modelo en el que estoy
                otherKey: 'id_guionista' // es el FK del otro modelo
            });
        
            productoFilm.belongsToMany(models.plataforma, {
                as: 'plataforma',
                through: 'plataformaFilm', // tabla intermedia
                foreignKey: 'id_productoFilm', // es el FK del modelo en el que estoy
                otherKey: 'id_plataforma' // es el FK del otro modelo
            })
        
            productoFilm.belongsToMany(models.imagen, {
                as: 'imagen',
                through: 'imagenFilm', // tabla intermedia
                foreignKey: 'id_productoFilm', // es el FK del modelo en el que estoy
                otherKey: 'id_imagenFilm' // es el FK del otro modelo
            })
        
    }

    return productoFilm;

} module.exports = productoFilm;
