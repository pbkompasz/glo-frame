import { Button } from "frames.js/next";
import { frames } from "../frames";

const handleRequest = frames(async (ctx) => {
    const realImage = `https://glo-dollars-mvp.vercel.app/end.png`
    return {
        image: realImage,
        buttons: [
            <Button action="link" target="https://warpcast.com/~/compose?text=I+just+donated+using+USDGLO.&embeds[]=https://glo-dollars-mvp.vercel.app/frames">
                Share
            </Button>,
            <Button action="link" target="https://www.glodollar.org/articles/how-glo-dollar-works">
                Why Glo?
            </Button>,
            <Button action="link" target="https://warpcast.com/glodollar">
                Follow @glodollar
            </Button>
        ],
    };
});

export const GET = handleRequest;
export const POST = handleRequest;
