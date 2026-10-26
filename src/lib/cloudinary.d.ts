export declare const uploadImage: (buffer: Buffer, folder: string) => Promise<{
    secure_url: string;
    public_id: string;
}>;
export declare const deleteImage: (publicId: string) => Promise<void>;
export declare const getPublicIdFromImageUrl: (url: string) => string | null;
//# sourceMappingURL=cloudinary.d.ts.map