import multer from "multer";
import { AppError } from "../utils/AppError.js";

const allowedImageTypes = new Set([
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
]);

export const imageUpload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024,
		files: 1,
	},
	fileFilter: (_request, file, callback) => {
		if (!allowedImageTypes.has(file.mimetype)) {
			callback(
				new AppError(400, "Only JPEG, PNG, WebP, and GIF images are supported"),
			);
			return;
		}

		callback(null, true);
	},
});
