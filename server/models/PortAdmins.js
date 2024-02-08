import mongoose from "mongoose";

//модель базы данных регистрируемого администратора порта
const PortAdminsSchema = new mongoose.Schema({
    //полное имя администратора порта
    portAdminName: {
        type: String,
        required: true
    },
    //зашифрованный пароль администратора порта
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

export default mongoose.model('PortAdmins', PortAdminsSchema);