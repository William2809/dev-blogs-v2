import {
	GetServerSideProps,
	InferGetServerSidePropsType,
	NextPage,
} from "next";
import AdminLayout from "../../../components/layout/AdminLayout";
import { useState } from "react";
import { PostDetail } from "../../../utils/types";
import { formatPosts, readPostsFromDb } from "../../../lib/utils";
import InfiniteScrollPosts from "../../../components/common/InfiniteScrollPosts";
import axios from "axios";
import { filterPosts } from "../../../utils/helper";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>;

let pageNo = 0;
const limit = 9;

const Posts: NextPage<Props> = ({ posts }) => {
	const [postsToRender, setPostsToRender] = useState(posts);
	const [hasMorePosts, setHasMorePosts] = useState(posts.length >= limit);

	const fetchMorePosts = async () => {
		try {
			pageNo++;
			const { data } = await axios(
				`/api/posts?limit=${limit}&skip=${postsToRender.length}`
			);

			if (data.posts.length < limit) {
				setPostsToRender([...postsToRender, ...data.posts]);
				setHasMorePosts(false);
			} else {
				setPostsToRender([...postsToRender, ...data.posts]);
			}
		} catch (error) {
			setHasMorePosts(false);
			console.log(error);
		}
	};

	return (
		<>
			<AdminLayout>
				<InfiniteScrollPosts
					hasMore={hasMorePosts}
					next={fetchMorePosts}
					dataLength={postsToRender.length}
					posts={postsToRender}
					showControls
					onPostRemoved={(post) => {
						setPostsToRender(filterPosts(postsToRender, post));
					}}
				/>
			</AdminLayout>
		</>
	);
};

interface ServerSideResponse {
	posts: PostDetail[];
}

export const getServerSideProps: GetServerSideProps<
	ServerSideResponse
> = async () => {
	try {
		// read posts
		const posts = await readPostsFromDb(limit, pageNo);
		// format posts
		const formattedPosts = formatPosts(posts);
		return {
			props: {
				posts: formattedPosts,
			},
		};
	} catch (error) {
		return { notFound: true };
	}
};

export default Posts;
