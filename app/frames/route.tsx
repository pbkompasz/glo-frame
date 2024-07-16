import { Button } from "frames.js/next";
import { frames } from "./frames";
import cron from "node-cron";

const TOPICS = ["healthcare", "homeless", "crypto"];

let topicOfTheDay = TOPICS[0];

// Cron job, pick charity of the day

let charityOfTheDay: {
  id: string | number | boolean | readonly string[] | readonly number[] | readonly boolean[] | null | undefined; name: any; contractAddress: string;
};

const task = cron.schedule(
  "0 0 * * *",
  async () => {
    const randomPos = Math.floor(Math.random() * TOPICS.length);
    topicOfTheDay = TOPICS[randomPos];
    do {
      charityOfTheDay = await getCharityOfTheDay();
    } while (!charityOfTheDay);
  },
  {
    scheduled: true,
  }
);

task.start();

// Charities

const searchCharities = async (searchTerm: string, offset: number) => {
  try {
    const rawResp = await fetch(
      `https://api.endaoment.org/v1/sdk/orgs/search?searchTerm=${searchTerm}&count=10&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );
    const resp = await rawResp.json();
    const filteredCharities = resp.filter((charity: { deployments: any[]; }) => {
      const validDeployments = charity.deployments.filter((deployment: { isDeployed: any; }) => deployment.isDeployed);
      return validDeployments.length === 3;
    })
    return filteredCharities[0];
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

const getCharityOfTheDay = async () => {
  const randomOffset = Math.floor(Math.random() * 200);
  return await searchCharities(topicOfTheDay, randomOffset);
};

const getRandomCharity = async () => {
  try {
    const randomChar = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    const randomOffset = Math.floor(Math.random() * 200);
    return await searchCharities(randomChar, randomOffset);
  } catch (error) {

  }
};

const getCharity = async (id: string | number) => {
  try {
    const rawResp = await fetch(
      `https://api.endaoment.org/v1/sdk/orgs/${id}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );
    const resp = await rawResp.json();
    return resp;
  } catch (error) {
    console.error("Fetch error:", error);
  }

}

const handleRequest = frames(async (ctx) => {
  let image, realImage;
  let buttons;
  const oldState = ctx.state;
  const newState = {
    ...oldState,
  };

  switch (ctx.searchParams.value) {
    case "charity-otd":
      if (!charityOfTheDay)
        do {
          charityOfTheDay = await getCharityOfTheDay();
        } while (!charityOfTheDay);
      image = charityOfTheDay.name;
      newState.address = charityOfTheDay.contractAddress;
      buttons = [
        <Button action="post" target={{ query: { value: 'select-chain', id: charityOfTheDay.id } }}>
          Donate
        </Button>,
        <Button action="post" target={{ query: { value: 'charity-rand' } }}>
          Show next
        </Button>,
        <Button action="link" target="https://app.endaoment.org/">
          Learn more
        </Button>,
      ]

      break;

    case "charity-rand":
      let randomCharity;
      newState.randCount = ctx.state.randCount + 1;
      if (ctx.state.randCount < 3) {
        do {
          randomCharity = await getRandomCharity();
        } while (!randomCharity);
        newState.address = randomCharity.contractAddress;
        newState.randomCharities[ctx.state.randCount] = randomCharity.id;
      }
      image = (await getCharity(newState.randomCharities[ctx.state.randCount % 3])).name;
      console.log(image)
      buttons = [
        <Button action="post" target={{ query: { value: "select-chain", id: newState.randomCharities[ctx.state.randCount % 3] } }}>
          Donate
        </Button>,
        <Button action="post" target={{ query: { value: "charity-rand" } }}>
          Show next
        </Button>,
        <Button action="link" target="https://app.endaoment.org/">
          Learn more
        </Button>,
      ];
      break;

    case "select-chain":
      realImage = `https://glo-dollars-mvp.vercel.app/chain.png`
      const charity = await getCharity(ctx.searchParams.id);
      buttons = [
        <Button action="post" target={{ query: { value: 'select-amount', chainId: 1, address: (charity.deployments.find((d: { chainId: number; }) => d.chainId === 1)).address } }}>
          Ethereum
        </Button>,
        <Button action="post" target={{ query: { value: 'select-amount', chainId: 10, address: (charity.deployments.find((d: { chainId: number; }) => d.chainId === 10)).address } }}>
          Optimism
        </Button>,
        <Button action="post" target={{ query: { value: 'select-amount', chainId: 8453, address: (charity.deployments.find((d: { chainId: number; }) => d.chainId === 8453)).address } }}>
          Base
        </Button>,
        <Button action="post" target={{ query: { value: "charity-rand" } }}>
          Select a random charity instead
        </Button>,
      ];
      break;

    case "select-amount":
      image = "Select the amount of USDGLO you want to donate";
      const { chainId, address, } = ctx.searchParams
      buttons = [
        <Button action="tx" target={{ pathname: "txdata", query: { chainId, address, amount: 1 } }} post_url="/final">
          1 USDGLO
        </Button>,
        <Button action="tx" target={{ pathname: "txdata", query: { chainId, address, amount: 10 } }} post_url="/final">
          10 USDGLO
        </Button>,
        <Button action="tx" target={{ pathname: "txdata", query: { chainId, address, amount: 100 } }} post_url="/final">
          100 USDGLO
        </Button>,
      ];
      break;


    default:
      realImage = `https://glo-dollars-mvp.vercel.app/start.png`
      buttons = [
        <Button action="post" target={{ query: { value: "charity-otd" } }}>
          Donate
        </Button>,
        <Button action="link" target="https://docs.google.com/document/d/1HE6Jvgrw43o37PM2SAEQiGGF7uFOr84Qrz5bvLaEO9Y">
          How it works
        </Button>,
      ];
      break;
  }

  return {
    image: realImage ?? <span style={{
      backgroundColor: "#EAF4F3", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center"
    }}>{image}</span>,
    buttons,
    state: newState,
  };
});

export const GET = handleRequest;
export const POST = handleRequest;
