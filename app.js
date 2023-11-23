
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const ejs = require('ejs');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const {Producto, User} = require('./models/model.js');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express()

const router = express.Router();

app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'vistas'));
app.set('view engine', 'ejs');

app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    res.render('index');
});


app.get('/productos/:id', Autenticar, (req, res) => {
    res.render('productos',{datas: req.user});
});


app.post('/registrar',  async (req, res, next) => {
  console.log(req.body);
  try {
    const user = new User(req.body);
    await user.save();
    console.log(user)
    res.status(200).json({success: true, user});
  } catch (error) {
    next(error);
  }
});

app.get('/comprobar_user/:correo', async(req, res) =>{
	try{
		const email = req.params.correo;
        let user = await User.findOne({correo: email}) || null;
        console.log(user);
        if(user !== null) {
            return res.json({
                success: false,
                msg: 'Usuario ya existe'
            });
        }
        res.json({
            success: true,
            msg: 'Registrado correctamente'
        });
	}catch(error){
		console.log(error.message);
		res.status(500).json({message: error.message})

	}
});


app.post('/login', async (req, res, next) => {
  const { correo, password } = req.body;

  try {
    const user = await User.findOne({ correo });
    if (!user) {
      return res.json({success: false, message: 'Usuario no encontrado.' });
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return res.json({success: false, message: 'Contraseña incorrecta.' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: '5m'
    });
    res.json({ token });
  } catch (error) {
    next(error);
  }

});

async function Autenticar(req, res, next){
    const token = req.headers['authorization'] || req.params.id;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    const user = await User.findById(decodedToken.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.json({ message: 'Invalid token', redirect : true});
  }
};
app.get("/autenticar/:id", async (req, res) => {
  const token = req.params.id;
  console.log(token)
   if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const decodedToken = jwt.verify(token, "chulowaskeao");
      const user = await User.findById(decodedToken.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      req.user = user;
      res.json({ message: `Welcome ${req.user.username}` });
    } catch (error) {
      res.json({ message: 'Invalid token' });
    }
});

app.post('/productos', async (req, res) => {
    const nuevoProducto = new Producto(req.body);
    try {
      const producto = await nuevoProducto.save();
      res.status(201).json({success: true, producto});
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

app.get('/productos', async (req, res) => {
    try {
      const productos = await Producto.find();
      res.status(201).json(productos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

app.get('/usuarios', async (req, res) => {
    try {
      const user = await User.find();
      res.status(201).json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
app.delete('/productos/:id', async (req, res) => {
    try {
      const producto = await Producto.findByIdAndDelete(req.params.id);
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json({ message: 'Producto eliminado exitosamente' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.put('/productos/:id', async (req, res) => {
    try{
      const producto = await Producto.findByIdAndUpdate(req.params.id, req.body, {new: true});
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json(producto);
      console.log(producto)
    }catch(err){
      console.log("Ha ocurrido un error "+err);
      res.status(500).json({ error: err.message });
    }

});
  app.delete('/usuarios/:id', async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }
      res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
app.put('/usuarios/:id', async (req, res) => {
    try{
      req.body.password = await bcrypt.hash(req.body.password, 10);
      console.log(req.body);
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true});
      await user.save();
      if (!user) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      res.json(user);
      console.log(user)
    }catch(err){
      console.log("Ha ocurrido un error "+err);
      res.status(500).json({ error: err.message });
    }

});

const port = 3000;

mongoose.connect('mongodb+srv://00000000003k:Tangamandapio@nodejscluster.fp6mnyz.mongodb.net/?retryWrites=true&w=majority');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
console.log('Conectado a MongoDB');
});
app.listen(port, () => {
console.log(`Server is running on port ${port}`)
});