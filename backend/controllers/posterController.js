const sharp = require('sharp');
const path = require('path');
const fs = require('fs/promises');
const Poster = require('../models/Poster');

const uploadPoster = async (req, res) => {
  console.log('🟡 Початок завантаження постера');

  try {
    if (!req.file) {
      console.warn('⚠️ Файл не передано');
      return res.status(400).json({ message: 'Файл не передано' });
    }

    const ext = path.extname(req.file.filename).toLowerCase();
    const baseName = req.file.filename.replace(/\.[^/.]+$/, '');
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'images');
    const filePath = path.join(uploadsDir, req.file.filename);

    let finalFilename;
    let finalFilePath;

    if (ext === '.webp') {
      console.log('ℹ️ Файл вже у форматі webp, конвертація пропущена');
      finalFilename = req.file.filename;
      finalFilePath = filePath;
    } else {
      finalFilename = baseName + '.webp';
      finalFilePath = path.join(uploadsDir, finalFilename);

      console.log(`📥 Вхідний файл: ${filePath}`);
      console.log(`📤 Вихідний файл (webp): ${finalFilePath}`);

      await sharp(filePath)
        .webp({ quality: 80 })
        .toFile(finalFilePath);
      
      console.log('✅ Конвертація в WebP завершена');

      await fs.unlink(filePath);
      console.log('🗑️ Оригінальний файл видалено');
    }
    const poster = new Poster({
      filename: finalFilename,
      path: finalFilePath,
      url: `http://localhost:5000/uploads/images/${finalFilename}`,
      contentType: 'image/webp',
    });

    await poster.save();
    console.log('🟢 Постер збережено в базу даних');

    res.json(poster);
  } catch (err) {
    console.error('🔴 Помилка при завантаженні постера:', err);
    res.status(500).json({ message: 'Помилка при завантаженні постера' });
  }
};
const deletePosterById = async (posterId) => {
  if (!posterId) return;

  try {
    const poster = await Poster.findById(posterId);
    if (!poster) return;

    await fs.unlink(poster.path);

    await Poster.findByIdAndDelete(posterId);
  } catch (err) {
    console.error('Помилка при видаленні постера:', err);
    throw err; 
  }
};

module.exports = { uploadPoster, deletePosterById };
