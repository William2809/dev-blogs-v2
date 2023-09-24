import { NextPage } from "next";
import Comments from "../../../components/common/Comments";
import AdminLayout from "../../../components/layout/AdminLayout";

interface Props {}

const AdminComments: NextPage<Props> = () => {
	return (
		<div>
			<h1 className="text-2xl dark:text-primary text-primary-dark font-semibold py-2 transition">
				Comments
			</h1>
			<AdminLayout>
				<div className="max-w-4xl mx-auto">
					<Comments fetchAll />
				</div>
			</AdminLayout>
		</div>
	);
};

export default AdminComments;
