import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { createIntegrante, listIntegrantes, getIntegrante, updateIntegrante, deleteIntegrante } from '../controllers/integrante.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

const router = Router();

router.use(authMiddleware);

router.post('/', upload.array('fotos', 5), createIntegrante);
router.get('/', listIntegrantes);
router.get('/:id', getIntegrante);
router.patch('/:id', upload.array('fotos', 5), updateIntegrante);
router.delete('/:id', deleteIntegrante);

export default router;
