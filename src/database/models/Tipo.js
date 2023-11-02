function tipo(sequelize, Datatypes) {

    alias = 'tipo';

    cols = {
        id: {
            type: Datatypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },

        nombre:
            { type: Datatypes.STRING(50) },

    }

    // Timestamps
    config = { tableName: "tipo", timestamps: false };

    const tipo = sequelize.define(alias, cols, config)

    tipo.associate = function (models) {
        tipo.belongsToMany(models.productoFilm, {
            as: 'productoFilm',
            through: 'tipoFilm', // tabla intermedia
            foreignKey: 'id_tipo', // es el FK del modelo en el que estoy
            otherKey: 'id_productoFilm'// es el FK del otro modelo
        })
    }

    return tipo;

} module.exports = tipo;