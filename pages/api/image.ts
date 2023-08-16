import { NextApiHandler } from "next";
import formidable from "formidable";
import cloudinary from "../../lib/cloudinary";
import { isAdmin } from "../../lib/utils";

const handler: NextApiHandler = (req, res) => {
	const { method } = req;

	switch (method) {
		case "POST":
			return uploadNewImage(req, res);
		case "GET":
			return readAllImages(req, res);
		default:
			return res.status(404).send("Not found!");
	}
};

const uploadNewImage: NextApiHandler = async (req, res) => {
	try {
		const admin = await isAdmin(req, res);
		if (!admin) {
			return res.status(401).json({ error: "Unauthorized request!" });
		}

		const form = formidable();
		form.parse(req, async (err, fields, files) => {
			if (err) return res.status(500).json({ error: err.message });

			const imageFile = files.image as formidable.File;
			const { secure_url: url } = await cloudinary.uploader.upload(
				imageFile.filepath,
				{
					folder: "dev-blogs",
				}
			);

			res.json({ src: url });
		});
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

const readAllImages: NextApiHandler = async (req, res) => {
	try {
		const admin = await isAdmin(req, res);
		if (!admin) {
			return res.status(401).json({ error: "Unauthorized request!" });
		}

		const { resources } = await cloudinary.api.resources({
			resource_type: "image",
			type: "upload",
			prefix: "dev-blogs",
		});

		const images = resources.map(({ secure_url }: any) => ({
			src: secure_url,
		}));
		res.json({ images });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

export default handler;
