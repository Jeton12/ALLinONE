const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost/restorantReviews', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Modeli për Përdoruesin
const UserSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
});

const User = mongoose.model('User', UserSchema);

// Modeli për Rishikimin
const ReviewSchema = new mongoose.Schema({
    username: String,
    comment: String,
    rating: Number,
});

const Review = mongoose.model('Review', ReviewSchema);

// Regjistrimi
app.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({ email: req.body.email, password: hashedPassword });
        await user.save();
        res.sendStatus(201);
    } catch (error) {
        res.status(400).send('Email ekziston!');
    }
});

// Autentifikimi
app.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
        return res.sendStatus(401);
    }
    const token = jwt.sign({ id: user._id }, 'secret_key');
    res.json({ token });
});

// Dërgimi i Rishikimeve
app.post('/reviews', async (req, res) => {
    const review = new Review(req.body);
    await review.save();
    res.sendStatus(201);
});

// Shfaqja e Rishikimeve
app.get('/reviews', async (req, res) => {
    const reviews = await Review.find();
    res.json(reviews);
});

app.listen(3000, () => {
    console.log('Serveri po dëgjon në portin 3000');
});
