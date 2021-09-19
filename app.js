require('dotenv').config();

//create the application
const express = require('express');
const app = express();

app.use(express.json());
 
//app.use(express.static("views")); 

//set the stripe
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

//simulate the order 
const storeItems = new Map([
    [1, {priceInBani: 450000, name: "Iphone 13"}],
    [2, {priceInBani: 700000, name: "Iphone 13 ProMax"}],
])


/*connection to database
const mysql = require('mysql');
const connection=mysql.createConnection({
    host:'eu-cdbr-west-01.cleardb.com', 
    user:'b1e2569ed3faaa',
    password:'5fe9dec8',
    database:'heroku_e4b593e11ddae98', 
});*/

const port = process.env.PORT || 3000;

//view engine
app.set('view engine', 'ejs');


app.get('/', function(req,res) {
    res.render('index'); 
});

app.get('/cancel', function(req,res) {
    res.render('cancel'); 
});

app.get('/success', function(req,res) {
    res.render('success'); 
});

app.post("/pay", async(req,res) => { 
    let total = 0;
    try{
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: req.body.items.map(
                item => 
                {
                const storeItem = storeItems.get(item.id);
                return{
                    price_data: { 
                        currency: 'ron', 
                        product_data:{
                            name: storeItem.name 
                        },
                        unit_amount: storeItem.priceInBani
                    },
                    quantity: item.quantity,   
                }
                
            }),

            success_url: `${process.env.SERVER_URL}/success`,
            cancel_url: `${process.env.SERVER_URL}/cancel`
        }) 

 res.json({url: session.url}); 

    } catch(e){
        res.status(500).json({error: e.message})
    }
   
}) 

app.listen(port);
console.log(`Server is listening on port ${port}`); 