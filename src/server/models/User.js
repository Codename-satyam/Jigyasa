const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');




// User Schema [defines the structure of user data in MongoDB]
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password:{ type: String, required: true },
    role:{ type: String, enum: ['student', 'teacher', 'admin'], default: 'student' },
    avatarId:{type: Number, default: 1},
    blocked: { type: Boolean, default: false },
    approved: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

//Hashing password befor saving
//Hashing -> password ki maa behen kr dena
UserSchema.pre('save', async function() {
    if(!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

//Method to compare password during login
UserSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password);
}

module.exports = mongoose.model('User',UserSchema);

