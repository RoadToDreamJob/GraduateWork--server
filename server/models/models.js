const sequelize = require('./db')
const { DataTypes } = require('sequelize')

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userFio: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userPhone: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: true
    },
    userEmail: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    userPassword: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userRole: {
        type: DataTypes.STRING,
        defaultValue: 'USER'
    }
})

const ClientPet = sequelize.define('client_pet', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    petName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    petImage: {
        type: DataTypes.STRING,
        allowNull: false
    },
    petBreed: {
        type: DataTypes.STRING,
        allowNull: false
    },
    petAge: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    petSex: {
        type: DataTypes.CHAR,
        allowNull: false
    },
    petWeight: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

const MedicineCard = sequelize.define('medicine_card', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    medicineInfo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    medicineDescription: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    dateVisit: {
        type: DataTypes.DATEONLY,
        allowNull: false
    }
})

const ClientRequest = sequelize.define('client_request', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    requestDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    requestDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    }
})

const Services = sequelize.define('services', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    serviceName: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    servicesPrice: {
        type: DataTypes.DECIMAL,
        allowNull: false
    },
    servicesDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    }
})

const ServicesCategories = sequelize.define('services_categories', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    categoryName: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    }
})

const Status = sequelize.define('status', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    statusName: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    }
})

const ServicesRequest = sequelize.define('services_request', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    }
})

const Doctor = sequelize.define('doctor', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    experienceValue: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

const Post = sequelize.define('post', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    postName: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    }
})

const Appointment = sequelize.define('appointment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    dateVisit: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    timeVisit: {
        type: DataTypes.TIME,
        allowNull: false
    }
})

Post.hasMany(Doctor)
Doctor.belongsTo(Post)

ClientPet.hasMany(MedicineCard, {as: 'med_info'})
MedicineCard.belongsTo(ClientPet)

Doctor.hasMany(Appointment)
Appointment.belongsTo(Doctor)

User.hasMany(ClientPet)
ClientPet.belongsTo(User)

User.hasMany(Doctor)
Doctor.belongsTo(User)

User.hasMany(Appointment)
Appointment.belongsTo(User)

ClientPet.hasMany(ClientRequest)
ClientRequest.belongsTo(ClientPet)

ClientRequest.hasOne(Appointment)
Appointment.belongsTo(ClientRequest)

User.hasMany(ClientRequest)
ClientRequest.belongsTo(User)

Status.hasMany(ClientRequest)
ClientRequest.belongsTo(Status)

ClientRequest.belongsToMany(Services, { through: ServicesRequest });
Services.belongsToMany(ClientRequest, { through: ServicesRequest });


ServicesCategories.hasMany(Services)
Services.belongsTo(ServicesCategories)

module.exports = {
    User,
    ClientPet,
    MedicineCard,
    ClientRequest,
    Services,
    ServicesCategories,
    Status,
    ServicesRequest,
    Doctor,
    Post,
    Appointment
}