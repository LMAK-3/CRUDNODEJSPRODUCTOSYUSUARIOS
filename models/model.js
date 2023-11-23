const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
require('dotenv').config();


const productoSchema = mongoose.Schema(
	{
		nombre:{
			type: String,
			required: [true, "Por favor ingrese el nombre del producto"]
		},
		cantidad:{
			type: Number,
			required: true,
			default: 0
			
		},
		precio:{
			type: Number,
			required: true,
		},
		imagen:{
			type: String,
			required: false,
		}
	},
	{
		timestamps: true
	
	}
)


const userSchema = mongoose.Schema(
	{
		nombre:{
			type: String,
			required: [true, "Por favor ingrese el nombre"]
		},
		apellido:{
			type: String,
			required: [true, "Por favor ingrese el apellido"]
			
		},
		correo:{
			type: String,
			required: [true, "Por favor ingrese el correo"]
		},
		password:{
			type: String,
			required: [true, "Por favor ingrese la contraseña"]
		}
	},
	{
		timestamps: true
	
	}
)

// Hash the password before saving it to the database
userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  try {
    user.password = await bcrypt.hash(user.password, 10);
    next();
  } catch (error) {
    return next(error);
  }
});

// Compare the given password with the hashed password in the database
userSchema.methods.comparePassword = async function (password) {
  	return bcrypt.compare(password, this.password);
};
const Producto = mongoose.model('Producto', productoSchema);
const User = mongoose.model('User', userSchema);
module.exports = {
	Producto,
	User
};


