import mongoose from "mongoose";

const uri = process.env.MONGODB_URI as string;

const dbConnect = async () => {
	try {
		const connection = await mongoose.connect(uri);

		return connection;
	} catch (error) {
		console.log("db connect error: ", error);
	}
};

export default dbConnect;
