import {
	FacebookIcon,
	FacebookShareButton,
	LinkedinIcon,
	LinkedinShareButton,
	RedditIcon,
	RedditShareButton,
	TwitterIcon,
	TwitterShareButton,
	WhatsappIcon,
	WhatsappShareButton,
} from "next-share";
import { FC } from "react";

interface Props {
	url: string;
	title?: string;
	quote?: string;
}

const Share: FC<Props> = ({ url, title, quote }): JSX.Element => {
	return (
		<div className="flex items-center space-x-3">
			<p className="font-semibold text-primary-dark dark:text-primary">
				Share:
			</p>
			<FacebookShareButton
				url={url}
				quote={quote}
				title={title}
			>
				<FacebookIcon
					round
					size={32}
				/>
			</FacebookShareButton>
			<TwitterShareButton url={url}>
				<TwitterIcon
					round
					size={32}
				/>
			</TwitterShareButton>
			<LinkedinShareButton
				url={url}
				source={quote}
				title={title}
			>
				<LinkedinIcon
					round
					size={32}
				/>
			</LinkedinShareButton>
			<WhatsappShareButton
				url={url}
				title={title}
				separator=":: "
			>
				<WhatsappIcon
					round
					size={32}
				/>
			</WhatsappShareButton>
			<RedditShareButton
				url={url}
				title={title}
			>
				<RedditIcon
					round
					size={32}
				/>
			</RedditShareButton>
		</div>
	);
};

export default Share;
