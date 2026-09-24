const fs = require("fs");
const path = require("path");
const { v2: cloudinary } = require("cloudinary");
const { createClient } = require("@supabase/supabase-js");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const supabase = sbUrl && sbKey ? createClient(sbUrl, sbKey) : null;

async function run() {
  console.log("=== SEEDING ALL STORE IMAGES TO CLOUDINARY ===");
  const imagesDir = path.join(__dirname, "../public/images");
  const files = fs.readdirSync(imagesDir).filter((f) => /\.(jpg|jpeg|png|webp|svg)$/i.test(f));

  console.log(`Found ${files.length} images to upload...`);

  const urlMap = {};
  const mediaRows = [];

  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filepath = path.join(imagesDir, filename);
    const stats = fs.statSync(filepath);
    const ext = path.extname(filename).slice(1).toLowerCase();
    const mimeType = ext === "png" ? "image/png" : ext === "svg" ? "image/svg+xml" : "image/jpeg";
    const nameWithoutExt = path.basename(filename, path.extname(filename));

    try {
      console.log(`[${i + 1}/${files.length}] Uploading ${filename}...`);
      const result = await cloudinary.uploader.upload(filepath, {
        folder: "iadewealth",
        public_id: nameWithoutExt,
        overwrite: true,
        resource_type: "image",
      });

      urlMap[filename] = result.secure_url;
      mediaRows.push({
        name: filename,
        path: result.public_id,
        url: result.secure_url,
        size: stats.size,
        mime_type: mimeType,
      });
      console.log(`  -> OK: ${result.secure_url}`);
    } catch (err) {
      console.error(`  -> Failed for ${filename}:`, err.message);
    }
  }

  // Save the mapping for easy reference
  const mapPath = path.join(__dirname, "../src/data/cloudinary-map.json");
  fs.writeFileSync(mapPath, JSON.stringify(urlMap, null, 2), "utf8");
  console.log(`Saved Cloudinary URL map to ${mapPath}`);

  // Insert into Supabase media table
  if (supabase && mediaRows.length > 0) {
    console.log("\nInserting media records into Supabase media table...");
    try {
      // Upsert or clear and insert
      const { error: delErr } = await supabase
        .from("media")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");
      if (delErr) console.log("Note on delete old media:", delErr.message);

      const { error: insErr } = await supabase.from("media").insert(mediaRows);
      if (insErr) {
        console.error("Supabase media insert error:", insErr.message);
      } else {
        console.log(`Successfully inserted ${mediaRows.length} images into Supabase media table!`);
      }
    } catch (err) {
      console.error("Error updating Supabase media table:", err.message);
    }
  }

  console.log("\n=== ALL IMAGES SEEDED TO CLOUDINARY SUCCESSFULLY ===");
}

run().catch((e) => {
  console.error("Fatal seeding error:", e);
  process.exit(1);
});
