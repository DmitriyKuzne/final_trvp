import mongoose from "mongoose";

//модель паромов
const FerriesSchema = new mongoose.Schema({
    //название парома
    ferryName: {
        type: String,
        required: true
    },
    //количество машиномест в пароме
    parkingSpacesQuant: {
        type: Number,
        required: true
    },
    //количество ячеек для груза в пароме
    cargoСompartmentsQuant: {
        type: Number,
        required: true
    },
}, {
    timestamps: true
})

export default mongoose.model('Ferries', FerriesSchema);