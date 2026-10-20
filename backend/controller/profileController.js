const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");
const db = require("../config/db");

const uploadsDirectory = path.join(__dirname, "..", "uploads");
const maxImageBytes = 2 * 1024 * 1024;

const removeUploadedFile = async (url) => {
  if (!url || !url.startsWith("/uploads/")) return;
  const filename = path.basename(url);
  await fs.unlink(path.join(uploadsDirectory, filename)).catch(() => {});
};

const updateProfilePicture = async (req, res, next) => {
  let nextPicture = null;
  try {
    const { imageData } = req.body;

    if (imageData !== null) {
      if (typeof imageData !== "string") {
        return res.status(400).json({ success: false, message: "Choose a valid image file." });
      }

      const match = imageData.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
      if (!match) {
        return res.status(400).json({ success: false, message: "Use a PNG, JPEG, or WebP image." });
      }

      const imageBuffer = Buffer.from(match[2], "base64");
      if (!imageBuffer.length || imageBuffer.length > maxImageBytes) {
        return res.status(400).json({ success: false, message: "The image must be 2 MB or smaller." });
      }

      const extension = match[1] === "jpeg" ? "jpg" : match[1];
      await fs.mkdir(uploadsDirectory, { recursive: true });
      const filename = `${req.user.id}-${randomUUID()}.${extension}`;
      await fs.writeFile(path.join(uploadsDirectory, filename), imageBuffer, { flag: "wx" });
      nextPicture = `/uploads/${filename}`;
    }

    db.query("SELECT profile_picture FROM users WHERE id = ?", [req.user.id], (selectError, results) => {
      if (selectError) {
        removeUploadedFile(nextPicture);
        return next(selectError);
      }
      if (!results.length) {
        removeUploadedFile(nextPicture);
        return res.status(404).json({ success: false, message: "User not found." });
      }

      const oldPicture = results[0].profile_picture;
      db.query("UPDATE users SET profile_picture = ? WHERE id = ?", [nextPicture, req.user.id], (updateError) => {
        if (updateError) {
          removeUploadedFile(nextPicture);
          return next(updateError);
        }
        if (oldPicture && oldPicture !== nextPicture) removeUploadedFile(oldPicture);
        return res.json({ success: true, message: "Profile picture updated.", profilePicture: nextPicture });
      });
    });
  } catch (error) {
    await removeUploadedFile(nextPicture);
    next(error);
  }
};

module.exports = { updateProfilePicture };
