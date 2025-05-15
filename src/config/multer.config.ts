import { diskStorage } from 'multer';
import { extname } from 'path';
import { mimeTypeRegex } from '../constant/regex';

export const multerConfig = {
  storage: diskStorage({
    destination: './waiting', // Dossier où les fichiers seront stockés
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now();
      const ext = extname(file.originalname);
      callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, callback) => {
    if (!mimeTypeRegex.test(file.mimetype)) {
      return callback(new Error('Only image files are allowed'), false);
    }
    callback(null, true);
  },
};
