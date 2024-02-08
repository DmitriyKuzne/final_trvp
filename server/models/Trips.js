import mongoose from "mongoose";

//модель информации о рейсе
const TripsSchema = new mongoose.Schema({
    //Пункт назначения
    destinationStateName: {
        type: String,
        required: true
    },
    //название парома
    ferryName: {
        type: String,
        required: true
    },
    //имя администратора порта
    portAdminName: {
        type: String,
        required: true
    },
    //количество занятых ячеек для груза в пароме
    hugeСompartmentsQuant: {
        type: Number,
        require: true
    },
    //количество легковых автомобилей в пароме по рейсу
    passengerCarsQuant: {
        type: Number,
        require: true
    },
    //количество грузовиков в пароме по рейсу
    trucksQuant: {
        type: Number,
        require: true
    },
    //количество тягачей в пароме по рейсу
    tractorsQuant: {
        type: Number,
        require: true
    },
    //идентификатор администратора порта
    portAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PortAdmins',
        required: true
    }
}, {
    timestamps: true
})

export default mongoose.model('Trips', TripsSchema);