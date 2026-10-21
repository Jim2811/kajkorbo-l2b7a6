import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";

cloudinary.config({
	cloud_name: env.cloudinary.cloudName,
	api_key: env.cloudinary.apiKey,
	api_secret: env.cloudinary.apiSecret,
});

export const uploadImage = (
	buffer: Buffer,
	folder: string,
): Promise<{ secure_url: string; public_id: string }> =>
	new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder,
				resource_type: "image",
			},
			(error, result) => {
				if (error) {
					reject(error);
					return;
				}

				if (!result?.secure_url || !result.public_id) {
					reject(new Error("Cloudinary returned an incomplete upload result"));
					return;
				}

				resolve({
					secure_url: result.secure_url,
					public_id: result.public_id,
				});
			},
		);

		uploadStream.end(buffer);
	});

export const deleteImage = async (publicId: string) => {
	const result = await cloudinary.uploader.destroy(publicId, {
		resource_type: "image",
	});

	if (result.result !== "ok" && result.result !== "not found") {
		throw new Error(`Cloudinary image deletion failed: ${result.result}`);
	}
};

export const getPublicIdFromImageUrl = (url: string): string | null => {
	const uploadMarker = "/image/upload/";
	const uploadIndex = url.indexOf(uploadMarker);
	if (uploadIndex === -1) {
		return null;
	}

	const path = url.slice(uploadIndex + uploadMarker.length).split("?")[0] ?? "";
	const segments = path.split("/").filter(Boolean);
	if (segments[0]?.startsWith("v") && /^v\d+$/.test(segments[0])) {
		segments.shift();
	}

	const publicId = segments.join("/");
	return publicId ? publicId.replace(/\.[^/.]+$/, "") : null;
};
