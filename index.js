const express = require('express');
const mongoose = require('mongoose');
const cors=require('cors');
const bcrypt = require('bcrypt');  // For hashing password
const jwt = require("jsonwebtoken");

//image and video upload using multer
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const BASE_URL = process.env.BASE_URL || 'https://yourdomain.com';

const allowed = [
  "http://localhost:5174",            // Vite dev
  "https://skcmines.com",             // prod
  "https://www.skcmines.com"
];


require('dotenv').config();

const app = express();
//Models
const Login = require('./Models/login');
const HomePage=require('./Models/Home');
const AboutPage = require('./Models/aboutPage');
const ProductsPage = require('./Models/ProductsPage');
const MicaPage = require('./Models/MicaPage');
const Quartz=require('./Models/Quartz');
const NewProductPage=require('./Models/NewProductPage');
const CsrPage=require('./Models/CsrPage');
const ContactusPage=require('./Models/ContactusPage');
const LocationPage=require('./Models/locationPage');

// Middleware
app.use(express.json());
app.use(cors());

//app.options("*", cors());
app.use(morgan('combined')); // Logging
// Serve images and videos as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic route
app.get('/', (req, res) => {
    res.send('API is running');
});
// --------------------------------------------------middleware for authentication-----------------------------------
const verifyToken = (req, res, next) => {
  try {
    // Token can be sent in headers or cookies
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Expecting: "Bearer <token>"

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET || "mysecret", (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return res.status(401).json({ message: "Token expired. Please login again." });
        }
        return res.status(403).json({ message: "Invalid token" });
      }

      // Save user data to request object
      req.user = decoded;
      next();
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//------------------------------------------------Login and Register-----------------------------------
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await Login.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new Login({
      username,
      password: hashedPassword
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// Login API
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await Login.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET || "mysecret",
      { expiresIn: "30m" }
    );

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

//*-----------------------------------------------Home Page -----------------------------------------
app.post("/homepage", verifyToken, async (req, res) => {
  try {
    const {
      bannerSection,
      sectionOne,
      sectionTwo,
      sectionThree,
      sectionFour,
      sectionFive,
    } = req.body;

    // Create a new homepage document
    const homepage = new HomePage({
      bannerSection,
      sectionOne,
      sectionTwo,
      sectionThree,
      sectionFour,
      sectionFive,
    });

    await homepage.save();

    res.status(201).json({
      message: "HomePage initial data created successfully",
      homepage,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.patch("/homepage", verifyToken, async (req, res) => {
  try {
    const { sectionName, data } = req.body; 
    // Example body:
    // { "sectionName": "sectionTwo", "data": { "title": "New Title" } }

    if (!sectionName || !data) {
      return res.status(400).json({ error: "sectionName and data are required" });
    }

    // Build update path dynamically
    const updatePath = {};
    for (let key in data) {
      updatePath[`${sectionName}.${key}`] = data[key];
    }

    // Assuming only 1 homepage doc
    const updated = await HomePage.findOneAndUpdate(
      {},                     // no filter, just the first doc
      { $set: updatePath },   // update only provided fields
      { new: true }           // return updated doc
    );

    if (!updated) {
      return res.status(404).json({ error: "HomePage document not found" });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/homepage", async (req, res) => {
  try {
    const homepage = await HomePage.findOne();
    if (!homepage) {
      return res.status(404).json({ error: "HomePage document not found" });
    }
    res.json(homepage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
    
//*-----------------------------------------------About Page -----------------------------------------
app.post("/aboutpage",verifyToken, async (req, res) => {
  try {
    const {
      heroSection,
      legacySection,
      aboutFounderSection,
      journeySection,
      reformEraSection,
      modernEraSection,
      missionSection
    } = req.body;

    // Create a new about page document
    const aboutPage = new AboutPage({
      heroSection,
      legacySection,
      aboutFounderSection,
      journeySection,
      reformEraSection,
      modernEraSection,
      missionSection
    });

    await aboutPage.save();

    res.status(201).json({
      message: "AboutPage initial data created successfully",
      aboutPage
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/aboutpage",verifyToken, async (req, res)=>{
  try {
    const { sectionName, data } = req.body; 
    // Example body:
    // { "sectionName": "modernEraSection", "data": { "title": "New Title" } }

    if (!sectionName || !data) {
      return res.status(400).json({ error: "sectionName and data are required" });
    }

    // Build update path dynamically
    const updatePath = {};
    for (let key in data) {
      updatePath[`${sectionName}.${key}`] = data[key];
    }

    // Assuming only 1 about page doc
    const updated = await AboutPage.findOneAndUpdate(
      {},                     // no filter, just the first doc
      { $set: updatePath },   // update only provided fields
      { new: true }           // return updated doc
    );

    if (!updated) {
      return res.status(404).json({ error: "AboutPage document not found" });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

app.get("/aboutpage", async (req, res)=>{
  try {
    const aboutPage = await AboutPage.findOne();
    if (!aboutPage) {
      return res.status(404).json({ error: "AboutPage document not found" });
    }
    res.json(aboutPage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})


//*-----------------------------------------------Products Page------------------------------------------
app.post("/productspage",verifyToken, async (req, res) => {
  try {
    const { bannerSection, productsSection } = req.body;

    // Create a new products page document
    const productsPage = new ProductsPage({
      bannerSection,
      productsSection
    });

    await productsPage.save();

    res.status(201).json({
      message: "ProductsPage initial data created successfully",
      productsPage
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})
app.patch("/productspage",verifyToken, async (req, res) => {
  try {
    const { sectionName, data } = req.body; 
    // Example body:
    // { "sectionName": "bannerSection", "data": { "title": "New Title" } }

    if (!sectionName || !data) {
      return res.status(400).json({ error: "sectionName and data are required" });
    }

    // Build update path dynamically
    const updatePath = {};
    for (let key in data) {
      updatePath[`${sectionName}.${key}`] = data[key];
    }

    // Assuming only 1 products page doc
    const updated = await ProductsPage.findOneAndUpdate(
      {},                     // no filter, just the first doc
      { $set: updatePath },   // update only provided fields
      { new: true }           // return updated doc
    );

    if (!updated) {
      return res.status(404).json({ error: "ProductsPage document not found" });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/productspage/productsection",verifyToken, async (req, res) => {
  try {
    const { action, product } = req.body;
    // product = { _id?, image?, title?, description?, toUrl? }

    let updatedDoc;

    if (action === "add") {
      updatedDoc = await ProductsPage.findOneAndUpdate(
        {}, // since only one doc exists
        { $push: { productsSection: product } },
        { new: true }
      );
    } 
    else if (action === "edit") {
      if (!product._id) {
        return res.status(400).json({ error: "Product _id is required for editing" });
      }

      // Build dynamic update object
      const updateFields = {};
      if (product.image !== undefined) updateFields["productsSection.$.image"] = product.image;
      if (product.title !== undefined) updateFields["productsSection.$.title"] = product.title;
      if (product.description !== undefined) updateFields["productsSection.$.description"] = product.description;
      if (product.toUrl !== undefined) updateFields["productsSection.$.toUrl"] = product.toUrl;

      updatedDoc = await ProductsPage.findOneAndUpdate(
        { "productsSection._id": product._id },
        { $set: updateFields },
        { new: true }
      );
    } 
    else if (action === "delete") {
      if (!product._id) {
        return res.status(400).json({ error: "Product _id is required for deletion" });
      }
      updatedDoc = await ProductsPage.findOneAndUpdate(
        {},
        { $pull: { productsSection: { _id: product._id } } },
        { new: true }
      );
    } 
    else {
      return res.status(400).json({ error: "Invalid action" });
    }

    res.json(updatedDoc);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/productspage",async (req, res) => {
  try {
    const productsPage = await ProductsPage.findOne();
    if (!productsPage) {
      return res.status(404).json({ error: "ProductsPage document not found" });
    }
    res.json(productsPage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//--------------------------------------------------MICA PAge---------------------------------------------------
app.post("/micapage",verifyToken, async (req, res)=>{
   try{
    const {
      bannerSection,
      sectionOne,
      sectionTwo,
      sectionThree,
      sectionFour
    }=req.body;

    const micaPage=new MicaPage({
      bannerSection,
      sectionOne,
      sectionTwo,
      sectionThree,
      sectionFour
    });
    await micaPage.save();
    res.status(201).json({message:"Mica Page initial data created successfully",micaPage});
   }
    catch(err){
      res.status(500).json({error:err.message});
    }
})
app.patch("/micapage",verifyToken, async (req, res)=>{
  try {
    const { sectionName, data } = req.body; 
    // Example body:
    // { "sectionName": "sectionTwo", "data": { "title": "New Title" } }

    if (!sectionName || !data) {
      return res.status(400).json({ error: "sectionName and data are required" });
    }

    // Build update path dynamically
    const updatePath = {};
    for (let key in data) {
      updatePath[`${sectionName}.${key}`] = data[key];
    }

    // Assuming only 1 mica page doc
    const updated = await MicaPage.findOneAndUpdate(
      {},                     // no filter, just the first doc
      { $set: updatePath },   // update only provided fields
      { new: true }           // return updated doc
    );

    if (!updated) {
      return res.status(404).json({ error: "MicaPage document not found" });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})
app.put("/micapage/sectiontwo/points",verifyToken, async (req, res) => {
  try {
    const { action, point } = req.body;
    // point = { _id?, point? }

    let updatedDoc;

    if (action === "add") {
      updatedDoc = await MicaPage.findOneAndUpdate(
        {}, // only one doc
        { $push: { "sectionTwo.points": point } },
        { new: true }
      );
    } 
    else if (action === "edit") {
      if (!point._id) {
        return res.status(400).json({ error: "Point _id is required for editing" });
      }

      updatedDoc = await MicaPage.findOneAndUpdate(
        { "sectionTwo.points._id": point._id },
        { $set: { "sectionTwo.points.$.point": point.point } },
        { new: true }
      );
    } 
    else if (action === "delete") {
      if (!point._id) {
        return res.status(400).json({ error: "Point _id is required for deletion" });
      }

      updatedDoc = await MicaPage.findOneAndUpdate(
        {},
        { $pull: { "sectionTwo.points": { _id: point._id } } },
        { new: true }
      );
    } 
    else {
      return res.status(400).json({ error: "Invalid action" });
    }

    if (!updatedDoc) {
      return res.status(404).json({ error: "MicaPage document not found" });
    }

    res.json(updatedDoc);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.put("/micapage/sectionthree/subproducts",verifyToken, async (req, res) => {
  try {
    const { action, subProduct } = req.body;
    // subProduct = { _id?, title?, image? }

    let updatedDoc;

    if (action === "add") {
      updatedDoc = await MicaPage.findOneAndUpdate(
        {}, // only one doc
        { $push: { "sectionThree.subProducts": subProduct } },
        { new: true }
      );
    } 
    else if (action === "edit") {
      if (!subProduct._id) {
        return res.status(400).json({ error: "subProduct _id is required for editing" });
      }

      // build dynamic update fields
      const updateFields = {};
      if (subProduct.title !== undefined) updateFields["sectionThree.subProducts.$.title"] = subProduct.title;
      if (subProduct.image !== undefined) updateFields["sectionThree.subProducts.$.image"] = subProduct.image;

      updatedDoc = await MicaPage.findOneAndUpdate(
        { "sectionThree.subProducts._id": subProduct._id },
        { $set: updateFields },
        { new: true }
      );
    } 
    else if (action === "delete") {
      if (!subProduct._id) {
        return res.status(400).json({ error: "subProduct _id is required for deletion" });
      }

      updatedDoc = await MicaPage.findOneAndUpdate(
        {},
        { $pull: { "sectionThree.subProducts": { _id: subProduct._id } } },
        { new: true }
      );
    } 
    else {
      return res.status(400).json({ error: "Invalid action" });
    }

    if (!updatedDoc) {
      return res.status(404).json({ error: "MicaPage document not found" });
    }

    res.json(updatedDoc);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/micapage", async (req, res)=>{
  try {
    const micaPage = await MicaPage.findOne();
    if (!micaPage) {
      return res.status(404).json({ error: "MicaPage document not found" });
    }
    res.json(micaPage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

//---------------------------------------------------Quartz Page and Feldspar Page and clay(R&D)------------------------------------------
// Since Quartz and Feldspar have identical schema, we can use same routes with different models if needed 0 index is Quartz and 1 is Feldspar AND 2 is clay R&D
app.post("/quartzpage",verifyToken, async (req,res)=>{
  try{
    const {
      bannerSection,
      sectionOne,
      sectionTwo,
      sectionThree
    } 
    = req.body;
    const quartzPage=new Quartz({
      bannerSection,
      sectionOne,
      sectionTwo,
      sectionThree
    });
    await quartzPage.save();
    res.status(201).json({message:"Quartz Page initial data created successfully",quartzPage});
  }
  catch(err){
    res.status(500).json({error:err.message});
  }
})
app.patch("/quartzpage/:index",verifyToken, async (req, res) => {
  try {
    const { index } = req.params;  // index from frontend (0, 1, etc.)
    const { sectionName, data } = req.body;

    if (!sectionName || !data) {
      return res.status(400).json({ error: "sectionName and data are required" });
    }

    // Find all products
    const products = await Quartz.find();
    const product = products[index];

    if (!product) {
      return res.status(404).json({ error: "Product not found for this index" });
    }

    // Build update path dynamically -> sections.heroSection.title, etc.
    const updatePath = {};
    for (let key in data) {
      updatePath[`${sectionName}.${key}`] = data[key];
    }

    // Update document
    const updated = await Quartz.findByIdAndUpdate(
      product._id,
      { $set: updatePath },
      { new: true }
    );

    res.json({ message: "Section updated successfully", product: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/quartzpage/:index/sectiontwo/points",verifyToken, async (req, res) => {
  try {
    const { index } = req.params;   // which doc (0 or 1)
    const { action, point } = req.body;
    // point = { _id?, point? }

    const docs = await Quartz.find(); // fetch both documents
    if (!docs || docs.length <= index) {
      return res.status(404).json({ error: "Document not found at given index" });
    }

    const doc = docs[index]; // select doc by index
    let updatedDoc;

    if (action === "add") {
      doc.sectionTwo.points.push(point);
      updatedDoc = await doc.save();
    } 
    else if (action === "edit") {
      if (!point._id) {
        return res.status(400).json({ error: "Point _id is required for editing" });
      }

      const targetPoint = doc.sectionTwo.points.id(point._id);
      if (!targetPoint) {
        return res.status(404).json({ error: "Point not found" });
      }

      targetPoint.point = point.point;
      updatedDoc = await doc.save();
    } 
    else if (action === "delete") {
      if (!point._id) {
        return res.status(400).json({ error: "Point _id is required for deletion" });
      }

      doc.sectionTwo.points.id(point._id)?.deleteOne();
      updatedDoc = await doc.save();
    } 
    else {
      return res.status(400).json({ error: "Invalid action" });
    }

    res.json(updatedDoc);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/quartzpage/:index", async (req, res) => {
  try {
    const { index } = req.params;  // index from frontend (0, 1, 2,etc.) 

    // Find all products
    const products = await Quartz.find();
    const product = products[index];

    if (!product) {
      return res.status(404).json({ error: "Product not found for this index" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//----------------------------------------------------new products page full details-----------------------------------------------------------

app.post("/newproductpage",verifyToken, async (req,res)=>{
  try{
    const {
      isNewProductPage,
      bannerSection,
      sectionOne,
      sectionTwo,
      sectionThree
    } 
    = req.body;
    const newProductPage=new NewProductPage({
      isNewProductPage,
      bannerSection,
      sectionOne,
      sectionTwo,
      sectionThree
    });
    await newProductPage.save();
    res.status(201).json({message:"New Product Page initial data created successfully",newProductPage});
  }
  catch(err){
    res.status(500).json({error:err.message});
  }
})
// Update specific product by id
app.patch("/newproductpage/:id",verifyToken, async (req, res) => {
  try {
    const { id } = req.params;   // document id from frontend
    const updatedData = req.body; // whole updated document

    if (!updatedData || Object.keys(updatedData).length === 0) {
      return res.status(400).json({ error: "Updated document data is required" });
    }

    // Update the document by id with the new data
    const updated = await NewProductPage.findByIdAndUpdate(
      id,
      { $set: updatedData },
      { new: true, runValidators: true } // runValidators ensures schema validation
    );

    if (!updated) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({ message: "Document updated successfully", product: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//to delete specific document in new products page based on id
app.delete("/newproductpage/:id",verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await NewProductPage.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product deleted successfully", deletedProduct });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

// to fetch specific document in new products page based on id we need to use this api on the clieent side to show full details of that product in a fulldetail page
app.get("/newproductpage/:id", async (req, res) => {
  try {
    const { id } = req.params; // document id from frontend

    const productPage = await NewProductPage.findById(id);
    if (!productPage) {
      return res.status(404).json({ error: "Product Page not found" });
    }
    res.json(productPage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
//to fetch all documents in new products page
app.get("/newproductpage", async (req, res) => {
  try {
    const productPages = await NewProductPage.find(); // fetch all documents
    res.json(productPages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//----------------------------------------------------CSR Page------------------------------------------------------------
app.post("/csrpage",verifyToken,(req,res)=>{
  try{
    const {
      bannerSection,
      sectionOne,
      sectionTwo
    }=req.body;

    const csrPage=new CsrPage({
      bannerSection,
      sectionOne,
      sectionTwo
    });
    csrPage.save();
    res.status(201).json({message:"Csr Page initial data created successfully",csrPage});
  }
  catch(err){
    res.status(500).json({error:err.message});
  }
});
app.patch("/csrpage",verifyToken,async(req,res)=>{
  try {
    const { sectionName, data } = req.body; 
    // Example body:
    // { "sectionName": "sectionTwo", "data": { "title": "New Title" } }

    if (!sectionName || !data) {
      return res.status(400).json({ error: "sectionName and data are required" });
    }

    // Build update path dynamically
    const updatePath = {};
    for (let key in data) {
      updatePath[`${sectionName}.${key}`] = data[key];
    }

    // Assuming only 1 csr page doc
    const updated = await CsrPage.findOneAndUpdate(
      {},                     // no filter, just the first doc
      { $set: updatePath },   // update only provided fields
      { new: true }           // return updated doc
    );

    if (!updated) {
      return res.status(404).json({ error: "CsrPage document not found" });
    }

    res.json(updated);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.put("/csrpage/sectiontwo/subproducts", verifyToken, async (req, res) => {
  try {
    const { action, subProduct } = req.body;
    // subProduct = { _id?, title?, image? }

    let updatedDoc;

    if (action === "add") {
      updatedDoc = await CsrPage.findOneAndUpdate(
        {}, // only one doc
        { $push: { "sectionTwo.subProducts": subProduct } },
        { new: true }
      );
    } 
    else if (action === "edit") {
      if (!subProduct._id) {
        return res.status(400).json({ error: "subProduct _id is required for editing" });
      }

      // build dynamic update fields
      const updateFields = {};
      if (subProduct.title !== undefined) updateFields["sectionTwo.subProducts.$.title"] = subProduct.title;
      if (subProduct.image !== undefined) updateFields["sectionTwo.subProducts.$.image"] = subProduct.image;

      updatedDoc = await CsrPage.findOneAndUpdate(
        { "sectionTwo.subProducts._id": subProduct._id },
        { $set: updateFields },
        { new: true }
      );
    } 
    else if (action === "delete") {
      if (!subProduct._id) {
        return res.status(400).json({ error: "subProduct _id is required for deletion" });
      }

      updatedDoc = await CsrPage.findOneAndUpdate(
        {},
        { $pull: { "sectionTwo.subProducts": { _id: subProduct._id } } },
        { new: true }
      );
    } 
    else {
      return res.status(400).json({ error: "Invalid action" });
    }

    if (!updatedDoc) {
      return res.status(404).json({ error: "CsrPage document not found" });
    }

    res.json(updatedDoc);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/csrpage",async(req,res)=>{
  try {
    const csrPage = await CsrPage.findOne();
    if (!csrPage) {
      return res.status(404).json({ error: "CsrPage document not found" });
    }
    res.json(csrPage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

//-----------------------------------------------------Contact Us page-------------------------------------------------------------

app.post("/contactuspage",verifyToken, async (req,res)=>{
  try{
    const {
      bannerSection,
      contactDetails,
      enquiryForm
    }=req.body;

    const contactusPage=new ContactusPage({
      bannerSection,
      contactDetails,
      enquiryForm
    });
    contactusPage.save();
    res.status(201).json({message:"Contact Us Page initial data created successfully",contactusPage});
  }
  catch(err){
    res.status(500).json({error:err.message});
  }
});
app.patch("/contactuspage",verifyToken, async (req, res)=>{
  try {
    const { sectionName, data } = req.body; 
    // Example body:
    // { "sectionName": "contactDetails", "data": { "email": "New Email"}}
    if (!sectionName || !data) {
      return res.status(400).json({ error: "sectionName and data are required" });
    }
    // Build update path dynamically
    const updatePath = {};
    for (let key in data) {
      updatePath[`${sectionName}.${key}`] = data[key];
    }
    // Assuming only 1 contact us page doc
    const updated = await ContactusPage.findOneAndUpdate(
      {},                     // no filter, just the first doc
      { $set: updatePath },   // update only provided fields
      { new: true }           // return updated doc
    );
    if (!updated) {
      return res.status(404).json({ error: "ContactusPage document not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
);

// PUT API for enquiryForm (add, delete, update status)

app.put("/contactus/enquiry",verifyToken, async (req, res) => {
  try {
    const { action, enquiry } = req.body;
    // enquiry = { _id?, name?, email?, phone?, subject?, message?, isResolved? }

    // since only one document exists, fetch it first
    const doc = await ContactusPage.findOne();
    if (!doc) {
      return res.status(404).json({ error: "ContactusPage document not found" });
    }

    let updatedDoc;

    if (action === "add") {
      doc.enquiryForm.push(enquiry);
      updatedDoc = await doc.save();
    } 
    else if (action === "delete") {
      if (!enquiry._id) {
        return res.status(400).json({ error: "Enquiry _id is required for delete" });
      }
      doc.enquiryForm = doc.enquiryForm.filter(
        (item) => item._id.toString() !== enquiry._id
      );
      updatedDoc = await doc.save();
    } 
    else if (action === "status") {
      if (!enquiry._id) {
        return res.status(400).json({ error: "Enquiry _id is required for status update" });
      }
      const item = doc.enquiryForm.id(enquiry._id);
      if (!item) {
        return res.status(404).json({ error: "Enquiry not found" });
      }
      item.isResolved = enquiry.isResolved; // only update status
      updatedDoc = await doc.save();
    } 
    else {
      return res.status(400).json({ error: "Invalid action" });
    }
    res.json(updatedDoc);
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
app.get("/contactuspage", async (req, res)=>{
  try {
    const contactusPage = await ContactusPage.findOne();
    if (!contactusPage) {
      return res.status(404).json({ error: "ContactusPage document not found" });
    }
    res.json(contactusPage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
);

//-----------------------------------------------Location Page-----------------------------------------------------------
// POST API - create a new location
app.post('/locationpage',verifyToken, async (req, res) => {
  try {
    const { title, address, imageUrl } = req.body;

    // Create new location document
    const newLocation = new LocationPage({
      title,
      address,
      imageUrl,
    });

    // Save to DB
    await newLocation.save();

    res.status(201).json({
      message: 'Location added successfully',
      data: newLocation,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add location', details: error.message });
  }
});
// PATCH API - update location by id
app.patch('/locationpage/:id',verifyToken, async (req, res) => {
  try {
    const { id } = req.params; // id from URL params
    const updates = req.body;  // fields to update

    // Find and update
    const updatedLocation = await LocationPage.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true } // return updated document
    );

    if (!updatedLocation) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({
      message: 'Location updated successfully',
      data: updatedLocation,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update location', details: error.message });
  }
});
app.delete('/locationpage/:id',verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedLocation = await LocationPage.findByIdAndDelete(id);

    if (!deletedLocation) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({
      message: 'Location deleted successfully',
      data: deletedLocation,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete location', details: error.message });
  }
});
app.get('/locationpage', async (req, res) => {
  try {
    const locations = await LocationPage.find();
    res.json({
      message: 'Locations fetched successfully',
      data: locations,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch locations', details: error.message });
  }
});

// ✅ GET single location by id
app.get('/locationpage/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const location = await LocationPage.findById(id);

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({
      message: 'Location fetched successfully',
      data: location,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch location', details: error.message });
  }
}); 

//---------------------------------------------------image and video upload using multer---------------------------------------------------

const makeDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

makeDir(path.join(__dirname, 'uploads/images'));
makeDir(path.join(__dirname, 'uploads/videos'));

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, 'uploads/images/');
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, 'uploads/videos/');
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/mpeg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, MP4, and MPEG are allowed.'));
    }
  },
});

// Error handling middleware for Multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  } else if (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
  next();
});

/* ================== ROUTES ================== */

// Upload Image
app.post('/upload/image', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  const imageUrl = `http://${req.headers.host}/uploads/images/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

// Upload Video
app.post('/upload/video', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video uploaded' });
  }
  const videoUrl = `http://${req.headers.host}/uploads/videos/${req.file.filename}`;
  res.status(200).json({ videoUrl });
});

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/mydatabase';

async function connectDB() {
  try {
    if (!mongoURI.startsWith('mongodb')) {
      throw new Error('Invalid MONGO_URI: must start with "mongodb://" or "mongodb+srv://"');
    }

    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000, // fail fast if cluster unreachable
      family: 4, // ✅ Force IPv4 (works on all systems & VPS)
    });

    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1); // Exit so PM2/Docker/systemd can restart
  }
}

connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});