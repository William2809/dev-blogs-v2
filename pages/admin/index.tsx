import { NextPage } from "next";
import AdminNav from "../../components/common/nav/AdminNav";
import AdminLayout from "../../components/layout/AdminLayout";
import ContentWrapper from "../../components/admin/ContentWrapper";
import LatestCommentListCard from "../../components/admin/LatestCommentListCard";
import {
	LatestComments,
	PostDetail,
	CommentResponse,
	LatestUserProfile,
} from "../../utils/types";
import { useEffect, useState } from "react";
import LatestPostListCard from "../../components/admin/LatestPostListCard";
import axios from "axios";
import LatestUserTable from "../../components/admin/LatestUserTable";

interface Props {}
const Admin: NextPage<Props> = () => {
	const [latestPosts, setLatestPosts] = useState<PostDetail[]>();
	const [latestComments, setLatestComments] = useState<LatestComments[]>();
	const [latestUsers, setLatestUsers] = useState<LatestUserProfile[]>();

	useEffect(() => {
		// fetching latest posts
		axios(`/api/posts?limit=5&skip=0`)
			.then(({ data }) => {
				setLatestPosts(data.posts);
			})
			.catch((err) => console.log(err));

		// fetching latest comments
		axios(`/api/comment/latest`)
			.then(({ data }) => {
				setLatestComments(data.comments);
			})
			.catch((err) => console.log(err));

		// fetching latest users
		axios(`/api/user`)
			.then(({ data }) => {
				setLatestUsers(data.users);
			})
			.catch((err) => console.log(err));
	}, []);

	return (
		<AdminLayout>
			<div className="flex space-x-10">
				<ContentWrapper
					title="Latest Posts"
					seeAllRoute="/admin/posts"
				>
					{latestPosts?.map(({ id, title, meta, slug }) => {
						return (
							<LatestPostListCard
								key={id}
								title={title}
								meta={meta}
								slug={slug}
							/>
						);
					})}
				</ContentWrapper>
				<ContentWrapper
					title="Latest Comments"
					seeAllRoute="/admin/comments"
				>
					{latestComments?.map((comment) => {
						return (
							<LatestCommentListCard
								comment={comment}
								key={comment.id}
							/>
						);
					})}
				</ContentWrapper>
			</div>

			{/* Latest Users */}
			<div className="max-w-[500px]">
				<ContentWrapper
					title="Latest Users"
					seeAllRoute="/admin/users"
				>
					<LatestUserTable users={latestUsers} />
				</ContentWrapper>
			</div>
		</AdminLayout>
	);
};

export default Admin;
