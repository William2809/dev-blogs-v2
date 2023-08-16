//title, content, slug, tags, thumbnail, meta, author, date

import { Schema, models, model, ObjectId, Model } from "mongoose";

export interface UserModelSchema {
	name: string;
	email: string;
	role: "user" | "admin";
	provider: "github";
	avatar?: string;
}

const UserSchema = new Schema<UserModelSchema>(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true,
		},
		role: {
			type: String,
			default: "user",
			enum: ["admin", "user"],
		},
		provider: {
			type: String,
			enum: ["github"],
		},
		avatar: {
			type: String,
		},
	},
	{
		timestamps: true,
	}
);

const User = models?.User || model("User", UserSchema);

export default User as Model<UserModelSchema>;
