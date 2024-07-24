import { Button } from "frames.js/next";
import { frames } from "../frames";

const handleRequest = frames(async (ctx) => {
	const realImage = `https://glo-dollars-mvp.vercel.app/end.png`

	const shareText = "🌈☀️ I just made a donation to the charity of the day in Glo Dollars (USDGLO) through this frame made by @glodollar and @pbkompasz. Feeling generous? Check it out. ↓";

	return {
		image: realImage,
		imageOptions: {
			aspectRatio: "1:1",
		},
		buttons: [
			<Button action="link" target={`https://warpcast.com/~/compose?text=${shareText}&embeds[]=https://glo-dollars-mvp.vercel.app/frames`}>
				Share
			</Button>,
			<Button action="link" target="https://www.glodollar.org/articles/how-glo-dollar-works">
				Why Glo?
			</Button>,
			<Button action="link" target="https://warpcast.com/glodollar">
				Follow Glo
			</Button>
		],
	};
});

export const GET = handleRequest;
export const POST = handleRequest;
