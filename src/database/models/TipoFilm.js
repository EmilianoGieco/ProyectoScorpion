function tipoFilm(sequelize, Datatypes) {

    alias = 'tipoFilm';

    cols = {
        id: {
            type: Datatypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        id_productoFilm:
            { type: Datatypes.INTEGER },

        id_tipo: // Corrige el nombre de la columna aquí
            { type: Datatypes.INTEGER },

    }

    // Timestamps
    config = { tableName: "tipoFilm", timestamps: false };

    const tipoFilm = sequelize.define(alias, cols, config)

    return tipoFilm;

} module.exports = tipoFilm;
