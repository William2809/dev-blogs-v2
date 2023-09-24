import { NextPage } from "next";
import { useRouter } from "next/router";
import AdminLayout from "../../components/layout/AdminLayout";
import { useEffect, useState } from "react";
import axios from "axios";
import { PostDetail } from "../../utils/types";
import InfiniteScrollPosts from "../../components/common/InfiniteScrollPosts";
import { filterPosts } from "../../utils/helper";

interface Props {}

const Search: NextPage<Props> = () => {
	const [loading, setLoading] = useState(false);
	const [notFound, setNotFound] = useState(false);
	const [results, setResults] = useState<PostDetail[]>([]);
	const { query } = useRouter();
	const title = query.title as string;

	const handleSearch = async () => {
		try {
			setLoading(true);
			const { data } = await axios("/api/posts/search?title=" + title);
			setLoading(false);

			setResults(data.results);
			if (!data.results.length) {
				setNotFound(true);
			} else {
				setNotFound(false);
			}
		} catch (error: any) {
			console.log("error while searching posts: ", error.message);
		}
	};

	useEffect(() => {
		if (loading) return;
		handleSearch();
	}, [title]);

	return (
		<AdminLayout>
			{notFound && (
				<h1 className="text-center text-3xl text-secondary-dark font-semibold opacity-40">
					Not Found :(
				</h1>
			)}
			{loading && (
				<h1 className="text-center text-3xl text-secondary-dark font-semibold opacity-40">
					Searching...
				</h1>
			)}
			<InfiniteScrollPosts
				hasMore={false}
				next={() => {}}
				dataLength={results.length}
				posts={results}
				showControls
				onPostRemoved={(post) => {
					setResults(filterPosts(results, post));
				}}
			/>
		</AdminLayout>
	);
};

export default Search;
