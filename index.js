// index.js (ES Modules)
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg;
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Servir imágenes
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Conexión a PostgreSQL
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "transportes",
  password: "formula11",
  port: 5432,
});

// Ruta prueba
app.get("/", (req, res) => {
  res.json({ message: "Backend funcionando", time: { now: new Date() } });
});

// Vehículos
app.get("/vehiculos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM vehiculos ORDER BY id ASC");
    const vehiculosConImagen = result.rows.map((vehiculo) => ({
      ...vehiculo,
      imagenUrl: vehiculo.imagen_url
        ? `http://localhost:${port}/images/${vehiculo.imagen_url}`
        : null,
    }));
    res.json(vehiculosConImagen);
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    res.status(500).json({ message: "Error al obtener vehículos", error: error.message });
  }
});

// Contactos
app.post("/contactos", async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body;

    // Guardar en la base de datos
    const query = `
      INSERT INTO contactos (nombre, email, mensaje, fecha)
      VALUES ($1, $2, $3, NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, email, mensaje]);

    res.json({ message: "Mensaje enviado correctamente", contacto: result.rows[0] });
  } catch (error) {
    console.error("Error al guardar contacto:", error);
    res.status(500).json({ message: "Error al enviar el mensaje", error: error.message });
  }
});



// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
