import "dotenv/config";

import express from "express";
import { pool } from "./db.js";
import cors from "cors";
import { upload } from "./upload.js";

const app = express();

pool.query("SELECT NOW()")
  .then(() => {
    console.log("✅ PostgreSQL connecté");
  })
  .catch((err) => {
    console.error("❌ Erreur PostgreSQL :", err);
  });

app.use(cors());

const PORT = process.env.PORT || 3001;

app.use(express.json());

app.use("/images", express.static("src/images"));
app.use("/uploads", express.static("src/uploads"));

/**
 * HOME
 */
app.get("/", (req, res) => {
  res.send("API Produits immobiliers");
});

/**
 * GET ALL PRODUITS
 */
app.get("/produits", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM produits
      ORDER BY id DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message:
        "Erreur serveur lors de la récupération des produits",
    });
  }
});

/**
 * GET ONE PRODUIT
 */
app.get("/produits/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const produitResult = await pool.query(
      `
      SELECT *
      FROM produits
      WHERE id = $1
      `,
      [id]
    );

    if (produitResult.rows.length === 0) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    const imagesResult = await pool.query(
      `
      SELECT image
      FROM images_produits
      WHERE produit_id = $1
      `,
      [id]
    );

    res.status(200).json({
      ...produitResult.rows[0],
      images: imagesResult.rows,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Erreur serveur",
    });
  }
});

/**
 * CREATE PRODUIT
 */
app.post(
  "/produits",
  upload.array("images", 10),
  async (req, res) => {
    try {
      console.log("BODY :", req.body);
      console.log("FILES :", req.files);

      const {
        titre,
        commune,
        quartier,
        avenue,
        type_produit,
        description,
      } = req.body;

      const files =
        (req.files as Express.Multer.File[]) || [];

      const imagePrincipale =
        files.length > 0 && files[0]
          ? `/uploads/${files[0].filename}`
          : null;

      const produitResult = await pool.query(
        `
        INSERT INTO produits
        (
          image,
          titre,
          commune,
          quartier,
          avenue,
          type_produit,
          description
        )
        VALUES
        (
          $1,$2,$3,$4,$5,$6,$7
        )
        RETURNING *
        `,
        [
          imagePrincipale,
          titre,
          commune,
          quartier,
          avenue,
          type_produit,
          description,
        ]
      );

      const produit = produitResult.rows[0];

      for (const file of files) {
        await pool.query(
          `
          INSERT INTO images_produits
          (
            produit_id,
            image
          )
          VALUES
          (
            $1,
            $2
          )
          `,
          [
            produit.id,
            `/uploads/${file.filename}`,
          ]
        );
      }

      res.status(201).json(produit);
    } catch (error) {
      console.log("ERREUR COMPLETE :", error);

      res.status(500).json({
        message:
          error instanceof Error
            ? error.message
            : "Erreur serveur",
      });
    }
  }
);

/**
 * UPDATE PRODUIT
 */
app.put("/produits/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      titre,
      commune,
      quartier,
      avenue,
      type_produit,
      description,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE produits
      SET
        titre = $1,
        commune = $2,
        quartier = $3,
        avenue = $4,
        type_produit = $5,
        description = $6
      WHERE id = $7
      RETURNING *
      `,
      [
        titre,
        commune,
        quartier,
        avenue,
        type_produit,
        description,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Erreur serveur",
    });
  }
});

/**
 * DELETE PRODUIT
 */
app.delete("/produits/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM produits
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Produit introuvable",
      });
    }

    res.status(200).json({
      message: "Produit supprimé",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Erreur serveur",
    });
  }
});

app.listen(PORT, () => {
  console.log("🚀 VERSION DEBUG");
  console.log(`Server is running on http://localhost:${PORT}`);
});